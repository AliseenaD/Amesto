from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Product, ProductVariant
from ..serializers import ProductSerializer, ProductVariantSerializer
from django.db import transaction
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.uploadedfile import InMemoryUploadedFile
import uuid
from firebase_admin import storage
import json
from ..decorators import require_role
from ..permissions import Auth0ResourceProtection

# Product view functionality
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser)

    # Set permission requirements for the products
    def get_permissions(self):
        if self.action in ['create', 'update', 'soft_delete']:
            return [Auth0ResourceProtection()]
        else:
            return super().get_permissions()
    
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
    @require_role('admin')
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
    @require_role('admin')
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
    @require_role('admin')
    @action(detail=True, methods=['post'])
    def soft_delete(self, request):
        instance = self.get_object()
        instance.soft_delete()
        return Response({"message:" "Product successfully deleted"}, status=status.HTTP_204_NO_CONTENT)
    