from rest_framework import serializers
from .models import User, Product, ProductVariant, OrderHistory, OrderItem, ShoppingCartItem

# Product variant serializer
class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'color', 'price', 'quantity']

# Product serializer 
class ProductSerializer(serializers.ModelSerializer):
    picture = serializers.URLField(required=False)
    variants = ProductVariantSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = ['id', 'type', 'brand', 'model', 'storage', 'picture', 'is_deleted', 'variants']

# Shopping cart serializer
class ShoppingCartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = ShoppingCartItem
        fields = ['id', 'product', 'variant', 'quantity']

# Order item serializer
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'quantity']

# Order history serializer
class OrderHistorySerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = OrderHistory
        fields = ['id', 'user', 'order_date', 'order_status', 'total_price', 'order_email', 'items']

# User serializer
class UserSerializer(serializers.ModelSerializer):
    shopping_cart = ShoppingCartItemSerializer(many=True, read_only=True)
    order_history = OrderHistorySerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'auth0_id', 'role', 'date_joined', 'shopping_cart', 'order_history']
        read_only_fields = ['email', 'auth0_id', 'role', 'date_joined']  