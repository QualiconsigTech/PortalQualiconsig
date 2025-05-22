from django.db import models
from apps.usuarios.models import Usuario
from apps.core.models import Setor
from .categoria import Categoria
from .prioridade import Prioridade

class Chamado(models.Model):
    titulo = models.CharField(max_length=200)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    prioridade = models.ForeignKey(Prioridade, on_delete=models.SET_NULL, null=True, blank=True)
    descricao = models.TextField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    analista = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='chamados_atendidos')
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE)
    criado_em = models.DateTimeField(auto_now_add=True)
    editado_em = models.DateTimeField(auto_now=True)
    encerrado_em = models.DateTimeField(null=True, blank=True)
    solucao = models.TextField(blank=True, null=True)
    arquivos = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.titulo
    
    @property
    def status_calculado(self):
        if self.encerrado_em:
            return "Encerrado"

        if self.analista:
            ultimo_comentario = self.comentarios_chamado.order_by('-criado_em').first()

            if ultimo_comentario:
                if ultimo_comentario.autor == self.analista:
                    return "Aguardando Resposta"
                else:
                    return "Em Atendimento"

            return "Em Atendimento" 

        return "Aberto"

