from django.urls import path
from apps.chamados.views.chamados import *
from apps.chamados.views.admin import *
from apps.chamados.views.analista import *
from apps.chamados.views.comentarios import *
from apps.chamados.views.faq import *
from apps.chamados.views.notificacoes import *
from apps.chamados.views.usuario import *
from apps.chamados.views.utils import *
from apps.chamados.views.dashboard import *

urlpatterns = [
    ## CHAMADOS
    path('criar/', CriarChamadoView.as_view()),
    path('', ListarUltimosChamadosView.as_view()),
    path('historico/', ListarHistoricoChamadosView.as_view()),
    path('<int:chamado_id>/', DetalhesChamadoView.as_view()),
    path('atualizar/<int:chamado_id>/', AtualizarChamadoView.as_view()),
    path('deletar/<int:chamado_id>/', DeletarChamadoView.as_view()),

    ## FAQ
    path('faq/criar/', CriarPerguntaFrequenteView.as_view(), name='criar-pergunta-frequente'),
    path('faq/', ListarPerguntasFrequentesView.as_view(), name='listar-perguntas-frequentes'),

    ## COMENTARIO
    path('<int:chamado_id>/comentarios/', ListarComentariosChamadoView.as_view(), name="listar_comentarios_chamado"),
    path('<int:chamado_id>/comentarios/criar/', CriarComentarioChamadoView.as_view(), name="criar_comentario_chamado"),

    ## NOTIFICACAO
    path('notificacoes/criar/', CriarNotificacaoView.as_view(), name='criar-notificacao'),
    path('notificacoes/', ListarNotificacoesUsuarioView.as_view(), name='listar-notificacoes-usuario'),
    path('notificacoes/<int:notificacao_id>/visualizar/', MarcarNotificacaoVisualizadaView.as_view(), name='marcar-notificacao-visualizada'),
    path('notificacoes/marcar-todas/', MarcarTodasNotificacoesLidasView.as_view(), name='marcar-todas-notificacoes'),

    ## ANALISTA
    path('analista/', ChamadosDoAnalistaView.as_view(), name='chamados-analista'),
    path('<int:chamado_id>/atender/', AtenderChamadoView.as_view(), name='atender-chamado'),
    path('atribuidos/', ChamadosAtribuidosView.as_view(), name='chamados-atribuidos'),
    path('<int:chamado_id>/encerrar/', EncerrarChamadoView.as_view(), name='encerrar-chamado'),
    
    ## ANALISTA ADMIN
    path('analista/admin/', ChamadosAdminView.as_view(), name='chamados-admin'),
    path('analista/admin/<str:setor_nome>/', ChamadosPorSetorAdminView.as_view(), name='chamados-admin-setor'),

    ## USUARIOS
     path('meus/', ChamadosDoUsuarioView.as_view(), name='chamados-do-usuario'),

    ## USUARIO ADMIN
    path('setor/', ChamadosDoSetorView.as_view(), name='chamados-do-setor'),
    path('me/', UsuarioLogadoView.as_view(), name='usuario-logado'),

    ## LISTAGEM
    path("categorias/", CategoriasListView.as_view(), name="categorias-list"),
    path("prioridades/", PrioridadesListView.as_view(), name="prioridades-list"),

    ## DASHBOARD
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
