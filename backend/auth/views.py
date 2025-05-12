import logging
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.timezone import now

from users.models.usuarios import Usuario
from .serializers import UsuarioSerializer

logger = logging.getLogger(__name__)

def generate_token(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
def cadastrar_usuario(request):
    serializer = UsuarioSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        logger.info(f"[AUTH] Novo usuário cadastrado com email: {user.email}")
        return Response({'mensagem': 'Cadastro realizado com sucesso'}, status=status.HTTP_201_CREATED)
    logger.warning(f"[AUTH] Erro ao cadastrar usuário: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    senha = request.data.get('password')

    usuario = Usuario.objects.filter(email=email).first()
    if usuario and usuario.check_password(senha):
        logger.info(f"[AUTH] Login bem-sucedido para o usuário ID={usuario.id}")
        primeiro_login = usuario.ultimo_acesso is None

        usuario.ultimo_acesso = now()
        usuario.save()

        token = generate_token(usuario)
        return Response({
            'token': token,
            'id': usuario.id,
            'primeiro_login': primeiro_login  # <-- envia essa flag ao frontend
        }, status=status.HTTP_200_OK)

    logger.warning(f"[AUTH] Tentativa de login falhou para o e-mail: {email}")
    return Response({'detail': 'Usuário e/ou senha incorreto(s)'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def atualizar_usuario_analista(request, tipo, id):
    if tipo not in ['usuario', 'analista']:
        logger.warning(f"[AUTH] Tipo inválido na atualização: {tipo}")
        return Response({'erro': 'Tipo inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.is_admin:
        logger.warning(f"[AUTH] Usuário não autorizado tentou atualizar perfil. ID={request.user.id}")
        return Response({'erro': 'Apenas administradores podem atualizar perfis.'}, status=status.HTTP_403_FORBIDDEN)

    modelo = Usuario == 'usuario'
    serializer_class = UsuarioSerializer == 'usuario' 

    try:
        instance = modelo.objects.get(id=id, deletado=False)
    except modelo.DoesNotExist:
        logger.warning(f"[AUTH] {tipo.capitalize()} ID={id} não encontrado para atualização.")
        return Response({'erro': f'{tipo.capitalize()} não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = serializer_class(instance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        logger.info(f"[AUTH] {tipo.capitalize()} ID={id} atualizado com sucesso por admin ID={request.user.id}")
        return Response({
            'mensagem': f'{tipo.capitalize()} atualizado com sucesso.',
            'dados': serializer.data
        }, status=status.HTTP_200_OK)
    
    logger.warning(f"[AUTH] Erro na validação ao atualizar {tipo} ID={id}: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def alterar_senha(request):
    nova_senha = request.data.get('nova_senha')
    confirmar_senha = request.data.get('confirmar_senha')

    if not nova_senha or not confirmar_senha:
        return Response({'erro': 'Preencha todos os campos.'}, status=status.HTTP_400_BAD_REQUEST)

    if nova_senha != confirmar_senha:
        return Response({'erro': 'As senhas não coincidem.'}, status=status.HTTP_400_BAD_REQUEST)

    usuario = request.user
    usuario.set_password(nova_senha)
    usuario.save()

    return Response({'mensagem': 'Senha alterada com sucesso.'}, status=status.HTTP_200_OK)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deletar_usuario_analista(request, tipo, id):
    if tipo not in ['usuario', 'analista']:
        logger.warning(f"[AUTH] Tipo inválido na exclusão: {tipo}")
        return Response({'erro': 'Tipo inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.is_admin:
        logger.warning(f"[AUTH] Usuário não autorizado tentou deletar perfil. ID={request.user.id}")
        return Response({'erro': 'Apenas administradores podem deletar perfis.'}, status=status.HTTP_403_FORBIDDEN)

    modelo = Usuario == 'usuario'

    try:
        instance = modelo.objects.get(id=id, deletado=False)
    except modelo.DoesNotExist:
        logger.warning(f"[AUTH] {tipo.capitalize()} ID={id} não encontrado para exclusão.")
        return Response({'erro': f'{tipo.capitalize()} não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    instance.deletado = True
    instance.save()
    logger.info(f"[AUTH] {tipo.capitalize()} ID={id} marcado como deletado por admin ID={request.user.id}")
    return Response({'mensagem': f'{tipo.capitalize()} deletado com sucesso.'}, status=status.HTTP_200_OK)