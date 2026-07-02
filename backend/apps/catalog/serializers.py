from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]
        read_only_fields = ["id", "slug"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text"]


class ProductVariantSerializer(serializers.ModelSerializer):
    """Used for reading variant data (includes computed price)."""
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ["id", "sku", "size", "color", "stock", "price_override", "price"]


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    """Used for creating/updating variants; id is optional (for updates)."""
    id = serializers.IntegerField(required=False)
    price_override = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )

    class Meta:
        model = ProductVariant
        fields = ["id", "sku", "size", "color", "stock", "price_override"]


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "brand", "category", "price", "is_active", "images"]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all(), write_only=True
    )
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    # Write-only variants field used for create/update
    variants_write = ProductVariantWriteSerializer(
        many=True, write_only=True, required=False, source="variants"
    )

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "brand",
            "category", "category_id",
            "price", "is_active",
            "images", "variants", "variants_write",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def create(self, validated_data):
        variants_data = validated_data.pop("variants", [])
        product = Product.objects.create(**validated_data)
        for v in variants_data:
            v.pop("id", None)
            ProductVariant.objects.create(product=product, **v)
        return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop("variants", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if variants_data is not None:
            keep_ids = {v["id"] for v in variants_data if "id" in v}
            instance.variants.exclude(id__in=keep_ids).delete()
            for v in variants_data:
                vid = v.pop("id", None)
                if vid:
                    ProductVariant.objects.filter(id=vid, product=instance).update(**v)
                else:
                    ProductVariant.objects.get_or_create(
                        product=instance,
                        size=v["size"],
                        color=v["color"],
                        defaults=v,
                    )

        return instance
