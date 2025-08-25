// frontend/src/hooks/useChat.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type Role = 'user' | 'assistant' | 'system';

export type Message = {
  id?: string;
  role: Role;
  text: string;
  ts?: number; // epoch ms
};

type SendOptions = {
  personaId?: string;          // 允許呼叫端覆寫當前 persona
  conversationId?: string;     // 若要延續同一對話
};

const PERSONA_LS_KEY = 'ncuacg.personaId';
const CONV_LS_KEY = 'ncuacg.convId';

// ---- NEW: 確保 API 常數結尾一定是 '/'，避免 Django 的 APPEND_SLASH 問題 ----
const ensureSlash = (u?: string) => (u ? (u.endsWith('/') ? u : u + '/') : undefined);

// 可由 .env 設定；否則走後端預設路由（結尾務必有 '/'）
const API_CHAT =
  ensureSlash((import.meta as any)?.env?.VITE_ASSISTANT_CHAT_URL) ||
  '/api/assistant/chat/';

function getPersonaFromLS(): string | undefined {
  try {
    const v = localStorage.getItem(PERSONA_LS_KEY);
    return v && v.trim() ? v : undefined;
  } catch {
    return undefined;
  }
}

function setPersonaToLS(id?: string) {
  try {
    if (!id) localStorage.removeItem(PERSONA_LS_KEY);
    else localStorage.setItem(PERSONA_LS_KEY, id);
  } catch {}
}

function getConvFromLS(): string | undefined {
  try {
    const v = localStorage.getItem(CONV_LS_KEY);
    return v && v.trim() ? v : undefined;
  } catch {
    return undefined;
  }
}

function setConvToLS(id?: string) {
  try {
    if (!id) localStorage.removeItem(CONV_LS_KEY);
    else localStorage.setItem(CONV_LS_KEY, id);
  } catch {}
}

// 先宣告函式，最後同時做 default 與 named export（避免匯入寫法不一致）
function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(() => getConvFromLS());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 監聽 Persona 切換事件與跨分頁 storage 事件，保持 LocalStorage 與 hook 同步
  useEffect(() => {
    const onPersonaChange = (e: Event) => {
      const id = (e as CustomEvent).detail?.id as string | undefined;
      if (typeof id === 'string') setPersonaToLS(id);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === PERSONA_LS_KEY) {
        // 這裡可視需要觸發 setState 讓 UI 立即反映 persona 改變
      }
    };
    window.addEventListener('persona:change', onPersonaChange as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('persona:change', onPersonaChange as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
    setConvToLS(undefined);
  }, []);

  const sendMessage = useCallback(
    async (content: string, opts?: SendOptions) => {
      if (!content.trim()) return;
      setError(null);

      // 1) 樂觀更新使用者訊息
      const userMsg: Message = { role: 'user', text: content.trim(), ts: Date.now() };
      setMessages((prev) => [...prev, userMsg]);

      // 2) 準備請求
      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      setLoading(true);
      try {
        const personaFromLS = getPersonaFromLS();
        const persona = opts?.personaId ?? personaFromLS; // 若呼叫端覆寫就用覆寫值

        const body = {
          message: content.trim(),
          conversation_id: opts?.conversationId ?? conversationId ?? undefined,
          // 同時帶兩個鍵以增加與後端相容性（後端 serializer 收 persona）
          persona: persona,
          personaId: persona,
        };

        const resp = await fetch(API_CHAT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          const txt = await resp.text().catch(() => '');
          throw new Error(`HTTP ${resp.status} ${resp.statusText}${txt ? ` - ${txt}` : ''}`);
        }

        const data = await resp.json().catch(() => ({} as any));

        const replyText: string =
          data.reply ?? data.message ?? data.text ?? '(後端未回傳文字內容)';
        const newConvId: string | undefined = data.conversation_id ?? data.conversationId ?? conversationId;

        // 3) 設定對話 ID（若後端回傳）
        if (newConvId && newConvId !== conversationId) {
          setConversationId(newConvId);
          setConvToLS(newConvId);
        }

        // 4) 加入助理訊息
        const botMsg: Message = { role: 'assistant', text: String(replyText || '').trim(), ts: Date.now() };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        const msg = err?.message || '發送失敗，請稍後再試';
        setError(msg);
        // 若失敗，補上一則系統錯誤訊息，避免畫面沒有回饋
        setMessages((prev) => [
          ...prev,
          { role: 'system', text: `⚠️ ${msg}`, ts: Date.now() },
        ]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [conversationId]
  );

  const state = useMemo(
    () => ({
      messages,
      loading,
      error,
      conversationId,
    }),
    [messages, loading, error, conversationId]
  );

  return {
    ...state,
    sendMessage,
    reset,
    // 提供一些可選的工具（呼叫端不一定用得到）
    abort: () => abortRef.current?.abort(),
    getPersona: getPersonaFromLS,
    setPersona: setPersonaToLS,
  };
}

// 同時提供 default 與 named export，避免外部以不同匯入寫法出錯
export default useChat;
export { useChat };
