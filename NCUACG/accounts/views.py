from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import bcrypt
from accounts.models import User, Credential, VerificationToken
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .verifyemail import generate_verification_token, send_verification_email
import os

class GetCaptcha(APIView):
    def get(self, request):
        new_captcha = CaptchaStore.generate_key()
        image_url = captcha_image_url(new_captcha)
        return Response({
            "captcha_key": new_captcha,
            "captcha_image_url": image_url
        })


class LoginView(APIView):
    def post(self, request):
        useremail = request.data.get("useremail")
        password = request.data.get("password")
        captcha_key = request.data.get("captcha_key")
        captcha_value = request.data.get("captcha_value")

        # 驗證 Captcha
        try:
            captcha_obj = CaptchaStore.objects.get(hashkey=captcha_key)
        except CaptchaStore.DoesNotExist:
            return Response({"error": "Captcha expired"}, status=status.HTTP_400_BAD_REQUEST)

        if captcha_obj.response != captcha_value.lower():
            return Response({"error": "Invalid Captcha"}, status=status.HTTP_400_BAD_REQUEST)

        # 驗證帳密
        user = User.objects.filter(email=useremail).first()
        cred = Credential.objects.filter(user=user).first()

        if bcrypt.checkpw(password.encode('utf-8'), cred.password_hash.encode('utf-8')):
            # 驗證成功，更新 last_login
            cred.last_login = timezone.now()
            cred.save()
        else:
            return Response({"error": "Invalid useremail or password"}, status=status.HTTP_400_BAD_REQUEST)

        # 登入成功 → 發 JWT
        refresh = RefreshToken.for_user(user)
        response = Response({"message": "Login success"})
        response.set_cookie("access_token", str(refresh.access_token), httponly=True, secure=True, samesite="Strict")
        response.set_cookie("refresh_token", str(refresh), httponly=True, secure=True, samesite="Strict")
        return response


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"message": "CSRF cookie set"})
    

class LogoutView(APIView):
    def post(self, request):
        response = Response({'message': '登出成功'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class RegisterView(APIView):
    def post(self, request):
        try:
            username = request.data.get("username")
            email = request.data.get("useremail")
            password = request.data.get("password")

            if User.objects.filter(email=email).exists():
                return Response({'message': '此 Email 已註冊過'}, status=400)
            if User.objects.filter(name=username).exists():
                return Response({'message': '此名字已被使用'}, status=400)

            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            with transaction.atomic():
                # 建立未啟用的帳號
                user = User.objects.create(
                    name=username,
                    email=email,
                    is_active=False
                )
                Credential.objects.create(
                    username=username,
                    password_hash=hashed.decode('utf-8'),
                    user=user
                )

                # 建立驗證 token
                token = generate_verification_token()
                VerificationToken.objects.create(user=user, token=token)

                # 發送驗證信
                send_verification_email(email, token)

            return Response({'message': '註冊成功，請查收驗證信'}, status=201)

        except Exception as e:
            return Response({'message': f'註冊失敗: {str(e)}'}, status=400)
        

class VerifyRegistrationView(APIView):
    def get(self, request):
        token_value = request.query_params.get("token")
        token_obj = VerificationToken.objects.filter(token=token_value, is_used=False).first()

        if not token_obj or token_obj.is_expired():
            return Response({"error": "驗證連結無效或已過期"}, status=status.HTTP_400_BAD_REQUEST)

        # 驗證成功
        token_obj.is_used = True
        token_obj.save()
        token_obj.user.is_active = True
        token_obj.user.save()

        return Response({"message": "驗證成功，註冊完成"}, status=status.HTTP_200_OK)
    
class Super_adminView(APIView):
    def post(self, request):
        super_admin_password = request.data.get("super_admin_password")
        useremail = request.data.get("useremail")
        password = request.data.get("password")
        # 超級網管註冊
        if super_admin_password == os.getenv("super_admin_password"):
            if not User.objects.filter(is_super_admin=True).exists():
                user = User.objects.filter(email=useremail).first()
                cred = Credential.objects.filter(user=user).first()
                if user:
                    if bcrypt.checkpw(password.encode('utf-8'), cred.password_hash.encode('utf-8')):
                        user.is_super_admin = True
                        user.is_admin = True
                        user.save()
                        return Response({"message": "已成功成為網管"}, status=201)
                    else:
                        return Response({"error": "用戶密碼錯誤"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "此用戶不存在"}, status=status.HTTP_400_BAD_REQUEST)
                
            else:
                return Response({"error": "已存在超級網管"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "超級網管密碼錯誤"}, status=status.HTTP_400_BAD_REQUEST)
