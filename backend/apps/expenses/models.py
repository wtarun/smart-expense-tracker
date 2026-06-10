import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Expense(models.Model):

    PAYMENT_CHOICES = [
        ("cash",          "Cash"),
        ("card",          "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("upi",           "UPI"),
        ("other",         "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="expenses",
    )
    title = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    currency = models.CharField(max_length=3, default="USD")
    expense_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_CHOICES,
        blank=True,
        null=True,
    )
    is_recurring = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "expenses"
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"
        ordering = ["-expense_date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "expense_date"]),
            models.Index(fields=["user", "category"]),
        ]

    def __str__(self):
        return f"{self.title} — {self.amount} ({self.expense_date})"
