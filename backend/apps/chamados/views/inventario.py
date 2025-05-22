from rest_framework import generics
from apps.chamados.models.inventario import ProdutoInventario
from apps.chamados.serializers import ProdutoInventarioSerializer

class ProdutoInventarioListCreateView(generics.ListCreateAPIView):
    queryset = ProdutoInventario.objects.all().order_by('-atualizado_em')
    serializer_class = ProdutoInventarioSerializer
