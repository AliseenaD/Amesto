from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import User, Product, ShoppingCartItem, OrderHistory, OrderItem, ProductVariant
from ..serializers import UserSerializer, ShoppingCartItemSerializer, OrderHistorySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import UserRateThrottle
from django.db import transaction
import logging
from django.contrib.auth.hashers import make_password

logger = logging.getLogger(__name__)

# User view functionality
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    throttle_classes = [UserRateThrottle]

    # All routes require permissions except for the register route
    def get_permissions(self):
        if self.action in ['register']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    # Create or verify a user
    @action(detail=False, methods=['post'])
    def verify_user(self, request):

        try:
            # get the email and password
            email = request.data.get('email')
            password = request.data.get('password')
            
            # Verify data
            if not email or not password:
                return Response({"Error": "Unable to retrieve user information"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Get the user
                user = User.objects.get(
                    email=email
                )
            # Return 404 error if there is no user
            except User.DoesNotExist:
                return Response({"error": "No user found"}, status=status.HTTP_404_NOT_FOUND)
        
            serializer = self.get_serializer(user)
            status_code = status.HTTP_200_OK
            return Response({"user": serializer.data}, status_code)
        except Exception as e:
            print(f"Error verifying user: {str(e)}")
            return Response({"Error": "Error while verifying"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Register new users within the database
    @action(detail=False, methods=['post'])
    def register(self, request):
        # Set of emails used to determine if a user is admin or not
        ADMIN_EMAILS = [
            "adaeihagh@gmail.com",
            "elmzadeh1@gmail.com"
        ]

        try:
            # Get the email and password
            email = request.data.get('email')
            password = request.data.get('password')

             # Verify data
            if not email or not password:
                return Response({"Error": "Unable to retrieve user information"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user already exists and return error
            if User.objects.filter(email=email).exists():
                return Response({"error": "User already exists"}, status=status.HTTP_409_CONFLICT)
            
            # Set the role
            role = 'Admin' if email in ADMIN_EMAILS else 'User'

            # create the user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                role=role
            )

            serializer = self.get_serializer(user)
            status_code = status.HTTP_200_OK
            return Response({"user": serializer.data}, status_code)
        except Exception as e:
            print(f"Error verifying user: {str(e)}")
            return Response({"Error": "Error while verifying"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    # Get the user profile
    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    # Get the user shopping cart
    @action(detail=False, methods=['get'])
    def shopping_cart(self, request):
        cart_items = ShoppingCartItem.objects.filter(user=request.user)
        serializer = ShoppingCartItemSerializer(cart_items, many=True)
        return Response(serializer.data)
    
    # Add item to the cart
    @action(detail=False, methods=['post'])
    def add_to_cart(self, request):
        user = request.user
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

        user = request.user
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
        user = request.user
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
        user = request.user
        order = OrderHistory.objects.filter(user=user)
        serializer = OrderHistorySerializer(order, many=True)
        return Response(serializer.data)

    # Place an order, update user order history 
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def place_order(self, request):
        user = request.user
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
