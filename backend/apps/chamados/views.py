import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.chamados.services import *

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


class CriarPerguntaFrequenteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data, status_code = criar_pergunta_frequente(request.data)
        return Response(data, status=status_code)


class ListarPerguntasFrequentesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = listar_perguntas_frequentes()
        return Response(data, status=status.HTTP_200_OK)


class ListarComentariosChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chamado_id):
        data = listar_comentarios_chamado(chamado_id)
        return Response(data, status=status.HTTP_200_OK)


class CriarComentarioChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        texto = request.data.get("texto")
        data, status_code = criar_comentario_chamado(chamado_id, texto, request.user)
        return Response(data, status=status_code)


class CriarNotificacaoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data, status_code = criar_notificacao(request.data)
        return Response(data, status=status_code)


class ListarNotificacoesUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = listar_notificacoes_usuario(request.user)
        return Response(data, status=status.HTTP_200_OK)


class MarcarNotificacaoVisualizadaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notificacao_id):
        data, status_code = marcar_notificacao_visualizada(notificacao_id, request.user)
        return Response(data, status=status_code)


class MarcarTodasNotificacoesLidasView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data, status_code = marcar_todas_notificacoes_lidas(request.user)
        return Response(data, status=status_code)


class ProdutosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data, status_code = listar_produtos()
        return Response(data, status=status_code)

    def post(self, request):
        data, status_code = criar_produto(request.data)
        return Response(data, status=status_code)


class UsarProdutoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        produto_id = request.data.get('produto_id')
        quantidade = int(request.data.get('quantidade', 0))
        data, status_code = usar_produto(produto_id, quantidade)
        return Response(data, status=status_code)
