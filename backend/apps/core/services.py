import logging
from core.models.setor import Setor
from core.models.cargo import Cargo
from core.models.links import links


logger = logging.getLogger(__name__)

def listar_setores():
    return Setor.objects.all()

def obter_setor_por_id(setor_id):
    return Setor.objects.filter(id=setor_id).first()

def criar_setor(data):
    return Setor.objects.create(**data)

def atualizar_setor(setor, data):
    for attr, value in data.items():
        setattr(setor, attr, value)
    setor.save()
    return setor

def deletar_setor(setor):
    setor.delete()

def listar_cargos():
    return Cargo.objects.all()

def obter_cargo_por_id(cargo_id):
    return Cargo.objects.filter(id=cargo_id).first()

def criar_cargo(data):
    return Cargo.objects.create(**data)

def atualizar_cargo(cargo, data):
    for attr, value in data.items():
        setattr(cargo, attr, value)
    cargo.save()
    return cargo

def deletar_cargo(cargo):
    cargo.delete()

def listar_todos_os_links():
    logger.info("[SERVICE] Listando todos os links.")
    return links.objects.all()