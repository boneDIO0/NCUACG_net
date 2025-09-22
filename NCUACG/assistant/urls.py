# NCUACG/assistant/urls.py
from django.urls import path, re_path

# 嘗試匯入正式 view；若尚未實作 list_personas，提供安全 stub（避免專案啟動失敗）
try:
    from .views import ChatAPI, list_personas
except ImportError:
    from .views import ChatAPI  # 你的現有檔案至少有 ChatAPI
    from django.http import JsonResponse

    def list_personas(request, *args, **kwargs):
        # TODO: 之後以正式的 views.list_personas 取代
        return JsonResponse(
            {"error": "list_personas not implemented"},
            status=501,
        )

app_name = "assistant"

urlpatterns = [
    # ✅ 正式路由（尾斜線結尾，與 APPEND_SLASH 相容）
    path("chat/", ChatAPI.as_view(), name="chat"),
    path("personas/", list_personas, name="personas"),

    # ✅ 兼容無尾斜線（避免 POST 被重導致 Body 遺失）
    re_path(r"^chat$", ChatAPI.as_view(), name="chat_no_slash"),
    re_path(r"^personas$", list_personas, name="personas_no_slash"),
]
