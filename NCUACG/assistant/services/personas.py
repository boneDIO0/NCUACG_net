# NCUACG/assistant/services/personas.py
from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Tuple, Optional

# Django 設定非強制（測試腳本也可載入）；若無 settings 就以 CWD 回退
try:
    from django.conf import settings  # type: ignore
except Exception:  # pragma: no cover
    settings = None  # type: ignore

# ----------------------------------------------
# 內建系統提示（當檔案不存在時的後援）
# ----------------------------------------------
PERSONAS: dict[str, str] = {
    "starter_guide": """
你是「萌新向導」。面對國高中或動畫新手，用白話、短句與友善語氣回覆，
最多 4 句一段，適度使用 emoji（不超過 2 個）。嚴格避免劇透與成人議題。
你會收到一段 <CONTEXT>（站內知識，如社團公告/活動）。回答社團日期、活動、公告時，
**只**以 <CONTEXT> 為準；找不到就明確說「查無資料」，並提出 1 個簡短追問以了解需求
（例如：想找哪一天或哪種類型）。若問題與站內無關，給入門級簡潔說明或 3 點入門建議即可。
回覆格式：精簡段落 + 最後一行 1 句追問。
""".strip(),

    "weekend_curator": """
你是「週末策展人」。負責本週推薦與社團活動整理，語氣俐落、可用條列。
優先推薦與社團/校內相關或 <CONTEXT> 中提到的活動，其次才是一般熱門作品。
當 <CONTEXT> 有符合日期/關鍵字時，輸出「3 選 1 精選」：每則標題 + 一句理由 +（若有）日期/地點。
找不到就明確說明「本週站內無相關活動」，改給 2–3 個替代建議（如：社課、成果牆、社群追蹤）。
禁止捏造日期或地點。若使用者指定日期，請只顯示該日期可證實的資訊。
""".strip(),

    "worldbuilding_researcher": """
你是「世界觀考據員」。面對核心觀眾與研究取向問題，條理清楚、引用名詞與設定來源。
盡可能避免劇透；若無法避免，先給「# 無雷版」要點，再用「# 可能含輕微雷」補充細節。
適合用小表格或鍵值清單整理名詞、時間線或系譜。對於社團/網站資訊，僅以 <CONTEXT> 為準。
若 <CONTEXT> 無資料，請說明缺口並提出查詢方向（例如官方資料、訪談、設定集）。
回覆結尾給 1 個可延伸閱讀或研究問題。
""".strip(),

    "storyboard_coach": """
你是「分鏡教練」。用教練式語氣給具體步驟、練習題與參數範例（例如鏡頭長度、構圖、轉場）。
輸出結構：
1) 目標（1–2 句）
2) 步驟（3–6 步）
3) 練習任務（1 個可在 20 分鐘內完成）
4) 可用工具與參數（如 Premiere/DaVinci 具體設定）
5) 安全與良好實踐（避免疲勞、尊重版權）
若問題涉及社團課程或活動，**僅**使用 <CONTEXT> 的資訊；找不到課程就提供自學路徑與下一步。
""".strip(),

    "parent_guardian": """
你是「家長安心顧問」。用中性、尊重且清楚的語氣，優先提供：年齡分級（若可得）、主題敏感度、
是否合家觀賞、單集/電影時長建議、觀影約定與時間管理建議。若涉及社團活動，僅以 <CONTEXT> 為準，
並提醒監護需求（如集合/散場時間）。禁止捏造分級與地點；不確定時要誠實說明並給安全替代。
結尾附上 1 個家長可詢問孩子的「共學提問」。
""".strip(),
}

# 內建的顯示資訊（當沒有 personas.json 時使用）
FALLBACK_META: dict[str, Dict[str, Optional[str]]] = {
    "starter_guide": {"name": "萌新向導", "description": "新手友善、無雷解說、簡短句子", "avatar": None},
    "weekend_curator": {"name": "週末策展人", "description": "本週精選與社團活動整理", "avatar": None},
    "worldbuilding_researcher": {"name": "世界觀考據員", "description": "設定考據、名詞對照與來源", "avatar": None},
    "storyboard_coach": {"name": "分鏡教練", "description": "實作步驟、練習與工具參數", "avatar": None},
    "parent_guardian": {"name": "家長安心顧問", "description": "分級與觀影建議、家長共學提問", "avatar": None},
}

# 預設 persona（可由 settings 或環境變數覆寫）
DEFAULT_PERSONA_ID = (
    (getattr(settings, "DEFAULT_PERSONA", None) if settings else None)
    or os.getenv("DEFAULT_PERSONA")
    or "weekend_curator"
)

# ----------------------------------------------
# 檔案載入與正規化
# ----------------------------------------------
def _base_dir() -> str:
    if settings and getattr(settings, "BASE_DIR", None):
        return str(settings.BASE_DIR)
    return os.getcwd()

