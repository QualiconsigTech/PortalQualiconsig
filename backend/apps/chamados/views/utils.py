from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.chamados.services.utils import *
   
class CategoriasListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categorias = listar_categorias()
        data = [{"id": cat.id, "nome": cat.nome} for cat in categorias]
        return Response(data)
    
class PrioridadesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prioridades = listar_prioridades()
        data = [{"id": prioridades.id, "nome": prioridades.nome} for prioridades in prioridades]
        return Response(data)
