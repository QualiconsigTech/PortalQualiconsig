import uuid
from django.db import models

class SeguroCartao(models.Model):
    processamento = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=20)
    data_inicio_vigencia = models.DateField()
    plano_seguro = models.CharField(max_length=255)
    cedente = models.CharField(max_length=255)
    vendedor = models.CharField(max_length=255)
    valor_seguro = models.DecimalField(max_digits=10, decimal_places=2)
    contrato = models.CharField(max_length=100)
    lote = models.CharField(max_length=100, blank=True, null=True)
    observacao = models.TextField(blank=True, null=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} - {self.contrato}"
