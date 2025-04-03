from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from chamados.models.chamados import Chamado
from chamados.serializers import ChamadoDetalhadoSerializer
from users.serializers import UsuarioLogadoSerializer
from users.services import filtrar_chamados_por_analista, atender_chamado, obter_dados_do_usuario,filtra_chamados_atribuidos, encerrar_chamado, listar_chamados_admin, listar_chamados_do_usuario, listar_chamados_do_setor
from users.utils import gerar_token_email, enviar_email_reset_senha, validar_token_email
from users.models.usuarios import Usuario

class ChamadosDoAnalistaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = filtrar_chamados_por_analista(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)

class AtenderChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        try:
            chamado = atender_chamado(request.user, chamado_id)
            return Response({
                "mensagem": f"Chamado '{chamado.titulo}' atribuído ao analista com sucesso."
            }, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"erro": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class ChamadosAtribuidosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = filtra_chamados_atribuidos(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
class EncerrarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        chamado = encerrar_chamado(chamado_id, request.user, request.data)
        return Response({
            'mensagem': 'Chamado encerrado com sucesso.',
            'chamado_id': chamado.id,
            'encerrado_em': chamado.encerrado_em
        })
    
## ANALISTA ADMIN    
class ChamadosAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_admin(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)


class ChamadosPorSetorAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, setor_nome):
        chamados = listar_chamados_admin(request.user, setor_nome)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
## USUARIO
class ChamadosDoUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_do_usuario(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
## USUARIOS ADMIN
class ChamadosDoSetorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_do_setor(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    
class UsuarioLogadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = obter_dados_do_usuario(request.user)
        serializer = UsuarioLogadoSerializer(usuario)
        return Response(serializer.data)
    
class EnviarResetSenhaView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            usuario = Usuario.objects.get(email=email)
            token = gerar_token_email(email)
            enviar_email_reset_senha(email, token)
            return Response({"mensagem": "E-mail de recuperação enviado com sucesso."})
        except Usuario.DoesNotExist:
            return Response({"erro": "E-mail não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
class ConfirmarResetSenhaView(APIView):
    def post(self, request):
        token = request.data.get("token")
        nova_senha = request.data.get("nova_senha")

        try:
            email = validar_token_email(token)
            usuario = Usuario.objects.get(email=email)
            usuario.set_password(nova_senha)
            usuario.save()
            return Response({"mensagem": "Senha redefinida com sucesso."})
        except Exception as e:
            return Response({"erro": "Token inválido ou expirado."}, status=400)