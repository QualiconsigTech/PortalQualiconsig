@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_monday_task(request):
    try:
        data = request.data
        user = request.user

        print(user)

        if not isinstance(user, Usuario):
            return Response({"erro": "Usuário não autorizado."}, status=status.HTTP_401_UNAUTHORIZED)

        data['user'] = user.id

        serializer = MondayCreateSerializer(data=data)

        if serializer.is_valid():
            # Montar o nome personalizado: nome usuário - nome setor - nome chamado
            nome_usuario = user.nome  # ou user.get_full_name() se existir
            nome_setor = user.setor.nome if hasattr(user, "setor") and user.setor else "Setor não informado"
            nome_chamado = data['task_name']

            task_name_custom = f"{nome_usuario} - {nome_setor} - {nome_chamado}"

            # Enviar para Monday com nome completo
            monday_response = Monday.create_task(task_name_custom)

            if monday_response == 200:
                task = serializer.save()
                logger.info(f'[INTEGRACOES] Criação de task na monday concluída - {task.task_name}')
                return Response({
                    'message': f'task created with success',
                    'taskName': task.task_name
                }, status=status.HTTP_201_CREATED)

            if monday_response == 401:
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
