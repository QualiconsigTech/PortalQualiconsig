import logging
from apps.core.models.setor import Setor
from apps.core.models.cargo import Cargo
from apps.core.models.links import links
from apps.core.models.grupo import Grupo


logger = logging.getLogger(__name__)

# ===== SETOR =====

def listar_setores():
    logger.info("[SERVICE] Listando todos os setores.")
    return Setor.objects.all()

def obter_setor_por_id(setor_id):
    logger.info(f"[SERVICE] Buscando setor com ID={setor_id}.")
    return Setor.objects.filter(id=setor_id).first()

def criar_setor(data):
    logger.info(f"[SERVICE] Criando setor com dados: {data}.")
    return Setor.objects.create(**data)

def atualizar_setor(setor, data):
    logger.info(f"[SERVICE] Atualizando setor ID={setor.id} com dados: {data}.")
    for attr, value in data.items():
        setattr(setor, attr, value)
    setor.save()
    return setor

def deletar_setor(setor):
    logger.info(f"[SERVICE] Deletando setor ID={setor.id}.")
    setor.delete()


# ===== CARGO =====

def listar_cargos():
    logger.info("[SERVICE] Listando todos os cargos.")
    return Cargo.objects.all()

def obter_cargo_por_id(cargo_id):
    logger.info(f"[SERVICE] Buscando cargo com ID={cargo_id}.")
    return Cargo.objects.filter(id=cargo_id).first()

def criar_cargo(data):
    logger.info(f"[SERVICE] Criando cargo com dados: {data}.")
    return Cargo.objects.create(**data)

def atualizar_cargo(cargo, data):
    logger.info(f"[SERVICE] Atualizando cargo ID={cargo.id} com dados: {data}.")
    for attr, value in data.items():
        setattr(cargo, attr, value)
    cargo.save()
    return cargo

def deletar_cargo(cargo):
    logger.info(f"[SERVICE] Deletando cargo ID={cargo.id}.")
    cargo.delete()


# ===== LINKS =====

def listar_todos_os_links():
    logger.info("[SERVICE] Listando todos os links.")
    return links.objects.all()


# ===== GRUPOS =====

def listar_grupos():
    logger.info("[SERVICE] Listando todos os grupos.")
    return Grupo.objects.all()

def obter_grupo_por_id(grupo_id):
    logger.info(f"[SERVICE] Buscando grupo com ID={grupo_id}.")
    return Grupo.objects.filter(id=grupo_id).first()

def criar_grupo(data):
    logger.info(f"[SERVICE] Criando grupo com dados: {data}.")
    return Grupo.objects.create(**data)

def atualizar_grupo(grupo, data):
    logger.info(f"[SERVICE] Atualizando grupo ID={grupo.id} com dados: {data}.")
    for attr, value in data.items():
        setattr(grupo, attr, value)
    grupo.save()
    return grupo

def deletar_grupo(grupo):
    logger.info(f"[SERVICE] Deletando grupo ID={grupo.id}.")
    grupo.delete()
