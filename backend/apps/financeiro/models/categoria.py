from django.db import models

class Categoria(models.Model):
    nome = models.CharField(max_length=255)
    tipo = models.CharField(max_length=255)
    deletado = models.BooleanField(default=False)

    def __str__(self):
        return self.nome