// frontend/src/pages/AssistantChat.tsx  或  frontend/src/AssistantChat.tsx
// 依你的專案實際路徑放置；以下以你提供的相對匯入為準
import { useEffect, useState } from 'react';
import { useChatContext } from '../contexts/ChatContext'; // ★ 全域 Context
import ChatBubble from '../components/ChatBubble';
import PersonaSwitch from '../components/PersonaSwitch'; // ★ 新增：角色切換器
import './AssistantChat.css';

const PERSONA_LS_KEY = 'ncuacg.personaId';

export default function AssistantChat() {
  const { messages, sendMessage, loading } = useChatContext();
  const [input, setInput] = useState('');

  // 追蹤目前 persona（供顯示/後續擴充送出時使用）
  const [personaId, setPersonaId] = useState<string>(() => {
    try {
      return localStorage.getItem(PERSONA_LS_KEY) || '';
    } catch {
      return '';
    }
  });

  // 監聽 PersonaSwitch 廣播事件，保持畫面同步
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id) setPersonaId(detail.id as string);
    };
    window.addEventListener('persona:change', onChange as EventListener);
    return () => window.removeEventListener('persona:change', onChange as EventListener);
  }, []);

  return (
    <section className="chat-container">
      <h2>社網 AI 助理</h2>

      {/* ★ 角色切換：小螢幕自動轉下拉，詳見 PersonaSwitch.tsx */}
      <div style={{ margin: '0.5rem 0' }}>
        <PersonaSwitch />
        {/* 可選：顯示目前角色 ID（之後你可以換成顯示名稱） */}
        {personaId && (
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
            目前角色：{personaId}
          </div>
        )}
      </div>

      <div className="chat-window">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} />
        ))}
        {loading && <p className="typing">AI 正在輸入...</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;

          // TODO：待你於 useChat.ts 增加 persona 參數後，改為：
          // sendMessage(input.trim(), { personaId });
          sendMessage(input.trim());
          setInput('');
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入訊息..."
        />
        <button type="submit" disabled={loading}>送出</button>
      </form>
    </section>
  );
}
