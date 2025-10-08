// frontend/src/hooks/useChat.ts
import { useEffect, useState } from 'react';

// —— 型別 —— //
export type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
};

// —— LocalStorage Keys（與 ChatContext 保持一致；避免循環依賴這裡自行宣告常數） —— //
const CHAT_LS_KEY = 'ncuacg.chat.history.v1';
const PERSONA_LS_KEY = 'ncuacg.personaId';

// —— API base：允許在 .env.development 設定 VITE_API_BASE（預設空字串相對路徑） —— //
const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE) || '';
const CHAT_ENDPOINT = `${API_BASE}/api/assistant/chat/`;

// —— Hook 主體 —— //
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(CHAT_LS_KEY) : null;
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 永續化聊天紀錄
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CHAT_LS_KEY, JSON.stringify(messages));
      }
    } catch {
      /* ignore */
    }
  }, [messages]);

  // 送出訊息：自動帶上目前 personaId（來自 LocalStorage），並接住後端回傳的 personaUsed 做持久化
  const sendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    // 先把使用者訊息放進視窗
    const userMsg: ChatMessage = { role: 'user', text: clean };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      // 從 LocalStorage 取目前 personaId；密語命中時，後端會覆蓋並回傳 personaUsed
      const personaId = (typeof window !== 'undefined' && window.localStorage.getItem(PERSONA_LS_KEY)) || '';

      const payload = {
        message: clean,
        personaId,                // 讓後端有「偏好 persona」；若有密語會被覆蓋
        now: new Date().toISOString(), // 可選：提供當前時間（後端/檢索可用）
      };

      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // 放入 AI 回覆
      const aiText = (data?.reply ?? '').toString();
      const aiMsg: ChatMessage = { role: 'assistant', text: aiText };
      setMessages((prev) => [...prev, aiMsg]);

      // ★ 關鍵：後端會回 personaUsed（包含密語觸發的隱藏 persona）
      const used: string | undefined = data?.personaUsed;
      if (used && typeof window !== 'undefined') {
        window.localStorage.setItem(PERSONA_LS_KEY, used);
        // 廣播事件，讓 ChatContext/PersonaSwitch 等即時同步
        window.dispatchEvent(new CustomEvent('persona:change', { detail: { id: used } }));
      }
    } catch (e: any) {
      setError('發送失敗，請稍後再試');
      // 也可以選擇把剛剛 push 的 user 訊息移除；這裡先保留方便除錯
      // setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setMessages([]);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CHAT_LS_KEY);
      }
    } catch {
      /* ignore */
    }
  };

  return {
    messages,
    sendMessage,
    loading,
    error,
    clear,
  };
}
