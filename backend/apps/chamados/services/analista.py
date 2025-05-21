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

    if chamado.analista:
        raise ValueError("Chamado já foi atribuído.")
    if chamado.encerrado_em:
        raise ValueError("Chamado já foi encerrado.")
    if usuario.tipo != "analista":
        raise PermissionError("Apenas analistas podem atender chamados.")

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
        raise ValueError("Chamado já está encerrado.")

    solucao = dados.get("solucao")
    if not solucao:
        raise ValueError("A solução é obrigatória para encerrar o chamado.")

    
    if usuario.tipo == "usuario":
        if chamado.usuario_id != usuario.id:
            raise PermissionError("Apenas o criador do chamado pode encerrá-lo.")
        if chamado.analista: 
            raise PermissionError("Chamado já está em atendimento. Apenas o analista pode encerrar.")
    elif usuario.tipo == "analista":
        if chamado.analista_id != usuario.id:
            raise PermissionError("Apenas o analista atribuído pode encerrar este chamado.")
    else:
        raise PermissionError("Tipo de usuário não permitido para encerrar o chamado.")

    chamado.solucao = solucao
    chamado.comentarios = dados.get("comentarios", "")
    arquivos_raw = dados.get("arquivos", "[]")
    try:
        arquivos_json = json.loads(arquivos_raw)
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