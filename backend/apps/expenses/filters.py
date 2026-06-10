import django_filters
from .models import Expense


class ExpenseFilter(django_filters.FilterSet):
    # Date range
    date_from = django_filters.DateFilter(field_name="expense_date", lookup_expr="gte")
    date_to   = django_filters.DateFilter(field_name="expense_date", lookup_expr="lte")

    # Amount range
    amount_min = django_filters.NumberFilter(field_name="amount", lookup_expr="gte")
    amount_max = django_filters.NumberFilter(field_name="amount", lookup_expr="lte")

    # Exact matches
    category   = django_filters.UUIDFilter(field_name="category__id")
    payment_method = django_filters.ChoiceFilter(choices=Expense.PAYMENT_CHOICES)

    class Meta:
        model = Expense
        fields = ["category", "payment_method", "date_from", "date_to", "amount_min", "amount_max"]
