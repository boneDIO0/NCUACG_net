import pickle, numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "content"
DATA_DIR.mkdir(exist_ok=True)

vecs, txts = pickle.load(open(DATA_DIR / 'notices.pkl','rb'))
def topk(q_emb, k=4):
    sims = np.dot(vecs, q_emb) # cos 相似
    idx = np.argsort(sims)[::-1][:k]
    return [txts[i] for i in idx]