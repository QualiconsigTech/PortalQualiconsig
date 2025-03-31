from rest_framework import serializers
from users.models.usuarios import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email']


class UsuarioLogadoSerializer(serializers.ModelSerializer):
    setor = serializers.StringRelatedField()
    cargo = serializers.StringRelatedField()

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'tipo', 'setor', 'cargo', 'is_admin', 'deletado']
