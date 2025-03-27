from rest_framework import serializers
from chamados.models.chamados import Chamado

class ChamadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamado
        fields = '__all__'
        read_only_fields = ['usuario', 'analista', 'criado_em', 'editado_em', 'encerrado_em']

class ChamadoResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamado
        fields = ['id', 'titulo', 'criado_em']


class ChamadoDetalhadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamado
        fields = '__all__'