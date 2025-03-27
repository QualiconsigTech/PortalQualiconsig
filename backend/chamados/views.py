import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from users.models.usuarios import Usuario
from .models.chamados import Chamado
from .serializers import ChamadoSerializer, ChamadoResumoSerializer, ChamadoDetalhadoSerializer

logger = logging.getLogger(__name__)

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_ultimos_chamados(request):
    usuario_id = request.user.id
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')[:10]
    serializer = ChamadoSerializer(chamados, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_historico_chamados(request):
    usuario_id = request.user.id
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')
    serializer = ChamadoSerializer(chamados, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalhes_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id)

        if chamado.usuario != request.user and not request.user.is_admin:
            return Response({'erro': 'Você não tem permissão para ver este chamado.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChamadoDetalhadoSerializer(chamado)
        return Response(serializer.data)

    except Chamado.DoesNotExist:
        return Response({'erro': 'Chamado não encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def atualizar_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return Response({'erro': 'Chamado não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != chamado.usuario and not request.user.is_admin:
        return Response({'erro': 'Você não tem permissão para atualizar este chamado.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ChamadoSerializer(chamado, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'mensagem': 'Chamado atualizado com sucesso.', 'dados': serializer.data}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deletar_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return Response({'erro': 'Chamado não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != chamado.usuario and not request.user.is_admin:
        return Response({'erro': 'Você não tem permissão para deletar este chamado.'}, status=status.HTTP_403_FORBIDDEN)

    chamado.delete()
    return Response({'mensagem': 'Chamado deletado com sucesso.'}, status=status.HTTP_200_OK)
