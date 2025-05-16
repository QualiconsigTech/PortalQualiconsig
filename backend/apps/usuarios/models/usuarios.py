from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group, Permission
from django.db import models
from core.models.setor import Setor
from core.models.cargo import Cargo
from core.models.grupo import Grupo 

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
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, senha, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    grupo = models.ForeignKey(Grupo, on_delete=models.PROTECT, related_name="usuarios")
    setor = models.ForeignKey(Setor, on_delete=models.PROTECT, related_name="usuarios")
    cargo = models.ForeignKey(Cargo, on_delete=models.PROTECT, related_name="usuarios")
    tipo = models.CharField(max_length=20, choices=TIPOS_USUARIO, default='usuario')
    
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    groups = models.ManyToManyField(Group, related_name='usuario_set', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='usuario_set', blank=True)
    deletado = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome', 'grupo', 'setor', 'cargo', 'tipo']

    objects = UsuarioManager()

    def __str__(self):
        return self.nome
