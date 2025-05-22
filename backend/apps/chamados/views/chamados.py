import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.chamados.services.chamados import *

logger = logging.getLogger(__name__)

class CriarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data, errors, status_code = criar_chamado(request.data, request.user)
        if errors:
            return Response(errors, status=status_code)
        return Response(data, status=status_code)

class ListarUltimosChamadosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = listar_ultimos_chamados(request.user.id)
        return Response(data)

class ListarHistoricoChamadosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = listar_historico_chamados(request.user.id)
        return Response(data)

class DetalhesChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chamado_id):
        data, status_code = detalhes_chamado(chamado_id, request.user)
        if data is None:
            return Response({'erro': 'Você não tem permissão para ver este chamado.'}, status=status_code)
        return Response(data, status=status_code)


class AtualizarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, chamado_id):
        data, status_code = atualizar_chamado(request.data, chamado_id, request.user)
        return Response(data, status=status_code)


class DeletarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, chamado_id):
        data, status_code = deletar_chamado(chamado_id, request.user)
        return Response(data, status=status_code)