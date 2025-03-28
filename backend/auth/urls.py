from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import cadastrar_usuario, cadastrar_analista, atualizar_usuario_analista, deletar_usuario_analista, login
from users.token import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('cadastrar/usuario/', cadastrar_usuario),
    path('cadastrar/analista/', cadastrar_analista),
    path('login/', login),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('atualizar/<str:tipo>/<int:id>/', atualizar_usuario_analista),
    path('deletar/<str:tipo>/<int:id>/', deletar_usuario_analista),
]
