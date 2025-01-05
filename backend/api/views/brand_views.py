from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Brand
from ..serializers import BrandSerializer
from django.core.cache import cache

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

    # Get all brands for phones
    @action(detail=False, methods=['get'])
    def phones(self, request):
        try:
            # Generate a cache key for phone brands
            cache_key = 'phone_brands'

            # Check if data is in cache, if so return that data
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # Get all phone brands
            queryset = self.get_queryset().filter(
                product_type='Phone'
            ).order_by('name')

            serializer = self.get_serializer(queryset, many=True)

            # Cache results for a minute
            cache.set(cache_key, serializer.data, timeout=60)

            return Response(serializer.data)
        
        except Exception as e:
            return Response({"error": "Failed to fetch phone brands: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # Get all brands for speakers
    @action(detail=False, methods=['get'])
    def speakers(self, request):
        try:
            # Generate a cache key for phone brands
            cache_key = 'speaker_brands'

            # Check if data is in cache, if so return that data
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # Get all phone brands
            queryset = self.get_queryset().filter(
                product_type='Speaker'
            ).order_by('name')

            serializer = self.get_serializer(queryset, many=True)

            # Cache results for a minute
            cache.set(cache_key, serializer.data, timeout=60)

            return Response(serializer.data)
        
        except Exception as e:
            return Response({"error": "Failed to fetch speaker brands: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Get all brands for headphones
    @action(detail=False, methods=['get'])
    def headphones(self, request):
        try:
            # Generate a cache key for phone brands
            cache_key = 'headphone_brands'

            # Check if data is in cache, if so return that data
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # Get all phone brands
            queryset = self.get_queryset().filter(
                product_type='Headphone'
            ).order_by('name')

            serializer = self.get_serializer(queryset, many=True)

            # Cache results for a minute
            cache.set(cache_key, serializer.data, timeout=60)

            return Response(serializer.data)
        
        except Exception as e:
            return Response({"error": "Failed to fetch headphone brands: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Get all brands for watches
    @action(detail=False, methods=['get'])
    def watches(self, request):
        try:
            # Generate a cache key for phone brands
            cache_key = 'watch_brands'

            # Check if data is in cache, if so return that data
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # Get all phone brands
            queryset = self.get_queryset().filter(
                product_type='Watch'
            ).order_by('name')

            serializer = self.get_serializer(queryset, many=True)

            # Cache results for a minute
            cache.set(cache_key, serializer.data, timeout=60)

            return Response(serializer.data)
        
        except Exception as e:
            return Response({"error": "Failed to fetch watch brands: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Get all brands for accessories
    @action(detail=False, methods=['get'])
    def accessories(self, request):
        try:
            # Generate a cache key for phone brands
            cache_key = 'accessory_brands'

            # Check if data is in cache, if so return that data
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # Get all phone brands
            queryset = self.get_queryset().filter(
                product_type='Accessory'
            ).order_by('name')

            serializer = self.get_serializer(queryset, many=True)

            # Cache results for a minute
            cache.set(cache_key, serializer.data, timeout=60)

            return Response(serializer.data)
        
        except Exception as e:
            return Response({"error": "Failed to fetch accessory brands: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)