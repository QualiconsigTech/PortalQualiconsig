#from chamados.models import Chamado
#rom django.utils import timezone
#from django.db.models import Q

#def filtrar_chamados_por_setor(analista):
#    if analista.setor.lower() in ["desenvolvimento", "dados"]:
#        return Chamado.objects.filter(categoria__in=["Desenvolvimento", "Dados"])
#    else:
#        return Chamado.objects.exclude(categoria__in=["Desenvolvimento", "Dados"])

#def atribuir_chamado_ao_analista(chamado_id, analista):
#    chamado = Chamado.objects.get(id=chamado_id)
#    chamado.analista = analista
#    chamado.editado_em = timezone.now()
#    chamado.save()
#    return chamado
