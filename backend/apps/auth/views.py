import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import APIException, PermissionDenied
from apps.usuarios.models.usuarios import Usuario
from apps.auth.serializers import *
from apps.auth.services import *

logger = logging.getLogger(__name__)

class CadastrarUsuarioView(APIView):
    def post(self, request):
        data, errors, status_code = cadastrar_novo_usuario(request.data)
        if errors:
            return Response(errors, status=status_code)
        return Response(data, status=status_code)

class LoginView(APIView):
    def post(self, request):
        try:
            resultado = autenticar_usuario(
                request.data.get('email'),
                request.data.get('password')
            )
            return Response(resultado, status=status.HTTP_200_OK)
        except APIException as e:
            return Response({'detail': str(e)}, status=e.status_code)

class AtualizarUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, tipo, id):
        try:
            data, errors, status_code = atualizar_usuario(tipo, id, request.data, request.user)
            if errors:
                return Response(errors, status=status_code)
            return Response(data, status=status_code)
        except Usuario.DoesNotExist:
            return Response({'erro': f'{tipo.capitalize()} não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({'erro': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeletarUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, tipo, id):
        try:
            data = deletar_usuario(tipo, id, request.user)
            return Response(data, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({'erro': f'{tipo.capitalize()} não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({'erro': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class UsuarioLogadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = obter_dados_do_usuario(request.user)
        serializer = UsuarioLogadoSerializer(usuario)
        return Response(serializer.data)


class AtualizarSenhaView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            data, errors, status_code = alterar_senha(request)
            if errors:
                return Response(errors, status=status_code)
            return Response(data, status=status_code)
        except Exception as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class CadastrarUsuariosEmLoteView(APIView):
    def post(self, request):
        if not isinstance(request.data, list):
            return Response({"erro": "Formato inválido. Envie uma lista de usuários."}, status=400)

        dados, status_code = cadastrar_usuarios_em_lote(request.data)
        return Response(dados, status=status_code)


