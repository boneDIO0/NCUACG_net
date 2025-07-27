import json, pickle, google.generativeai as genai, os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "content"
DATA_DIR.mkdir(exist_ok=True)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

vecs, txts = [], []
with open(DATA_DIR / "notices.json", "r", encoding="utf-8") as f:
    for rec in json.load(f):
        emb = genai.embed_content(               # ★ 用函式
            model="models/embedding-001",
            content=rec["content"],
            task_type="retrieval_document"       # 建議加 task_type
        )["embedding"]
        vecs.append(emb)
        txts.append(rec)

with open(DATA_DIR / "notices.pkl", "wb") as f:
    pickle.dump((vecs, txts), f)

print(f"✅ 產生 {len(vecs)} 筆向量，存到 {DATA_DIR/'notices.pkl'}")
