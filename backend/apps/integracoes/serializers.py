from rest_framework import serializers
from .models.monday import MondayCreate

class MondayCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MondayCreate
        fields = ['task_name', 'user']
