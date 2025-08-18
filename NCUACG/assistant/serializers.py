# NCUACG/assistant/serializers.py
from __future__ import annotations

from typing import Any, Dict, Optional
from rest_framework import serializers


__all__ = [
    "ChatRequestSerializer",
    "ChatResponseSerializer",
    "PersonaSerializer",
    "ErrorSerializer",
]


class ChatRequestSerializer(serializers.Serializer):
    """
    前端送進來的聊天請求。
    - message: 必填，會自動去除前後空白並禁止空字串
    - persona: 選填；同時相容 personaId / persona_id 三種鍵名
    - conversation_id: 選填；若未使用可忽略
    """
    message = serializers.CharField(allow_blank=False)
    conversation_id = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    persona = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        # 允許 personaId / persona_id 作為別名
        if not attrs.get("persona"):
            initial = getattr(self, "initial_data", {}) or {}
            alias = initial.get("personaId") or initial.get("persona_id")
            if alias:
                attrs["persona"] = alias

        # message 清理與檢查
        msg = attrs.get("message")
        if isinstance(msg, str):
            msg = msg.strip()
            if not msg:
                raise serializers.ValidationError({"message": "message cannot be empty"})
            attrs["message"] = msg
        else:
            raise serializers.ValidationError({"message": "message must be a string"})

        # 轉為 None 而非空字串，讓後端更好判斷
        if isinstance(attrs.get("persona"), str) and attrs["persona"].strip() == "":
            attrs["persona"] = None
        if isinstance(attrs.get("conversation_id"), str) and attrs["conversation_id"].strip() == "":
            attrs["conversation_id"] = None

        return attrs


class ChatResponseSerializer(serializers.Serializer):
    """
    後端回傳給前端的標準聊天回應。
    - reply: 助理輸出的文字（必要）
    - persona: 實際使用的 persona（選填）
    - conversation_id: 對話識別（選填）
    - usage: 計量/除錯資訊（選填，結構不固定，採任意 dict）
    """
    reply = serializers.CharField()
    persona = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    conversation_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    usage = serializers.DictField(required=False)


class PersonaSerializer(serializers.Serializer):
    """
    人設清單元素。為了與不同來源的欄位對齊，這裡採統一欄位：
    - id: 角色唯一識別
    - name: 顯示名稱（由 displayName/name 映射而來）
    - avatar: 頭像路徑（可選）
    - description: 簡述（由 summary/description 映射而來）
    """
    id = serializers.CharField()
    name = serializers.CharField()
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class ErrorSerializer(serializers.Serializer):
    """
    統一錯誤回應格式（可選）。
    """
    error = serializers.CharField()
    detail = serializers.CharField(required=False, allow_blank=True, allow_null=True)
