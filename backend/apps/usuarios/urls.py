from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.usuarios.views import UsuarioViewSet, GerentesPorSetorView
from .views import CargosListView

router = DefaultRouter()
router.register(r'', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path("gerentes/", GerentesPorSetorView.as_view(), name="gerentes-por-setor"),
    path("cargos/", CargosListView.as_view()),
    path('', include(router.urls)),
    
]