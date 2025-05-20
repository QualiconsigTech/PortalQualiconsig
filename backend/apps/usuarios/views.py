from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.chamados.models.notificacao import Notificacao
from apps.chamados.serializers import ChamadoDetalhadoSerializer
from apps.usuarios.serializers import UsuarioLogadoSerializer, LinkSerializer
from apps.usuarios.services import *
from apps.usuarios.utils import *
from apps.usuarios.models.usuarios import Usuario
from django.utils import timezone


#ANALISTA COMUM
class ChamadosDoAnalistaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = filtrar_chamados_por_analista(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)


        
class ChamadosAtribuidosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = filtra_chamados_atribuidos(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)
    

    
#ANALISTA ADMIN    
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
    
#USUARIO
class ChamadosDoUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chamados = listar_chamados_do_usuario(request.user)
        serializer = ChamadoDetalhadoSerializer(chamados, many=True)
        return Response(serializer.data)

class AtenderChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        try:
            chamado = atender_chamado(chamado_id, request.user)

            Notificacao.objects.create(
                usuario_destino=chamado.usuario,
                chamado=chamado,
                mensagem=f"Seu chamado {chamado.titulo} está em atendimento."
            )

            return Response({
                "mensagem": f"Chamado '{chamado.titulo}' atribuído ao analista com sucesso."
            }, status=status.HTTP_200_OK)

        except PermissionError as e:
            return Response({"erro": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"erro": "Erro ao atender o chamado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EncerrarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        try:
            chamado = encerrar_chamado(chamado_id, request.user, request.data)

            Notificacao.objects.create(
                usuario_destino=chamado.usuario,
                chamado=chamado,
                mensagem=f"Seu chamado {chamado.titulo} foi encerrado."
            )

            return Response({
                'mensagem': 'Chamado encerrado com sucesso.',
                'chamado_id': chamado.id,
                'encerrado_em': chamado.encerrado_em
            }, status=status.HTTP_200_OK)
        
        except PermissionError as e:
            return Response({"erro": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"erro": "Erro interno ao encerrar chamado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CancelarChamadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chamado_id):
        try:
            chamado = cancelar_chamado(chamado_id, request.user, request.data)
            return Response({
                "mensagem": f"Chamado '{chamado.titulo}' cancelado com sucesso.",
                "encerrado_em": chamado.encerrado_em
            })
        except PermissionError as e:
            return Response({"erro": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"erro": "Erro interno ao cancelar chamado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#USUARIOS ADMIN
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
    

#RESETE DE SENHA    
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
        

#LISTAGEM       
class CategoriasListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categorias = listar_categorias()
        data = [{"id": cat.id, "nome": cat.nome} for cat in categorias]
        return Response(data)


class SetoresListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        setores = listar_setores()
        data = [{"id": setor.id, "nome": setor.nome, "area_id": setor.area_id} for setor in setores]
        return Response(data)
    
class PrioridadesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prioridades = listar_prioridades()
        data = [{"id": prioridades.id, "nome": prioridades.nome} for prioridades in prioridades]
        return Response(data)

class CargoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cargos = listar_cargos()
        data = [{"id": cargos.id, "nome": cargos.nome} for cargos in cargos]
        return Response(data)

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