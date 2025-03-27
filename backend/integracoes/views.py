from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import MondayCreateSerializer
from users.models.usuarios import Usuario
import logging
from .utilities import Monday

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_monday_task(request):
    try:
        data = request.data

        user = request.user

        if not isinstance(user, Usuario):
            return Response({"erro": "Usuário não autorizado."}, status=status.HTTP_401_UNAUTHORIZED)

        data['user'] = user.id

        serializer = MondayCreateSerializer(data=data)

        if serializer.is_valid():
            monday_response_status = Monday.create_task(data['task_name'])
            if monday_response_status == 200:
                task = serializer.save()
                logger.info(f'[INTEGRACOES] Criação de task na monday concluida - {task.task_name}')
                return Response({
                    'message': f'task created with sucess',
                    'taskName': task.task_name
                }, status=status.HTTP_201_CREATED)

            if monday_response_status == 401:
                logger.warning(f'[INTEGRACOES] Token monday expirado ou alterado')
                return Response({
                    'message': 'monday request fail',
                }, status=status.HTTP_400_BAD_REQUEST)

            logger.warning(f'[INTEGRACOES] Falha ao criar task na monday')
            return Response({
                'message': 'monday request fail',
            }, status=status.HTTP_400_BAD_REQUEST)

        logger.warning(f'[INTEGRACOES] Erro na validação - {serializer.errors}')
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f'[INTEGRACOES] Erro inesperado -> {type(e)}: {str(e)}')
        return Response({'message': 'internal error'}, status.HTTP_500_INTERNAL_SERVER_ERROR)
