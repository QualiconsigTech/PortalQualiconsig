from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'setores', SetorViewSet, basename='setor')
router.register(r'cargos', CargoViewSet, basename='cargo')

urlpatterns = [
    path('', include(router.urls)),
    ## LINKS
    path('links/', LinksView.as_view(), name='links-list'),
    path('links/criar/', LinksCreateView.as_view(), name='links-list'),
]