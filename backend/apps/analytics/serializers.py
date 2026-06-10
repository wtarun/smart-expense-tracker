from rest_framework import serializers


class SummaryQuerySerializer(serializers.Serializer):
    """Validates query params for GET /analytics/summary/"""
    month = serializers.RegexField(
        regex=r"^\d{4}-(0[1-9]|1[0-2])$",
        required=False,
        help_text="YYYY-MM  e.g. 2026-06",
    )


class CategoryBreakdownQuerySerializer(serializers.Serializer):
    """Validates query params for GET /analytics/category-breakdown/"""
    date_from = serializers.DateField(required=False)
    date_to   = serializers.DateField(required=False)

    def validate(self, attrs):
        if attrs.get("date_from") and attrs.get("date_to"):
            if attrs["date_from"] > attrs["date_to"]:
                raise serializers.ValidationError(
                    {"date_from": "date_from must be before date_to."}
                )
        return attrs


class MonthlyTrendQuerySerializer(serializers.Serializer):
    """Validates query params for GET /analytics/monthly-trend/"""
    months = serializers.IntegerField(
        required=False,
        default=6,
        min_value=1,
        max_value=24,
        help_text="Number of months to include (1–24). Default: 6.",
    )
