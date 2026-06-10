from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from utils.pagination import StandardPagination
from utils.response import R
from .filters import ExpenseFilter
from .models import Expense
from .serializers import ExpenseReadSerializer, ExpenseWriteSerializer


class ExpenseListCreateView(APIView):
    """
    GET  /api/v1/expenses/  — paginated, filtered, searchable list
    POST /api/v1/expenses/  — create a new expense
    """
    permission_classes = [IsAuthenticated]

    # Filter / search / ordering backends
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = ["title", "notes"]
    ordering_fields = ["expense_date", "amount", "created_at"]
    ordering = ["-expense_date"]

    def _filtered_queryset(self, request):
        qs = Expense.objects.filter(user=request.user).select_related("category")

        # Apply django-filter
        filterset = ExpenseFilter(request.GET, queryset=qs, request=request)
        qs = filterset.qs

        # Search
        search = request.GET.get("search", "").strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(title__icontains=search) | Q(notes__icontains=search))

        # Ordering
        ordering = request.GET.get("ordering", "-expense_date")
        allowed = {"expense_date", "-expense_date", "amount", "-amount", "created_at", "-created_at"}
        if ordering in allowed:
            qs = qs.order_by(ordering)

        return qs

    def get(self, request):
        qs = self._filtered_queryset(request)
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ExpenseReadSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = ExpenseWriteSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return R.error("Validation failed.", details=serializer.errors)
        expense = serializer.save(user=request.user)
        return R.created(
            data=ExpenseReadSerializer(expense).data,
            message="Expense created.",
        )


class ExpenseDetailView(APIView):
    """
    GET    /api/v1/expenses/{id}/
    PATCH  /api/v1/expenses/{id}/
    DELETE /api/v1/expenses/{id}/
    """
    permission_classes = [IsAuthenticated]

    def _get_expense(self, pk, user):
        try:
            return Expense.objects.select_related("category").get(pk=pk, user=user)
        except Expense.DoesNotExist:
            return None

    def get(self, request, pk):
        expense = self._get_expense(pk, request.user)
        if not expense:
            return R.not_found("Expense not found.")
        return R.success(data=ExpenseReadSerializer(expense).data)

    def patch(self, request, pk):
        expense = self._get_expense(pk, request.user)
        if not expense:
            return R.not_found("Expense not found.")
        serializer = ExpenseWriteSerializer(
            expense, data=request.data, partial=True, context={"request": request}
        )
        if not serializer.is_valid():
            return R.error("Validation failed.", details=serializer.errors)
        expense = serializer.save()
        return R.success(
            data=ExpenseReadSerializer(expense).data,
            message="Expense updated.",
        )

    def delete(self, request, pk):
        expense = self._get_expense(pk, request.user)
        if not expense:
            return R.not_found("Expense not found.")
        expense.delete()
        return R.no_content()
