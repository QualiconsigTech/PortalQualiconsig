from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from dashboard.service import (
    calcular_periodo,
    get_chamados_total,
    get_chamados_por_setor,
    get_top_usuario,
    get_top_setor,
    get_evolucao_chamados,
    get_chamados_abertos,
    get_chamados_em_atendimento,
    get_chamados_encerrados
)
from rest_framework.decorators import api_view
from chamados.models import Chamado
from django.db.models import Count


class BaseDashboardViews(APIView):
    permission_classes = [IsAuthenticated]

    def get_periodo(self, request):
        periodo = request.query_params.get("periodo")
        data_inicio = request.query_params.get("data_inicio")
        data_fim = request.query_params.get("data_fim")
        
        if not periodo and not data_inicio and not data_fim:
            return None, None

        return calcular_periodo(periodo, data_inicio, data_fim)


class ChamadosTotalViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        total = get_chamados_total(inicio, fim, usuario=request.user)
        return Response({"total_chamados": total})


class ChamadosPorSetorViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        dados = get_chamados_por_setor(inicio, fim, usuario=request.user)
        return Response({"chamados_por_setor": dados})


class TopUsuarioViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        usuario = get_top_usuario(inicio, fim, usuario=request.user)
        return Response({"top_usuario": usuario})


class TopSetorViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        setor = get_top_setor(inicio, fim, usuario=request.user)
        return Response({"top_setor": setor})


class EvolucaoChamadosViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        dados = get_evolucao_chamados(inicio, fim, usuario=request.user)
        return Response(dados)


class ChamadosPorCategoriaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        periodo = request.query_params.get("periodo", "mensal")
        data_inicio = request.query_params.get("data_inicio")
        data_fim = request.query_params.get("data_fim")
        inicio, fim = calcular_periodo(periodo, data_inicio, data_fim)

        qs = Chamado.objects.all()

        if inicio and fim:
            qs = qs.filter(criado_em__range=[inicio, fim])

        if request.user.tipo == 'usuario' and request.user.is_admin:
            qs = qs.filter(usuario__setor=request.user.setor)

        dados = (
            qs.values("categoria__nome")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        return Response(dados)
    
class ChamadosAbertosViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        total = get_chamados_abertos(inicio, fim, usuario=request.user)
        return Response({ "total_abertos": total })

class ChamadosEmAtendimentoViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        total = get_chamados_em_atendimento(inicio, fim, usuario=request.user)
        return Response({ "total_em_atendimento": total })

class ChamadosEncerradosViews(BaseDashboardViews):
    def get(self, request):
        inicio, fim = self.get_periodo(request)
        total = get_chamados_encerrados(inicio, fim, usuario=request.user)
        return Response({ "total_encerrados": total })
