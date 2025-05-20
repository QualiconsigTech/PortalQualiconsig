from rest_framework import serializers
from apps.chamados.models.chamados import Chamado
from apps.chamados.models.perguntas import PerguntaFrequente
from apps.usuarios.serializers import UsuarioSerializer
from apps.chamados.models.comentario import ComentarioChamado
from apps.chamados.models.notificacao import Notificacao
from apps.chamados.models import Produto

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
        fields = [
            'id',
            'titulo',
            'descricao',
            'gravidade',
            'criado_em',
            'editado_em',
            'encerrado_em',
            'solucao',
            'comentarios',
            'arquivos',
            'usuario',
            'analista',
            'categoria_nome',
            'setor_nome',
            'prioridade_nome',
            'categoria',
            'setor',
            'prioridade',
        ]

class PerguntaFrequenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerguntaFrequente
        fields = ['id', 'pergunta', 'resposta', 'deletado']

class ComentarioChamadoSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source='autor.username', read_only=True)
    autor = UsuarioSerializer(read_only=True) 

    class Meta:
        model = ComentarioChamado
        fields = ['id', 'chamado', 'autor', 'autor_nome', 'texto', 'criado_em']
        read_only_fields = ['id', 'autor_nome', 'criado_em']

class NotificacaoSerializer(serializers.ModelSerializer):
    chamado_id = serializers.IntegerField(source='chamado.id', read_only=True) 

    class Meta:
        model = Notificacao
        fields = ['id', 'mensagem', 'visualizado', 'criado_em', 'chamado_id'] 


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'quantidade']





