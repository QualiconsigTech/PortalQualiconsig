from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.usuarios.views import UsuarioViewSet

router = DefaultRouter()
router.register(r'', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('', include(router.urls)),
]