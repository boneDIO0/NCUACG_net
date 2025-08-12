import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/Login.css';
export default function Login() {
  const navigate = useNavigate();
  const [useremail, setUseremail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [message, setMessage] = useState('')
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!useremail || !password){
      setMessage("你的帳號密碼咧?");
      return;
    }
    await axios.post('http://localhost:8000/api/login/', {
        useremail:useremail,
        password:password
      }, { withCredentials: true }).then(res => {
        setMessage(res.data.message)
      })
      .catch(err => {
       setMessage(err.response?.data?.message || '發生錯誤')
    }); 
  }

  return (

  <div className='outercontainer'>
  
  <div className='submitForm-container'>
  <h2 className='loginText'>登入</h2>
  <form onSubmit={handleLogin} >
    <input
      className='accountTextField'
      type="text"
      placeholder="帳號"
      value={useremail}
      onChange={(e) => setUseremail(e.target.value)}
    />
    <input
      className='passwordTextField'
      type="password"
      placeholder="密碼"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    {error && <div className='errorText'>{error}</div>}
    <p>{message}</p>
    <button className='submitButton' type="submit">登入</button>
  </form>

  <div>
    <a href="/forget-password">忘記密碼？</a>
    <a href="/register">註冊帳號</a>
  </div>

  <hr />

  <div>
    <p>其他登入方式</p>
    <button>portal 登入</button>
  </div>
</div>
  <Sidebar />
</div>
  );
}
