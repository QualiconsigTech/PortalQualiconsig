import logging
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from apps.usuarios.models.usuarios import Usuario
from .serializers import UsuarioSerializer
from django.utils.timezone import now

logger = logging.getLogger(__name__)

def gerar_token(usuario):
    refresh = RefreshToken.for_user(usuario)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def cadastrar_novo_usuario(dados):
    serializer = UsuarioSerializer(data=dados)
    if serializer.is_valid():
        user = serializer.save()
        logger.info(f"[AUTH] Novo usuário cadastrado com email: {user.email}")
        return {'mensagem': 'Cadastro realizado com sucesso'}, None, 201
    logger.warning(f"[AUTH] Erro ao cadastrar usuário: {serializer.errors}")
    return None, serializer.errors, 400

def autenticar_usuario(email, senha):
    usuario = Usuario.objects.filter(email=email).first()
    if usuario and usuario.check_password(senha):
        logger.info(f"[AUTH] Login bem-sucedido para o usuário ID={usuario.id}")
        primeiro_login = usuario.ultimo_acesso is None
        usuario.ultimo_acesso = now()
        usuario.save()

        token = gerar_token(usuario)
        return {
            'token': token,
            'id': usuario.id,
            'primeiro_login': primeiro_login
        }
    logger.warning(f"[AUTH] Tentativa de login falhou para o e-mail: {email}")
    raise AuthenticationFailed("Usuário e/ou senha incorreto(s)")

def alterar_senha_usuario(usuario: Usuario, nova_senha: str, confirmar_senha: str):
    if not nova_senha or not confirmar_senha:
        raise ValidationError({'erro': 'Preencha todos os campos.'})

    if nova_senha != confirmar_senha:
        raise ValidationError({'erro': 'As senhas não coincidem.'})

    usuario.set_password(nova_senha)
    usuario.save()

    return {
        'mensagem': 'Senha alterada com sucesso.',
    }, None, status.HTTP_200_OK

def atualizar_usuario(tipo, id, dados, user):
    if tipo not in ['usuario', 'analista']:
        raise ValueError("Tipo inválido.")

    if not user.is_admin:
        logger.warning(f"[AUTH] Usuário não autorizado tentou atualizar perfil. ID={user.id}")
        raise PermissionDenied("Apenas administradores podem atualizar perfis.")

    try:
        usuario = Usuario.objects.get(id=id, deletado=False)
    except Usuario.DoesNotExist:
        raise Usuario.DoesNotExist(f"{tipo.capitalize()} não encontrado.")

    serializer = UsuarioSerializer(usuario, data=dados, partial=True)
    if serializer.is_valid():
        serializer.save()
        logger.info(f"[AUTH] {tipo.capitalize()} ID={id} atualizado com sucesso por admin ID={user.id}")
        return {
            'mensagem': f'{tipo.capitalize()} atualizado com sucesso.',
            'dados': serializer.data
        }, None, 200
    
    logger.warning(f"[AUTH] Erro ao atualizar {tipo} ID={id}: {serializer.errors}")
    return None, serializer.errors, 400

def deletar_usuario(tipo, id, user):
    if tipo not in ['usuario', 'analista']:
        raise ValueError("Tipo inválido.")

    if not user.is_admin:
        logger.warning(f"[AUTH] Usuário não autorizado tentou deletar perfil. ID={user.id}")
        raise PermissionDenied("Apenas administradores podem deletar perfis.")

    try:
        usuario = Usuario.objects.get(id=id, deletado=False)
    except Usuario.DoesNotExist:
        raise Usuario.DoesNotExist(f"{tipo.capitalize()} não encontrado.")

    usuario.deletado = True
    usuario.save()
    logger.info(f"[AUTH] {tipo.capitalize()} ID={id} marcado como deletado por admin ID={user.id}")
    return {'mensagem': f'{tipo.capitalize()} deletado com sucesso.'}
