from datetime import datetime
from django.utils.timezone import now, timedelta
from chamados.models import Chamado
from django.db.models import Count

def calcular_periodo(periodo=None, data_inicio=None, data_fim=None):
    hoje = now().date()

    if data_inicio and data_fim:
        return datetime.fromisoformat(data_inicio).date(), datetime.fromisoformat(data_fim).date()

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

    return None, None


def get_chamados_total(inicio, fim, usuario=None):
    queryset = Chamado.objects.all()
    if inicio and fim:
        queryset = queryset.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        queryset = queryset.filter(usuario__setor=usuario.setor)
    return queryset.count()

def get_chamados_por_setor(inicio, fim, usuario=None):
    queryset = Chamado.objects.all()
    if inicio and fim:
        queryset = queryset.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        queryset = queryset.filter(usuario__setor=usuario.setor)
    return queryset.values("setor__nome").annotate(total=Count("id"))

def get_top_usuario(inicio, fim, usuario=None):
    queryset = Chamado.objects.all()
    if inicio and fim:
        queryset = queryset.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        queryset = queryset.filter(usuario__setor=usuario.setor)
    return queryset.values("usuario__nome").annotate(qtd=Count("id")).order_by("-qtd").first()

def get_top_setor(inicio, fim, usuario=None):
    queryset = Chamado.objects.all()
    if inicio and fim:
        queryset = queryset.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        queryset = queryset.filter(usuario__setor=usuario.setor)
    return queryset.values("setor__nome").annotate(total=Count("id")).order_by("-total").first()

def get_evolucao_chamados(inicio, fim, usuario=None):
    queryset = Chamado.objects.all()
    if inicio and fim:
        queryset = queryset.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        queryset = queryset.filter(usuario__setor=usuario.setor)
    return queryset.extra({'data': "DATE(criado_em)"}).values('data').annotate(total=Count('id')).order_by('data')

def get_chamados_abertos(inicio=None, fim=None, usuario=None):
    qs = Chamado.objects.filter(analista__isnull=True, encerrado_em__isnull=True)
    if inicio and fim:
        qs = qs.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        qs = qs.filter(usuario__setor=usuario.setor)
    return qs.count()

def get_chamados_em_atendimento(inicio=None, fim=None, usuario=None):
    qs = Chamado.objects.filter(analista__isnull=False, encerrado_em__isnull=True)
    if inicio and fim:
        qs = qs.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        qs = qs.filter(usuario__setor=usuario.setor)
    return qs.count()

def get_chamados_encerrados(inicio=None, fim=None, usuario=None):
    qs = Chamado.objects.filter(encerrado_em__isnull=False)
    if inicio and fim:
        qs = qs.filter(criado_em__range=[inicio, fim])
    if usuario and usuario.tipo == 'usuario' and usuario.is_admin:
        qs = qs.filter(usuario__setor=usuario.setor)
    return qs.count()

