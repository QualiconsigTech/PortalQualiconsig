import logging
from rest_framework import status
from django.utils import timezone
from apps.chamados.models.chamados import Chamado
from apps.chamados.models.comentario import ComentarioChamado
from apps.chamados.models.notificacao import Notificacao
from apps.chamados.serializers import *

logger = logging.getLogger(__name__)

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

    if chamado.analista == autor:
        chamado.editado_em = timezone.now()
        chamado.save()

    return {"mensagem": "Comentário adicionado com sucesso."}, status.HTTP_201_CREATED