from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.chamados.serializers import ChamadoDetalhadoSerializer, UsuarioLogadoSerializer
from apps.chamados.services.admin import *
from apps.chamados.services.usuario import obter_dados_do_usuario

#ANALISTA ADMIN    
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
       
#USUARIOS ADMIN
class ChamadosDoSetorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_do_setor(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
class UsuarioLogadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = obter_dados_do_usuario(request.user)
        serializer = UsuarioLogadoSerializer(usuario)
        return Response(serializer.data)
    