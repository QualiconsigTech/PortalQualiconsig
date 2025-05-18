from rest_framework import serializers
from .models.grupo import Grupo
from .models.setor import Setor
from .models.cargo import Cargo
from .models.links import links

class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = "__all__"

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = "__all__"

class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = links
        fields = ['titulo', 'url','tipo', 'logo']


class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = "__all__"