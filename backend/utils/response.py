from rest_framework.response import Response
from rest_framework import status


class R:
    @staticmethod
    def success(data=None, message="OK", status_code=status.HTTP_200_OK):
        return Response(
            {"success": True, "data": data, "message": message},
            status=status_code,
        )

    @staticmethod
    def created(data=None, message="Created"):
        return Response(
            {"success": True, "data": data, "message": message},
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def error(error="An error occurred", details=None, status_code=status.HTTP_400_BAD_REQUEST):
        payload = {"success": False, "error": error}
        if details is not None:
            payload["details"] = details
        return Response(payload, status=status_code)

    @staticmethod
    def not_found(error="Not found"):
        return R.error(error=error, status_code=status.HTTP_404_NOT_FOUND)

    @staticmethod
    def unauthorized(error="Authentication credentials were not provided."):
        return R.error(error=error, status_code=status.HTTP_401_UNAUTHORIZED)

    @staticmethod
    def forbidden(error="You do not have permission to perform this action."):
        return R.error(error=error, status_code=status.HTTP_403_FORBIDDEN)

    @staticmethod
    def no_content():
        return Response(status=status.HTTP_204_NO_CONTENT)
