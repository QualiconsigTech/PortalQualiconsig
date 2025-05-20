import logging
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from apps.chamados.models.chamados import Chamado
from apps.chamados.models.perguntas import PerguntaFrequente
from apps.chamados.models.comentario import ComentarioChamado
from apps.chamados.models.notificacao import Notificacao
from apps.chamados.models import Produto
from apps.chamados.serializers import *

logger = logging.getLogger(__name__)

# CHAMADOS
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

# FAQ
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

# COMENTÁRIOS
def listar_comentarios_chamado(chamado_id):
    comentarios = ComentarioChamado.objects.filter(chamado_id=chamado_id).order_by('criado_em')
    serializer = ComentarioChamadoSerializer(comentarios, many=True)
    return serializer.data

def criar_comentario_chamado(chamado_id, texto, autor):
    if not texto:
        return {"erro": "Texto do comentário é obrigatório."}, status.HTTP_400_BAD_REQUEST

    if len(texto) > 1000:
        return {"erro": "Texto muito grande (máximo 1000 caracteres)."}, status.HTTP_400_BAD_REQUEST

    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return {"erro": "Chamado não encontrado."}, status.HTTP_404_NOT_FOUND

    ComentarioChamado.objects.create(
        chamado=chamado,
        autor=autor,
        texto=texto
    )

    if autor.tipo == 'analista':
        Notificacao.objects.create(
            usuario_destino=chamado.usuario,
            chamado=chamado,
            mensagem=f"Seu chamado {chamado.titulo} recebeu uma resposta do analista."
        )
    elif autor.tipo == 'usuario' and chamado.analista:
        Notificacao.objects.create(
            usuario_destino=chamado.analista,
            chamado=chamado,
            mensagem=f"Novo comentário no chamado {chamado.titulo} que você está atendendo."
        )

    return {"mensagem": "Comentário adicionado com sucesso."}, status.HTTP_201_CREATED

# NOTIFICAÇÕES
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

# PRODUTOS
def listar_produtos():
    produtos = Produto.objects.all()
    serializer = ProdutoSerializer(produtos, many=True)
    return serializer.data, status.HTTP_200_OK

def criar_produto(data):
    serializer = ProdutoSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return serializer.data, status.HTTP_201_CREATED
    return serializer.errors, status.HTTP_400_BAD_REQUEST

def usar_produto(produto_id, quantidade_utilizada):
    try:
        produto = Produto.objects.get(id=produto_id)
        if produto.quantidade < quantidade_utilizada:
            return {'erro': 'Estoque insuficiente'}, status.HTTP_400_BAD_REQUEST

        produto.quantidade -= quantidade_utilizada
        produto.save()

        return {
            'mensagem': f'{quantidade_utilizada}x {produto.nome} utilizados. Estoque atualizado.',
            'estoque_atual': produto.quantidade
        }, status.HTTP_200_OK

    except Produto.DoesNotExist:
        return {'erro': 'Produto não encontrado'}, status.HTTP_404_NOT_FOUND
    except Exception as e:
        return {'erro': str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR
