# NCUACG/assistant/services/retriever.py
from __future__ import annotations

import os
import re
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from sentence_transformers import SentenceTransformer

# ====== 時間處理（盡量不依賴額外套件） ======
from datetime import datetime, timedelta, timezone
try:
    # 若在 Django 環境中，使用 django.utils.timezone 以保持與設定一致
    from django.utils import timezone as dj_tz  # type: ignore
    def _now() -> datetime:
        return dj_tz.now()
except Exception:  # pragma: no cover
    def _now() -> datetime:
        return datetime.now(timezone.utc)

# 事件視窗（預設 30 天）；可由 Django settings 或 env 覆寫
_WINDOW_DAYS = 30
try:
    from django.conf import settings  # type: ignore
    if getattr(settings, "DEFAULT_EVENT_WINDOW_DAYS", None):
        _WINDOW_DAYS = int(settings.DEFAULT_EVENT_WINDOW_DAYS)
    else:
        _WINDOW_DAYS = int(os.getenv("DEFAULT_EVENT_WINDOW_DAYS", _WINDOW_DAYS))
except Exception:  # pragma: no cover
    _WINDOW_DAYS = int(os.getenv("DEFAULT_EVENT_WINDOW_DAYS", _WINDOW_DAYS))

# ====== 內容與向量檔位置（沿用你的既有邏輯） ======
BASE = Path(__file__).resolve().parents[3]  # 到 NCUACG_net/
DATA = BASE / "frontend" / "src" / "data"
DATA.mkdir(exist_ok=True)
VECS_PATH = DATA / "notices.pkl"

# 讀取向量與原文（沿用）
vecs, docs = pickle.load(open(VECS_PATH, "rb"))
vecs = np.asarray(vecs, dtype=np.float32)
vecs_norm = vecs / (np.linalg.norm(vecs, axis=1, keepdims=True) + 1e-9)

# 查詢嵌入模型（與 build_emb 同一家族；E5）
_Q_MODEL_NAME = "intfloat/multilingual-e5-base"
_q_model = SentenceTransformer(_Q_MODEL_NAME)

def _embed_query(text: str) -> np.ndarray:
    q = _q_model.encode([f"query: {text}"], normalize_embeddings=True, convert_to_numpy=True)[0]
    return q.astype(np.float32)

# ====== 時間解析輔助 ======
_ISO_CANDIDATES = (
    "%Y-%m-%d",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d %H:%M:%S",
)

def _to_dt_aware(dt: datetime) -> datetime:
    """確保 datetime 是有時區的（統一轉成 UTC aware）。"""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def _parse_dt(value: Any) -> Optional[datetime]:
    """
    盡力從 doc 的欄位值解析時間。
    支援：
    - ISO 8601（含時區）
    - 常見日期格式（見 _ISO_CANDIDATES）
    - '2025/08/30 18:00'、'2025.08.30' 等常見變體（以正規化方式嘗試）
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        # 若是 Unix timestamp（秒）
        try:
            return _to_dt_aware(datetime.fromtimestamp(float(value), tz=timezone.utc))
        except Exception:
            return None
    if isinstance(value, datetime):
        return _to_dt_aware(value)
    if not isinstance(value, str):
        return None

    s = value.strip()
    if not s:
        return None

    # 1) 嘗試原字串用 fromisoformat（Python 3.11+ 支援 ±HH:MM）
    try:
        return _to_dt_aware(datetime.fromisoformat(s))
    except Exception:
        pass

    # 2) 嘗試替換常見分隔符號，做幾種 pattern
    s2 = re.sub(r"[./]", "-", s)
    # 移除多餘空白
    s2 = re.sub(r"\s+", " ", s2)

    for fmt in _ISO_CANDIDATES:
        try:
            return _to_dt_aware(datetime.strptime(s2, fmt))
        except Exception:
            continue

    # 3) 嘗試抓出 YYYY-MM-DD 或 YYYY-MM-DD HH:MM 的片段
    m = re.search(r"(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?", s2)
    if m:
        date_part = m.group(1)
        time_part = m.group(2) or "00:00"
        try:
            return _to_dt_aware(datetime.strptime(f"{date_part} {time_part}", "%Y-%m-%d %H:%M" if len(time_part) == 5 else "%Y-%m-%d %H:%M:%S"))
        except Exception:
            pass

    return None

# 從文件物件提取開始時間（支援多鍵）
_START_KEYS = ("start_time", "start", "date", "datetime", "when", "time")

def _extract_start_dt(doc: Dict[str, Any]) -> Optional[datetime]:
    meta = doc if isinstance(doc, dict) else {}
    for key in _START_KEYS:
        if key in meta:
            dt = _parse_dt(meta.get(key))
            if dt:
                return dt
    # 也許日期藏在 content 裡，試著掃描
    text = (meta.get("content") or meta.get("title") or "") if isinstance(meta, dict) else ""
    dt = _parse_dt(text)
    return dt

# ====== 相似度 + 時間過濾 ======
def _rank_with_time(query: str, k: int = 4, pool_factor: int = 4) -> List[Tuple[int, float, Optional[datetime]]]:
    """
    回傳候選索引 + 相似度 + 起始時間。
    先取相似度前 k*pool_factor，再做未來視窗過濾與排序。
    """
    q = _embed_query(query)
    sims = vecs_norm @ q  # cosine (已正規化)
    # 先抓比較多的候選
    n = min(len(sims), max(k * pool_factor, k))
    idxs = sims.argsort()[::-1][:n]

    now = _now()
    until = now + timedelta(days=_WINDOW_DAYS)

    enriched: List[Tuple[int, float, Optional[datetime]]] = []
    for i in idxs:
        i_int = int(i)
        dt = _extract_start_dt(docs[i_int])
        enriched.append((i_int, float(sims[i_int]), dt))

    # 只留在 [now, until] 之間的
    future = [(i, s, dt) for (i, s, dt) in enriched if (dt is not None and dt >= now and dt <= until)]

    # 排序：先依開始時間，再以相似度作次序
    if future:
        future.sort(key=lambda x: (x[2], -x[1]))  # dt 早者優先，相似度高者優先
        return future[:k]

    # 若沒有任何未來活動，回退到純相似度前 k（避免沒脈絡）
    fallback = [(int(i), float(sims[int(i)]), _extract_start_dt(docs[int(i)])) for i in idxs[:k]]
    return fallback

def topk(query: str, k: int = 4) -> List[Dict[str, Any]]:
    """
    回傳前 k 筆原始文件物件（含 title/content 等），已考慮「未來活動」優先。
    """
    ranked = _rank_with_time(query, k=k, pool_factor=4)
    return [docs[i] for (i, _, _) in ranked]

def retrieve_context(query: str, k: int = 4) -> str:
    """
    把前 k 筆文件的內容串成一段供 LLM 參考；若能取得開始時間，會一併顯示。
    """
    ranked = _rank_with_time(query, k=k, pool_factor=4)
    parts: List[str] = []
    for (i, _sim, dt) in ranked:
        d = docs[i]
        title = str(d.get("title", "") or "").strip()
        content = str(d.get("content", "") or "").strip()
        # 顯示有解析到的日期，幫助 persona 嚴格控雷
        dt_str = dt.astimezone(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M %Z") if dt else ""
        header = f"[{title}] {dt_str}".strip()
        if header:
            parts.append(header)
        parts.append(content)
    return "\n---\n".join(p for p in parts if p)
