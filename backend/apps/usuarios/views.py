from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from apps.usuarios.models import Usuario
from apps.usuarios.serializers import UsuarioSerializer

class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.filter(deletado=False)
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]