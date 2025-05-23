from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.auth.views import *


urlpatterns = [
    path('cadastrar/usuario/', CadastrarUsuarioView.as_view(), name='cadastrar-usuario'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UsuarioLogadoView.as_view(), name='usuario-logado'),
    path('atualizar/<str:tipo>/<int:id>/', AtualizarUsuarioView.as_view(), name='atualizar-usuario'),
    path('deletar/<str:tipo>/<int:id>/', DeletarUsuarioView.as_view(), name='deletar-usuario'),
    path('alterar-senha/', AtualizarSenhaView.as_view(), name='deletar-usuario'),
    path('cadastrar/usuarios/', CadastrarUsuariosEmLoteView.as_view(), name='cadastrar-usuarios-em-lote'),

]