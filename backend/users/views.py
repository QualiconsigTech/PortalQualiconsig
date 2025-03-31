from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from chamados.models.chamados import Chamado
from chamados.serializers import ChamadoDetalhadoSerializer
from users.services import filtrar_chamados_por_analista, atender_chamado, filtra_chamados_atribuidos, encerrar_chamado, listar_chamados_admin, listar_chamados_do_usuario, listar_chamados_do_setor


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

class ChamadosDoAnalistaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = filtrar_chamados_por_analista(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)

class AtenderChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        try:
            chamado = atender_chamado(request.user, chamado_id)
            return Response({
                "mensagem": f"Chamado '{chamado.titulo}' atribuído ao analista com sucesso."
            }, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"erro": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class ChamadosAtribuidosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = filtra_chamados_atribuidos(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
class EncerrarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        chamado = encerrar_chamado(chamado_id, request.user)
        return Response({
            'mensagem': 'Chamado encerrado com sucesso.',
            'chamado_id': chamado.id,
            'encerrado_em': chamado.encerrado_em
        })
    
## ANALISTA ADMIN    
class ChamadosAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_admin(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)


class ChamadosPorSetorAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, setor_nome):
        chamados = listar_chamados_admin(request.user, setor_nome)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
## USUARIO
class ChamadosDoUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_do_usuario(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
## USUARIOS ADMIN
class ChamadosDoSetorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_do_setor(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)