import logging
from apps.chamados.models import Categoria
from backend.apps.chamados.models.prioridade import Prioridade
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def listar_categorias():
    logger.info("[SERVICE] Listando categorias.")
    return Categoria.objects.all()

def listar_prioridades():
    logger.info("[SERVICE] Listando prioridades.")
    return Prioridade.objects.all()


def gerar_token_email(email):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(email, salt='reset-senha')

def validar_token_email(token, tempo_expiracao=3600):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.loads(token, salt='reset-senha', max_age=tempo_expiracao)

def enviar_email_reset_senha(email, token):
    link = f"http://localhost:3000/redefinir-senha?token={token}" 
    assunto = "Recuperação de senha"
    mensagem = f"Clique no link para redefinir sua senha: {link}"

    send_mail(
        assunto,
        mensagem,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )