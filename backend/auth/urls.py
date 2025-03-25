from django.urls import path
from .views import cadastrar_usuario, cadastrar_analista, login, atualizar_usuario_analista, deletar_usuario_analista

urlpatterns = [
    path('cadastrar/usuario/', cadastrar_usuario),
    path('cadastrar/analista/', cadastrar_analista),
    path('login/', login),
    path('atualizar/<str:tipo>/<int:id>/', atualizar_usuario_analista),
    path('deletar/<str:tipo>/<int:id>/', deletar_usuario_analista),
]
