from django.core.mail import send_mail
from django.conf import settings
from itsdangerous import URLSafeTimedSerializer

def gerar_token_email(email):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(email, salt='reset-senha')

def validar_token_email(token, tempo_expiracao=3600):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.loads(token, salt='reset-senha', max_age=tempo_expiracao)
