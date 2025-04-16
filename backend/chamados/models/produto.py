from django.db import models

class Produto(models.Model):
    nome = models.CharField(max_length=100)
    quantidade = models.PositiveIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nome} ({self.quantidade} em estoque)"
