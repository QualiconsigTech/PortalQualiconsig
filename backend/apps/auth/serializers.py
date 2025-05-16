from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from apps.usuarios.models.usuarios import Usuario
import re

def validar_email(email):
    padrao_email = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return re.match(padrao_email, email)

def validar_senha(senha):
    padrao_senha = r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]:;"\'<>,.?/~`]).{8,}$'
    return re.match(padrao_senha, senha)

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'password', 'cargo', 'setor', 'deletado', 'is_admin', 'tipo']

    def validate_email(self, value):
        if not validar_email(value):
            raise serializers.ValidationError("Email inválido.")
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def validate_password(self, value):
        if not validar_senha(value):
            raise serializers.ValidationError(
                "A senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, um número e um caractere especial."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user

