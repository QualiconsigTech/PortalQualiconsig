from django.db import models
from apps.usuarios.models import Usuario

class ProdutoInventario(models.Model):
    pavimento = models.CharField(max_length=100, blank=True, null=True)
    setor = models.CharField(max_length=100, blank=True, null=True)
    posicao = models.CharField(max_length=100, blank=True, null=True)
    gerente = models.CharField(max_length=100, blank=True, null=True)
    anydesk = models.CharField(max_length=100, blank=True, null=True)
    marca = models.CharField(max_length=100, blank=True, null=True)
    modelo = models.CharField(max_length=100, blank=True, null=True)
    hostname = models.CharField(max_length=100, blank=True, null=True)
    serial = models.CharField(max_length=100, blank=True, null=True)
    processador = models.CharField(max_length=100, blank=True, null=True)
    memoria = models.CharField(max_length=100, blank=True, null=True)
    armazenamento = models.CharField(max_length=100, blank=True, null=True)
    impressora = models.CharField(max_length=100, blank=True, null=True)
    headset = models.CharField(max_length=100, blank=True, null=True)
    ip = models.CharField(max_length=100, blank=True, null=True)
    observacao = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)
    ativo = models.BooleanField(default=True)

    # Adicionais
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    consultor = models.CharField(max_length=100, blank=True, null=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.modelo} - {self.hostname or self.serial}"
