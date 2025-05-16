from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models.setor import Setor
from .models.cargo import Cargo
from .services import listar_todos_os_links
from .serializers import SetorSerializer, CargoSerializer, LinkSerializer


class SetorViewSet(ModelViewSet):
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer
    permission_classes = [IsAuthenticated]

class CargoViewSet(ModelViewSet):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated]

#Links
class LinksCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = LinkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LinksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        links = listar_todos_os_links()
        serializer = LinkSerializer(links, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)