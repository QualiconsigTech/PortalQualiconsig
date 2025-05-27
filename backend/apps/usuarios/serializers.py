from rest_framework import serializers
from apps.core.models import Grupo, Setor, Cargo
from apps.usuarios.models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    grupos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Grupo.objects.all()
    )
    setor = serializers.PrimaryKeyRelatedField(queryset=Setor.objects.all())
    setor_nome = serializers.CharField(source="setor.nome", read_only=True)
    cargo = serializers.PrimaryKeyRelatedField(queryset=Cargo.objects.all())

    class Meta:
        model = Usuario
        fields = [
            "id",
            "nome",
            "email",
            "grupos",
            "setor",
            "setor_nome",
            "cargo",
            "tipo",
            "is_active",
            "is_staff",
            "is_admin",
            "last_login"
        ]
        read_only_fields = ["id", "last_login"]

class GerentePorSetorSerializer(serializers.ModelSerializer):
    setor = serializers.CharField(source='setor.nome')
    cargo = serializers.CharField(source='cargo.nome')

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'setor', 'cargo']
