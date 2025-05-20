import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
import json
from apps.chamados.models import Chamado, Categoria
from apps.usuarios.models import Setor
from apps.usuarios.models.prioridade import Prioridade
from apps.usuarios.models.cargo import Cargo
from apps.usuarios.models.links import links

logger = logging.getLogger(__name__)

#ANALISTA
def filtrar_chamados_por_analista(usuario):
    if usuario.tipo != 'analista' or not usuario.setor:
        logger.warning(f"[SERVICE] Usuário ID={usuario.id} não é analista ou não tem setor associado.")
        return Chamado.objects.none()

    logger.info(f"[SERVICE] Listando chamados do setor {usuario.setor} para analista ID={usuario.id}")
    return Chamado.objects.filter(setor=usuario.setor)


def atender_chamado(chamado_id, usuario):
    chamado = Chamado.objects.get(id=chamado_id)

    if chamado.analista:
        raise ValueError("Chamado já foi atribuído.")
    if chamado.encerrado_em:
        raise ValueError("Chamado já foi encerrado.")
    if usuario.tipo != "analista":
        raise PermissionError("Apenas analistas podem atender chamados.")

    chamado.analista = usuario
    chamado.editado_em = timezone.now()
    chamado.save()

    return chamado


def filtra_chamados_atribuidos(usuario):
    if usuario.tipo != 'analista':
        logger.warning(f"[SERVICE] Usuário ID={usuario.id} tentou acessar chamados atribuídos sem ser analista.")
        return Chamado.objects.none
    
    return Chamado.objects.filter(analista=usuario)

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



def encerrar_chamado(chamado_id, usuario, dados=None):
    chamado = Chamado.objects.get(id=chamado_id)

    if chamado.encerrado_em:
        raise ValueError("Chamado já está encerrado.")

    solucao = dados.get("solucao")
    if not solucao:
        raise ValueError("A solução é obrigatória para encerrar o chamado.")

    # Permissões: usuário criador ou analista atribuído
    if usuario.tipo == "usuario":
        if chamado.usuario_id != usuario.id:
            raise PermissionError("Apenas o criador do chamado pode encerrá-lo.")
        if chamado.analista:  # Se já tiver analista, usuário comum não pode mais encerrar
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
        raise ValueError("Erro ao decodificar os arquivos enviados.")

    chamado.arquivos = arquivos_json
    chamado.encerrado_em = timezone.now()
    chamado.editado_em = timezone.now()
    chamado.save()

    return chamado




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

#USUARIO
def listar_chamados_do_usuario(usuario):
    if usuario.tipo != 'usuario':
        logger.warning(f"[SERVICE] Permissão negada: ID={usuario.id} tentou acessar chamados de usuário.")
        raise PermissionDenied("Apenas usuários comuns podem acessar seus chamados.")
    
    logger.info(f"[SERVICE] Listando chamados do usuário ID={usuario.id}")
    return Chamado.objects.filter(usuario=usuario)

#USUARIO ADMIN
def listar_chamados_do_setor(usuario):
    if usuario.tipo != 'usuario' or not usuario.is_admin:
        logger.warning(f"[SERVICE] Acesso negado: ID={usuario.id} tentou acessar chamados do setor.")
        raise PermissionDenied("Apenas usuários administradores podem acessar essa informação.")
    
    logger.info(f"[SERVICE] Listando chamados do setor {usuario.setor} para admin ID={usuario.id}")
    return Chamado.objects.filter(usuario__setor=usuario.setor)

#Links
def listar_todos_os_links():
    logger.info("[SERVICE] Listando todos os links.")
    return links.objects.all()

#LISTAGEM 
def obter_dados_do_usuario(usuario):
    logger.info(f"[SERVICE] Obtendo dados do usuário ID={usuario.id}")
    return usuario 

def listar_categorias():
    logger.info("[SERVICE] Listando categorias.")
    return Categoria.objects.all()

def listar_setores():
    logger.info("[SERVICE] Listando setores.")
    return Setor.objects.all()

def listar_prioridades():
    logger.info("[SERVICE] Listando prioridades.")
    return Prioridade.objects.all()

def listar_cargos():
    logger.info("[SERVICE] Listando cargos.")
    return Cargo.objects.all()
