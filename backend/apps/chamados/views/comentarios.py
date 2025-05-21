import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.chamados.services.comentarios import *

logger = logging.getLogger(__name__)

class ListarComentariosChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chamado_id):
        data = listar_comentarios_chamado(chamado_id)
        return Response(data, status=status.HTTP_200_OK)


class CriarComentarioChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        texto = request.data.get("texto")
        data, status_code = criar_comentario_chamado(chamado_id, texto, request.user)
        return Response(data, status=status_code)