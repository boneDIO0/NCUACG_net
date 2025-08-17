from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import bcrypt
from accounts.models import User, Credential
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

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



@csrf_exempt
def logout_user(request):
    # 若沒 session/token，後端可以不做事
    return JsonResponse({'message': '登出成功'}, status=200)

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            email = data['useremail']
            password = data['password']

            # ✅ 加密密碼
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            if User.objects.filter(email=email).exists():
                return JsonResponse({'message': '此 Email 已註冊過'}, status=400)
            if User.objects.filter(name=username).exists():
                return JsonResponse({'message': '此名字已被使用'}, status=400)
            with transaction.atomic():  # 🔐 開啟資料庫交易
            # ✅ 建立使用者記錄
                user = User.objects.create(name=username, email=email)
                Credential.objects.create(
                    username=username,
                    password_hash=hashed.decode('utf-8'),
                    user=user
                )

            return JsonResponse({'message': '註冊成功'}, status=201)
        except Exception as e:
            print(f"錯誤: {e}")
            return JsonResponse({'message': f'註冊失敗: {str(e)}'}, status=400)

    return JsonResponse({'message': '不支援的請求方法'}, status=405)
