from rest_framework import serializers
from chamados.models.chamados import Chamado

class ChamadoSerializer(serializers.ModelSerializer):
    categoria_nome  = serializers.CharField(source='categoria.nome', read_only=True)
    setor_nome  = serializers.CharField(source='setor.nome', read_only=True)
    class Meta:
        model = Chamado
        fields = '__all__'
        read_only_fields = ['usuario', 'analista', 'criado_em', 'editado_em', 'encerrado_em']

class ChamadoResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamado
        fields = ['id', 'titulo', 'criado_em']


class ChamadoDetalhadoSerializer(serializers.ModelSerializer):
    categoria_nome  = serializers.CharField(source='categoria.nome', read_only=True)
    setor_nome  = serializers.CharField(source='setor.nome', read_only=True)
    class Meta:
        model = Chamado
        fields = '__all__'