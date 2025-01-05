from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Product, Brand
from ..serializers import ProductSerializer, ProductVariantSerializer
from django.db import transaction
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.uploadedfile import InMemoryUploadedFile
import uuid
from ..firebase_config import bucket
import json
from ..decorators import require_role
from ..permissions import Auth0ResourceProtection
from rest_framework.pagination import PageNumberPagination
import hashlib
from django.core.cache import cache
from django.db.models import Max

# Create settings for paginations
class CustomProductsPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

# Product view functionality
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser)
    pagination_class = CustomProductsPagination

    # Caching method to generate cache key
    def _generate_cache_key(self, prefix, request):
        # Create the has string used as the key for caching
        page = request.query_params.get('page', '1')
        page_size = request.query_params.get('page_size', str(self.pagination_class.page_size))
        brand = request.query_params.get('brand', '')
    
        key_string = f"{prefix}:page={page}:size={page_size}:brand={brand}"
        return f"products:{hashlib.md5(key_string.encode()).hexdigest()}"
    
    # Clear the cache
    def invalidate_cache(self):
        cache.clear()

    # Set permission requirements for the products
    def get_permissions(self):
        if self.action in ['create', 'update', 'soft_delete']:
            return [Auth0ResourceProtection()]
        else:
            return super().get_permissions()
    
    # List all of the products
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Paginate the results
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    # List all phone products
    @action(detail=False, methods=['get'])
    def phones(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('phones', request)
            
            # Check if data in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
        

            # Filter by brand if present otherwise just get all phones
            if brand:
                queryset = self.get_queryset().filter(
                    type='Phone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
                print(len(queryset))
            else:
                queryset = self.get_queryset().filter(
                    type='Phone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result
        
        
        except Exception as e:
            return Response({"error": f"Failed to fetch phone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # List all phones filtered by price in decreasing order
    @action(detail=False, methods=['get'])
    def phones_price_decrease(self, request):
        # Get the brand from the request   
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key(f'phones_price_decrease', request)
            
            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is no specific brand then filter all phones otherwise filter by brand
            if brand:
                queryset = self.get_queryset().filter(
                    type='Phone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Phone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch phone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # List all phones filtered by price in increasing order
    @action(detail=False, methods=['get'])
    def phones_price_increase(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('phones_price_increase', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Phone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Phone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch phone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # List all phones filtered by storage in increasing order
    @action(detail=False, methods=['get'])
    def phones_storage_increase(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('phones_storage_increase', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Phone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('storage')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Phone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('storage')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result
            
        except Exception as e:
            return Response({"error": f"Failed to fetch phone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # List all phones filtered by storage in decreasing order
    @action(detail=False, methods=['get'])
    def phones_storage_decrease(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('phones_storage_decrease', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Phone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-storage')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Phone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-storage')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result
            
        except Exception as e:
            return Response({"error": f"Failed to fetch phone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # List all speaker products 
    @action(detail=False, methods=['get'])
    def speakers(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('speakers', request)

            # Check to see if data in cache to return 
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)

            # Filter by brand if present otherwise fetch all
            if brand:
                queryset = self.get_queryset().filter(
                    type='Speaker',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
                print(len(queryset))
            else:
                queryset = self.get_queryset().filter(
                    type='Speaker',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            
            
            # Set the data in cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result
        
        except Exception as e:
            return Response({"error": f"Failed to fetch speaker products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Get all phones by price in increasing order
    @action(detail=False, methods=['get'])
    def speakers_price_increase(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('speakers_price_increase', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Speaker',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Speaker',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch phone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Get all phones by price in decreasing order
    @action(detail=False, methods=['get'])
    def speakers_price_decrease(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('speakers_price_decrease', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Speaker',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Speaker',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch speaker products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Retrieve all watches
    @action(detail=False, methods=['get'])
    def watches(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('watches', request)

            # Check if data in cache, if is then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand filter for that otherwise return all
            if brand:
                queryset = self.get_queryset().filter(
                    type='Watch',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            else:
                queryset = self.get_queryset().filter(
                    type='Watch',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            print(str(e))
            return Response({"error": f"Failed to fetch watch products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Retrieve all watches in decreasing price
    @action(detail=False, methods=['get'])
    def watches_price_decrease(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('watches_price_decrease', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Watch',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Watch',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch watch products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Retrieve all watches in increasing price
    @action(detail=False, methods=['get'])
    def watches_price_increase(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('watches_price_increase', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Watch',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Watch',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch watch products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Retrieve all headphones
    @action(detail=False, methods=['get'])
    def headphones(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('headphones', request)

            # Check if data in cache, if is then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand filter for that otherwise return all
            if brand:
                queryset = self.get_queryset().filter(
                    type='Headphone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            else:
                queryset = self.get_queryset().filter(
                    type='Headphone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch headphone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Filter headphones by decreasing price
    @action(detail=False, methods=['get'])
    def headphones_price_decrease(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('headphones_price_decrease', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Headphone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Headphone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch headphone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Filter headphones by increasing price
    @action(detail=False, methods=['get'])
    def headphones_price_increase(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('headphones_price_increase', request)

            # Check if data is in cache, if so then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand then filter based on that otherwise return all brands
            if brand:
                queryset = self.get_queryset().filter(
                    type='Headphone',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')
            else:
                # Filter by phones and annotated max variant price
                queryset = self.get_queryset().filter(
                    type='Headphone',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('max_price')

            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch headphone products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Retrieve all accessories
    @action(detail=False, methods=['get'])
    def accessories(self, request):
        # Get the brand from the request
        brand = request.query_params.get('brand')

        try:
            # Generate a cache key
            cache_key = self._generate_cache_key('accessories', request)

            # Check if data in cache, if is then return that
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # If there is a brand filter for that otherwise return all
            if brand:
                queryset = self.get_queryset().filter(
                    type='Accessory',
                    brand=brand,
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            else:
                queryset = self.get_queryset().filter(
                    type='Accessory',
                    is_deleted=False
                ).annotate(
                    max_price=Max('variants__price')
                ).order_by('-created_at')
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

            # Set the data in the cache for five minutes
            cache.set(cache_key, result.data, timeout=60)

            return result

        except Exception as e:
            return Response({"error": f"Failed to fetch accessory products: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Get specific product
    def retrieve(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk, is_deleted=False)
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
    # Add a new product and its associated variants
    @require_role('admin')
    def create(self, request):
        # Get all the data necessary
        type = request.data.get('type')
        brand = request.data.get('brand')
        model = request.data.get('model')
        storage_size = request.data.get('storage')
        variants = request.data.get('variants')
        image_file = request.FILES.get('image')

        # Validate all of the input, check storage if type is phone
        if not all([type, brand, model, variants, image_file]):
            if type == 'Phone' and not storage_size:
                return Response({"error": "Input cannot be invalid"}, status=status.HTTP_400_BAD_REQUEST)
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
                    try:
                        variant_serializer = ProductVariantSerializer(data=variant_data)
                        variant_serializer.is_valid(raise_exception=True)
                        variant_serializer.save(product = product)
                    except Exception as e:
                        print("Exited with this error in variants:", e)
                        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
            # Now check to see if the brand of the product in brands, if not then add it if so do nothing
            brand_exists = Brand.objects.filter(
                name=brand,
                product_type=type
            ).exists()

            # If not in brands then add it
            if not brand_exists:
                try:
                    Brand.objects.create(
                        name=brand,
                        product_type=type
                    )     
                except Exception as e:
                    # Delete the product we just created since brand creation failed
                    product.delete()
                    return Response(
                        {"error": f"Failed to create brand record: {str(e)}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Clear the cache now
            self.invalidate_cache()
                    
            return Response({"message": "Successfully created a new product"}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Function to upload a given image to firebase
    def upload_image_to_firebase(self, image_file):
        try:
            if isinstance(image_file, InMemoryUploadedFile):
                file_name = f"{uuid.uuid4()}_{image_file.name}"
                blob = bucket.blob(f"product_images/{file_name}")
                blob.upload_from_file(image_file.file, content_type=image_file.content_type)
                blob.make_public()
                return blob.public_url
            return None
        except Exception as e:
            print(f"Error uploading image to firebase: {str(e)}")

    # Update a product's variants
    @require_role('admin')
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial  = kwargs.pop('partial', False)
        instance = self.get_object()

        # Copy the data as the request data is immutable
        copy_data = request.data.copy()

        # Handle image update if image is provided
        if 'image' in request.FILES:
            new_image_url = self.upload_image_to_firebase(request.FILES['image'])
            if new_image_url:
                copy_data['picture'] = new_image_url

        # Handle the variants
        if 'variants' in copy_data:
            variants_data = copy_data.pop('variants')

            # If the variants are an instance of a list of string, then json loads the first element
            if isinstance(variants_data, list):
                variants_data = variants_data[0]
            if isinstance(variants_data, str):
                variants_data = json.loads(variants_data)

            # Update the variants
            self.update_variants(instance, variants_data)
        
        # Update the product fields
        serializer = self.get_serializer(instance, data=copy_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        # Clear the cache now
        self.invalidate_cache()
        
        # Fetch the updated instance
        updated_product = self.get_serializer(product).data
        return Response(updated_product)

    # Helper function to update individual variants as well
    def update_variants(self, product, variants_data):
        existing_variants = {str(variant.id): variant for variant in product.variants.all()}

        for variant_data in variants_data:
            variant_id = str(variant_data.get('id'))
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
    def soft_delete(self, request, pk=None):
        instance = self.get_object()
        instance.soft_delete()

        # Clear the cache now
        self.invalidate_cache()

        return Response({"message:" "Product successfully deleted"}, status=status.HTTP_204_NO_CONTENT)
        
    