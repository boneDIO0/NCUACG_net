import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; //接後端時把這個刪掉
import { useAuth } from '../contexts/AuthContext';
import '../styles/Sidebar.css';
const Sidebar: React.FC = () => {
  const { isAuthenticated, user,logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // ← 由自己管理開關狀態
  // 根據按鈕文字導航
  const navigate = useNavigate();
  const handleClick = (item: string) => {
  
    switch (item) {
      /*
      case '首頁':
        window.location.href = '/';
        break;
      case '關於':
        window.location.href = '/about';
        break;
      case '服務':
        window.location.href = '/services';
        break;
      case '聯絡':
        window.location.href = '/contact';
        break;
        */
      case '登入':
        navigate('/Login');
        break;
      
      default:
        break;
    }
    setIsOpen(false); // ← 點完選單自動關閉 Sidebar
  };
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);
  return (
    
    <AnimatePresence>
      {isOpen && (
        <>
         
          {/* 遮罩層 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='sidebar-mask'
            
          />
          
          {/* 側邊欄 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className='sidebar-contents'
            
          >
            {/* 關閉按鈕 */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='close-button'
             
            >
                <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
                <polyline points="6,6 18,16 6,26" stroke="rgba(0,0,0,0.8)" strokeWidth="3" fill="none" />
                <polyline points="22,6 34,16 22,26" stroke="rgba(0,0,0,0.8)" strokeWidth="3" fill="none" />
                </svg>
            </motion.button>

            {/* 側邊欄內容 */}
            <div style={{ marginTop: '60px' }}>
              <h2 className='sidebar-title' >
                導航菜單
              </h2>
              
              {/* 子組件區域 */}
              <div style={{ marginBottom: '30px' }}>
                <h3 className='sidebar-section-title'>
                  快速導航
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['首頁', '關於', '服務','歌謠祭平台'].map((item, index) => (
                    <motion.button
                      key={item}
                      onClick={() => handleClick(item)}  
                      whileHover={{ scale: 1.05, backgroundColor: '#f0f8ff' }}
                      whileTap={{ scale: 0.95 }}
                      className='option-buttons'
                    >
                      {item}
                    </motion.button>
                  ))}
                  
                  {/* 額外加登入/登出按鈕 */}
                {isAuthenticated ? (
                  <>
                    <motion.button
                      onClick={logout}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className='logout-button'
                      
                    >
                      登出
                    </motion.button>
                    <p style={{ fontSize: '14px', color: '#555', marginTop: '10px' }}>
                      ciallo~(∠・ω&lt; )⌒☆，{user?.username}
                    </p>
                  </>
                ) : (
                  <motion.button
                    onClick={() => handleClick('登入')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='login-button'
                  >
                    登入
                  </motion.button>
                )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      {/* 右上角開啟按鈕 */}
     {!isOpen && (
  <motion.button
    onClick={handleOpen}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="sidebar-open-button"
  >
    {/* 空心 < < 使用 SVG */}
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
      <polyline points="18,6 6,16 18,26" stroke="rgba(0,0,0,0.8)" strokeWidth="3" fill="none" />
      <polyline points="34,6 22,16 34,26" stroke="rgba(0,0,0,0.8)" strokeWidth="3" fill="none" />
    </svg>
  </motion.button>
)}
    </AnimatePresence>
    
  );
};
export default Sidebar