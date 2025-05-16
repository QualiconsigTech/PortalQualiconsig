import logging
from rest_framework.exceptions import PermissionDenied
from apps.chamados.models import Chamado

logger = logging.getLogger(__name__)

#ANALISTA ADMIN
def listar_chamados_admin(usuario, setor_nome=None):
    if usuario.tipo != 'analista' or not usuario.is_admin:
        logger.warning(f"[SERVICE] Acesso negado: usuário ID={usuario.id} tentou acessar todos chamados.")
        raise PermissionDenied("Acesso negado.")

    if setor_nome:
        logger.info(f"[SERVICE] Listando chamados do setor '{setor_nome}' para admin ID={usuario.id}")
        return Chamado.objects.filter(setor__nome__iexact=setor_nome)
    
    logger.info(f"[SERVICE] Listando todos os chamados para admin ID={usuario.id}")
    return Chamado.objects.all()

#USUARIO ADMIN
def listar_chamados_do_setor(usuario):
    if usuario.tipo != 'usuario' or not usuario.is_admin:
        logger.warning(f"[SERVICE] Acesso negado: ID={usuario.id} tentou acessar chamados do setor.")
        raise PermissionDenied("Apenas usuários administradores podem acessar essa informação.")
    
    logger.info(f"[SERVICE] Listando chamados do setor {usuario.setor} para admin ID={usuario.id}")
    return Chamado.objects.filter(usuario__setor=usuario.setor)