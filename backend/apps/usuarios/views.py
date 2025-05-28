from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from apps.usuarios.models import Usuario
from apps.usuarios.serializers import UsuarioSerializer, GerentePorSetorSerializer
from apps.usuarios.services import listar_gerentes_por_setor
from apps.core.models.cargo import Cargo
from rest_framework import serializers


class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.filter(deletado=False)
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

class GerentesPorSetorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        setor_id = request.query_params.get("setor_id")
        if not setor_id:
            return Response({"detail": "Parâmetro 'setor_id' é obrigatório."}, status=400)

        gerentes = listar_gerentes_por_setor(setor_id)
        serializer = GerentePorSetorSerializer(gerentes, many=True)
        return Response(serializer.data)

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id', 'nome']

class CargosListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cargos = Cargo.objects.all()
        serializer = CargoSerializer(cargos, many=True)
        return Response(serializer.data)