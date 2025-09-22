# NCUACG/assistant/views.py
from __future__ import annotations

from typing import Any, Dict

from django.http import HttpRequest
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

# 模型呼叫（維持原有別名與行為）
from .services.llama_client import ask_llama_rag as ask_model

# ✨ 序列化與 personas 單一來源
from .serializers import (
    ChatRequestSerializer,
    ChatResponseSerializer,
    PersonaSerializer,
)
from .services.personas import (
    get_personas,
    get_default_persona_id,
    resolve_persona_id,   # ← 新增：密語/ID 解析
)


class ChatAPI(APIView):
    """
    POST /api/assistant/chat/
    body: { "message": str, "persona"?: str }  # 亦相容 personaId/persona_id
    resp: { "reply": str, "persona": str, "personaUsed": str } or 400/500
    """
    permission_classes = [AllowAny]

    def post(self, request: HttpRequest, *args, **kwargs):
        # 先用 serializer 驗證基本欄位
        req = ChatRequestSerializer(data=request.data)
        if not req.is_valid():
            errors: Dict[str, Any] = req.errors  # type: ignore
            available = PersonaSerializer(get_personas(), many=True).data

            # 若 persona 非法 → 400 並附可用清單
            if "persona" in errors:
                detail = (
                    errors["persona"][0]
                    if isinstance(errors["persona"], list)
                    else errors["persona"]
                )
                return Response(
                    {"detail": detail, "available_personas": available},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 其他驗證錯誤 → 也統一附上 available_personas
            return Response(
                {
                    "detail": "Invalid request",
                    "errors": errors,
                    "available_personas": available,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = req.validated_data
        message: str = data["message"]
        # 同時相容 personaId（若序列化器沒收這欄就從原始 body 補）
        preferred_from_body = request.data.get("personaId") or request.data.get("persona_id")
        preferred: str = (data.get("persona") or preferred_from_body or get_default_persona_id())

        # ★關鍵：密語優先 → 解析本次實際採用的人格
        used = resolve_persona_id(preferred_id=preferred, user_text=message)

        try:
            # 帶入 used（已處理密語）給模型
            reply = ask_model(message, persona_slug=used)

            # 仍用舊的回應序列化器產生基本欄位
            resp = ChatResponseSerializer(data={"reply": reply, "persona": used})
            resp.is_valid(raise_exception=True)

            # 再補上 personaUsed 供前端持久化
            payload = dict(resp.data)
            payload["personaUsed"] = used
            return Response(payload, status=status.HTTP_200_OK)

        except Exception:
            # 可加 logger.exception(e)
            return Response(
                {"detail": "Internal Server Error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PersonasAPI(APIView):
    """
    GET /api/assistant/personas/
    resp: [ { id, name, avatar, description }, ... ]
    """
    permission_classes = [AllowAny]

    def get(self, request: HttpRequest, *args, **kwargs):
        # 統一由後端 personas 單一來源取得
        data = PersonaSerializer(get_personas(), many=True).data
        return Response(data, status=status.HTTP_200_OK)


# 兼容函式型掛載（若 urls.py 使用函式 path）
def chat(request: HttpRequest, *args, **kwargs):
    return ChatAPI.as_view()(request, *args, **kwargs)


def list_personas(request: HttpRequest, *args, **kwargs):
    return PersonasAPI.as_view()(request, *args, **kwargs)
