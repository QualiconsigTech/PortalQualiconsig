import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.chamados.services.faq import *

logger = logging.getLogger(__name__)

class CriarPerguntaFrequenteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data, status_code = criar_pergunta_frequente(request.data)
        return Response(data, status=status_code)


class ListarPerguntasFrequentesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = listar_perguntas_frequentes()
        return Response(data, status=status.HTTP_200_OK)
