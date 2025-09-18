from rest_framework import serializers

from django.contrib.auth.password_validation import validate_password
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
from captcha.models import CaptchaStore
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .verifyemail import generate_verification_token, send_verification_email
import os
import logging

class LoginSerializer(serializers.Serializer):
    useremail = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    captcha_key = serializers.CharField()
    captcha_value = serializers.CharField()

    def validate(self, attrs):
        useremail = attrs.get("useremail")
        password = attrs.get("password")
        captcha_key = attrs.get("captcha_key")
        captcha_value = attrs.get("captcha_value")

        # 驗證 Captcha
        try:
            captcha_obj = CaptchaStore.objects.get(hashkey=captcha_key)
        except CaptchaStore.DoesNotExist:
            raise serializers.ValidationError({"captcha": "Captcha expired"})

        if captcha_obj.response != captcha_value.lower():
            raise serializers.ValidationError({"captcha": "Invalid Captcha"})

        # 驗證帳密
        user = User.objects.filter(email=useremail).first()
        if not user:
            raise serializers.ValidationError({"useremail": "Invalid useremail or password"})

        cred = getattr(user, 'credential', None)
        if not cred or not bcrypt.checkpw(password.encode('utf-8'), cred.password_hash.encode('utf-8')):
            raise serializers.ValidationError({"useremail": "Invalid useremail or password"})

        if not user.is_active:
            raise serializers.ValidationError({"useremail": "你尚未驗證email"})

        # 更新 last_login
        with transaction.atomic():
            user.last_login = timezone.now()
            user.is_authenticated=True
            user.save()

        # 簽發 JWT
        refresh = RefreshToken.for_user(user) 
        refresh['id'] = int(user.pk)
        refresh["user_id"] = int(user.pk)  # 加這行
        attrs['user'] = user
        attrs['access'] = str(refresh.access_token)
        attrs['refresh'] = str(refresh)
        return attrs

    
class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100)
    useremail = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate_name(self, value):
        if User.objects.filter(name=value).exists():
            raise serializers.ValidationError("此名字已被使用")
        return value

    def validate_useremail(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("此 Email 已註冊過")
        return value

    def create(self, validated_data):
        name = validated_data['name']
        email = validated_data['useremail']
        password = validated_data['password']

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        with transaction.atomic():
            # 建立未啟用帳號
            user = User.objects.create(
                name=name,
                email=email,
                is_active=False
            )
            # 建立 Credential
            Credential.objects.create(
                user=user,
                password_hash=hashed.decode('utf-8')
            )
            # 建立驗證 token
            token = generate_verification_token()
            VerificationToken.objects.create(user=user, token=token)
            # 發送驗證信
            send_verification_email(email, token)

        return user