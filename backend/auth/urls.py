from django.urls import path
from .views import alterar_senha
from rest_framework_simplejwt.views import TokenRefreshView
from .views import cadastrar_usuario, atualizar_usuario_analista, deletar_usuario_analista, login

urlpatterns = [
    path('cadastrar/usuario/', cadastrar_usuario),
    path('login/', login),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('atualizar/<str:tipo>/<int:id>/', atualizar_usuario_analista),
    path('deletar/<str:tipo>/<int:id>/', deletar_usuario_analista),
    path('alterar-senha/', alterar_senha),
]