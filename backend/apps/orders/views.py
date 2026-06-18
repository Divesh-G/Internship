from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderStatusUpdateSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")

    @transaction.atomic
    def perform_create(self, serializer):
        cart = Cart.objects.filter(user=self.request.user).prefetch_related("items__variant").first()
        if not cart or not cart.items.exists():
            raise ValidationError("Cart is empty.")

        total = sum(item.variant.price * item.quantity for item in cart.items.all())
        order = serializer.save(user=self.request.user, total=total)

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                variant=item.variant,
                product_name=item.variant.product.name,
                size=item.variant.size,
                color=item.variant.color,
                unit_price=item.variant.price,
                quantity=item.quantity,
            )

        cart.items.all().delete()


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class OrderStatusUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        order = Order.objects.get(pk=pk)
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data)
