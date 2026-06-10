from rest_framework.permissions import BasePermission


class IsSelf(BasePermission):
    """Allow access only when the target object IS the requesting user."""

    def has_object_permission(self, request, view, obj):
        return obj == request.user
