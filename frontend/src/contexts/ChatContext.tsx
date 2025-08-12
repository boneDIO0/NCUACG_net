import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useChat } from '../hooks/useChat';

// Context 型別 = useChat 的回傳內容
type ChatContextType = ReturnType<typeof useChat>;

// 建立 Context（預設為 null，使用時做防呆）
const ChatCtx = createContext<ChatContextType | null>(null);

// 供整站包裹的 Provider
export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat(); // { messages, sendMessage, loading, clear, ... }
  return <ChatCtx.Provider value={chat}>{children}</ChatCtx.Provider>;
}

// 在任一元件取用聊天狀態
export function useChatContext(): ChatContextType {
  const ctx = useContext(ChatCtx);
  if (!ctx) {
    throw new Error('useChatContext must be used within <ChatProvider>');
  }
  return ctx;
}
