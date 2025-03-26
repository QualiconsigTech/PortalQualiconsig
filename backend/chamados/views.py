import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import get_authorization_header
from users.models.usuarios import Usuario
from .models.chamados import Chamado
from .serializers import ChamadoSerializer, ChamadoResumoSerializer, ChamadoDetalhadoSerializer

# Configura o logger
logger = logging.getLogger(__name__)

## Criar chamados
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_chamado(request):
    try:
        usuario = request.user  

        if not isinstance(usuario, Usuario):
            return Response({"erro": "Usuário não autorizado."}, status=status.HTTP_401_UNAUTHORIZED)

        logger.info(f"[CHAMADO] ID do usuário autenticado: {usuario.id}")

        data = request.data.copy()
        data['usuario'] = usuario.id  

        serializer = ChamadoSerializer(data=data)
        if serializer.is_valid():
            serializer.save(usuario=usuario) 
            logger.info(f"[CHAMADO] Chamado criado com sucesso para o usuário ID={usuario.id}")
            return Response({'mensagem': 'Chamado criado com sucesso.'}, status=status.HTTP_201_CREATED)

        logger.warning(f"[CHAMADO] Erro de validação: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"[CHAMADO] Erro inesperado: {str(e)}")
        return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


## Lista os 10 chamados
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_ultimos_chamados(request):
    usuario_id = request.user.id
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')[:10]
    serializer = ChamadoResumoSerializer(chamados, many=True)
    return Response(serializer.data)


## Lista 10 chamados em historico
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_historico_chamados(request):
    usuario_id = request.user.id
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')[:10]
    serializer = ChamadoResumoSerializer(chamados, many=True)
    return Response(serializer.data)


## Lista Destalhes do chamados 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalhes_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id, usuario=request.user)
        serializer = ChamadoDetalhadoSerializer(chamado)
        return Response(serializer.data)
    except Chamado.DoesNotExist:
        return Response({'erro': 'Chamado não encontrado'}, status=status.HTTP_404_NOT_FOUND)