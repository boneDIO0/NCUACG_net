from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import bcrypt
from accounts.models import User, Credential
from django.db import transaction
from django.utils import timezone

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            password = data['password']

            cred = Credential.objects.get(username=username)
            if bcrypt.checkpw(password.encode('utf-8'), cred.password_hash.encode('utf-8')):
                # 驗證成功，更新 last_login
                cred.last_login = timezone.now()
                cred.save()
                return JsonResponse({'message': '登入成功'}, status=200)
            else:
                return JsonResponse({'message': '密碼錯誤'}, status=401)
        except Credential.DoesNotExist:
            return JsonResponse({'message': '帳號不存在'}, status=404)
        except Exception as e:
            return JsonResponse({'message': f'登入錯誤: {str(e)}'}, status=400)
    return JsonResponse({'message': '不支援的請求方法'}, status=405)

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
