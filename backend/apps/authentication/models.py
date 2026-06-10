import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from utils.validators import validate_currency, SUPPORTED_CURRENCIES


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Make email the login identifier
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    currency = models.CharField(
        max_length=3,
        default="USD",
        validators=[validate_currency],
    )
    timezone = models.CharField(max_length=50, default="UTC")
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    USERNAME_FIELD = "email"
    # username is still required (AbstractUser default keeps it in REQUIRED_FIELDS)
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
