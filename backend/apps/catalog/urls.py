from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BannerViewSet,
    CategoryViewSet,
    ProductImageDeleteView,
    ProductImageUploadView,
    ProductViewSet,
)

router = DefaultRouter()
router.register("banners", BannerViewSet, basename="banner")
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")

urlpatterns = router.urls + [
    path("products/<slug:slug>/images/", ProductImageUploadView.as_view(), name="product-image-upload"),
    path("products/<slug:slug>/images/<int:pk>/", ProductImageDeleteView.as_view(), name="product-image-delete"),
]
