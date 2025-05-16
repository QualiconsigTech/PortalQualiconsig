from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.chamados.models.notificacao import Notificacao
from apps.chamados.serializers import ChamadoDetalhadoSerializer
from apps.chamados.services.analista import *


#ANALISTA COMUM
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

           
            Notificacao.objects.create(
                usuario_destino=chamado.usuario,     
                mensagem=f"Seu chamado {chamado.titulo} está em atendimento.",
                chamado=chamado                     
            )

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
        chamado = encerrar_chamado(chamado_id, request.user, request.data)

        Notificacao.objects.create(
            usuario_destino=chamado.usuario,
            chamado=chamado,
            mensagem=f"Seu chamado {chamado.titulo} foi encerrado."
        )

        return Response({
            'mensagem': 'Chamado encerrado com sucesso.',
            'chamado_id': chamado.id,
            'encerrado_em': chamado.encerrado_em
        })