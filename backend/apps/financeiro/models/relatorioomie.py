from django.db import models
from apps.usuarios.models import Usuario

class RelatorioOmie(models.Model):
    nome_arquivo = models.CharField(max_length=255)
    arquivo_base64 = models.TextField()
    
    total_quali = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_parceiros = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_garanhus = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_despesas_op = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_despesas_nao_op = models.DecimalField(max_digits=15, decimal_places=2, default=0)


    criado_em = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)  

    def __str__(self):
        return f"{self.nome_arquivo} - {self.usuario}"
