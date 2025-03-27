from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group, Permission
from django.db import models
from .cargo import Cargo
from .setor import Setor

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
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE)
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE)
    deletado = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    groups = models.ManyToManyField(
        Group,
        related_name='usuario_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='usuario_set',
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome', 'cargo', 'setor']

    objects = UsuarioManager()

    def __str__(self):
        return self.nome
