from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from chamados.models.chamados import Chamado


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def abrir_chamado(request):
    data = request.data
    required_fields = ['titulo', 'categoria', 'prioridade', 'gravidade', 'descricao']

    for field in required_fields:
        if field not in data or not data[field]:
            return Response({field: 'Campo obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

    chamado = Chamado.objects.create(
        titulo=data['titulo'],
        categoria_id=data['categoria'],
        prioridade=data['prioridade'],
        gravidade=data['gravidade'],
        descricao=data['descricao'],
        usuario=request.user
    )

    return Response({
        'mensagem': 'Chamado criado com sucesso!',
        'chamado_id': chamado.id
    }, status=status.HTTP_201_CREATED)
