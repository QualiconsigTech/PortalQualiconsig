from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from users.models.usuarios import Usuario
from users.models.analista import Analista
from .serializers import UsuarioSerializer, AnalistaSerializer

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
        return Response({'mensagem': 'Cadastro realizado com sucesso'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def cadastrar_analista(request):
    serializer = AnalistaSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({'mensagem': 'Cadastro realizado com sucesso'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    senha = request.data.get('password')

    analista = Analista.objects.filter(email=email, deletado=False).first()

    if analista and analista.check_password(senha):
        token = generate_token(analista)
        return Response({
            'token': token,
            'id': analista.id
        }, status=status.HTTP_200_OK)

    usuario = Usuario.objects.filter(email=email).first()
    if usuario and usuario.check_password(senha):
        token = generate_token(usuario)
        return Response({
            'token': token,
            'id': usuario.id
        }, status=status.HTTP_200_OK)

    return Response({'detail': 'Usuário e/ou senha incorreto(s)'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def atualizar_usuario_analista(request, tipo, id):
    if tipo not in ['usuario', 'analista']:
        return Response({'erro': 'Tipo inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.is_admin:
        return Response({'erro': 'Apenas administradores podem atualizar perfis.'}, status=status.HTTP_403_FORBIDDEN)

    modelo = Usuario if tipo == 'usuario' else Analista
    serializer_class = UsuarioSerializer if tipo == 'usuario' else AnalistaSerializer

    try:
        instance = modelo.objects.get(id=id, deletado=False)
    except modelo.DoesNotExist:
        return Response({'erro': f'{tipo.capitalize()} não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = serializer_class(instance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'mensagem': f'{tipo.capitalize()} atualizado com sucesso.',
            'dados': serializer.data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deletar_usuario_analista(request, tipo, id):
    if tipo not in ['usuario', 'analista']:
        return Response({'erro': 'Tipo inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.is_admin:
        return Response({'erro': 'Apenas administradores podem deletar perfis.'}, status=status.HTTP_403_FORBIDDEN)

    modelo = Usuario if tipo == 'usuario' else Analista

    try:
        instance = modelo.objects.get(id=id, deletado=False)
    except modelo.DoesNotExist:
        return Response({'erro': f'{tipo.capitalize()} não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    instance.deletado = True
    instance.save()
    return Response({'mensagem': f'{tipo.capitalize()} deletado com sucesso.'}, status=status.HTTP_200_OK)
