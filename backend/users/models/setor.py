from django.db import models
from .area import Area

class Setor(models.Model):
    nome = models.CharField(max_length=100)
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name="setores")
    deletado = models.BooleanField(default=False)

    def __str__(self):
        return self.nome
