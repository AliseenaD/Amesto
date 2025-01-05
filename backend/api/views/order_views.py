from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ..models import OrderHistory
from ..serializers import OrderHistorySerializer
from ..decorators import require_role
from ..permissions import Auth0ResourceProtection

# Pagination class for the orders
class CustomOrdersPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

# API Calls for order history (ADMIN permissions only)
class OrderHistoryViewSet(viewsets.ModelViewSet):
    queryset = OrderHistory.objects.all()
    serializer_class = OrderHistorySerializer
    permission_classes = [Auth0ResourceProtection]
    pagination_class = CustomOrdersPagination

    # Function that gets all past orders
    @require_role('admin')
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by('-order_date')

        # Paginate the results
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    # Filter all the past orders by pending
    @require_role('admin')
    @action(detail=False, methods=['get'])
    def pending(self, request):
        queryset = self.get_queryset().filter(
            order_status='Pending'
        ).order_by('-order_date')

        # Paginate the results
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
     # Filter all the past orders by processed
    @require_role('admin')
    @action(detail=False, methods=['get'])
    def processed(self, request):
        queryset = self.get_queryset().filter(
            order_status='Processed'
        ).order_by('-order_date')

        # Paginate the results
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    # Function that allows admin to update the order status of an item
    @require_role('admin')
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
