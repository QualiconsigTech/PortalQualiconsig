from django.db import models

class RepasseCessao(models.Model):
    processamento = models.UUIDField()
    integracao = models.CharField(max_length=255)
    operation = models.CharField(max_length=100)
    numero_contrato = models.CharField(max_length=50)
    data_cessao = models.DateField()
    valor_emissao = models.DecimalField(max_digits=12, decimal_places=2)
    valor_desembolso = models.DecimalField(max_digits=12, decimal_places=2)
    valor_cessao = models.DecimalField(max_digits=12, decimal_places=2)
    spread_bancarizacao_refin = models.DecimalField(max_digits=10, decimal_places=2)
    spread_ted_portability = models.DecimalField(max_digits=10, decimal_places=2)
    spread_ted_refinancing = models.DecimalField(max_digits=10, decimal_places=2)
    spread_bancarizacao_portability = models.DecimalField(max_digits=10, decimal_places=2)
    spread_rco_refinancing = models.DecimalField(max_digits=10, decimal_places=2)
    spread_rco_portability = models.DecimalField(max_digits=10, decimal_places=2)
    valor_rebate_bruto_total = models.DecimalField(max_digits=12, decimal_places=2)
    impostos = models.DecimalField(max_digits=10, decimal_places=2)
    valor_qualiconsig = models.DecimalField(max_digits=12, decimal_places=2)
    valor_qualibanking = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = "Repasse de Cessão"
        verbose_name_plural = "Repasses de Cessão"
        ordering = ['-data_cessao']
