// frontend/src/pages/AssistantChat.tsx
import { useEffect, useRef, useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import ChatBubble from '../components/ChatBubble';
import PersonaSwitch from '../components/PersonaSwitch';
import './AssistantChat.css';

const PERSONA_LS_KEY = 'ncuacg.personaId';

// 本地訊息型別（若你的 Context 已匯出型別，可改成由 Context 匯入）
type ChatMsg = {
  role: 'user' | 'assistant' | 'system';
  text: string;
};

export default function AssistantChat() {
  const { messages, sendMessage, loading } = useChatContext();
  const [input, setInput] = useState('');
  const [personaId, setPersonaId] = useState<string>(() => {
    try { return localStorage.getItem(PERSONA_LS_KEY) || ''; } catch { return ''; }
  });

  // 可滾動區參考 + 自動捲到底
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // 同步 Persona 切換事件
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id) setPersonaId(detail.id as string);
    };
    window.addEventListener('persona:change', onChange as EventListener);
    return () => window.removeEventListener('persona:change', onChange as EventListener);
  }, []);

  // 讓滾輪事件優先在內層生效
  const handleWheelCapture: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    const before = el.scrollTop;
    el.scrollTop += e.deltaY;
    if (el.scrollTop !== before) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section
      className="chat-container chat-shell"
      style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <h2 style={{ margin: '0 0 .25rem' }}>社網 AI 助理</h2>

      <div style={{ margin: '0.5rem 0' }}>
        <PersonaSwitch />
        {personaId && (
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
            目前角色：{personaId}
          </div>
        )}
      </div>

      {/* 可滾動區 */}
      <div
        ref={scrollRef}
        className="chat-window chat-scroll"
        onWheelCapture={handleWheelCapture}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '0.25rem 0',
        }}
      >
        { (messages as ChatMsg[]).map((m: ChatMsg, i: number) => (   // ★ 明確型別
          <ChatBubble key={i} role={m.role} text={m.text} />
        ))}
        {loading && <p className="typing">AI 正在輸入...</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage(input.trim(), { personaId });
          setInput('');
        }}
        style={{ marginTop: '.5rem' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入訊息..."
          style={{ width: '75%' }}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: '.5rem' }}>
          送出
        </button>
      </form>
    </section>
  );
}
