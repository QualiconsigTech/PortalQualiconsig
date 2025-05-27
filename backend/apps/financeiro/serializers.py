from rest_framework import serializers
from apps.financeiro.models import RepasseCessao
from apps.financeiro.models.relatorioomie import RelatorioOmie
from apps.financeiro.models.categoria import Categoria

class RepasseCessaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepasseCessao
        fields = '__all__'

class RelatorioOmieSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatorioOmie
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'tipo'] 