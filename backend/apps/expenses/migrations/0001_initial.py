import uuid
import decimal
import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("categories", "0002_seed_system_categories"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Expense",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="expenses",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="expenses",
                        to="categories.category",
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                (
                    "amount",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(decimal.Decimal("0.01"))],
                    ),
                ),
                ("currency", models.CharField(default="USD", max_length=3)),
                ("expense_date", models.DateField()),
                ("notes", models.TextField(blank=True, null=True)),
                (
                    "payment_method",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("cash", "Cash"),
                            ("card", "Card"),
                            ("bank_transfer", "Bank Transfer"),
                            ("upi", "UPI"),
                            ("other", "Other"),
                        ],
                        max_length=30,
                        null=True,
                    ),
                ),
                ("is_recurring", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Expense",
                "verbose_name_plural": "Expenses",
                "db_table": "expenses",
                "ordering": ["-expense_date", "-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="expense",
            index=models.Index(fields=["user", "expense_date"], name="expenses_user_date_idx"),
        ),
        migrations.AddIndex(
            model_name="expense",
            index=models.Index(fields=["user", "category"], name="expenses_user_category_idx"),
        ),
    ]
