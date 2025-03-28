from django.urls import path
from users.views import (
    abrir_chamado,
)

from django.urls import path

urlpatterns = []

''''
from .views import ChamadosDoAnalistaView, AtenderChamadoView

urlpatterns = [
    path('abrir-chamado/', abrir_chamado),
    path('chamados/', ChamadosDoAnalistaView.as_view(), name='chamados-analista'),
    path('chamados/<int:chamado_id>/atender/', AtenderChamadoView.as_view(), name='atender-chamado'),

]
'''