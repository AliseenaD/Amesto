import os
import django
import json
import logging
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now import Django models after setting up Django
from django.db import transaction
from api.models import User, Product, ProductVariant, ShoppingCartItem, OrderHistory, OrderItem

# Set up the logging
logging.basicConfig(level = logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Dictionaries to store mappings between old and new IDs
product_ids = {}
variant_ids = {}

# Function to load each individual file
def load_json(filename):
    try:
        with open(filename, 'r') as f:
            return [json.loads(line) for line in f]
    except FileNotFoundError:
        logging.error(f"File was not found: {filename}")
        return []
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON file: {filename}")
        return []

# Populate the users from the json file and do it all at once
@transaction.atomic
def populate_users():
    users_data = load_json('users.json')
    for data in users_data:
        try:
            user, created = User.objects.get_or_create(
                auth0_id=data['auth0Id'],
                defaults={
                    'email': data['email'],
                    'role': data['role'],
                    'username': data['email']
                }
            )
            print('Added User')
            logging.info(f"User {'created' if created else 'updated'}: {user.email}")
        except Exception as e:
            logging.error(f"Error while creating/updating user: {data['email']}: {str(e)}")
    
# Populate all of the products from the json file and do it all at once
@transaction.atomic
def populate_products():
    products_data = load_json('products.json')
    for product_data in products_data:
        try:
            product, created = Product.objects.get_or_create(
                brand=product_data['brand'],
                model=product_data['model'],
                storage=product_data['storage'],
                defaults={
                    'type': product_data['type'],
                    'picture': product_data['picture'],
                    'is_deleted': product_data['isDeleted'],
                    'created_at': product_data['createdAt']['$date'],
                    'updated_at': product_data['updatedAt']['$date']
                }
            )
            print('Added product')
            # Store the mapping
            product_ids[product_data['_id']['$oid']] = product.id
            logging.info(f"Product {'created' if created else 'updated'}: {product}")
        except Exception as e:
            logging.info(f"Error creating/updating product {product_data['brand']} {product_data['model']}: {str(e)}")

# Populate all of the product variants and do it all at once
@transaction.atomic
def populate_product_variants():
    product_variants_data = load_json('productvariants.json')
    for variant_data in product_variants_data:
        try:
            # Get the ids so correct linking to product can occur
            old_id = variant_data['productId']['$oid']
            new_id = product_ids.get(old_id)
            if new_id is None:
                logging.error(f"No mapping found for the product ID: {old_id}")
                continue

            product = Product.objects.get(id=new_id)
            variant, created = ProductVariant.objects.get_or_create(
                product = product,
                color = variant_data['color'],
                defaults= {
                    'price': Decimal(str(variant_data['price'])),
                    'quantity': variant_data['quantity']
                }
            )
            # Store mapping between old and new id
            variant_ids[variant_data['_id']['$oid']] = variant.id
        except Product.DoesNotExist:
            logging.error(f"No product found for variant: {variant_data['_id']['$oid']}")
        except Exception as e:
            logging.error(f"Error occurred while creating/updating variant: {str(e)}")

# Populate the shopping cart and do it all at once
@transaction.atomic
def populate_shopping_cart():
    users_data = load_json('users.json')
    for user_data in users_data:
        try:
            user = User.objects.get(auth0_id=user_data['auth0Id'])
            for cart_item in user_data.get('shoppingCart', []):
                try:
                    new_product_id = product_ids.get(cart_item['productId']['$oid'])
                    new_variant_id = variant_ids.get(cart_item['variantId']['$oid'])
                    if new_product_id is None or new_variant_id is None:
                        logging.error(f"No mapping found for product or variant ID in cart item")
                        continue
                    
                    product = Product.objects.get(id=new_product_id)
                    variant = ProductVariant.objects.get(id=new_variant_id)
                    cart_item, created = ShoppingCartItem.objects.get_or_create(
                        user=user,
                        product=product,
                        variant=variant,
                        defaults={
                            'quantity': cart_item['quantity']
                        }
                    )
                    logging.info(f"ShoppingCartItem {'created' if created else 'updated'}: {cart_item}")
                except (Product.DoesNotExist, ProductVariant.DoesNotExist) as e:
                    logging.error(f"Product or Variant not found for cart item: {str(e)}")
                except Exception as e:
                    logging.error(f"Error creating/updating cart item for user {user.email}: {str(e)}")
        except User.DoesNotExist:
            logging.error(f"User not found: {user_data['auth0Id']}")
        except Exception as e:
            logging.error(f"Error processing shopping cart for user {user_data['auth0Id']}: {str(e)}")

def main():
    populate_users()
    populate_products()
    populate_product_variants()
    populate_shopping_cart()

if __name__ == "__main__":
    main()