def _candidate_persona_paths() -> List[str]:
    base = _base_dir()
    return [
        os.path.join(base, "NCUACG", "assistant", "prompts", "personas.json"),
        os.path.join(base, "frontend", "src", "data", "personas.json"),
    ]

def _load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _normalize_persona_item(pid: str, obj: Dict[str, Any]) -> Dict[str, Any]:
    # 名稱/描述鍵位相容
    name = obj.get("name") or obj.get("displayName") or pid
    description = obj.get("description") or obj.get("summary") or ""
    avatar = obj.get("avatar")
    # prompt 鍵位相容（不對外公開，只給 get_system_prompt 用）
    sys_prompt = (
        obj.get("system_prompt")
        or obj.get("system")
        or obj.get("prompt")
        or obj.get("instructions")
    )
    return {
        "id": str(pid),
        "name": str(name),
        "avatar": avatar,
        "description": str(description) if description else "",
        "_system_prompt": str(sys_prompt) if isinstance(sys_prompt, str) else None,
    }

def _normalize_personas(raw: Any) -> Dict[str, Dict[str, Any]]:
    """
    支援兩種來源格式：
    1) 陣列：[{ id, name/displayName, description/summary, avatar?, system_prompt? }]
    2) 物件：{ "<id>": { name/displayName, ... } }
    """
    by_id: Dict[str, Dict[str, Any]] = {}
    if isinstance(raw, list):
        for item in raw:
            if not isinstance(item, dict):  # 跳過非物件
                continue
            pid = item.get("id")
            if not pid:
                continue
            by_id[str(pid)] = _normalize_persona_item(str(pid), item)
        return by_id

    if isinstance(raw, dict):
        for pid, obj in raw.items():
            if not isinstance(obj, dict):
                continue
            by_id[str(pid)] = _normalize_persona_item(str(pid), obj)
        return by_id

    return by_id

def _load_personas_from_files() -> Tuple[Dict[str, Dict[str, Any]], Optional[str]]:
    """
    依優先序讀取 personas.json。成功則回傳(資料, 路徑)；否則({}, None)。
    """
    for p in _candidate_persona_paths():
        try:
            if os.path.exists(p):
                raw = _load_json(p)
                return _normalize_personas(raw), p
        except Exception:
            # 若讀取/解析失敗，嘗試下一個
            continue
    return {}, None

def _merge_with_fallback(meta_by_id: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    將檔案載入的結果與內建後援合併：
    - 名稱/描述/頭像缺漏者由 FALLBACK_META 填上
    - system prompt 缺漏者由 PERSONAS 填上
    """
    all_ids = set(meta_by_id.keys()) | set(FALLBACK_META.keys()) | set(PERSONAS.keys())
    merged: Dict[str, Dict[str, Any]] = {}
    for pid in sorted(all_ids):
        file_meta = meta_by_id.get(pid, {})
        fb_meta = FALLBACK_META.get(pid, {})
        merged[pid] = {
            "id": pid,
            "name": (file_meta.get("name") or fb_meta.get("name") or pid),
            "avatar": file_meta.get("avatar") or fb_meta.get("avatar"),
            "description": file_meta.get("description") or fb_meta.get("description") or "",
            "_system_prompt": (
                file_meta.get("_system_prompt")
                or PERSONAS.get(pid)  # 以原始檔內建 prompt 作為最後保底
            ),
        }
    return merged

# ----------------------------------------------
# 對外 API
# ----------------------------------------------
def get_personas() -> List[Dict[str, Any]]:
    """
    回傳 persona 清單（不含 system prompt）：
    [{ id, name, avatar, description }]
    """
    file_meta, _src = _load_personas_from_files()
    data = _merge_with_fallback(file_meta)
    # 排序：預設 persona 優先，其餘依名稱
    def sort_key(x: Dict[str, Any]) -> tuple:
        return (0 if x["id"] == DEFAULT_PERSONA_ID else 1, x["name"])
    rows = sorted(data.values(), key=sort_key)
    # 過濾內部欄位
    return [{"id": r["id"], "name": r["name"], "avatar": r["avatar"], "description": r["description"]} for r in rows]

def get_system_prompt(persona_id: Optional[str]) -> str:
    """
    取得指定 persona 的 system prompt；若無則回退到預設。
    """
    pid = persona_id or DEFAULT_PERSONA_ID
    file_meta, _src = _load_personas_from_files()
    data = _merge_with_fallback(file_meta)
    prompt = (data.get(pid, {}) or {}).get("_system_prompt")
    if isinstance(prompt, str) and prompt.strip():
        return prompt
    # 若找不到該 id，回退到預設 id，再找一次
    fallback = (data.get(DEFAULT_PERSONA_ID, {}) or {}).get("_system_prompt")
    if isinstance(fallback, str) and fallback.strip():
        return fallback
    # 最後保底（理論上到不了）
    return PERSONAS.get(DEFAULT_PERSONA_ID, "")

# 舊名稱相容
def get_persona_prompt(persona_id: Optional[str]) -> str:
    return get_system_prompt(persona_id)
