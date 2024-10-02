from django.contrib import admin
from .models import User, Product, ProductVariant, ShoppingCartItem, OrderHistory, OrderItem

admin.site.register(User)
admin.site.register(Product)
admin.site.register(ProductVariant)
admin.site.register(ShoppingCartItem)
admin.site.register(OrderHistory)
admin.site.register(OrderItem)
