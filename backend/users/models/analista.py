from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from .setor import Setor

class AnalistaManager(BaseUserManager):
    def create_user(self, email, senha=None, **extra_fields):
        if not email:
            raise ValueError("O campo de e-mail é obrigatório.")
        email = self.normalize_email(email)
        analista = self.model(email=email, **extra_fields)
        analista.set_password(senha)
        analista.save(using=self._db)
        return analista

    def create_superuser(self, email, senha=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, senha, **extra_fields)

class Analista(AbstractBaseUser, PermissionsMixin):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE)
    deletado = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome', 'setor']

    objects = AnalistaManager()

    def __str__(self):
        return self.nome
