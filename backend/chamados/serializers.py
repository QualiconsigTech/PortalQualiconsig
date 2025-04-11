from rest_framework import serializers
from chamados.models.chamados import Chamado
from chamados.models.perguntas import PerguntaFrequente
from users.serializers import UsuarioSerializer

class ChamadoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    analista = UsuarioSerializer(read_only=True)
    categoria_nome  = serializers.CharField(source='categoria.nome', read_only=True)
    setor_nome  = serializers.CharField(source='setor.nome', read_only=True)
    prioridade_nome = serializers.CharField(source='prioridade.nome', read_only=True)
    class Meta:
        model = Chamado
        fields = '__all__'
        read_only_fields = ['usuario', 'analista', 'criado_em', 'editado_em', 'encerrado_em']

class ChamadoResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamado
        fields = ['id', 'titulo', 'criado_em']


class ChamadoDetalhadoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    analista = UsuarioSerializer(read_only=True)
    categoria_nome  = serializers.CharField(source='categoria.nome', read_only=True)
    setor_nome  = serializers.CharField(source='setor.nome', read_only=True)
    prioridade_nome = serializers.CharField(source='prioridade.nome', read_only=True)
    class Meta:
        model = Chamado
        fields = '__all__'

class PerguntaFrequenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerguntaFrequente
        fields = ['id', 'pergunta', 'resposta', 'deletado']