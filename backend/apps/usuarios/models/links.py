from django.db import models

class links(models.Model):
    titulo = models.CharField(max_length=100)
    url = models.URLField()
    tipo = models.CharField(max_length=20,choices=[('sistema', 'Sistema'), ('banco', 'Banco')])
    logo = models.CharField(max_length=100, blank=True, null=True,help_text="Nome do arquivo da imagem (ex: BMG.png)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.titulo
