import { useState } from 'react';
import AssistantChat from '../pages/AssistantChat';   // 直接重用聊天頁

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* floating button */}
      <button
        onClick={() => setOpen(!open)}
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
          zIndex: 1000,
        }}
      >
        💬
      </button>

      {/* drawer / modal */}
      {open && (
        <div
          style={{
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
          }}
        >
          <AssistantChat />
        </div>
      )}
    </>
  );
}
