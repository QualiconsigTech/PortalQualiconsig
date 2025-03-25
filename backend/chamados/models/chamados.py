from django.db import models
from users.models.analista import Analista
from users.models.usuarios import Usuario
from .categoria import Categoria

class Chamado(models.Model):
    titulo = models.CharField(max_length=200)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    prioridade = models.CharField(max_length=50)
    gravidade = models.CharField(max_length=50)
    descricao = models.TextField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    analista = models.ForeignKey(Analista, on_delete=models.CASCADE)
    criado_em = models.DateTimeField(auto_now_add=True)
    editado_em = models.DateTimeField(auto_now=True)
    encerrado_em = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.titulo
