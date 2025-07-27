import { useState } from 'react';	

export interface Msg { role: 'user' | 'assistant'; text: string }

export function useChat() {
const [messages, setMessages] = useState<Msg[]>([]);
const [loading, setLoading] = useState(false);

async function sendMessage(userText: string) {
const newMsg: Msg = { role: 'user', text: userText };
setMessages((prev) => [...prev, newMsg]);
setLoading(true);
try {
const res = await fetch('/api/assistant/chat/', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ message: userText }),
});
const data = await res.json();
setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
} catch (err) {
setMessages((prev) => [...prev, { role: 'assistant', text: '⚠️ 連線失敗' }]);
} finally {
setLoading(false);
}
}

return { messages, sendMessage, loading };
}

