import { useEffect, useMemo, useRef, useState } from 'react';

export type Role = 'user' | 'assistant' | 'system';
export type Msg = { role: Role; text: string; ts?: number };

const STORAGE_KEY = 'ai_chat_history_v1';

// 允許在不同環境（SSR/測試）安全存取 localStorage
function safeLoad<T>(key: string, fallback: T): T {
    try {
        if (typeof window === 'undefined') return fallback;
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    }
    catch {
        return fallback;
    }
}
function safeSave<T>(key: string, value: T) {
    try {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch {
        /* ignore */
    }
}

export function useChat() {
    const [messages, setMessages] = useState<Msg[]>(
        () =>
            safeLoad<Msg[]>(STORAGE_KEY, [
                {
                    role: 'assistant',
                    text: '嗨～我是社網 AI 助理，有任何關於社團與網站的問題都可以問我！',
                    ts: Date.now(),
                },
            ])
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 簡單避免重複送出
    const inFlight = useRef<AbortController | null>(null);

    // 每次 messages 改變就寫回 localStorage
    useEffect(
        () => {
            safeSave(STORAGE_KEY, messages);
        },
        [messages]
    );

    // 將要送往後端的對話限制長度，避免 payload 過大
    const recentForBackend = useMemo(
        () => {
            // 只帶最後 20 則訊息；後端若不需要完整脈絡可改成只帶 user 的最後一句
            return messages.slice(-20).map((m) => ({ role: m.role, content: m.text }));
        },
        [messages]
    );

    async function sendMessage(input: string) {
        if (!input.trim()) return;
        if (loading && inFlight.current) {
            // 若需要：取消上一請求
            inFlight.current.abort();
            inFlight.current = null;
        }
        const userMsg: Msg = { role: 'user', text: input.trim(), ts: Date.now() };
        setMessages((prev) => [...prev, userMsg]);
        setError(null);
        setLoading(true);

        const controller = new AbortController();
        inFlight.current = controller;

        try {
            const res = await fetch('/api/assistant/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    // 給後端：最新一則 user 訊息 +（可選）近期對話
                    message: userMsg.text,
                    context: recentForBackend, // 後端若不使用可忽略
                }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
            }

            const data: { reply?: string } = await res.json();
            const replyText = (data.reply ?? '').trim();

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: replyText || '（後端沒有回覆內容）',
                    ts: Date.now(),
                },
            ]);
        }
        catch (err: any) {
            const msg =
                err?.name === 'AbortError'
                    ? '請求已取消'
                    : err?.message || '發生未知錯誤，請稍後再試';
            setError(msg);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: `抱歉，呼叫後端失敗：${msg}`,
                    ts: Date.now(),
                },
            ]);
        }
        finally {
            setLoading(false);
            inFlight.current = null;
        }
    }

    function clear() {
        setMessages([]);
        safeSave(STORAGE_KEY, []);
    }

    return { messages, sendMessage, loading, error, clear };
}
