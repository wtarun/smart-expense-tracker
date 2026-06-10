from django.db.models import Q
from apps.categories.models import Category


def resolve_category(category_id, user):
    """
    Return the Category if it is a system category or belongs to the requesting user.
    Raises Category.DoesNotExist when not found or not accessible.
    """
    return Category.objects.get(
        Q(id=category_id) & (Q(is_system=True) | Q(user=user))
    )
