import { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import '../styles/Login.css';

interface CaptchaResponse {
  captcha_key: string;
  captcha_image_url: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [useremail, setUseremail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth(); // 從 Context 取得 setUser
  const [message, setMessage] = useState('')
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaInput, setCaptchaInput] = useState(''); // 使用者輸入
  const loadCaptcha = async () => {
    try {
      const res = await axios.get<CaptchaResponse>("http://127.0.0.1:8000/api/get-captcha/");
      setCaptcha(res.data);
      setCaptchaInput('');
    } catch (err) {
      console.error("Failed to load captcha:", err);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!useremail || !password){
      setMessage("你的帳號密碼咧?");
      return;
    }
   try {
    // 登入
    const loginRes = await axios.post(
      'http://localhost:8000/api/login/',
      {
        useremail,
        password,
        captcha_key: captcha?.captcha_key,
        captcha_value: captchaInput
      },
      { withCredentials: true }
    );
    setMessage(loginRes.data.message);

    // 成功 → 抓 /api/me/ 更新 Context
    const meRes = await axios.get<User>('http://127.0.0.1:8000/api/me/', {
      withCredentials: true
    });
    setUser(meRes.data);
  } catch (err: any) {
    setMessage(err.response?.data?.message || '發生錯誤');
  }
  }
  const [showPassword, setShowPassword] = useState(false);
  return (

  <div className='outercontainer'>
  
  <div className='submitForm-container'>
  <h2 className='loginText'>登入</h2>
   {captcha ? (
        <div>
          <img
            src={captcha.captcha_image_url}
            alt="captcha"
            className="border rounded"
          />
          <button
            onClick={loadCaptcha}
            className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Refresh
          </button>
        </div>
      ) : (
        <p>Loading captcha...</p>
      )}
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
      type={showPassword ? "text" : "password"}
      placeholder="密碼"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <input
      className='accountTextField'
      type="text"
      placeholder="驗證碼"
      value={captchaInput}
      onChange={(e) => setCaptchaInput(e.target.value)}
    />
    <button
        type="button"
        className="toggle-btn"
        onClick={() => setShowPassword(!showPassword)}
      >
        <img
          src={showPassword ?  "/images/eye.png":"/images/eye_off.png"}
          alt="toggle password"
          className="eye-icon"
        />
      </button>
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
    <button className='portal_submit_btn'>portal 登入</button>
  </div>
</div>
  <Sidebar />
</div>
  );
}
