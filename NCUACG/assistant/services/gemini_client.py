"""
assistant/services/gemini_client.py
----------------------------------
集中管理 Google Gemini Chat 與 Embedding 兩種呼叫。

• ask_gemini(prompt, context)  → 取得回覆文字
• embed_text(text)             → 取得 768 維向量 (list[float])

後續 Retrieval / RAG 可 import 這兩個函式。
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv

# ─── 讀取 .env ────────────────────────────────────────────────────────────
load_dotenv(find_dotenv())

API_KEY           = os.getenv("GEMINI_API_KEY")
CHAT_MODEL_NAME   = os.getenv("GEMINI_MODEL", "gemini-pro")
EMBED_MODEL_NAME  = "models/embedding-001"              # 固定名稱

if not API_KEY:
    raise RuntimeError("環境變數 GEMINI_API_KEY 未設定，請檢查 .env 或雲端 Secrets")

# ─── 初始化 Gemini SDK ────────────────────────────────────────────────────
genai.configure(api_key=API_KEY)

# Chat 與 Embedding 分開取得
_chat_model  = genai.GenerativeModel(CHAT_MODEL_NAME)
# embed_content 建議直接用函式呼叫，或 get_model 也行：
# _embed_model = genai.get_model(EMBED_MODEL_NAME)


# ╭─────────────────────────────────────────────────────────────╮
# │                Public helper functions                      │
# ╰─────────────────────────────────────────────────────────────╯
def embed_text(text: str) -> List[float]:
    """
    取得指定文字的向量表示 (list[float]，長度 768)。
    用於向量檢索 / RAG。
    """
    result = genai.embed_content(
        model=EMBED_MODEL_NAME,
        content=text,
        task_type="retrieval_document",
    )
    return result["embedding"]


def ask_gemini(prompt: str, context: Optional[str] = None) -> str:
    """
    一般聊天：可附加 RAG context。
    • prompt   = 使用者輸入
    • context  = 預先檢索的文件段落 (可為 None)

    回傳 Gemini 生成的文字（已 strip）。
    """
    messages = []
    # ① 若有檢索脈絡，先加 system prompt
    if context:
        messages.append(
            {
                "role": "system",
                "content": (
                    "以下是網站文件參考片段，請根據它們回答使用者問題，"
                    "若片段不足以回答，請簡短說明無相關資料：\n---\n"
                    f"{context}\n---"
                ),
            }
        )
    # ② 真正的使用者提問
    messages.append({"role": "user", "content": prompt})

    response = _chat_model.generate_content(messages)
    return response.text.strip()
