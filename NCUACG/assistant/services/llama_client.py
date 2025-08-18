# NCUACG/assistant/services/llama_client.py
from __future__ import annotations

import os
from typing import Dict, Optional, List

from groq import Groq
from .retriever import retrieve_context          # 讀取站內檢索脈絡（notices.pkl 等）
from .personas import get_persona_prompt         # ✅ 改用 personas.py 做為唯一來源

# ──────────────────────────────────────────────────────────────────────────────
# Model / Client
# 可用環境變數覆蓋；預設使用未被淘汰的模型
MODEL = os.getenv("LLAMA_MODEL", "llama-3.1-70b-specdec")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ──────────────────────────────────────────────────────────────────────────────
# Chat 組裝
def _messages(prompt: str, context: Optional[str], persona_slug: Optional[str]) -> List[Dict[str, str]]:
    # 從 personas.py 取出對應 persona 的 system prompt
    system = get_persona_prompt(persona_slug)
    # 你可以選擇把脈絡拼在同一則 system，或維持第二則 system message
    if context:
        system = f"{system}\n\n[站內脈絡]\n{context}"

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]

# ──────────────────────────────────────────────────────────────────────────────
# 對外函式
def ask_llama(prompt: str, context: Optional[str] = None, persona_slug: Optional[str] = None) -> str:
    """
    直接呼叫 LLM。
    :param prompt: 使用者輸入
    :param context: （可選）站內檢索脈絡文字
    :param persona_slug: （可選）persona 代號；例如 "starter_guide"
    """
    resp = client.chat.completions.create(
        model=MODEL,
        messages=_messages(prompt, context, persona_slug),
        temperature=0.2,
    )
    return (resp.choices[0].message.content or "").strip()

def ask_llama_rag(prompt: str, persona_slug: Optional[str] = None) -> str:
    """
    先用 retriever 擷取站內內容，組 RAG 後再詢問模型。
    :param persona_slug: （可選）persona 代號
    """
    ctx = retrieve_context(prompt)  # 從本地向量/檔案取前 K 段內容
    return ask_llama(prompt, ctx, persona_slug)
