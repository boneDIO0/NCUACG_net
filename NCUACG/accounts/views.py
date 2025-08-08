from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import bcrypt
from django.http import HttpRequest
from accounts.models import User, Credential
from django.db import transaction

@csrf_exempt
def login_api_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({"message": "登入成功", "username": user.username})
            else:
                return JsonResponse({"error": "帳號或密碼錯誤"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "只接受 POST"}, status=405)

@csrf_exempt
def logout_api_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "已登出"})
    return JsonResponse({"error": "只接受 POST"}, status=405)

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
