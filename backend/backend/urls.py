from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import ProductViewSet, UserViewSet, OrderHistoryViewSet, NewsItemViewSet, BrandViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderHistoryViewSet)
router.register(r'news', NewsItemViewSet)
router.register(r'brands', BrandViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]