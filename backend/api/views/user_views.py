from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import User, Product, ShoppingCartItem, OrderHistory, OrderItem, ProductVariant
from ..serializers import UserSerializer, ShoppingCartItemSerializer, OrderHistorySerializer
from rest_framework.throttling import UserRateThrottle
from django.db import transaction
from ..permissions import Auth0ResourceProtection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# User view functionality
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    throttle_classes = [UserRateThrottle]
    permission_classes = [Auth0ResourceProtection]

    # Create or verify a user
    @action(detail=False, methods=['post'])
    def verify_user(self, request):
        try:
            if request.auth is None:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            auth0_id = request.auth.get('sub')
            email = request.auth.get(f'{settings.AUTH0_AUDIENCE}/email')
            role = request.auth.get(f'https://{settings.AUTH0_AUDIENCE}/roles', ['user'])
            # Verify data
            if not auth0_id or not email:
                return Response({"Error": "Unable to retrieve user information"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create the user
            user, created = User.objects.get_or_create(
                auth0_id = auth0_id,
                defaults= {
                    'username': email,
                    'email': email,
                    'role': role[0] if role else 'user'
                })
            serializer = self.get_serializer(user)
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response({"user": serializer.data, "created": created}, status_code)
        except Exception as e:
            print(f"Error verifying user: {str(e)}")
            return Response({"Error": "Error while verifying"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Get the user profile
    @action(detail=False, methods=['get'])
    def profile(self, request):
        authId = request.auth.get('sub')
        user = User.objects.get(auth0_id = authId)
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    # Get the user shopping cart
    @action(detail=False, methods=['get'])
    def shopping_cart(self, request):
        authId = request.auth.get('sub')
        user = User.objects.get(auth0_id = authId)
        cart_items = ShoppingCartItem.objects.filter(user=user)
        serializer = ShoppingCartItemSerializer(cart_items, many=True)
        return Response(serializer.data)
    
    # Add item to the cart
    @action(detail=False, methods=['post'])
    def add_to_cart(self, request):
        authId = request.auth.get('sub')
        user = User.objects.get(auth0_id = authId)
        product_id = request.data.get('product')
        variant_id = request.data.get('variant')
        quantity = request.data.get('quantity')

        try:
            product = Product.objects.get(id=product_id)
            variant = ProductVariant.objects.get(id=variant_id, product=product)
        except (Product.DoesNotExist, ProductVariant.DoesNotExist):
            return Response({'error': 'Product or variant not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart_item, created = ShoppingCartItem.objects.get_or_create(
            user=user,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = ShoppingCartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Delete an item from shopping cart
    @action(detail=False, methods=['delete'])
    def delete_from_cart(self, request):

        logger.info(f"Received delete_from_cart request. Auth: {request.auth}")
        logger.info(f"Request data: {request.data}")

        authId = request.auth.get('sub')
        logger.info(f"Auth ID: {authId}")

        user = User.objects.get(auth0_id = authId)
        logger.info(f"User found: {user.id}")
        cart_item_id = request.data.get('cart_item_id')
        logger.info(f"Cart item ID: {cart_item_id}")

        try:
            cart_item = ShoppingCartItem.objects.get(id=cart_item_id, user=user)
        except ShoppingCartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart_item.delete()
        logger.info(f"Cart item deleted successfully: {cart_item_id}")
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Update quantity of item in the shopping cart
    @action(detail=False, methods=['patch'])
    def update_cart_item(self, request):
        authId = request.auth.get('sub')
        user = User.objects.get(auth0_id = authId)
        cart_item_id = request.data.get('cart_item_id')

        try:
            cart_item = ShoppingCartItem.objects.get(id=cart_item_id, user=user)
        except ShoppingCartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ShoppingCartItemSerializer(cart_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # View users order history
    @action(detail=False, methods=['get'])
    def order_history(self, request):
        authId = request.auth.get('sub')
        user = User.objects.get(auth0_id = authId)
        order = OrderHistory.objects.filter(user=user)
        serializer = OrderHistorySerializer(order, many=True)
        return Response(serializer.data)

    # Place an order, update user order history 
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def place_order(self, request):
        authId = request.auth.get('sub')
        user = User.objects.get(auth0_id = authId)
        cart_items = ShoppingCartItem.objects.filter(user=user)

        # Check there are cart items
        if not cart_items:
            return Response({'error': 'Shopping cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the requested quantities are all available
        for cart_item in cart_items:
            if cart_item.quantity > cart_item.variant.quantity:
                return Response({'error': f'Not enough in stock for {cart_item.product.brand} {cart_item.product.model} ({cart_item.variant.color}).'
                                 f'Requested: {cart_item.quantity} Available: {cart_item.variant.quantity}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate total price and add as order
        total_amount = sum(item.variant.price * item.quantity for item in cart_items)
        order = OrderHistory.objects.create(user=user, total_price=total_amount, order_email=user.email)

        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                variant=cart_item.variant,
                quantity=cart_item.quantity
            )
            # Update item quantities
            cart_item.variant.quantity -= cart_item.quantity
            cart_item.variant.save()
        
        # Delete the items from the users cart    
        cart_items.delete()

        serializer = OrderHistorySerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
