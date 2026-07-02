from rest_framework import parsers, permissions, status, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductListSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to everyone; restrict writes to staff users."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filterset_fields = ["category__slug", "brand"]
    search_fields = ["name", "brand", "description"]
    ordering_fields = ["price", "created_at"]

    def get_queryset(self):
        qs = Product.objects.select_related("category").prefetch_related("images", "variants")
        # Staff/admin see all products including inactive
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return qs
        return qs.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        return ProductDetailSerializer


class ProductImageUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, slug):
        product = get_object_or_404(Product, slug=slug)
        serializer = ProductImageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductImageDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, slug, pk):
        image = get_object_or_404(ProductImage, pk=pk, product__slug=slug)
        image.image.delete(save=False)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
