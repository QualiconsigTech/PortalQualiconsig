from apps.usuarios.models import Usuario

def listar_usuarios():
    return Usuario.objects.filter(deletado=False)

def obter_usuario_por_id(usuario_id):
    return Usuario.objects.filter(id=usuario_id, deletado=False).first()

def criar_usuario(data):
    return Usuario.objects.create(**data)

def atualizar_usuario(usuario, data):
    for attr, value in data.items():
        setattr(usuario, attr, value)
    usuario.save()
    return usuario

def deletar_usuario(usuario):
    usuario.deletado = True
    usuario.save()
    return usuario