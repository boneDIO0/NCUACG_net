/*這裡都是寫頁面*/ 
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgetPwd from './pages/ForgetPwd';
import Announcement from './pages/Announcement';
import { AuthProvider } from './contexts/AuthContext';
//import Notice from './pages/Notice';

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
     { /*
      <aside style={{ width: '200px', padding: '20px', background: '#f9f9f9' }}>
        <QuickNav />
      </aside>
      */}
      <main style={{ flex: 1, padding: '20px' }}>
        <AuthProvider>
        <Routes>
          {/*Route之後需要加密 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forget-password" element={<ForgetPwd />} />
          <Route path="/announcement" element={<Announcement />} />
        </Routes>
        </AuthProvider>
      </main>
    </div>
  );
}
