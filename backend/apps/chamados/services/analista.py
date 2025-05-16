import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
import json
from apps.chamados.models import Chamado

logger = logging.getLogger(__name__)

def filtrar_chamados_por_analista(usuario):
    if usuario.tipo != 'analista' or not usuario.setor:
        logger.warning(f"[SERVICE] Usuário ID={usuario.id} não é analista ou não tem setor associado.")
        return Chamado.objects.none()

    logger.info(f"[SERVICE] Listando chamados do setor {usuario.setor} para analista ID={usuario.id}")
    return Chamado.objects.filter(setor=usuario.setor)


def atender_chamado(usuario, chamado_id):
    chamado = get_object_or_404(Chamado, id=chamado_id)

    if usuario.tipo != 'analista':
        logger.warning(f"[SERVICE] Permissão negada: usuário ID={usuario.id} tentou atender chamado.")
        raise PermissionError("Somente analistas podem atender chamados.")

    if chamado.analista is not None:
        logger.warning(f"[SERVICE] Chamado ID={chamado_id} já está sendo atendido.")
        raise ValueError("Chamado já está sendo atendido.")

    chamado.analista = usuario
    chamado.editado_em = timezone.now()
    chamado.save()

    logger.info(f"[SERVICE] Chamado ID={chamado_id} atribuído ao analista ID={usuario.id}")
    return chamado

def filtra_chamados_atribuidos(usuario):
    if usuario.tipo != 'analista':
        logger.warning(f"[SERVICE] Usuário ID={usuario.id} tentou acessar chamados atribuídos sem ser analista.")
        return Chamado.objects.none
    
    return Chamado.objects.filter(analista=usuario)


def encerrar_chamado(chamado_id, usuario, dados=None):
    chamado = Chamado.objects.get(id=chamado_id)

    if chamado.encerrado_em:
        logger.warning(f"[SERVICE] Tentativa de reencerramento do chamado ID={chamado_id}")
        raise ValueError("Chamado já encerrado.")

    if not dados or not dados.get("solucao"):
        logger.warning(f"[SERVICE] Encerramento inválido: solução ausente no chamado ID={chamado_id}")
        raise ValueError("É necessário informar a solução para encerrar o chamado.")

    chamado.solucao = dados.get("solucao")
    chamado.comentarios = dados.get("comentarios")
    arquivos_raw = dados.get("arquivos")
    try:
        arquivos_json = json.loads(arquivos_raw) if arquivos_raw else []
        if not isinstance(arquivos_json, list):
            raise ValueError("Formato inválido de arquivos.")
    except json.JSONDecodeError:
        logger.error(f"[SERVICE] Erro ao decodificar arquivos no encerramento do chamado ID={chamado_id}")
        raise ValueError("Erro ao decodificar os arquivos.")
    
    chamado.arquivos = arquivos_json

    chamado.encerrado_em = timezone.now()
    chamado.editado_em = timezone.now()
    chamado.save()

    return chamado