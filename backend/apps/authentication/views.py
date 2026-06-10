from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

from utils.response import R
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    TokenPairSerializer,
    UserProfileSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
)


class RegisterView(APIView):
    """POST /api/v1/auth/register/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return R.error("Validation failed.", details=serializer.errors)

        user = serializer.save()
        return R.created(
            data={"id": str(user.id), "email": user.email, "username": user.username},
            message="Account created successfully.",
        )


class LoginView(APIView):
    """POST /api/v1/auth/login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return R.error("Invalid credentials.", details=serializer.errors, status_code=401)

        user = serializer.validated_data["user"]
        tokens = TokenPairSerializer.for_user(user)
        profile = UserProfileSerializer(user).data

        return R.success(
            data={"access": tokens["access"], "refresh": tokens["refresh"], "user": profile},
            message="Login successful.",
        )


class LogoutView(APIView):
    """POST /api/v1/auth/logout/  — blacklists the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if not serializer.is_valid():
            return R.error("Invalid token.", details=serializer.errors)

        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except TokenError:
            return R.error("Token is already invalid or expired.")

        return R.success(message="Logged out successfully.")


class TokenRefreshAPIView(TokenRefreshView):
    """
    POST /api/v1/auth/token/refresh/
    Wraps simplejwt's built-in view to use our response envelope.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return R.success(data=response.data, message="Token refreshed.")
        return R.error("Token refresh failed.", status_code=response.status_code)


class MeView(APIView):
    """GET / PATCH /api/v1/auth/me/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return R.success(data=serializer.data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return R.error("Validation failed.", details=serializer.errors)

        serializer.save()
        return R.success(
            data=UserProfileSerializer(request.user).data,
            message="Profile updated.",
        )


class ChangePasswordView(APIView):
    """POST /api/v1/auth/change-password/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return R.error("Validation failed.", details=serializer.errors)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        # Blacklist all existing refresh tokens after password change
        # (user must log in again)
        return R.success(message="Password changed successfully. Please log in again.")
