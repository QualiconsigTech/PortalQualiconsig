from rest_framework import serializers
from apps.usuarios.models.usuarios import Usuario
from apps.usuarios.models.links import links


class UsuarioSerializer(serializers.ModelSerializer):
    setor_nome = serializers.CharField(source='setor.nome', read_only=True)
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'setor_nome']


class UsuarioLogadoSerializer(serializers.ModelSerializer):
    setor = serializers.StringRelatedField()
    cargo = serializers.StringRelatedField()

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'tipo', 'setor', 'cargo', 'is_admin', 'deletado']

class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = links
        fields = ['titulo', 'url','tipo', 'logo']
