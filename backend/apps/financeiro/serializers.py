from rest_framework import serializers
from apps.financeiro.models import RepasseCessao

class RepasseCessaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepasseCessao
        fields = '__all__'
