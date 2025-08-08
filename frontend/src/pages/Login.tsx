import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {login} = useAuth();
  const [message, setMessage] = useState('')
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username || !password){
      setMessage("你的帳號密碼咧?");
      return;
    }
    await axios.post('http://localhost:8000/api/login/', {
        username:username,
        password:password
      }, { withCredentials: true }).then(res => {
        setMessage(res.data.message)
      })
      .catch(err => {
       setMessage(err.response?.data?.message || '發生錯誤')
    }); 
  }

  return (

    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>登入</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="帳號"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          登入
        </button>
      </form>

      <div> {/* 補助連結，不在 form 裡 */}
    <a href="/forget-password">忘記密碼？</a>
    <a href="/register">註冊帳號</a>
    </div>

     <hr />

    <div> {/* 其他登入方式區塊 */}
    <p>其他登入方式</p>
    <p>{message}</p>
    <button >portal 登入</button>
        </div>
        <Sidebar />
    </div>
  );
}
