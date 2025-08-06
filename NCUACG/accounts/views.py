from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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

# Create your views here.
