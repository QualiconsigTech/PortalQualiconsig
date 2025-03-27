from django.urls import path
from chamados.views import (criar_chamado, listar_ultimos_chamados, listar_historico_chamados, detalhes_chamado, atualizar_chamado, deletar_chamado)

urlpatterns = [
    path('criar/', criar_chamado),
    path('', listar_ultimos_chamados),
    path('historico/', listar_historico_chamados),
    path('<int:chamado_id>/', detalhes_chamado),
    path('atualizar/<int:chamado_id>/', atualizar_chamado),
    path('deletar/<int:chamado_id>/', deletar_chamado),

]
