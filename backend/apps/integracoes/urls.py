from django.urls import path
from apps.integracoes.views import CreateMondayTaskView

urlpatterns = [
    path('monday/create-task/', CreateMondayTaskView.as_view())
]
