"""
assistant/services/gemini_client.py
----------------------------------
集中管理 Google Gemini Chat 與 Embedding 兩種呼叫。

• embed_text(text)          → 取得 768 維向量 (list[float])
• ask_gemini(prompt)        → 自動檢索 → 組 Prompt → 回覆文字
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List

import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv

# ─── 讀取 .env ────────────────────────────────────────────────────────────
load_dotenv(find_dotenv())

API_KEY          = os.getenv("GEMINI_API_KEY")
CHAT_MODEL_NAME  = os.getenv("GEMINI_MODEL", "gemini-pro")
EMBED_MODEL_NAME = "models/embedding-001"           # 官方固定名稱

if not API_KEY:
    raise RuntimeError("環境變數 GEMINI_API_KEY 未設定，請檢查 .env 或雲端 Secrets")

# ─── 初始化 Gemini SDK ────────────────────────────────────────────────────
genai.configure(api_key=API_KEY)

_chat_model = genai.GenerativeModel(CHAT_MODEL_NAME)

# ─── 內部：向量檢索 ─────────────────────────────────────────────────────────
# topk() 放在 retriever.py，避免循環 import
from assistant.services.retriever import topk   # noqa: E402  pylint: disable=wrong-import-position

# ╭─────────────────────────────────────────────────────────────╮
# │               public helper functions                       │
# ╰─────────────────────────────────────────────────────────────╯
def embed_text(text: str) -> List[float]:
    """
    取得文字的向量 (list[float]，長度 768)。
    用於向量檢索 / 離線嵌入腳本。
    """
    result = genai.embed_content(
        model=EMBED_MODEL_NAME,
        content=text,
        task_type="retrieval_document",
    )
    return result["embedding"]


def ask_gemini(prompt: str) -> str:
    """
    1. 先用 `topk()` 依 prompt 檢索站內段落
    2. 組成 System Prompt + 使用者 Prompt
    3. 呼叫 Gemini 回覆
    """
    context = topk(prompt, k=4)  # ← 字串，已 join "---"

    system_prompt = (
        "你是國立中央大學動畫社網站的 AI 助理，"
        "下面是與問題相關的公告片段，若片段不足請用自己的方式回答：\n"
        f"{context}"
    )

    response = _chat_model.generate_content([system_prompt, prompt])

    # SDK v0.3+: text 位於 candidates[0].content.parts[0].text
    return response.candidates[0].content.parts[0].text.strip()
