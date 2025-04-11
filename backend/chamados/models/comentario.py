from django.db import models
from users.models.usuarios import Usuario
from chamados.models.chamados import Chamado

class ComentarioChamado(models.Model):
    chamado = models.ForeignKey(Chamado, on_delete=models.CASCADE, related_name="comentarios_chamado")
    autor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    texto = models.TextField(max_length=1000)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.autor.username} no chamado #{self.chamado.id}"
