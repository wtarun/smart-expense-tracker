from django.db import migrations

SYSTEM_CATEGORIES = [
    {"name": "Food & Dining",   "icon": "restaurant",      "color": "#FF6B6B"},
    {"name": "Transport",       "icon": "directions_car",  "color": "#4ECDC4"},
    {"name": "Housing",         "icon": "home",            "color": "#45B7D1"},
    {"name": "Health",          "icon": "local_hospital",  "color": "#96CEB4"},
    {"name": "Entertainment",   "icon": "movie",           "color": "#FFEAA7"},
    {"name": "Shopping",        "icon": "shopping_bag",    "color": "#DDA0DD"},
    {"name": "Education",       "icon": "school",          "color": "#98D8C8"},
    {"name": "Other",           "icon": "category",        "color": "#B0B0B0"},
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    for cat in SYSTEM_CATEGORIES:
        Category.objects.get_or_create(
            name=cat["name"],
            is_system=True,
            defaults={"icon": cat["icon"], "color": cat["color"], "user": None},
        )


def unseed_categories(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    Category.objects.filter(is_system=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("categories", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_code=unseed_categories),
    ]
