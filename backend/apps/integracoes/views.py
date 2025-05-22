import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.integracoes.services import create_monday_task_service

logger = logging.getLogger(__name__)


class CreateMondayTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data, status_code = create_monday_task_service(request.data, request.user)
            return Response(data, status=status_code)
        except Exception as e:
            logger.error(f'[INTEGRACOES] Erro inesperado -> {type(e)}: {str(e)}')
            return Response({'message': 'internal error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
