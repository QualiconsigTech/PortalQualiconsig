import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from apps.chamados.models.chamados import Chamado
from apps.chamados.models.notificacao import Notificacao
from apps.chamados.serializers import *

logger = logging.getLogger(__name__)

def criar_chamado(data, usuario):
    data = data.copy()
    data['usuario'] = usuario.id
    serializer = ChamadoSerializer(data=data)
    if serializer.is_valid():
        chamado = serializer.save(usuario=usuario)
        Notificacao.objects.create(
            mensagem=f"Seu chamado de  N°{chamado.id} foi aberto com sucesso.",
            usuario_destino=usuario,
            chamado=chamado
        )
        return {'mensagem': 'Chamado criado com sucesso.'}, None, status.HTTP_201_CREATED
    return None, serializer.errors, status.HTTP_400_BAD_REQUEST

def listar_ultimos_chamados(usuario_id):
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')[:10]
    serializer = ChamadoSerializer(chamados, many=True)
    return serializer.data

def listar_historico_chamados(usuario_id):
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')
    serializer = ChamadoSerializer(chamados, many=True)
    return serializer.data

def detalhes_chamado(chamado_id, usuario):
    chamado = get_object_or_404(Chamado, id=chamado_id)
    if chamado.usuario != usuario and not usuario.is_admin:
        return None, status.HTTP_403_FORBIDDEN
    serializer = ChamadoDetalhadoSerializer(chamado)
    return serializer.data, status.HTTP_200_OK

def atualizar_chamado(data, chamado_id, usuario):
    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return {'erro': 'Chamado não encontrado'}, status.HTTP_404_NOT_FOUND

    if usuario != chamado.usuario and not usuario.is_admin:
        return {'erro': 'Você não tem permissão para atualizar este chamado.'}, status.HTTP_403_FORBIDDEN

    serializer = ChamadoSerializer(chamado, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return {
            'mensagem': 'Chamado atualizado com sucesso.',
            'dados': serializer.data
        }, status.HTTP_200_OK
    return serializer.errors, status.HTTP_400_BAD_REQUEST

def deletar_chamado(chamado_id, usuario):
    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return {'erro': 'Chamado não encontrado'}, status.HTTP_404_NOT_FOUND

    if usuario != chamado.usuario and not usuario.is_admin:
        return {'erro': 'Você não tem permissão para deletar este chamado.'}, status.HTTP_403_FORBIDDEN

    chamado.delete()
    return {'mensagem': 'Chamado deletado com sucesso.'}, status.HTTP_200_OK
