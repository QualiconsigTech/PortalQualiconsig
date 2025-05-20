from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from apps.core.models.setor import Setor
from apps.core.models.cargo import Cargo
from apps.core.models.grupo import Grupo

TIPOS_USUARIO = (
    ('usuario', 'Usuário Comum'),
    ('analista', 'Analista'),
)

class UsuarioManager(BaseUserManager):
    def create_user(self, email, senha=None, **extra_fields):
        if not email:
            raise ValueError('O campo email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(senha)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, senha=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_admin', True)
        return self.create_user(email, senha, **extra_fields)

class Usuario(AbstractBaseUser):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    grupos = models.ManyToManyField(Grupo, related_name="usuarios", blank=True)
    setor = models.ForeignKey(Setor, on_delete=models.PROTECT, related_name="usuarios")
    cargo = models.ForeignKey(Cargo, on_delete=models.PROTECT, related_name="usuarios")
    tipo = models.CharField(max_length=20, choices=TIPOS_USUARIO, default='usuario')
    ultimo_acesso = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    deletado = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome', 'setor', 'cargo', 'tipo']

    objects = UsuarioManager()

    def __str__(self):
        return self.nome
