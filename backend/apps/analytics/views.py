from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from utils.response import R
from .serializers import (
    CategoryBreakdownQuerySerializer,
    MonthlyTrendQuerySerializer,
    SummaryQuerySerializer,
)
from .services import get_category_breakdown, get_monthly_trend, get_summary


class SummaryView(APIView):
    """
    GET /api/v1/analytics/summary/

    Query params:
      month  YYYY-MM  (default: current month)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = SummaryQuerySerializer(data=request.query_params)
        if not params.is_valid():
            return R.error("Invalid query parameters.", details=params.errors)

        data = get_summary(
            user=request.user,
            month_str=params.validated_data.get("month"),
        )
        return R.success(data=data)


class CategoryBreakdownView(APIView):
    """
    GET /api/v1/analytics/category-breakdown/

    Query params:
      date_from  YYYY-MM-DD  (optional)
      date_to    YYYY-MM-DD  (optional)

    Omitting both returns all-time breakdown.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = CategoryBreakdownQuerySerializer(data=request.query_params)
        if not params.is_valid():
            return R.error("Invalid query parameters.", details=params.errors)

        data = get_category_breakdown(
            user=request.user,
            date_from=params.validated_data.get("date_from"),
            date_to=params.validated_data.get("date_to"),
        )
        return R.success(data=data)


class MonthlyTrendView(APIView):
    """
    GET /api/v1/analytics/monthly-trend/

    Query params:
      months  int 1–24  (default: 6)

    Returns a complete month skeleton — months with zero spending
    are included as 0 so Chart.js renders a continuous line.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = MonthlyTrendQuerySerializer(data=request.query_params)
        if not params.is_valid():
            return R.error("Invalid query parameters.", details=params.errors)

        data = get_monthly_trend(
            user=request.user,
            months=params.validated_data["months"],
        )
        return R.success(data=data)
