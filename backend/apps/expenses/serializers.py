import datetime

from rest_framework import serializers
from apps.categories.serializers import CategorySerializer
from .models import Expense
from .services import resolve_category


class ExpenseReadSerializer(serializers.ModelSerializer):
    """Used for GET responses — includes the full nested category object."""
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "title",
            "amount",
            "currency",
            "expense_date",
            "category",
            "payment_method",
            "notes",
            "is_recurring",
            "created_at",
            "updated_at",
        ]


class ExpenseWriteSerializer(serializers.ModelSerializer):
    """Used for POST / PATCH — accepts category_id, returns full object on save."""
    category_id = serializers.UUIDField()

    class Meta:
        model = Expense
        fields = [
            "title",
            "amount",
            "currency",
            "expense_date",
            "category_id",
            "payment_method",
            "notes",
        ]
        extra_kwargs = {
            "currency":       {"required": False},
            "payment_method": {"required": False},
            "notes":          {"required": False},
        }

    def validate_expense_date(self, value):
        if value > datetime.date.today():
            raise serializers.ValidationError("Expense date cannot be in the future.")
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_category_id(self, value):
        user = self.context["request"].user
        try:
            resolve_category(value, user)
        except Exception:
            raise serializers.ValidationError(
                "Category not found or does not belong to you."
            )
        return value

    def _get_category(self, category_id):
        user = self.context["request"].user
        return resolve_category(category_id, user)

    def create(self, validated_data):
        category_id = validated_data.pop("category_id")
        category = self._get_category(category_id)
        return Expense.objects.create(category=category, **validated_data)

    def update(self, instance, validated_data):
        if "category_id" in validated_data:
            category_id = validated_data.pop("category_id")
            instance.category = self._get_category(category_id)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
