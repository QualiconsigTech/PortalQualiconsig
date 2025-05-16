from django.urls import path
from apps.chamados.views import *

urlpatterns = [
    path('criar/', CriarChamadoView.as_view()),
    path('', ListarUltimosChamadosView.as_view()),
    path('historico/', ListarHistoricoChamadosView.as_view()),
    path('<int:chamado_id>/', DetalhesChamadoView.as_view()),
    path('atualizar/<int:chamado_id>/', AtualizarChamadoView.as_view()),
    path('deletar/<int:chamado_id>/', DeletarChamadoView.as_view()),

    path('faq/criar/', CriarPerguntaFrequenteView.as_view(), name='criar-pergunta-frequente'),
    path('faq/', ListarPerguntasFrequentesView.as_view(), name='listar-perguntas-frequentes'),

    path('<int:chamado_id>/comentarios/', ListarComentariosChamadoView.as_view(), name="listar_comentarios_chamado"),
    path('<int:chamado_id>/comentarios/criar/', CriarComentarioChamadoView.as_view(), name="criar_comentario_chamado"),

    path('notificacoes/criar/', CriarNotificacaoView.as_view(), name='criar-notificacao'),
    path('notificacoes/', ListarNotificacoesUsuarioView.as_view(), name='listar-notificacoes-usuario'),
    path('notificacoes/<int:notificacao_id>/visualizar/', MarcarNotificacaoVisualizadaView.as_view(), name='marcar-notificacao-visualizada'),
    path('notificacoes/marcar-todas/', MarcarTodasNotificacoesLidasView.as_view(), name='marcar-todas-notificacoes'),

    path('produtos/', ProdutosView.as_view()),
    path('produtos/usar/', UsarProdutoView.as_view()),
]
