from django.db import models
from .setor import Setor
from .cargo import Cargo

class Usuario(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField()
    senha = models.CharField(max_length=128)
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE)
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE)
    deletado = models.BooleanField(default=False)

    def __str__(self):
        return self.nome