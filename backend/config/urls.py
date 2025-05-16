from django.contrib import admin
from django.urls import path, include
from apps.integracoes.webhook import github_webhook
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/auth/', include('apps.auth.urls')),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/chamados/', include('apps.chamados.urls')),
    path('api/integracoes/', include('apps.integracoes.urls')),
    path("webhook/github/", github_webhook),
    path("api/dashboard/", include("apps.dashboard.urls")),
]
