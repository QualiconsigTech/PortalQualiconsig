from django.db import models
from apps.core.models.grupo import Grupo

class Setor(models.Model):
    nome = models.CharField(max_length=100)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='setores')
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'setor'
        verbose_name = 'Setor'
        verbose_name_plural = 'Setores'

    def __str__(self):
        return f'{self.nome} ({self.grupo.nome})'
