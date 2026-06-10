"""
Analytics services — all heavy DB aggregation is here.

Query strategy per endpoint
───────────────────────────
summary             → 3 queries: this-month agg, last-month agg, top-category, recent 5
category-breakdown  → 1 query: grouped annotate on expenses
monthly-trend       → 1 query: TruncMonth annotate on expenses
"""

import datetime
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth

from apps.expenses.models import Expense
from apps.expenses.serializers import ExpenseReadSerializer


# ─────────────────────────────────────────────────────────────────────────────
# Date helpers
# ─────────────────────────────────────────────────────────────────────────────

def _parse_month(month_str: str | None) -> datetime.date:
    """Return the first day of the given YYYY-MM string, or today's month."""
    if month_str:
        try:
            return datetime.datetime.strptime(month_str, "%Y-%m").date().replace(day=1)
        except ValueError:
            pass
    return datetime.date.today().replace(day=1)


def _next_month(date: datetime.date) -> datetime.date:
    """First day of the month after date."""
    if date.month == 12:
        return date.replace(year=date.year + 1, month=1, day=1)
    return date.replace(month=date.month + 1, day=1)


def _prev_month(date: datetime.date) -> datetime.date:
    """First day of the month before date."""
    if date.month == 1:
        return date.replace(year=date.year - 1, month=12, day=1)
    return date.replace(month=date.month - 1, day=1)


def _n_months_before(date: datetime.date, n: int) -> datetime.date:
    """First day of the month n months before date."""
    result = date
    for _ in range(n):
        result = _prev_month(result)
    return result


def _pct(part: Decimal, total: Decimal) -> Decimal:
    if total == 0:
        return Decimal("0.0")
    return (part / total * 100).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def _mom_change(current: Decimal, previous: Decimal) -> Decimal | None:
    """Month-over-month % change. None when there is no previous data."""
    if previous == 0:
        return None
    return ((current - previous) / previous * 100).quantize(
        Decimal("0.1"), rounding=ROUND_HALF_UP
    )


# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

def get_summary(user, month_str: str | None = None) -> dict:
    """
    Dashboard summary for a given month.

    DB hits: 4
      1. aggregate: total + count for this month
      2. aggregate: total for last month
      3. values/annotate: top category (this month)
      4. select_related: recent 5 expenses (this month)
    """
    this_start = _parse_month(month_str)
    this_end   = _next_month(this_start)
    last_start = _prev_month(this_start)

    base_this = Expense.objects.filter(
        user=user,
        expense_date__gte=this_start,
        expense_date__lt=this_end,
    )
    base_last = Expense.objects.filter(
        user=user,
        expense_date__gte=last_start,
        expense_date__lt=this_start,
    )

    # ── Query 1: this month totals ──
    this_agg = base_this.aggregate(total=Sum("amount"), count=Count("id"))
    this_total = this_agg["total"] or Decimal("0.00")
    this_count = this_agg["count"]

    # ── Query 2: last month total ──
    last_total = base_last.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

    # ── Query 3: top category this month ──
    top_cat = (
        base_this
        .values("category__name", "category__color", "category__icon")
        .annotate(total=Sum("amount"))
        .order_by("-total")
        .first()
    )

    # ── Query 4: recent 5 expenses ──
    recent_qs = (
        base_this
        .select_related("category")
        .order_by("-expense_date", "-created_at")[:5]
    )

    return {
        "month":                   this_start.strftime("%Y-%m"),
        "total_spent":             str(this_total.quantize(Decimal("0.01"))),
        "total_spent_last_month":  str(last_total.quantize(Decimal("0.01"))),
        "month_over_month_change": str(_mom_change(this_total, last_total)),
        "total_expenses_count":    this_count,
        "top_category": {
            "name":   top_cat["category__name"],
            "color":  top_cat["category__color"],
            "icon":   top_cat["category__icon"],
            "amount": str(top_cat["total"].quantize(Decimal("0.01"))),
        } if top_cat else None,
        "recent_expenses": ExpenseReadSerializer(recent_qs, many=True).data,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Category breakdown
# ─────────────────────────────────────────────────────────────────────────────

def get_category_breakdown(user, date_from=None, date_to=None) -> dict:
    """
    Spending by category for a given period.

    DB hits: 1
      — values/annotate grouped query; percentages computed in Python.

    Chart.js output: labels + backgroundColor arrays + raw detail.
    """
    qs = Expense.objects.filter(user=user)

    if date_from:
        qs = qs.filter(expense_date__gte=date_from)
    if date_to:
        qs = qs.filter(expense_date__lte=date_to)

    # Single aggregation query
    rows = (
        qs
        .values(
            "category__id",
            "category__name",
            "category__color",
            "category__icon",
        )
        .annotate(amount=Sum("amount"), count=Count("id"))
        .order_by("-amount")
    )

    # Evaluate once — avoids re-hitting DB inside the loop
    rows = list(rows)
    grand_total = sum((r["amount"] for r in rows), Decimal("0.00"))

    breakdown = [
        {
            "category_id":    str(r["category__id"]),
            "category_name":  r["category__name"],
            "category_color": r["category__color"] or "#B0B0B0",
            "category_icon":  r["category__icon"],
            "amount":         str(r["amount"].quantize(Decimal("0.01"))),
            "count":          r["count"],
            "percentage":     str(_pct(r["amount"], grand_total)),
        }
        for r in rows
    ]

    return {
        # Chart.js-ready arrays
        "labels":           [b["category_name"]  for b in breakdown],
        "background_colors":[b["category_color"] for b in breakdown],
        "amounts":          [float(b["amount"])  for b in breakdown],
        # Full detail for tooltips / table
        "total":            str(grand_total.quantize(Decimal("0.01"))),
        "breakdown":        breakdown,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Monthly trend
# ─────────────────────────────────────────────────────────────────────────────

def get_monthly_trend(user, months: int = 6) -> dict:
    """
    Total spending per calendar month for the last N months.

    DB hits: 1
      — TruncMonth annotate; PostgreSQL does the grouping.

    Chart.js output: labels + data arrays + raw detail.
    """
    months = max(1, min(months, 24))          # clamp 1–24
    today       = datetime.date.today().replace(day=1)
    start_date  = _n_months_before(today, months - 1)

    # Single grouped query — PostgreSQL date_trunc under the hood
    rows = (
        Expense.objects.filter(user=user, expense_date__gte=start_date)
        .annotate(month=TruncMonth("expense_date"))
        .values("month")
        .annotate(total=Sum("amount"), count=Count("id"))
        .order_by("month")
    )

    rows = list(rows)

    # Build a complete month skeleton (fill months with no expenses as 0)
    month_map: dict[str, dict] = {}
    cursor = start_date
    while cursor <= today:
        key = cursor.strftime("%Y-%m")
        month_map[key] = {"month": key, "total": "0.00", "count": 0}
        cursor = _next_month(cursor)

    for r in rows:
        key = r["month"].strftime("%Y-%m")
        if key in month_map:
            month_map[key]["total"] = str(r["total"].quantize(Decimal("0.01")))
            month_map[key]["count"] = r["count"]

    trend = list(month_map.values())   # already sorted by insertion order (Python 3.7+)

    return {
        # Chart.js-ready arrays
        "labels": [t["month"]        for t in trend],
        "data":   [float(t["total"]) for t in trend],
        # Full detail
        "months_requested": months,
        "trend":            trend,
    }
