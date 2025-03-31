from django.urls import path
from users.views import ChamadosDoAnalistaView, AtenderChamadoView, EnviarResetSenhaView, ConfirmarResetSenhaView,UsuarioLogadoView,ChamadosAtribuidosView, ChamadosDoSetorView,EncerrarChamadoView, ChamadosAdminView, ChamadosPorSetorAdminView,ChamadosDoUsuarioView

urlpatterns = [
    ## ANALISTA
    path('chamados/', ChamadosDoAnalistaView.as_view(), name='chamados-analista'),
    path('chamados/<int:chamado_id>/atender/', AtenderChamadoView.as_view(), name='atender-chamado'),
    path('chamados/atribuidos/', ChamadosAtribuidosView.as_view(), name='chamados-atribuidos'),
    path('chamados/<int:chamado_id>/encerrar/', EncerrarChamadoView.as_view(), name='encerrar-chamado'),
    ## ANALISTA ADMIN
    path('chamados/admin/', ChamadosAdminView.as_view(), name='chamados-admin'),
    path('chamados/admin/<str:setor_nome>/', ChamadosPorSetorAdminView.as_view(), name='chamados-admin-setor'),
    ## USUARIOS
     path('chamados/meus/', ChamadosDoUsuarioView.as_view(), name='chamados-do-usuario'),
    ## USUARIO ADMIN
    path('chamados/setor/', ChamadosDoSetorView.as_view(), name='chamados-do-setor'),
    path('me/', UsuarioLogadoView.as_view(), name='usuario-logado'),
    path('reset-password/', EnviarResetSenhaView.as_view(), name='enviar-reset-senha'),
    path('reset-password/confirm/', ConfirmarResetSenhaView.as_view(), name='confirmar-reset-senha'),
]
