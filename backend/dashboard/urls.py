from django.urls import path
from dashboard.view import (
    ChamadosTotalView, ChamadosPorSetorView,
    TopUsuarioView, TopSetorView
)

urlpatterns = [
    path("chamados-total/", ChamadosTotalView.as_view()),
    path("chamados-por-setor/", ChamadosPorSetorView.as_view()),
    path("top-usuario/", TopUsuarioView.as_view()),
    path("top-setor/", TopSetorView.as_view()),
]
