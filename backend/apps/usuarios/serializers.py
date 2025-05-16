from rest_framework import serializers
from apps.core.models import Grupo, Setor, Cargo
from apps.usuarios.models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    grupo = serializers.SlugRelatedField(slug_field="nome", queryset=Grupo.objects.all())
    setor = serializers.SlugRelatedField(slug_field="nome", queryset=Setor.objects.all())
    cargo = serializers.SlugRelatedField(slug_field="nome", queryset=Cargo.objects.all())

    class Meta:
        model = Usuario
        fields = [
            "id",
            "nome",
            "email",
            "grupo",
            "setor",
            "cargo",
            "tipo",
            "is_active",
            "is_staff",
            "is_admin",
            "last_login"
        ]
        read_only_fields = ["id", "last_login"]
