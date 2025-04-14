from django.db import models
from users.models import Usuario
from chamados.models import Chamado

class Notificacao(models.Model):
    usuario_destino = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="notificacoes")
    chamado = models.ForeignKey(Chamado, on_delete=models.CASCADE, related_name="notificacoes")
    mensagem = models.CharField(max_length=255)
    visualizado = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notificação para {self.usuario_destino.nome}: {self.mensagem}"
