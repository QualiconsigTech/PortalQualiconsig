from django.urls import path
from .views import create_monday_task

urlpatterns = [
    path('monday/create-task/', create_monday_task)
]
