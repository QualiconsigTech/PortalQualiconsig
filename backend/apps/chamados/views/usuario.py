from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.chamados.serializers import ChamadoDetalhadoSerializer
from apps.chamados.services.usuario import *

class ChamadosDoUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_do_usuario(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
class CancelarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        try:
            chamado = cancelar_chamado(chamado_id, request.user, request.data)
            return Response({"mensagem": f"Chamado '{chamado.titulo}' cancelado com sucesso."})
        except Exception as e:
            return Response({"erro": str(e)}, status=400)
    
