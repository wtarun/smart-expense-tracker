from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from utils.response import R
from .models import Category
from .serializers import CategorySerializer, CategoryWriteSerializer


class CategoryListCreateView(APIView):
    """GET /api/v1/categories/  POST /api/v1/categories/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return system categories + the user's own custom categories
        categories = Category.objects.filter(
            Q(is_system=True) | Q(user=request.user)
        ).order_by("is_system", "name")
        serializer = CategorySerializer(categories, many=True)
        return R.success(data=serializer.data)

    def post(self, request):
        serializer = CategoryWriteSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return R.error("Validation failed.", details=serializer.errors)
        category = serializer.save(user=request.user, is_system=False)
        return R.created(
            data=CategorySerializer(category).data,
            message="Category created.",
        )


class CategoryDetailView(APIView):
    """PATCH /api/v1/categories/{id}/   DELETE /api/v1/categories/{id}/"""
    permission_classes = [IsAuthenticated]

    def _get_owned_category(self, pk, user):
        try:
            return Category.objects.get(pk=pk, user=user, is_system=False)
        except Category.DoesNotExist:
            return None

    def patch(self, request, pk):
        category = self._get_owned_category(pk, request.user)
        if not category:
            return R.not_found("Category not found or you do not have permission to edit it.")
        serializer = CategoryWriteSerializer(
            category, data=request.data, partial=True, context={"request": request}
        )
        if not serializer.is_valid():
            return R.error("Validation failed.", details=serializer.errors)
        serializer.save()
        return R.success(data=CategorySerializer(category).data, message="Category updated.")

    def delete(self, request, pk):
        category = self._get_owned_category(pk, request.user)
        if not category:
            return R.not_found("Category not found or you do not have permission to delete it.")
        if category.expenses.exists():
            return R.error(
                "Cannot delete a category that has expenses linked to it.",
                status_code=409,
            )
        category.delete()
        return R.no_content()
