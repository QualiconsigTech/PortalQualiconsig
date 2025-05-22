import logging
from rest_framework.exceptions import PermissionDenied
from apps.chamados.models import Chamado
from django.utils import timezone


logger = logging.getLogger(__name__)

def listar_chamados_do_usuario(usuario):
    if usuario.tipo != 'usuario':
        logger.warning(f"[SERVICE] Permissão negada: ID={usuario.id} tentou acessar chamados de usuário.")
        raise PermissionDenied("Apenas usuários comuns podem acessar seus chamados.")
    
    logger.info(f"[SERVICE] Listando chamados do usuário ID={usuario.id}")
    return Chamado.objects.filter(usuario=usuario)

def cancelar_chamado(chamado_id, usuario, dados=None):
    chamado = Chamado.objects.get(id=chamado_id)

    if chamado.encerrado_em or chamado.analista:
        raise ValueError("Chamado já está em atendimento ou encerrado. Não pode ser cancelado.")

    if usuario.tipo != "usuario":
        raise PermissionDenied("Apenas usuários podem cancelar chamados.")

    solucao = dados.get("solucao")
    if not solucao:
        raise ValueError("É necessário informar a solução para cancelar o chamado.")

    chamado.solucao = solucao
    chamado.encerrado_em = timezone.now()
    chamado.editado_em = timezone.now()
    chamado.save()

    return chamado