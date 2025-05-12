from django.urls import path
from dashboard.views import (ChamadosAbertosViews,ChamadosEmAtendimentoViews,ChamadosEncerradosViews,ChamadosTotalViews, ChamadosPorSetorViews,TopUsuarioViews, TopSetorViews, EvolucaoChamadosViews, ChamadosPorCategoriaView)
from . import views

urlpatterns = [
    path("chamados-total/", ChamadosTotalViews.as_view()),
    path("chamados-por-setor/", ChamadosPorSetorViews.as_view()),
    path("top-usuario/", TopUsuarioViews.as_view()),
    path("top-setor/", TopSetorViews.as_view()),
    path("evolucao-chamados/", EvolucaoChamadosViews.as_view()),
    path("chamados-por-categoria/", ChamadosPorCategoriaView.as_view()),
    path("chamados-abertos/", ChamadosAbertosViews.as_view()),
    path("chamados-em-atendimento/", ChamadosEmAtendimentoViews.as_view()),
    path("chamados-encerrados/", ChamadosEncerradosViews.as_view()),
]
