from django.urls import path
from .views import SummaryView, CategoryBreakdownView, MonthlyTrendView

urlpatterns = [
    path("summary/",            SummaryView.as_view(),           name="analytics-summary"),
    path("category-breakdown/", CategoryBreakdownView.as_view(), name="analytics-category-breakdown"),
    path("monthly-trend/",      MonthlyTrendView.as_view(),      name="analytics-monthly-trend"),
]
