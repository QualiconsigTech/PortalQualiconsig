from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from users.models.usuarios import Usuario
from users.models.analista import Analista
import re

def validar_email(email):
    padrao_email = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return re.match(padrao_email, email)

def validar_senha(senha):
    padrao_senha = r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]:;"\'<>,.?/~`]).{8,}$'
    return re.match(padrao_senha, senha)

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'senha', 'cargo', 'setor', 'deletado']

    def validate_email(self, value):
        if not validar_email(value):
            raise serializers.ValidationError("Email inválido.")
        if Usuario.objects.filter(email=value).exists() or Analista.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def validate_senha(self, value):
        if not validar_senha(value):
            raise serializers.ValidationError(
                "A senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, um número e um caractere especial."
            )
        return value

    def create(self, validated_data):
        validated_data['senha'] = make_password(validated_data['senha'])
        return super().create(validated_data)

class AnalistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analista
        fields = ['id', 'nome', 'email', 'senha', 'setor', 'deletado']

    def validate_email(self, value):
        if not validar_email(value):
            raise serializers.ValidationError("Email inválido.")
        if Usuario.objects.filter(email=value).exists() or Analista.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def validate_senha(self, value):
        if not validar_senha(value):
            raise serializers.ValidationError(
                "A senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, um número e um caractere especial."
            )
        return value

    def create(self, validated_data):
        validated_data['senha'] = make_password(validated_data['senha'])
        return super().create(validated_data)
