import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import APIException, PermissionDenied
from apps.auth.services import *
from apps.usuarios.models.usuarios import Usuario


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


class AlterarSenhaView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            nova_senha = request.data.get('nova_senha')
            confirmar_senha = request.data.get('confirmar_senha')

            data, errors, status_code = alterar_senha_usuario(request.user, nova_senha, confirmar_senha)

            if errors:
                return Response(errors, status=status_code)
            return Response(data, status=status_code)

        except ValidationError as e:
            return Response({'erro': str(e.detail)}, status=e.status_code)
