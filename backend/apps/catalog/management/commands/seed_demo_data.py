from django.core.management.base import BaseCommand

from apps.catalog.models import Category, Product, ProductVariant

DEMO_CATALOG = {
    "T-Shirts": [
        {
            "name": "Classic Cotton Tee",
            "brand": "Threadline",
            "price": "1200.00",
            "description": "100% cotton crew-neck t-shirt.",
            "variants": [
                ("Black", "S", 20), ("Black", "M", 25), ("Black", "L", 15),
                ("White", "S", 18), ("White", "M", 22), ("White", "L", 10),
            ],
        },
        {
            "name": "Graphic Print Tee",
            "brand": "Threadline",
            "price": "1500.00",
            "description": "Relaxed-fit tee with front print.",
            "variants": [("Navy", "M", 12), ("Navy", "L", 8)],
        },
    ],
    "Jackets": [
        {
            "name": "Denim Jacket",
            "brand": "Urban Co",
            "price": "4500.00",
            "description": "Classic denim jacket with button closure.",
            "variants": [("Blue", "M", 10), ("Blue", "L", 6), ("Blue", "XL", 4)],
        },
    ],
    "Trousers": [
        {
            "name": "Slim Fit Chinos",
            "brand": "Urban Co",
            "price": "2800.00",
            "description": "Stretch cotton chinos, slim fit.",
            "variants": [("Khaki", "M", 14), ("Khaki", "L", 9), ("Black", "M", 11)],
        },
    ],
}


class Command(BaseCommand):
    help = "Seed the database with demo categories, products and variants for local development."

    def handle(self, *args, **options):
        for category_name, products in DEMO_CATALOG.items():
            category, _ = Category.objects.get_or_create(name=category_name)
            for product_data in products:
                product, _ = Product.objects.get_or_create(
                    name=product_data["name"],
                    defaults={
                        "category": category,
                        "brand": product_data["brand"],
                        "price": product_data["price"],
                        "description": product_data["description"],
                    },
                )
                for color, size, stock in product_data["variants"]:
                    sku = f"{product.slug}-{color}-{size}".upper().replace(" ", "-")
                    ProductVariant.objects.get_or_create(
                        product=product,
                        size=size,
                        color=color,
                        defaults={"sku": sku, "stock": stock},
                    )

        self.stdout.write(self.style.SUCCESS("Demo catalog data seeded."))
