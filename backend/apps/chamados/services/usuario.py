import logging
from rest_framework.exceptions import PermissionDenied
from apps.chamados.models import Chamado


logger = logging.getLogger(__name__)

def listar_chamados_do_usuario(usuario):
    if usuario.tipo != 'usuario':
        logger.warning(f"[SERVICE] Permissão negada: ID={usuario.id} tentou acessar chamados de usuário.")
        raise PermissionDenied("Apenas usuários comuns podem acessar seus chamados.")
    
    logger.info(f"[SERVICE] Listando chamados do usuário ID={usuario.id}")
    return Chamado.objects.filter(usuario=usuario)
