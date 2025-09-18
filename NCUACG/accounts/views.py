from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
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
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .verifyemail import generate_verification_token, send_verification_email
import os
import logging
from accounts.serializers import RegisterSerializer,LoginSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
import traceback
from accounts.tokentest import JWTtest
import jwt
from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken  # ←這裡
from rest_framework.exceptions import AuthenticationFailed    # ←這裡
logger = logging.getLogger(__name__)
class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found', code='user_not_found')

        return user
class UserProfileView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user  # 這裡會是 CustomJWTAuthentication 回傳的 User

            role = "member"
            if getattr(user, "is_super_admin", False):
                role = "superadmin"
            elif getattr(user, "is_admin", False):
                role = "admin"

            response_data = {
                "id": user.id,
                "username": getattr(user, "name", ""),  # 你的 User 是用 name
                "role": role,
            }

            print(f"✅ 成功回傳資料: {response_data}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": "取得個人資料時發生錯誤"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetCaptcha(APIView):
    def get(self, request):
        new_captcha = CaptchaStore.generate_key()
        image_url = captcha_image_url(new_captcha)
        return Response({
            "captcha_key": new_captcha,
            "captcha_image_url": image_url
        })


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]
            access_token = serializer.validated_data["access"]
            refresh_token = serializer.validated_data["refresh"]

            logger.info(f"User '{user.name}' logged in successfully.")
            
            return Response({
                "message": "Login success",
                "access": access_token,
                "refresh": refresh_token
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(logger.error(traceback.format_exc()))
            return Response({
                "message": str(e),
            }, status=400)


class LogoutView(APIView):
    def post(self, request):
        response = Response({'message': '登出成功'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()  # 呼叫 create()
        return Response({'message': '註冊成功，請查收驗證信'}, status=status.HTTP_201_CREATED)
        

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
