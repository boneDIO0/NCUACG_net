# scripts/build_emb.py
from sentence_transformers import SentenceTransformer
import json, pickle, re
import numpy as np
from pathlib import Path
from typing import Any, Iterable

BASE = Path(__file__).resolve().parents[1]      # 指到 NCUACG_net/
DATA = BASE / "frontend" / "src" / "data"
DATA.mkdir(exist_ok=True)

NOTICES_JSON = DATA / "notices.json"
ABOUT_JSON   = DATA / "aboutInfo.json"

MODEL_NAME = "intfloat/multilingual-e5-base"    # 中文/英文皆佳（E5 系列）
model = SentenceTransformer(MODEL_NAME)

# 會優先擷取這些 key 的字串內容
PREFERRED_KEYS = {"title", "content", "description", "text", "body", "summary", "subtitle"}

def extract_text_blocks(obj: Any) -> list[str]:
    """
    將任意型別（dict/list/str/其他）抽取為字串清單。
    - dict: 先抓常見文字欄位，其餘 value 也遞迴
    - list/tuple: 逐項遞迴
    - str: 直接回傳
    - 其他: 轉成字串（必要時）
    """
    out: list[str] = []

    if obj is None:
        return out

    if isinstance(obj, str):
        s = obj.strip()
        if s:
            out.append(s)
        return out

    if isinstance(obj, (list, tuple)):
        for item in obj:
            out.extend(extract_text_blocks(item))
        return out

    if isinstance(obj, dict):
        # 先取偏好欄位
        for k in PREFERRED_KEYS:
            if k in obj and isinstance(obj[k], str) and obj[k].strip():
                out.append(obj[k].strip())
        # 其他欄位遞迴展開
        for k, v in obj.items():
            if k in PREFERRED_KEYS:
                continue
            out.extend(extract_text_blocks(v))
        return out

    # 其餘型別，轉字串
    s = str(obj).strip()
    if s:
        out.append(s)
    return out

def chunk_text(text: str, max_chars: int = 500) -> list[str]:
    """簡單等長切片（只接字串）"""
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    return [text[i:i+max_chars] for i in range(0, len(text), max_chars)]

docs = []

# ① notices.json
if NOTICES_JSON.exists():
    with open(NOTICES_JSON, "r", encoding="utf-8") as f:
        notices = json.load(f)
    # notices 可能是 list[dict] 或其他結構
    if isinstance(notices, dict):
        notice_blocks = extract_text_blocks(notices)
        for i, txt in enumerate(notice_blocks):
            for piece in chunk_text(txt):
                docs.append({"source": "notice", "index": i, "content": piece})
    else:
        for n in notices:
            # 優先取 n["content"]，不保證為字串
            blocks = extract_text_blocks(n.get("content", n))
            for piece in [p for b in blocks for p in chunk_text(b)]:
                docs.append({
                    "source": "notice",
                    "title":  n.get("title", ""),
                    "slug":   n.get("slug", ""),
                    "content": piece
                })

# ② aboutInfo.json
if ABOUT_JSON.exists():
    with open(ABOUT_JSON, "r", encoding="utf-8") as f:
        about_data = json.load(f)
    about_blocks = extract_text_blocks(about_data)  # ← 修正點：先抽文字
    for i, txt in enumerate(about_blocks):
        for piece in chunk_text(txt):
            docs.append({"source": "about", "section": i, "content": piece})

if not docs:
    raise SystemExit("❌ 沒有可用文件，請確認 notices.json / aboutInfo.json 是否存在且有內容")

# E5 建議：文件加前綴 "passage: "
passages = [f"passage: {d['content']}" for d in docs]
vecs = model.encode(passages, normalize_embeddings=True, convert_to_numpy=True).astype(np.float32)

with open(DATA / "notices.pkl", "wb") as f:   # 沿用原檔名，retriever 無需改
    pickle.dump((vecs, docs), f)

print(f"✅ 產生 {len(docs)} 段文件向量，寫入 {DATA/'notices.pkl'}（模型：{MODEL_NAME}）")
