# NCUACG/assistant/services/llama_client.py
from __future__ import annotations

import os
from typing import Dict, Optional, List

from groq import Groq
from .retriever import retrieve_context
from .personas import get_system_prompt, resolve_persona_id  # ✅ 單一來源 + 密語解析

# ──────────────────────────────────────────────────────────────────────────────
# Model / Client
MODEL = os.getenv("LLAMA_MODEL", "llama-3.1-70b-specdec")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ──────────────────────────────────────────────────────────────────────────────
# Chat 組裝
def _build_messages(
    user_prompt: str,
    context: Optional[str],
    preferred_persona_id: Optional[str],
) -> List[Dict[str, str]]:
    """
    先用密語解析出 persona（可覆蓋前端傳來的 preferred_persona_id），
    再組合 system + user 訊息。
    """
    persona_id = resolve_persona_id(preferred_id=preferred_persona_id, user_text=user_prompt)
    system = get_system_prompt(persona_id)
    if context:
        system = f"{system}\n\n[站內脈絡]\n{context}"

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user_prompt},
    ]

# ──────────────────────────────────────────────────────────────────────────────
# 對外函式
def ask_llama(
    prompt: str,
    context: Optional[str] = None,
    persona_slug: Optional[str] = None,
) -> str:
    """
    直接呼叫 LLM。
    :param prompt: 使用者輸入
    :param context: （可選）站內檢索脈絡文字
    :param persona_slug: （可選）persona 代號；例如 "starter_guide"
    """
    msgs = _build_messages(prompt, context, persona_slug)
    resp = client.chat.completions.create(
        model=MODEL,
        messages=msgs,
        temperature=0.2,
    )
    return (resp.choices[0].message.content or "").strip()

def ask_llama_rag(
    prompt: str,
    persona_slug: Optional[str] = None,
) -> str:
    """
    先用 retriever 擷取站內內容，組 RAG 後再詢問模型。
    :param persona_slug: （可選）persona 代號
    """
    ctx = retrieve_context(prompt)
    return ask_llama(prompt, ctx, persona_slug)
