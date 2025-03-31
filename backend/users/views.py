from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from chamados.models.chamados import Chamado
#from .services import filtrar_chamados_por_setor, atribuir_chamado_ao_analista
from chamados.serializers import ChamadoDetalhadoSerializer


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

''''
class ChamadosDoAnalistaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analista = request.user
        chamados = filtrar_chamados_por_setor(analista)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AtenderChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        analista = request.user
        chamado = atribuir_chamado_ao_analista(chamado_id, analista)
        return Response({"message": "Chamado atribuído com sucesso."})
'''