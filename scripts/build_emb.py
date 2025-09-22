# scripts/build_emb.py
from sentence_transformers import SentenceTransformer
import json, pickle, re, logging
from json.decoder import JSONDecodeError
import numpy as np
from pathlib import Path
from typing import Any, Iterable

# ─────────────────────────────────────────────────────────────────────────────
# 基本路徑
BASE = Path(__file__).resolve().parents[1]      # 指到 NCUACG_net/
DATA = BASE / "frontend" / "src" / "data"
DATA.mkdir(exist_ok=True)

# 資料來源
NOTICES_JSON = DATA / "notices.json"
ABOUT_JSON   = DATA / "aboutInfo.json"
INTRO_JSON   = DATA / "introduction.json"

# ─────────────────────────────────────────────────────────────────────────────
# Logging（讓批次腳本輸出更可讀）
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# 更健壯的 JSON 載入（容錯：BOM / 可選註解 / 尾逗號）
def _strip_json_extras(text: str) -> str:
    """
    寬鬆模式：移除常見的 JSON 以外符號（行內註解、區塊註解、部分尾逗號）。
    僅作保險，仍建議提交「嚴格 JSON」。
    """
    t = text.lstrip("\ufeff")  # 去 UTF-8 BOM（雙保險）
    # 區塊註解 /* ... */
    t = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
    # 行尾註解 // ...（避免誤傷 "http://": 僅匹配非冒號後的 //）
    t = re.sub(r"(^|[^\:])//.*?$", r"\1", t, flags=re.M)
    # 嘗試移除容器末尾多餘逗號
    t = re.sub(r",\s*([}\]])", r"\1", t)
    return t

def safe_load_json(path: Path, *, allow_comments: bool = False):
    """
    更健壯的 JSON 讀取：
    - 以 utf-8-sig 讀，能自動忽略 BOM
    - 可選：剝註解/尾逗號（allow_comments=True）
    - JSON 解析錯誤時，顯示路徑、行列與前後文片段並中止
    """
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            raw = f.read()
        text = raw.lstrip("\ufeff")
        if allow_comments:
            text = _strip_json_extras(text)
        return json.loads(text)
    except FileNotFoundError:
        logger.warning("⚠️ 找不到檔案：%s", path)
        return None
    except JSONDecodeError as e:
        start = max(e.pos - 30, 0)
        end   = e.pos + 30
        snippet = (text[start:end] if "text" in locals() else "")
        raise SystemExit(
            f"❌ 解析 JSON 失敗：{path}\n"
            f"   行 {e.lineno}, 列 {e.colno}, 位移 {e.pos}\n"
            f"   周邊片段：{snippet!r}"
        )

# ─────────────────────────────────────────────────────────────────────────────
# Embedding 模型
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

# ─────────────────────────────────────────────────────────────────────────────
# 收集語料
docs: list[dict] = []

# ① notices.json
notices = safe_load_json(NOTICES_JSON, allow_comments=False)
if notices is not None:
    if isinstance(notices, dict):
        notice_blocks = extract_text_blocks(notices)
        for i, txt in enumerate(notice_blocks):
            for piece in chunk_text(txt):
                docs.append({"source": "notice", "index": i, "content": piece})
    else:
        for n in notices or []:
            blocks = extract_text_blocks(n.get("content", n))
            for piece in [p for b in blocks for p in chunk_text(b)]:
                docs.append({
                    "source":  "notice",
                    "title":   n.get("title", ""),
                    "slug":    n.get("slug", ""),
                    "content": piece
                })

# ② aboutInfo.json
about_data = safe_load_json(ABOUT_JSON, allow_comments=False)
if about_data is not None:
    about_blocks = extract_text_blocks(about_data)
    for i, txt in enumerate(about_blocks):
        for piece in chunk_text(txt):
            docs.append({"source": "about", "section": i, "content": piece})

# ③ introduction.json
intro_data = safe_load_json(INTRO_JSON, allow_comments=False)
if intro_data is not None:
    if isinstance(intro_data, list):
        for item in intro_data:
            blocks = extract_text_blocks({
                "title": item.get("title", ""),
                "text":  item.get("text",  ""),
            }) or extract_text_blocks(item)

            for piece in [p for b in blocks for p in chunk_text(b)]:
                docs.append({
                    "source":  "introduction",
                    "title":   item.get("title", ""),
                    "url":     item.get("url", ""),
                    "id":      item.get("id"),
                    "content": piece,
                })
    else:
        for piece in [p for b in extract_text_blocks(intro_data) for p in chunk_text(b)]:
            docs.append({"source": "introduction", "content": piece})

# 沒有任何文件就中止（避免輸出空 pkl）
if not docs:
    raise SystemExit("❌ 沒有可用文件，請確認 notices.json / aboutInfo.json / introduction.json 是否存在且有內容")

# ─────────────────────────────────────────────────────────────────────────────
# 產生向量並輸出
# E5 建議：文件加前綴 "passage: "
passages = [f"passage: {d['content']}" for d in docs]
vecs = model.encode(passages, normalize_embeddings=True, convert_to_numpy=True).astype(np.float32)

with open(DATA / "notices.pkl", "wb") as f:   # 沿用原檔名，retriever 無需改
    pickle.dump((vecs, docs), f)

print(f"✅ 產生 {len(docs)} 段文件向量，寫入 {DATA/'notices.pkl'}（模型：{MODEL_NAME}）")
