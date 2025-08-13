// frontend/src/hooks/useChat.ts
import { useEffect, useState } from 'react';

export type Role = 'user' | 'assistant' | 'system';
export type Msg  = { role: Role; text: string };

const KEY = 'ai_chat_history_v1';

// 小工具：包一層，統一改 sessionStorage
const store = {
  get(): Msg[] {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch {
      return [];
    }
  },
  set(data: Msg[]) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* ignore quota errors */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  },
};

// 一次性把舊的 localStorage 紀錄搬到 sessionStorage（若有的話）
function migrateFromLocalOnce() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && !sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, raw);
    }
    localStorage.removeItem(KEY); // 之後都不用 localStorage 了
  } catch {}
}

export function useChat() {
  const [messages, setMessages] = useState<Msg[]>(() => {
    migrateFromLocalOnce();
    return store.get();
  });
  const [loading, setLoading] = useState(false);

  // 每次 messages 改變就寫回 sessionStorage
  useEffect(() => {
    store.set(messages);
  }, [messages]);

  async function sendMessage(input: string) {
    const userMsg: Msg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/assistant/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const replyText = (data?.reply ?? '').toString();

      const aiMsg: Msg = { role: 'assistant', text: replyText || '（沒有內容）' };
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
