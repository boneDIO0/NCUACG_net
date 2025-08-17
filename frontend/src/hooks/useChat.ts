// frontend/src/hooks/useChat.ts
import { useEffect, useState } from 'react';

export type Role = 'user' | 'assistant' | 'system';
export type Msg  = { role: Role; text: string };

const KEY = 'ai_chat_history_v1';
const PERSONA_LS_KEY = 'ncuacg.personaId';
const API_CHAT =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any)?.env?.VITE_ASSISTANT_CHAT_URL) ||
  '/api/assistant/chat/';

// ---- sessionStorage 封裝 ----
const store = {
  get(): Msg[] {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch {
      return [];
    }
  },
  set(list: Msg[]) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
  },
  clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  },
};

// ---- Hook ----
export function useChat() {
  const [messages, setMessages] = useState<Msg[]>(() => store.get());
  const [loading, setLoading] = useState(false);

  // 每次 messages 改變就寫回 sessionStorage
  useEffect(() => {
    store.set(messages);
  }, [messages]);

  // 送出訊息（附帶 personaId）
  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content) return;

    const userMsg: Msg = { role: 'user', text: content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // 從 LocalStorage 讀取目前 persona（與 PersonaSwitch / ChatContext 對齊）
    let personaId: string | null = null;
    try {
      personaId = localStorage.getItem(PERSONA_LS_KEY);
    } catch {
      personaId = null;
    }

    try {
      const resp = await fetch(API_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 若後端用 cookie session，這行可保留；否則不影響
        body: JSON.stringify({
          message: content,
          personaId: personaId || undefined, // 後端亦接受 persona_id
        }),
      });

      if (!resp.ok) {
        const aiErr: Msg = {
          role: 'assistant',
          text: '⚠️ 伺服器回應非 2xx，請稍後再試',
        };
        setMessages((prev) => [...prev, aiErr]);
        return;
      }

      const data = (await resp.json()) as { reply?: string; error?: string };
      const reply = (data && data.reply) || data?.error || '（無回應）';

      const aiMsg: Msg = { role: 'assistant', text: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const aiErr: Msg = { role: 'assistant', text: '⚠️ 連線失敗，請稍後再試' };
      setMessages((prev) => [...prev, aiErr]);
      // 可選：console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setMessages([]);
    store.clear(); // 立即清空（不等到關閉分頁）
  }

  return { messages, sendMessage, loading, clear };
}
