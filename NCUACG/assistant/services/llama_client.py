# NCUACG/assistant/services/llama_client.py
import os
from groq import Groq
from .retriever import retrieve_context  # 會讀 notices.pkl，避免循環引用

MODEL = os.getenv("LLAMA_MODEL")
client = Groq()

_SYSTEM = (
    "你是動畫社官網助理。回答要簡潔、先用站內脈絡；"
    "若無相關內容就如實說不知道，避免亂猜。"
)

def _messages(prompt: str, context: str | None) -> list[dict]:
    msgs = [{"role": "system", "content": _SYSTEM}]
    if context:
        msgs.append({"role": "system", "content": f"[站內脈絡]\n{context}"})
    msgs.append({"role": "user", "content": prompt})
    return msgs

def ask_llama(prompt: str, context: str | None = None) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=_messages(prompt, context),
        temperature=0.2,
    )
    return (resp.choices[0].message.content or "").strip()

def ask_llama_rag(prompt: str) -> str:
    ctx = retrieve_context(prompt)  # 從 pkl 取前 K 段內容
    return ask_llama(prompt, ctx)
