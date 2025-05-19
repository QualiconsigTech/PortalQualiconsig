from django.db import models
import uuid

class RelatorioRepasseQualibankingFinal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    processamento = models.UUIDField()
    
    integracao = models.CharField(max_length=100, blank=True, null=True)
    operation = models.CharField(max_length=100, blank=True, null=True)
    numero_contrato = models.CharField(max_length=100)
    data_cessao = models.DateField(blank=True, null=True)
    valor_emissao = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valor_desembolso = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valor_cessao = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    spread_bancarizacao_refin = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    spread_ted_portability = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    spread_ted_refinancing = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    spread_bancarizacao_portability = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    spread_rco_refinancing = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    spread_rco_portability = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    valor_rebate_bruto_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    impostos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valor_qualiconsig = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valor_qualibanking = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    premio_tarifa = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    iof = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    premio_bruto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    movimento = models.CharField(max_length=50, blank=True, null=True)
    data_movimento = models.DateField(blank=True, null=True)
    credito = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    debito = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "relatorios_repasse_qualibanking_final"
        verbose_name = "Relatório Final - Repasse + Fatura"
        verbose_name_plural = "Relatórios Finais - Repasse + Fatura"
