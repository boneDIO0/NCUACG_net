# NCUACG/assistant/views.py
from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Tuple

from django.conf import settings
from django.http import JsonResponse, HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# 改：allow personaId 傳入模型（沿用你原有的匯入與呼叫方式）
from .services.llama_client import ask_llama_rag as ask_model


class ChatAPI(APIView):
    """
    POST /api/assistant/chat
    body: { "message": string, "personaId"?: string, "persona_id"?: string }
    resp: { "reply": string } or { "error": string, "detail"?: string }
    """
    permission_classes = [AllowAny]

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
            # 你原本的實作只回傳 reply，這裡維持不破壞前端
            return Response({"reply": reply})
        except Exception as e:
            # TODO: 可加入 logger.exception(e)
            return Response(
                {"error": "assistant failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# -----------------------
# Personas 列表端點
# -----------------------

PERSONA_KEYS_MAP = {
    "name": ("displayName", "name",),          # 來源鍵 -> 統一為 name
    "description": ("summary", "description",) # 來源鍵 -> 統一為 description
}

def _candidate_persona_paths() -> List[str]:
    """
    回傳 personas.json 的候選路徑（依優先序）：
    1) <BASE_DIR>/NCUACG/assistant/prompts/personas.json   # 後端單一真實來源（建議）
    2) <BASE_DIR>/frontend/src/data/personas.json          # 若後端未提供，退而求其次
    """
    base = getattr(settings, "BASE_DIR", None) or os.getcwd()
    return [
        os.path.join(base, "NCUACG", "assistant", "prompts", "personas.json"),
        os.path.join(base, "frontend", "src", "data", "personas.json"),
    ]


def _load_personas_from_file(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _normalize_personas(raw: Any) -> List[Dict[str, Any]]:
    """
    將多種可能格式轉為統一陣列：
    - 陣列：[{ id, displayName/name, summary/description, avatar? }]
    - 物件：{ "<id>": { displayName/name, ... }, ... }
    """
    result: List[Dict[str, Any]] = []

    def to_row(pid: str, obj: Dict[str, Any]) -> Dict[str, Any]:
        # 取名稱
        name = obj.get("displayName") or obj.get("name") or pid
        # 取描述
        desc = obj.get("summary") or obj.get("description") or ""
        # avatar 原樣帶出
        avatar = obj.get("avatar")
        return {"id": str(pid), "name": str(name), "avatar": avatar, "description": str(desc) if desc else ""}

    if isinstance(raw, list):
        for item in raw:
            if not isinstance(item, dict):
                continue
            pid = item.get("id") or ""
            if not pid:
                # 若沒有 id 就跳過
                continue
            result.append(to_row(pid, item))
        return result

    if isinstance(raw, dict):
        for pid, obj in raw.items():
            if not isinstance(obj, dict):
                continue
            result.append(to_row(pid, obj))
        return result

    return result


def _load_personas_any() -> Tuple[List[Dict[str, Any]], str]:
    """
    依序嘗試候選路徑，回傳 (personas, source_path)。
    若皆失敗，回傳空陣列與空字串。
    """
    for p in _candidate_persona_paths():
        try:
            if os.path.exists(p):
                raw = _load_personas_from_file(p)
                personas = _normalize_personas(raw)
                return personas, p
        except Exception:
            # 某一路徑讀取失敗則嘗試下一個
            continue
    return [], ""


class PersonasAPI(APIView):
    """
    GET /api/assistant/personas
    resp: [ { id, name, avatar, description }, ... ]
    """
    permission_classes = [AllowAny]

    def get(self, request: HttpRequest, *args, **kwargs):
        personas, _src = _load_personas_any()
        # 與前端約定：直接回傳陣列（非包在物件內）
        return Response(personas, status=status.HTTP_200_OK)


# 若你在 urls.py 以「函式」方式掛載，這裡提供相容的入口
def list_personas(request: HttpRequest, *args, **kwargs):
    """
    與 urls.py 的 path("personas/", list_personas) 相容。
    """
    view = PersonasAPI.as_view()
    return view(request, *args, **kwargs)
