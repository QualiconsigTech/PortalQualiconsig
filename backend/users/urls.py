from django.urls import path
from users.views import (
    abrir_chamado,
)

urlpatterns = [
    path('abrir-chamado/', abrir_chamado),
]
