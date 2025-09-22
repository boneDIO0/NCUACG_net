// frontend/src/hooks/useChat.ts
import { useEffect, useState } from 'react';

/** 對話訊息型別（僅 user / assistant 兩種） */
export type Role = 'user' | 'assistant';
export interface ChatMessage {
  role: Role;
  text: string;
}

/** localStorage keys */
const KEY_MSG = 'ai_chat_history_v1';
const KEY_PERSONA = 'ai_chat_persona_v1';

/** 後端 API 路徑（相對於同網域） */
const CHAT_API = '/api/assistant/chat/';

/**
 * 全域聊天 hook：
 * - 保留訊息於 state + localStorage
 * - 每次送出會把目前 personaId 一起帶給後端
 * - 後端若回傳 personaUsed（密語觸發或切換），會更新 activePersona 並持久化
 */
export function useChat() {
  // 1) 歷史訊息（載入/保存 localStorage）
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(KEY_MSG);
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });

  // 2) 目前 persona（預設 weeked_curator；可被密語覆蓋）
  const [activePersona, setActivePersona] = useState<string>(() => {
    try {
      return localStorage.getItem(KEY_PERSONA) || 'weekend_curator';
    } catch {
      return 'weekend_curator';
    }
  });

  // 3) 請求中標記
  const [loading, setLoading] = useState(false);

  // 4) 永續化：訊息 & persona
  useEffect(() => {
    try {
      localStorage.setItem(KEY_MSG, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_PERSONA, activePersona);
    } catch {}
  }, [activePersona]);

  // 5) 核心：送訊息（會把 personaId 一起帶到後端）
  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    // 先把使用者訊息推進畫面
    const userMsg: ChatMessage = { role: 'user', text: content };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          personaId: activePersona, // ★ 帶上目前 persona
        }),
      });

      // 後端標準回應：{ reply, persona, personaUsed }
      const data = await res.json();

      // 顯示模型回覆
      const replyText: string =
        (typeof data?.reply === 'string' && data.reply) ||
        '（沒有回覆內容）';
      const aiMsg: ChatMessage = { role: 'assistant', text: replyText };
      setMessages((prev) => [...prev, aiMsg]);

      // ★關鍵：若後端告訴我們本次實際採用的人格（密語觸發或切換）
      const used: string | undefined =
        (typeof data?.personaUsed === 'string' && data.personaUsed) ||
        (typeof data?.persona === 'string' && data.persona);

      if (used && used !== activePersona) {
        setActivePersona(used); // 同步更新並寫入 localStorage（useEffect 會處理）
      }
    } catch (e) {
      // 簡單錯誤回覆
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '（抱歉，伺服器暫時沒有回應）' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 6) 清空對話（不影響目前 persona）
  const clear = () => {
    setMessages([]);
    try {
      localStorage.removeItem(KEY_MSG);
    } catch {}
  };

  return {
    messages,
    loading,
    sendMessage,
    clear,
    activePersona,
    setActivePersona, // 讓 UI（下拉選單）也能手動切換
  };
}
