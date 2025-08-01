import pickle, numpy as np, google.generativeai as genai, os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# --- 讀取 API KEY，做一次 configure ---
load_dotenv(find_dotenv())
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
EMBED_MODEL = "models/embedding-001"

BASE = Path(__file__).resolve().parent.parent.parent.parent
vecs, txts = pickle.load(open(BASE / "content/notices.pkl", "rb"))
vecs = np.asarray(vecs, dtype=np.float32)
vecs_norm = vecs / (np.linalg.norm(vecs, axis=1, keepdims=True) + 1e-9)

def _embed(text: str) -> np.ndarray:
    return np.asarray(
        genai.embed_content(
            model=EMBED_MODEL,
            content=text,
            task_type="retrieval_document",
        )["embedding"],
        dtype=np.float32,
    )

def topk(query: str, k: int = 4) -> str:
    q = _embed(query)
    q /= np.linalg.norm(q) + 1e-9
    sims = vecs_norm @ q
    idx  = sims.argsort()[::-1][:k]
    return "\n---\n".join(txts[i]["content"] for i in idx)
