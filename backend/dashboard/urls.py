from django.urls import path
from dashboard.views import (ChamadosTotalViews, ChamadosPorSetorViews,TopUsuarioViews, TopSetorViews, EvolucaoChamadosViews, ChamadosPorCategoriaView)
from . import views

urlpatterns = [
    path("chamados-total/", ChamadosTotalViews.as_view()),
    path("chamados-por-setor/", ChamadosPorSetorViews.as_view()),
    path("top-usuario/", TopUsuarioViews.as_view()),
    path("top-setor/", TopSetorViews.as_view()),
    path("evolucao-chamados/", EvolucaoChamadosViews.as_view()),
    path("chamados-por-categoria/", ChamadosPorCategoriaView.as_view()),
]
