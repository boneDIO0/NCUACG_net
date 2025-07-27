import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import ChatBubble from '../components/ChatBubble';
import './AssistantChat.css';

export default function AssistantChat() {
  const { messages, sendMessage, loading } = useChat();
  const [input, setInput] = useState('');

  return (
    <section className="chat-container">
      <h2>社網 AI 助理</h2>

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
          sendMessage(input.trim());
          setInput('');
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入訊息..."
        />
        <button type="submit">送出</button>
      </form>
    </section>
  );
}