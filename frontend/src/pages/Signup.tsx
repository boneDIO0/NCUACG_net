import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [useremail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setrePassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
   //大概這邊要處理註冊
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !useremail || !password || !repassword) {
      setError('請填寫所有欄位');
      return;
    }
    if (password !== repassword) {
      setError('密碼不一致');
      return;
    }
     await axios.post('http://localhost:8000/api/register/', {
        username:username,
        useremail:useremail,
        password:password
      }, { withCredentials: true }).then(res => {
        setMessage(res.data.message)
      })
      .catch(err => {
        setMessage(err.response?.data?.message || '發生錯誤')
    });  // 保留 cookies 
  }

  

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>註冊帳號</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="暱稱(你希望大家如何稱呼你)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="電子郵件"
          value={useremail}
          onChange={(e) => setUserEmail(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="再次輸入密碼"
          value={repassword}
          onChange={(e) => setrePassword(e.target.value)}
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
          註冊
        </button>
      </form>
      <p>{message}</p>
      <Sidebar/>
    </div>
  );
}