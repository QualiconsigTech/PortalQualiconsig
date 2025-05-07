from datetime import datetime
from django.utils.timezone import now, timedelta
from chamados.models import Chamado
from django.db.models import Count

def calcular_periodo(periodo, data_inicio=None, data_fim=None):
    hoje = now().date()

    if periodo == "diario":
        return hoje, hoje
    elif periodo == "semanal":
        return hoje - timedelta(days=7), hoje
    elif periodo == "mensal":
        return hoje.replace(day=1), hoje
    elif periodo == "trimestral":
        return hoje - timedelta(days=90), hoje
    elif periodo == "semestral":
        return hoje - timedelta(days=180), hoje
    elif periodo == "anual":
        return hoje.replace(month=1, day=1), hoje
    elif periodo == "personalizado" and data_inicio and data_fim:
        return datetime.fromisoformat(data_inicio).date(), datetime.fromisoformat(data_fim).date()
    else:
        return hoje.replace(day=1), hoje

def get_chamados_total(inicio, fim):
    return Chamado.objects.filter(criado_em__range=[inicio, fim]).count()

def get_chamados_por_setor(inicio, fim):
    return (
        Chamado.objects
        .filter(criado_em__range=[inicio, fim])
        .values("setor__nome")
        .annotate(total=Count("id"))
    )

def get_top_usuario(inicio, fim):
    return (
        Chamado.objects
        .filter(criado_em__range=[inicio, fim])
        .values("usuario__nome")
        .annotate(qtd=Count("id"))
        .order_by("-qtd")
        .first()
    )

def get_top_setor(inicio, fim):
    return (
        Chamado.objects
        .filter(criado_em__range=[inicio, fim])
        .values("setor__nome")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )
