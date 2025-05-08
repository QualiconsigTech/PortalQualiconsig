from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from dashboard.service import ( calcular_periodo, get_chamados_total, get_chamados_por_setor,get_top_usuario, get_top_setor, get_evolucao_chamados )
from rest_framework.decorators import api_view
from chamados.models import Chamado
from django.db.models import Count

class BaseDashboardViews(APIView):
    permission_classes = [IsAuthenticated]

    def get_periodo(self, request):
        periodo = request.query_params.get("periodo", "mensal")
        data_inicio = request.query_params.get("data_inicio")
        data_fim = request.query_params.get("data_fim")
        return calcular_periodo(periodo, data_inicio, data_fim)

class ChamadosTotalViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        total = get_chamados_total(inicio, fim)
        return Response({ "total_chamados": total })

class ChamadosPorSetorViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        dados = get_chamados_por_setor(inicio, fim)
        return Response({ "chamados_por_setor": dados })

class TopUsuarioViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        usuario = get_top_usuario(inicio, fim)
        return Response({ "top_usuario": usuario })

class TopSetorViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        setor = get_top_setor(inicio, fim)
        return Response({ "top_setor": setor })

class EvolucaoChamadosViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        dados = get_evolucao_chamados(inicio, fim)
        return Response(dados)

class ChamadosPorCategoriaView(APIView):
    def get(self, request):
        dados = (
            Chamado.objects
            .values("categoria__nome")
            .annotate(total=Count("id"))
            .order_by("-total")
        )
        return Response(dados)