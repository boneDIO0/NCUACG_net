import secrets
from django.conf import settings
from django.core.mail import send_mail

def generate_verification_token():
    return secrets.token_urlsafe(32)

def generate_verification_url(token):
    #return f"{settings.FRONTEND_URL}/verify-registration/?token={token}"
    return f"http://localhost:8000/api/verify-registration/?token={token}"

def send_verification_email(user_email, token):
    url = generate_verification_url(token)
    subject = "註冊驗證信"
    message = f"請點擊此連結完成註冊驗證：\n{url}\n此信件為自動發送，請勿回復。"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])