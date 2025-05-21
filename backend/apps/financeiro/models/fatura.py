from django.db import models

class FaturaComissao(models.Model):
    processamento = models.UUIDField()
    id_venda = models.UUIDField()
    movimento = models.CharField(max_length=100)
    apolice = models.CharField(max_length=50)
    segurado = models.CharField(max_length=255)
    data_emissao = models.DateField()
    inicio_vigencia = models.DateField()
    fim_vigencia = models.DateField()
    data_movimento = models.DateField()
    parcela = models.PositiveIntegerField()
    total_parcelas = models.PositiveIntegerField()
    valor_comissao = models.DecimalField(max_digits=12, decimal_places=2)
    cod_externo = models.CharField(max_length=50, null=True, blank=True)
    metadados = models.JSONField(null=True, blank=True)
    id_fatura = models.UUIDField()
    data_fatura = models.DateField()
    data_fechamento_fatura = models.DateField()
    id_intermediario = models.UUIDField()
    nome_intermediario = models.CharField(max_length=255)
    insurance_id = models.UUIDField()
    cod_externo2 = models.CharField(max_length=50)
    numero_contrato = models.CharField(max_length=100, default="")
    premio_tarifa = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    iof = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    premio_bruto = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Fatura de Comissão"
        verbose_name_plural = "Faturas de Comissão"
        ordering = ['-data_fatura']
