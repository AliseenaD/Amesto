from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Product, ShoppingCartItem, OrderHistory, OrderItem, ProductVariant
from .serializers import UserSerializer, ProductSerializer, ShoppingCartItemSerializer, OrderHistorySerializer, ProductVariantSerializer
from .auth0backend import Auth0Authentication, isAdminUser
from rest_framework.throttling import UserRateThrottle
from django.db import transaction
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.uploadedfile import InMemoryUploadedFile
import uuid
from firebase_admin import storage
import json
from django.conf import settings

# User view functionality
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] # Could potentially remove because the authentication class is already checking access token
    authentication_classes = [Auth0Authentication]
    throttle_classes = [UserRateThrottle]

    # Alter get permissions so the verify-user route is not requiring auth
    def get_permissions(self):
        if self.action == 'verify_user':
            return [AllowAny()]
        else:
            return super().get_permissions()

    # Create or verify a user
    @action(detail=False, methods=['post'])
    def verify_user(self, request):
        print(f"Request headers: {request.headers}")
        auth0_id = request.auth.payload.get('sub')
        email = request.auth.payload.get(f"{settings.AUTH_0_AUDIENCE}/email")
        role = request.auth.payload.get(f"{settings.AUTH_0_AUDIENCE}/roles", ['user'])

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
        print(serializer.data)
        return Response({"user": serializer.data, "created": created}, status_code)

    # Get the user info
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
    # Get the user profile
    @action(detail=False, methods=['get'])
    def profile(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    # Get the user shopping cart
    @action(detail=False, methods=['get'])
    def shopping_cart(self, request):
        user = request.user
        cart_items = ShoppingCartItem.objects.filter(user=user)
        serializer = ShoppingCartItemSerializer(cart_items, many=True)
        return Response(serializer.data)
    
    # Add item to the cart
    @action(detail=False, methods=['post'])
    def add_to_cart(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
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
        cart_item_id = request.data.get('cart_item_id')

        try:
            cart_item = ShoppingCartItem.objects.get(id=cart_item_id, user=user)
        except ShoppingCartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Update quantity of item in the shopping cart
    @action(detail=False, methods=['put'])
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

        if not cart_items:
            return Response({'error': 'Shopping cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate total price and add as order
        total_amount = sum(item.variant.price * item.quantity for item in cart_items)
        order = OrderHistory.objects.create(user=user, total_price=total_amount)

        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                variant=cart_item.variant,
                quantity=cart_item.quantity
            )
        cart_items.delete()

        serializer = OrderHistorySerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Product view functionality
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    authentication_classes = [Auth0Authentication]
    parser_classes = (MultiPartParser, FormParser)

    # Adjust permission requirements based on different api actions
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'variants']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'soft_delete']:
            permission_classes = [isAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    # List all of the products
    def list(self, request):
        products = Product.objects.filter(is_deleted=False)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    # Get specific product
    def retrieve(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk, is_deleted=False)
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # MAY NOT NEED THIS
    # Retrieve the variants of a specific product
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        try:
            product = Product.objects.filter(pk=pk, is_deleted=False)
            variants = ProductVariant.objects.filter(product=product)
            serializer = ProductVariantSerializer(variants, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
    # Add a new product
    def create(self, request):
        # Get all the data necessary
        type = request.data.get('type')
        brand = request.data.get('brand')
        model = request.data.get('model')
        storage_size = request.data.get('storage')
        variants = request.data.get('variants')
        image_file = request.FILES.get('image')

        # Validate all of the input
        if not all([type, brand, model, storage_size, variants, image_file]):
            return Response({"error": "Input cannot be invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            image_url = self.upload_image_to_firebase(image_file)
            # Validate image url
            if not image_url:
                return Response({"Error": "Invalid image input"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create a new product
            product_data = {
                "type": type,
                "brand": brand,
                "model": model,
                "storage": int(storage_size) if storage_size else None,
                "picture": image_url
            }

            product_serializer = self.get_serializer(data=product_data)
            product_serializer.is_valid(raise_exception=True)
            product = product_serializer.save()

            # Create the variants associated with the product
            try:
                parsed_variants = json.loads(variants) if isinstance(variants, str) else variants
            except json.JSONDecodeError:
                return Response({"Error": "Invalid variants input"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Loop through and create new variant for each variant passed in
            if isinstance(parsed_variants, list) and parsed_variants:
                for variant_data in parsed_variants:
                    variant_data['product'] = product.id
                    variant_serializer = ProductVariantSerializer(data=variant_data)
                    variant_serializer.is_valid(raise_exception=True)
                    variant_serializer.save()
                    
            return Response({"message": "Successfully created a new product"}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Function to upload a given image to firebase
    def upload_image_to_firebase(self, image_file):
        if isinstance(image_file, InMemoryUploadedFile):
            file_name = f"{uuid.uuid4()}_{image_file.name}"
            blob = storage.bucket().blob(f"product_images/{file_name}")
            blob.upload_from_file(image_file.file, content_type=image_file.content_type)
            blob.make_public()
            return blob.public_url
        return None

    # Update a product's variants
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial  = kwargs.pop('partial', False)
        instance = self.get_object()

        # Handle image update if image is provided
        if 'image' in request.FILES:
            new_image_url = self.upload_image_to_firebase(request.FILES['image'])
            if new_image_url:
                request.data['picture'] = new_image_url
        
        # Update the product fields
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        # Handle the variants
        if 'variants' in request.data:
            variants_data = request.data.pop('variants')
            self.update_variants(product, variants_data)
        
        # Fetch the updated instance
        updated_product = self.get_serializer(product).data
        return Response(updated_product)

    # Helper function to update individual variants as well
    def update_variants(self, product, variants_data):
        existing_variants = {variant.id: variant for variant in product.variants.all()}

        for variant_data in variants_data:
            variant_id = variant_data.get('id')
            # If there is a variant id, then we will update existing variant
            if variant_id:
                variant = existing_variants.pop(variant_id)
                variant_serializer = ProductVariantSerializer(variant, data=variant_data, partial=True)
                variant_serializer.is_valid(raise_exception=True)
                variant_serializer.save()
            # Otherwise create a brand new variant
            else:
                variant_data['product'] = product.id
                variant_serializer = ProductVariantSerializer(data=variant_data)
                variant_serializer.is_valid(raise_exception=True)
                variant_serializer.save()
        
        # Delete any variants not in the update data
        for variant in existing_variants.values():
            variant.delete()

    # Soft delete product
    @action(detail=True, methods=['post'])
    def soft_delete(self, request):
        instance = self.get_object()
        instance.soft_delete()
        return Response({"message:" "Product successfully deleted"}, status=status.HTTP_204_NO_CONTENT)
    

    
# API Calls for order history (ADMIN permissions only)
class OrderHistoryViewSet(viewsets.ModelViewSet):
    queryset = OrderHistory.objects.all()
    serializer_class = OrderHistorySerializer
    permission_classes = [isAdminUser]
    authentication_classes = [Auth0Authentication]
    # Set up the pagination
    pagination_class = PageNumberPagination
    page_size = 100

    # Function that gets all past orders
    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    # Function that allows admin to update the order status of an item
    @action(detail=True, methods=['put'])
    def update_order_status(self, request, pk=None):
        new_status = request.data.get('order_status')

        # Validate data
        if not new_status:
            return Response({"Error": "Must provide valid order status"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = self.get_object()
            order.order_status = new_status
            order.save()
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Exception as e:
            return Response({"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
