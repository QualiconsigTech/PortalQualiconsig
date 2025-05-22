import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.chamados.services.notificacoes import *

logger = logging.getLogger(__name__)

class CriarNotificacaoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data, status_code = criar_notificacao(request.data)
        return Response(data, status=status_code)


class ListarNotificacoesUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = listar_notificacoes_usuario(request.user)
        return Response(data, status=status.HTTP_200_OK)


class MarcarNotificacaoVisualizadaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notificacao_id):
        data, status_code = marcar_notificacao_visualizada(notificacao_id, request.user)
        return Response(data, status=status_code)


class MarcarTodasNotificacoesLidasView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data, status_code = marcar_todas_notificacoes_lidas(request.user)
        return Response(data, status=status_code)