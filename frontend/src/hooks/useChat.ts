// frontend/src/hooks/useChat.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** ────────────────────────────────────────────────────────────────────────────
 *  URL utils（步驟 8）
 *  - 任何 API 常數都經過 ensureSlash()，保證以 `/` 結尾，避免 Django APPEND_SLASH 問題
 *  - 支援三種環境變數（擇一設定即可）：
 *      VITE_ASSISTANT_CHAT_URL、VITE_ASSISTANT_PERSONAS_URL、VITE_ASSISTANT_BASE_URL
 *    若僅給 BASE_URL，端點會自動補上 chat/、personas/
 *  ─────────────────────────────────────────────────────────────────────────── */
const ensureSlash = (input?: string, fallback: string = ''): string => {
  const raw = (input ?? fallback).trim();
  if (!raw) return '';
  return raw.endsWith('/') ? raw : `${raw}/`;
};
const API_BASE = ensureSlash(
  import.meta.env.VITE_ASSISTANT_BASE_URL as string | undefined,
  '/api/assistant/' // 後端 DRF 預設掛載在此時的 fallback
);
const API_CHAT = ensureSlash(
  (import.meta.env.VITE_ASSISTANT_CHAT_URL as string | undefined) ??
    (API_BASE ? `${API_BASE}chat` : '')
);
const API_PERSONAS = ensureSlash(
  (import.meta.env.VITE_ASSISTANT_PERSONAS_URL as string | undefined) ??
    (API_BASE ? `${API_BASE}personas` : '')
);

// ────────────────────────────────────────────────────────────────────────────
export type Role = 'user' | 'assistant' | 'system';
export type Message = {
  id?: string;
  role: Role;
  text: string;
  ts?: number; // epoch ms
};

type SendOptions = {
  personaId?: string;      // 允許呼叫端覆寫當前 persona
  conversationId?: string; // 若要延續同一對話
};

type UseChatState = {
  messages: Message[];
  loading: boolean;
  error: string | null;
  conversationId?: string;
};
type UseChatApi = UseChatState & {
  sendMessage: (text: string, opts?: SendOptions) => Promise<void>;
  reset: () => void;
  abort: () => void;
  getPersona: () => string | undefined;
  setPersona: (id: string) => void;
};

// ────────────────────────────────────────────────────────────────────────────
// LocalStorage keys（與其他檔案一致）
const PERSONA_LS_KEY = 'ncuacg.personaId';
const CONV_LS_KEY = 'ncuacg.conversationId';
const getPersonaFromLS = () => {
  const v = localStorage.getItem(PERSONA_LS_KEY);
  return v || undefined;
};
const setPersonaToLS = (id: string) => localStorage.setItem(PERSONA_LS_KEY, id);
const getConvFromLS = () => {
  const v = localStorage.getItem(CONV_LS_KEY);
  return v || undefined;
};
const setConvToLS = (id?: string) => {
  if (!id) return;
  localStorage.setItem(CONV_LS_KEY, id);
};

// ────────────────────────────────────────────────────────────────────────────
export function useChat(): UseChatApi {
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
        // 可視需求補充：收到他頁修改 persona 後，這裡是否要做 UI 提示或清空對話
      }
      if (e.key === CONV_LS_KEY && e.newValue !== conversationId) {
        setConversationId(e.newValue || undefined);
      }
    };
    window.addEventListener('persona:change', onPersonaChange as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('persona:change', onPersonaChange as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [conversationId]);

  // 送訊息（帶 persona 與 convId）
  const sendMessage = useCallback(
    async (text: string, opts?: SendOptions) => {
      const trimmed = (text ?? '').trim();
      if (!trimmed) return;
      if (!API_CHAT) {
        setError('Chat API URL 未設定');
        return;
      }

      // 先寫入 user 訊息
      const userMsg: Message = { role: 'user', text: trimmed, ts: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      // 構造 payload（步驟 8：一律打到確保尾斜線的 API_CHAT）
      const persona = opts?.personaId ?? getPersonaFromLS();
      const body: Record<string, unknown> = {
        message: trimmed,
        persona, // 後端 serializers 已支援可選的 persona 欄位
      };
      const convId = opts?.conversationId ?? conversationId;
      if (convId) body['conversation_id'] = convId;

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch(API_CHAT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: ctrl.signal,
          // credentials: 'include', // 若跨網域且需 cookie，再打開
        });

        // 400：可能是 persona 非法 → 回傳 available_personas
        if (res.status === 400) {
          const data = await res.json().catch(() => ({} as any));
          const detail = data?.detail ?? 'Bad Request';
          const available = data?.available_personas as Array<{ id: string; name?: string }>|undefined;
          setError(detail);
          if (available?.length) {
            // 自動 fallback：改用第一個合法 persona 再重試（可依需求保守化處理）
            const fallback = available[0].id;
            setPersonaToLS(fallback);
          }
          return;
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const replyText: string = data?.reply ?? '';
        const newConvId: string | undefined = data?.conversation_id;
        const usedPersona: string | undefined = data?.persona;
        if (newConvId && newConvId !== conversationId) {
          setConversationId(newConvId);
          setConvToLS(newConvId);
        }
        if (usedPersona) {
          setPersonaToLS(usedPersona);
        }

        const botMsg: Message = { role: 'assistant', text: replyText, ts: Date.now() };
        setMessages((prev) => [...prev, botMsg]);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setError(e?.message ?? 'Network error');
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setLoading(false);
    setConversationId(undefined);
    localStorage.removeItem(CONV_LS_KEY);
  }, []);

  const state: UseChatState = useMemo(
    () => ({ messages, loading, error, conversationId }),
    [messages, loading, error, conversationId]
  );

  return {
    ...state,
    sendMessage,
    reset,
    abort: () => abortRef.current?.abort(),
    getPersona: getPersonaFromLS,
    setPersona: setPersonaToLS,
  };
}

// 兼容：同時導出 default 與 named
export default useChat;
