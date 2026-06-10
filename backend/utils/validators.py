from django.core.exceptions import ValidationError
import re


def validate_strong_password(value):
    if len(value) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", value):
        raise ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", value):
        raise ValidationError("Password must contain at least one lowercase letter.")
    if not re.search(r"\d", value):
        raise ValidationError("Password must contain at least one digit.")


SUPPORTED_CURRENCIES = [
    "USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY", "CHF", "SGD",
]


def validate_currency(value):
    if value not in SUPPORTED_CURRENCIES:
        raise ValidationError(
            f"'{value}' is not a supported currency. Choose from: {', '.join(SUPPORTED_CURRENCIES)}"
        )
