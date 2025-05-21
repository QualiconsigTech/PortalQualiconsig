import logging

from itsdangerous import URLSafeTimedSerializer
from apps.chamados.models import Categoria
from apps.chamados.models.prioridade import Prioridade
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
