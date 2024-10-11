from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ..models import OrderHistory
from ..serializers import OrderHistorySerializer
from ..decorators import require_role
from ..permissions import Auth0ResourceProtection

# API Calls for order history (ADMIN permissions only)
class OrderHistoryViewSet(viewsets.ModelViewSet):
    queryset = OrderHistory.objects.all()
    serializer_class = OrderHistorySerializer
    permission_classes = [Auth0ResourceProtection]

    # Function that gets all past orders
    @require_role('admin')
    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
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
