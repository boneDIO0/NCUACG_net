/* 這裡都是寫頁面 */
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgetPwd from './pages/ForgetPwd';
import Announcement from './pages/Announcement';
import AssistantChat from './pages/AssistantChat';
import ChatWidget from './components/ChatWidget';

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 
      <aside style={{ width: '200px', padding: '20px', background: '#f9f9f9' }}>
        <QuickNav />
      </aside>
      */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Routes>
          {/* Route 之後需要加密 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forget-password" element={<ForgetPwd />} />
          <Route path="/announcement" element={<Announcement />} />

          {/* --- AI 助理聊天頁 --- */}
          <Route path="/assistant" element={<AssistantChat />} />
        </Routes>
      </main>

      {/* 全站浮動 AI 助理按鈕 / 面板 */}
      <ChatWidget />
    </div>
  );
}
