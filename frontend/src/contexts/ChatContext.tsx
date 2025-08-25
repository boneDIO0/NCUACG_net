// frontend/src/contexts/ChatContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import useChat from '../hooks/useChat';

const PERSONA_LS_KEY = 'ncuacg.personaId';
const PERSONA_EVENT = 'persona:change';

// ---- 型別 ----
type BaseChat = ReturnType<typeof useChat>;
type ChatContextType = BaseChat & {
  personaId: string;
  setPersonaId: (id: string) => void;
};

// ---- Context ----
const ChatCtx = createContext<ChatContextType | null>(null);

// ---- LocalStorage 安全封裝 ----
function safeGetLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetLocal(key: string, val: string) {
  try {
    window.localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

// ---- Provider ----
export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat(); // { messages, sendMessage, loading, clear, ... }

  // 讀取預設 persona（優先：LocalStorage > 環境變數 > 空字串）
  const defaultPersona =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any)?.env?.VITE_DEFAULT_PERSONA) || '';

  const [personaId, setPersonaIdState] = useState<string>(() => {
    return safeGetLocal(PERSONA_LS_KEY) || defaultPersona || '';
  });

  // 供外部呼叫：設定 persona + 持久化 + 廣播事件
  const setPersonaId = (id: string) => {
    setPersonaIdState(id);
    safeSetLocal(PERSONA_LS_KEY, id);
    window.dispatchEvent(new CustomEvent(PERSONA_EVENT, { detail: { id } }));
  };

  // 監聽外部（例如 PersonaSwitch）觸發的 persona 變更事件
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id && detail.id !== personaId) {
        setPersonaIdState(detail.id as string);
        safeSetLocal(PERSONA_LS_KEY, detail.id as string);
      }
    };
    window.addEventListener(PERSONA_EVENT, handler as EventListener);
    return () => window.removeEventListener(PERSONA_EVENT, handler as EventListener);
  }, [personaId]);

  // 組合 Context 值（不更動 useChat 的 API）
  const value: ChatContextType = {
    ...chat,
    personaId,
    setPersonaId,
  };

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

// ---- Hook ----
export function useChatContext(): ChatContextType {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error('useChatContext must be used within <ChatProvider>');
  return ctx;
}
