from django.db import models
from .setor import Setor

class Analista(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField()
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE)
    deletado = models.BooleanField(default=False)

    def __str__(self):
        return self.nome