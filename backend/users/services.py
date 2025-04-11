from chamados.models import Chamado
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, NotFound
import json
from chamados.models import Chamado, Categoria
from users.models import Setor
from users.models.prioridade import Prioridade


# Analista
def filtrar_chamados_por_analista(usuario):
    if usuario.tipo != 'analista' or not usuario.setor:
        return Chamado.objects.none()

    return Chamado.objects.filter(setor=usuario.setor)


def atender_chamado(usuario, chamado_id):
    chamado = get_object_or_404(Chamado, id=chamado_id)

    if usuario.tipo != 'analista':
        raise PermissionError("Somente analistas podem atender chamados.")

    if chamado.analista is not None:
        raise ValueError("Chamado já está sendo atendido.")

    chamado.analista = usuario
    chamado.editado_em = timezone.now()
    chamado.save()

    return chamado

def filtra_chamados_atribuidos(usuario):
    if usuario.tipo != 'analista':
        return Chamado.objects.none
    
    return Chamado.objects.filter(analista=usuario)


def encerrar_chamado(chamado_id, usuario, dados=None):
    chamado = Chamado.objects.get(id=chamado_id)

    if chamado.analista != usuario:
        raise PermissionError("Você não tem permissão para encerrar este chamado.")

    if chamado.encerrado_em:
        raise ValueError("Chamado já encerrado.")

    if not dados or not dados.get("solucao"):
        raise ValueError("É necessário informar a solução para encerrar o chamado.")

    chamado.solucao = dados.get("solucao")
    chamado.comentarios = dados.get("comentarios")
    arquivos_raw = dados.get("arquivos")
    try:
        arquivos_json = json.loads(arquivos_raw) if arquivos_raw else []
        if not isinstance(arquivos_json, list):
            raise ValueError("Formato inválido de arquivos.")
    except json.JSONDecodeError:
        raise ValueError("Erro ao decodificar os arquivos.")
    
    chamado.arquivos = arquivos_json

    chamado.encerrado_em = timezone.now()
    chamado.editado_em = timezone.now()
    chamado.save()

    return chamado



# Analista Admin
def listar_chamados_admin(usuario, setor_nome=None):
    if usuario.tipo != 'analista' or not usuario.is_admin:
        raise PermissionDenied("Acesso negado.")

    if setor_nome:
        return Chamado.objects.filter(setor__nome__iexact=setor_nome)
    return Chamado.objects.all()

## Usuarios
def listar_chamados_do_usuario(usuario):
    if usuario.tipo != 'usuario':
        raise PermissionDenied("Apenas usuários comuns podem acessar seus chamados.")
    
    return Chamado.objects.filter(usuario=usuario)

## Usuarios Admin
def listar_chamados_do_setor(usuario):
    if usuario.tipo != 'usuario' or not usuario.is_admin:
        raise PermissionDenied("Apenas usuários administradores podem acessar essa informação.")

    return Chamado.objects.filter(usuario__setor=usuario.setor)

#Listagem 
def obter_dados_do_usuario(usuario):
    return usuario 

def listar_categorias():
    return Categoria.objects.all()

def listar_setores():
    return Setor.objects.all()

def listar_prioridades():
    return Prioridade.objects.all()
