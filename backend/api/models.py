from django.db import models
from django.contrib.auth.models import AbstractUser

# User model
class User(AbstractUser):
    auth0_id = models.CharField(max_length=255, unique=True)
    role = models.CharField(max_length=10, default='user')
    
    def __str__(self):
        return self.email

# Product model
class Product(models.Model):
    type = models.CharField(max_length = 100)
    brand = models.CharField(max_length = 100)
    model = models.CharField(max_length = 100)
    storage = models.IntegerField(null=True, blank=True)
    picture = models.URLField()
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.model}"

    # Soft delete a product
    def soft_delete(self):
        self.is_deleted = True
        self.save()
    
# Variants of each product
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    color = models.CharField(max_length=7, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.product} - {self.color}"
    
# Order History
class OrderHistory(models.Model):
    user = models.ForeignKey(User, related_name='order_history', on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    order_status = models.CharField(max_length=20, default='Pending')
    total_price = models.DecimalField(max_digits=15, decimal_places=2)
    order_email = models.EmailField(default='example@email.com')

    def __str__(self):
        return f"Order {self.id} for {self.user.email}"

# Each item in the order
class OrderItem(models.Model):
    order = models.ForeignKey(OrderHistory, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity  = models.IntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product} x in Order {self.order.id}"
    
# Each item in a shopping cart
class ShoppingCartItem(models.Model):
    user = models.ForeignKey(User, related_name='shopping_cart', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity  = models.IntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product} in {self.user.email}'s cart"