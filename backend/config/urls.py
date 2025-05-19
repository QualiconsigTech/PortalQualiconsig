from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from apps.integracoes.webhook import github_webhook

schema_view = get_schema_view(
    openapi.Info(
        title="Qualiconsig API",
        default_version='v1',
        description="Documentação da API dos módulos do Portal Qualiconsig",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),   
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/core/', include('apps.core.urls')),
    path('api/auth/', include('apps.auth.urls')),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/chamados/', include('apps.chamados.urls')),
    path('api/financeiro/', include('apps.financeiro.urls')),
    path('api/integracoes/', include('apps.integracoes.urls')),
    path("webhook/github/", github_webhook),
]
