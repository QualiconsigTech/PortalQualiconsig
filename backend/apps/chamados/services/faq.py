import logging
from rest_framework import status
from apps.chamados.models.perguntas import PerguntaFrequente
from apps.chamados.serializers import *

logger = logging.getLogger(__name__)

def criar_pergunta_frequente(data):
    serializer = PerguntaFrequenteSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return {'mensagem': 'Pergunta cadastrada com sucesso.'}, status.HTTP_201_CREATED
    return serializer.errors, status.HTTP_400_BAD_REQUEST

def listar_perguntas_frequentes():
    perguntas = PerguntaFrequente.objects.filter(deletado=False).order_by('id')
    serializer = PerguntaFrequenteSerializer(perguntas, many=True)
    return serializer.data