# NCUACG/assistant/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# 改：allow personaId 傳入模型
from .services.llama_client import ask_llama_rag as ask_model


class ChatAPI(APIView):
    def post(self, request, *args, **kwargs):
        msg = request.data.get("message", "")
        persona_id = request.data.get("personaId") or request.data.get("persona_id")

        # 基本驗證
        if not isinstance(msg, str) or not msg.strip():
            return Response(
                {"error": "`message` is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reply = ask_model(msg, persona_slug=persona_id)
            return Response({"reply": reply})
        except Exception as e:
            # 可加上 logger.exception(e)
            return Response(
                {"error": "assistant failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
