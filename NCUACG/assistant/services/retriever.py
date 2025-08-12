# NCUACG/assistant/services/retriever.py
import pickle, numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

# 內容與向量檔位置
BASE = Path(__file__).resolve().parents[3]  # 到 NCUACG_net/
DATA = BASE / "frontend" / "src" / "data"
DATA.mkdir(exist_ok=True)
VECS_PATH = DATA / "notices.pkl"

# 讀取向量與原文
vecs, docs = pickle.load(open(VECS_PATH, "rb"))
vecs = np.asarray(vecs, dtype=np.float32)
vecs_norm = vecs / (np.linalg.norm(vecs, axis=1, keepdims=True) + 1e-9)

# 查詢嵌入模型（與 build_emb 同一家族；E5）
_Q_MODEL_NAME = "intfloat/multilingual-e5-base"
_q_model = SentenceTransformer(_Q_MODEL_NAME)

def _embed_query(text: str) -> np.ndarray:
    q = _q_model.encode([f"query: {text}"], normalize_embeddings=True, convert_to_numpy=True)[0]
    return q.astype(np.float32)

def topk(query: str, k: int = 4) -> list[dict]:
    """回傳前 k 筆原始文件物件（含 title/content 等）"""
    q = _embed_query(query)
    sims = vecs_norm @ q  # cosine (已正規化)
    idx = sims.argsort()[::-1][:k]
    return [docs[i] for i in idx]

def retrieve_context(query: str, k: int = 4) -> str:
    """把前 k 筆文件的 content 串成一段供 LLM 參考"""
    hits = topk(query, k=k)
    return "\n---\n".join(h["content"] for h in hits)
