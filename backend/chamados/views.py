import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models.usuarios import Usuario
from .models.chamados import Chamado
from chamados.models.perguntas import PerguntaFrequente
from .serializers import ProdutoSerializer ,NotificacaoSerializer ,ChamadoSerializer,  ChamadoDetalhadoSerializer, PerguntaFrequenteSerializer, ComentarioChamadoSerializer
from chamados.models.comentario import ComentarioChamado
from chamados.models.chamados import Chamado
from chamados.models.notificacao import Notificacao
from chamados.models import Produto

logger = logging.getLogger(__name__)

#CHAMADOS
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_chamado(request):
    try:
        usuario = request.user

        if not isinstance(usuario, Usuario):
            return Response({"erro": "Usuário não autorizado."}, status=status.HTTP_401_UNAUTHORIZED)

        logger.info(f"[CHAMADO] ID do usuário autenticado: {usuario.id}")

        data = request.data.copy()
        data['usuario'] = usuario.id

        serializer = ChamadoSerializer(data=data)
        if serializer.is_valid():
            chamado = serializer.save(usuario=usuario)

            logger.info(f"[CHAMADO] Chamado criado com sucesso para o usuário ID={usuario.id}")

            
            mensagem_notificacao = f"Seu chamado de  N°{chamado.id} foi aberto com sucesso."
            Notificacao.objects.create(
                mensagem=mensagem_notificacao,
                usuario_destino=usuario,  
                chamado=chamado
            )

            return Response({'mensagem': 'Chamado criado com sucesso.'}, status=status.HTTP_201_CREATED)

        logger.warning(f"[CHAMADO] Erro de validação: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"[CHAMADO] Erro inesperado: {str(e)}")
        return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_ultimos_chamados(request):
    usuario_id = request.user.id
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')[:10]
    serializer = ChamadoSerializer(chamados, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_historico_chamados(request):
    usuario_id = request.user.id
    chamados = Chamado.objects.filter(usuario_id=usuario_id).order_by('-criado_em')
    serializer = ChamadoSerializer(chamados, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalhes_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id)

        if chamado.usuario != request.user and not request.user.is_admin:
            return Response({'erro': 'Você não tem permissão para ver este chamado.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChamadoDetalhadoSerializer(chamado)
        return Response(serializer.data)

    except Chamado.DoesNotExist:
        return Response({'erro': 'Chamado não encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def atualizar_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return Response({'erro': 'Chamado não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != chamado.usuario and not request.user.is_admin:
        return Response({'erro': 'Você não tem permissão para atualizar este chamado.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ChamadoSerializer(chamado, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'mensagem': 'Chamado atualizado com sucesso.', 'dados': serializer.data}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deletar_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return Response({'erro': 'Chamado não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != chamado.usuario and not request.user.is_admin:
        return Response({'erro': 'Você não tem permissão para deletar este chamado.'}, status=status.HTTP_403_FORBIDDEN)

    chamado.delete()
    return Response({'mensagem': 'Chamado deletado com sucesso.'}, status=status.HTTP_200_OK)

#FAQ
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_pergunta_frequente(request):
    serializer = PerguntaFrequenteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'mensagem': 'Pergunta cadastrada com sucesso.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_perguntas_frequentes(request):
    perguntas = PerguntaFrequente.objects.filter(deletado=False).order_by('id')
    serializer = PerguntaFrequenteSerializer(perguntas, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


#COMENTARIOS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_comentarios_chamado(request, chamado_id):
    comentarios = ComentarioChamado.objects.filter(chamado_id=chamado_id).order_by('criado_em')
    serializer = ComentarioChamadoSerializer(comentarios, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_comentario_chamado(request, chamado_id):
    try:
        chamado = Chamado.objects.get(id=chamado_id)
    except Chamado.DoesNotExist:
        return Response({"erro": "Chamado não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    texto = request.data.get('texto')
    if not texto:
        return Response({"erro": "Texto do comentário é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

    if len(texto) > 1000:
        return Response({"erro": "Texto muito grande (máximo 1000 caracteres)."}, status=status.HTTP_400_BAD_REQUEST)

    comentario = ComentarioChamado.objects.create(
        chamado=chamado,
        autor=request.user,
        texto=texto
    )

    if request.user.tipo == 'analista':
        Notificacao.objects.create(
            usuario_destino=chamado.usuario,
            chamado=chamado,
            mensagem=f"Seu chamado {chamado.titulo} recebeu uma resposta do analista."
        )
    elif request.user.tipo == 'usuario' and chamado.analista:
        Notificacao.objects.create(
            usuario_destino=chamado.analista,
            chamado=chamado,
            mensagem=f"Novo comentário no chamado {chamado.titulo} que você está atendendo."
        )
    return Response({"mensagem": "Comentário adicionado com sucesso."}, status=status.HTTP_201_CREATED)


#NOTIFICAÇÃO
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_notificacao(request):
    serializer = NotificacaoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_notificacoes_usuario(request):
    notificacoes = Notificacao.objects.filter(usuario_destino=request.user).order_by('-criado_em')
    serializer = NotificacaoSerializer(notificacoes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marcar_notificacao_visualizada(request, notificacao_id):
    try:
        notificacao = Notificacao.objects.get(id=notificacao_id, usuario_destino=request.user)
        notificacao.visualizado = True
        notificacao.save()
        return Response({"detail": "Notificação marcada como visualizada."}, status=status.HTTP_200_OK)
    except Notificacao.DoesNotExist:
        return Response({"detail": "Notificação não encontrada."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marcar_todas_notificacoes_lidas(request):
    try:
        usuario = request.user
        
        notificacoes = Notificacao.objects.filter(usuario_destino=usuario, visualizado=False)

        notificacoes.update(visualizado=True)

        return Response({"mensagem": "Todas as notificações foram marcadas como lidas."}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def produtos_view(request):
    try:
        if request.method == 'GET':
            produtos = Produto.objects.all()
            serializer = ProdutoSerializer(produtos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            serializer = ProdutoSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'erro': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def usar_produto(request):
    try:
        produto_id = request.data.get('produto_id')
        quantidade_utilizada = int(request.data.get('quantidade', 0))

        if not produto_id or quantidade_utilizada <= 0:
            return Response({'erro': 'Dados inválidos'}, status=status.HTTP_400_BAD_REQUEST)

        produto = Produto.objects.get(id=produto_id)

        if produto.quantidade < quantidade_utilizada:
            return Response({'erro': 'Estoque insuficiente'}, status=status.HTTP_400_BAD_REQUEST)

        produto.quantidade -= quantidade_utilizada
        produto.save()

        return Response({
            'mensagem': f'{quantidade_utilizada}x {produto.nome} utilizados. Estoque atualizado.',
            'estoque_atual': produto.quantidade
        }, status=status.HTTP_200_OK)

    except Produto.DoesNotExist:
        return Response({'erro': 'Produto não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'erro': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



