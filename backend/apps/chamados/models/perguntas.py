from django.db import models

class PerguntaFrequente(models.Model):
    pergunta = models.CharField(max_length=255)
    resposta = models.TextField()
    deletado = models.BooleanField(default=False)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.pergunta
