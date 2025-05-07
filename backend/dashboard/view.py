from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from dashboard.service import ( calcular_periodo, get_chamados_total, get_chamados_por_setor,get_top_usuario, get_top_setor)

class BaseDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get_periodo(self, request):
        periodo = request.query_params.get("periodo", "mensal")
        data_inicio = request.query_params.get("data_inicio")
        data_fim = request.query_params.get("data_fim")
        return calcular_periodo(periodo, data_inicio, data_fim)

class ChamadosTotalView(BaseDashboardView):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        total = get_chamados_total(inicio, fim)
        return Response({ "total_chamados": total })

class ChamadosPorSetorView(BaseDashboardView):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        dados = get_chamados_por_setor(inicio, fim)
        return Response({ "chamados_por_setor": dados })

class TopUsuarioView(BaseDashboardView):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        usuario = get_top_usuario(inicio, fim)
        return Response({ "top_usuario": usuario })

class TopSetorView(BaseDashboardView):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        setor = get_top_setor(inicio, fim)
        return Response({ "top_setor": setor })
