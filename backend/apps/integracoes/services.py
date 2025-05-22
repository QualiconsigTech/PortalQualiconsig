import logging
from rest_framework import status
from apps.integracoes.serializers import MondayCreateSerializer
from apps.usuarios.models.usuarios import Usuario
from apps.integracoes.utilities import Monday

logger = logging.getLogger(__name__)

def create_monday_task_service(data, user):
    if not isinstance(user, Usuario):
        return {"erro": "Usuário não autorizado."}, status.HTTP_401_UNAUTHORIZED

    data['user'] = user.id
    serializer = MondayCreateSerializer(data=data)

    if serializer.is_valid():
        nome_usuario = user.nome
        nome_setor = user.setor.nome if hasattr(user, "setor") and user.setor else "Setor não informado"
        nome_chamado = data['task_name']
        task_name_custom = f"{nome_usuario}[{nome_setor}] - {nome_chamado}"

        monday_response = Monday.create_task(task_name_custom)

        if monday_response == 200:
            task = serializer.save()
            logger.info(f'[INTEGRACOES] Criação de task na monday concluída - {task.task_name}')
            return {
                'message': 'task created with success',
                'taskName': task.task_name
            }, status.HTTP_201_CREATED

        if monday_response == 401:
            logger.warning('[INTEGRACOES] Token monday expirado ou alterado')
            return {'message': 'monday request fail'}, status.HTTP_400_BAD_REQUEST

        logger.warning('[INTEGRACOES] Falha ao criar task na monday')
        return {'message': 'monday request fail'}, status.HTTP_400_BAD_REQUEST

    logger.warning(f'[INTEGRACOES] Erro na validação - {serializer.errors}')
    return serializer.errors, status.HTTP_400_BAD_REQUEST
