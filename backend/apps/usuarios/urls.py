from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.usuarios.views import UsuarioViewSet, GerentesPorSetorView
from apps.core.models import Cargo, Setor

router = DefaultRouter()
router.register(r'', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path("gerentes/", GerentesPorSetorView.as_view(), name="gerentes-por-setor"),
    path('', include(router.urls)),
    
]