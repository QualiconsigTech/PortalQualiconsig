from django.db import models
from apps.usuarios.models import Usuario
from apps.core.models.setor import Setor
from apps.core.models.cargo import Cargo

class ProdutoInventario(models.Model):
    pavimento = models.CharField(max_length=100, blank=True, null=True)
    setor = models.ForeignKey(Setor, on_delete=models.SET_NULL, null=True, blank=True, db_column='setor_id')
    posicao = models.CharField(max_length=100, blank=True, null=True)
    anydesk = models.CharField(max_length=100, blank=True, null=True)
    tipo_hardware = models.CharField(max_length=50,blank=True,null=True,help_text="Computador ou Notebook")
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
    ativo = models.BooleanField(default=True)
    celular_modelo = models.CharField(max_length=100, null=True, blank=True)
    celular_marca = models.CharField(max_length=100, null=True, blank=True)
    celular_numero = models.CharField(max_length=20, null=True, blank=True)

    # Adicionais
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    consultor = models.CharField(max_length=100, blank=True, null=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.modelo} - {self.hostname or self.serial}"
