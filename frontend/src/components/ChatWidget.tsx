import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { useChatContext } from '../contexts/ChatContext'; // 與頁面共用同一份 messages
import AssistantChat from '../pages/AssistantChat';        // 重用聊天頁
import personasJson from '../data/personas.json';

const PERSONA_LS_KEY = 'ncuacg.personaId';

type Persona = {
  id: string;
  name?: string;         // 有些資料用 name
  displayName?: string;  // 有些資料用 displayName
  summary?: string;
  avatar?: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages } = useChatContext();

  // personas 映射表（id -> 顯示名稱）
  const personas = useMemo(() => (personasJson as Persona[]) ?? [], []);
  const getPersonaName = (id?: string | null) => {
    if (!id) return '';
    const p = personas.find(x => x.id === id);
    return p?.displayName || p?.name || id;
  };

  // 目前 persona：LocalStorage 初值 + 事件同步
  const [personaId, setPersonaId] = useState<string>(() => {
    try {
      return localStorage.getItem(PERSONA_LS_KEY) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id) setPersonaId(detail.id as string);
    };
    window.addEventListener('persona:change', onChange as EventListener);
    return () => window.removeEventListener('persona:change', onChange as EventListener);
  }, []);

  // --- 樣式：固定在右下角 ---
  const basePanelStyle: CSSProperties = {
    position: 'fixed',
    bottom: '96px',
    right: '24px',
    width: '360px',
    height: '520px', // 稍增高度，留出標頭空間
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,.25)',
    zIndex: 1000,
    overflow: 'hidden',
    transition: 'opacity .2s ease, transform .2s ease',
  };
  const visibleStyle: CSSProperties = {
    opacity: 1,
    transform: 'translateY(0)',
    visibility: 'visible',
    pointerEvents: 'auto',
  };
  const hiddenStyle: CSSProperties = {
    opacity: 0,
    transform: 'translateY(8px)',
    visibility: 'hidden',
    pointerEvents: 'none',
  };

  const headerStyle: CSSProperties = {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    borderBottom: '1px solid #eee',
    background: '#fafbff',
    fontSize: '.9rem',
  };
  const pillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid #dde3ff',
    background: '#f1f4ff',
    color: '#3f5bd9',
    fontWeight: 600,
  };

  // （可選）簡易未讀：只要有助理訊息且面板關閉就顯示
  const hasUnread = !open && messages.some((m) => m.role === 'assistant');

  return (
    <>
      {/* 浮動開關按鈕 */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="ai-chat-panel"
        aria-label={open ? '收合助理' : '開啟助理'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#4f8cff',
          color: '#fff',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,.2)',
          zIndex: 1001,
        } as CSSProperties}
        title={open ? '收合助理' : '開啟助理'}
      >
        💬
        {hasUnread && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#ff4d4f',
              boxShadow: '0 0 0 2px rgba(255,255,255,.9) inset',
            }}
          />
        )}
      </button>

      {/* 面板：永遠掛載，用樣式切換可見性（保留對話狀態） */}
      <div
        id="ai-chat-panel"
        style={{
          ...basePanelStyle,
          ...(open ? visibleStyle : hiddenStyle),
        }}
      >
        {/* 標頭：顯示當前 persona 名稱；實際切換在面板內的 PersonaSwitch */}
        <div style={headerStyle}>
          <strong>社網 AI 助理</strong>
          <span style={pillStyle} title="於面板內可切換角色">
            🤖 角色：{getPersonaName(personaId) || '（預設）'}
          </span>
        </div>

        {/* 主要聊天內容（含 PersonaSwitch 與訊息列表/輸入框） */}
        <div style={{ height: 'calc(100% - 44px)' }}>
          <AssistantChat />
        </div>
      </div>
    </>
  );
}
