from rest_framework import viewsets, permissions, status
from ..models import NewsItem
from ..serializers import NewsSerializer
from ..decorators import require_role
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from rest_framework.response import Response
from django.core.files.uploadedfile import InMemoryUploadedFile
import uuid
from ..firebase_config import bucket
from rest_framework.pagination import PageNumberPagination

# Custom news pagination class to implement pagination
class CustomNewsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# News item view functionality
class NewsItemViewSet(viewsets.ModelViewSet):
    queryset = NewsItem.objects.all()
    serializer_class = NewsSerializer
    pagination_class = CustomNewsPagination

    # Set permissions so only authorized and admin can post and delete news
    def get_permissions(self):
        # Anyone can retrieve or list
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        # Require permissions for create update and delete
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    # Get posts (paginated)
    def list(self, request, *args, **kwargs):
        # Get the news items
        queryset = self.get_queryset()
        
        # Paginate the results
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    # Create a new post
    @require_role('admin')
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Get all of the data necessary
        text = request.data.get('text')
        image_file = request.FILES.get('image')

        # Validate input
        if not all ([text, image_file]):
            return Response({'error': 'Input data cannot be invalid'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Now upload the image to firebase
        try:
            image_url = self.upload_image_to_firebase(image_file)
            # Create a new news data object
            news_data = {
                "text": text,
                "picture": image_url
            }
            # Create serializer and save to database
            news_serializer = self.get_serializer(data=news_data)
            news_serializer.is_valid(raise_exception=True)
            news_item = news_serializer.save()
            
            return Response(self.get_serializer(news_item).data, status=status.HTTP_201_CREATED)


        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # Function to upload a given image to firebase
    def upload_image_to_firebase(self, image_file):
        try:
            if isinstance(image_file, InMemoryUploadedFile):
                file_name = f"{uuid.uuid4()}_{image_file.name}"
                blob = bucket.blob(f"news_images/{file_name}")
                blob.upload_from_file(image_file.file, content_type=image_file.content_type)
                blob.make_public()
                return blob.public_url
            return None
        except Exception as e:
            print(f"Error uploading image to firebase: {str(e)}")

    # Function to delete a given image url from the firebase storage
    def delete_image_from_firebase(self, image_url):
        try:
            image_path = image_url.split('/news_images/')[-1]
            blob = bucket.blob(f"news_images/{image_path}")
            blob.delete()
        except Exception as e:
            print(f"An error occurred while deleteing image from firebase: {str(e)}")
    
    # Update a post
    @require_role('admin')
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    # Delete a post
    @require_role('admin')
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        item = self.get_object()
        # delete the items picture from firebase
        try:
            if item.picture:
                self.delete_image_from_firebase(item.picture)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return super().destroy(request, *args, **kwargs)

