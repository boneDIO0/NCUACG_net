/*這裡都是寫頁面*/ 
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
//import Login from './pages/Login';
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
        <Routes>
          <Route path="/" element={<Home />} />
          {/*<Route path="/login" element={<Login />} />*/}
          {/*<Route path="/notice" element={<Notice />} />*/}
        </Routes>
      </main>
    </div>
  );
}
