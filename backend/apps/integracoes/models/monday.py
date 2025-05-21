from django.db import models
from apps.usuarios.models.usuarios import Usuario


class MondayCreate(models.Model):

    task_name = models.CharField(max_length=100)
    user = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.task_name
