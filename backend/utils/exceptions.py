from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {"success": False, "error": "Internal server error."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    error_message = _extract_message(response.data)

    return Response(
        {
            "success": False,
            "error": error_message,
            "details": response.data if isinstance(response.data, dict) else None,
        },
        status=response.status_code,
    )


def _extract_message(data):
    if isinstance(data, dict):
        for key in ("detail", "non_field_errors"):
            if key in data:
                val = data[key]
                return str(val[0]) if isinstance(val, list) else str(val)
        first_key = next(iter(data))
        val = data[first_key]
        return f"{first_key}: {val[0] if isinstance(val, list) else val}"
    if isinstance(data, list):
        return str(data[0])
    return str(data)
