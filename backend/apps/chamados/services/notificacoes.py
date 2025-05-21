import logging
from rest_framework import status
from apps.chamados.models.notificacao import Notificacao
from apps.chamados.serializers import *

logger = logging.getLogger(__name__)

def criar_notificacao(data):
    serializer = NotificacaoSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return serializer.data, status.HTTP_201_CREATED
    return serializer.errors, status.HTTP_400_BAD_REQUEST

def listar_notificacoes_usuario(usuario):
    notificacoes = Notificacao.objects.filter(usuario_destino=usuario).order_by('-criado_em')
    serializer = NotificacaoSerializer(notificacoes, many=True)
    return serializer.data

def marcar_notificacao_visualizada(notificacao_id, usuario):
    try:
        notificacao = Notificacao.objects.get(id=notificacao_id, usuario_destino=usuario)
        notificacao.visualizado = True
        notificacao.save()
        return {"detail": "Notificação marcada como visualizada."}, status.HTTP_200_OK
    except Notificacao.DoesNotExist:
        return {"detail": "Notificação não encontrada."}, status.HTTP_404_NOT_FOUND

def marcar_todas_notificacoes_lidas(usuario):
    notificacoes = Notificacao.objects.filter(usuario_destino=usuario, visualizado=False)
    notificacoes.update(visualizado=True)
    return {"mensagem": "Todas as notificações foram marcadas como lidas."}, status.HTTP_200_OK