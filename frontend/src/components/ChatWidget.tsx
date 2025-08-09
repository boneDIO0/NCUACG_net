import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useChatContext } from '../contexts/ChatContext'; // ★ 改用全域 Context
import AssistantChat from '../pages/AssistantChat'; // 直接重用聊天頁

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages } = useChatContext(); // ★ 與頁面共用同一份 messages

  // 基本樣式（固定在右下角）
  const basePanelStyle: CSSProperties = {
    position: 'fixed',
    bottom: '96px',
    right: '24px',
    width: '360px',
    height: '480px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,.25)',
    zIndex: 1000,
    overflow: 'hidden',
    transition: 'opacity .2s ease, transform .2s ease',
  };

  // 顯示 / 隱藏：只改視覺，不卸載元件（保留對話狀態）
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

  return (
    <>
      {/* floating button */}
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
        }}
        title={open ? '收合助理' : '開啟助理'}
      >
        💬
      </button>

      {/* drawer / modal：改為「永遠掛載」，用樣式切換可見性 */}
      <div
        id="ai-chat-panel"
        style={{
          ...basePanelStyle,
          ...(open ? visibleStyle : hiddenStyle),
        }}
      >
        <AssistantChat />
      </div>
    </>
  );
}
