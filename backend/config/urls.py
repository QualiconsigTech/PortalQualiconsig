from django.contrib import admin
from django.urls import path, include
from integracoes.webhook import github_webhook


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth.urls')),
    path('api/usuarios/', include('users.urls')),
    path('api/chamados/', include('chamados.urls')),
    path('api/integracoes/', include('integracoes.urls')),
    path("webhook/github/", github_webhook),
    path("api/dashboard/", include("dashboard.urls")),
]
