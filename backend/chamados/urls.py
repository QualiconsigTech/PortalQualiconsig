from django.urls import path
from chamados.views import (criar_chamado, listar_ultimos_chamados, listar_historico_chamados, detalhes_chamado,)

urlpatterns = [
    path('criar/', criar_chamado),
    path('chamados/', listar_ultimos_chamados),
    path('historico/', listar_historico_chamados),
    path('chamado/<int:chamado_id>/', detalhes_chamado),
]
