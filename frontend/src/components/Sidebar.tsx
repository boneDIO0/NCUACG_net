import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; //接後端時把這個刪掉
import { useAuth } from '../contexts/AuthContext';
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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1500,
              cursor: 'pointer'
            }}
          />
          
          {/* 側邊欄 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '350px',
              height: '100vh',
              backgroundColor: '#ffffff',
              boxShadow: '-5px 0 20px rgba(0, 0, 0, 0.3)',
              zIndex: 1600,
              overflowY: 'auto',
              padding: '20px'
            }}
          >
            {/* 關閉按鈕 */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '30px',
                height: '30px',
                border: 'none',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#666'
              }}
            >
              ×
            </motion.button>

            {/* 側邊欄內容 */}
            <div style={{ marginTop: '60px' }}>
              <h2 style={{ 
                color: '#333', 
                marginBottom: '20px',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                導航菜單
              </h2>
              
              {/* 子組件區域 */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#555', marginBottom: '15px', fontSize: '18px' }}>
                  快速導航
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['首頁', '關於', '服務'].map((item, index) => (
                    <motion.button
                      key={item}
                      onClick={() => handleClick(item)}  
                      whileHover={{ scale: 1.05, backgroundColor: '#f0f8ff' }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        color: '#333',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {item}
                    </motion.button>
                  ))}
                  {/*歌謠祭平台*/}
                  {isAuthenticated?(<motion.button
                      onClick={() => handleClick("歌謠祭平台")}  
                      whileHover={{ scale: 1.05, backgroundColor: '#f0f8ff' }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        color: '#333',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {"歌謠祭平台"}
                    </motion.button>):null}
                  {/* 額外加登入/登出按鈕 */}
                {isAuthenticated ? (
                  <>
                    <motion.button
                      onClick={logout}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #dc3545',
                        borderRadius: '8px',
                        backgroundColor: '#fff0f0',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginTop: '10px'
                      }}
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
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #007bff',
                      borderRadius: '8px',
                      backgroundColor: '#f0f8ff',
                      color: '#007bff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginTop: '10px'
                    }}
                  >
                    登入
                  </motion.button>
                )}
                </div>
              </div>
              {/* 設置區域 */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#555', marginBottom: '15px', fontSize: '18px' }}>
                  設置
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                    <input type="checkbox" defaultChecked />
                    <span>自動播放</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                    <input type="checkbox" />
                    <span>音效開啟</span>
                  </label>
                  <div>
                    <label style={{ color: '#333', display: 'block', marginBottom: '5px' }}>
                      動畫速度
                    </label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1" 
                      defaultValue="1"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* 統計信息 */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#555', marginBottom: '15px', fontSize: '18px' }}>
                  統計資訊
                </h3>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ marginBottom: '10px', color: '#333' }}>
                    <strong>總頁面數:</strong> 3
                  </div>
                  <div style={{ marginBottom: '10px', color: '#333' }}>
                    <strong>當前頁面:</strong> 第 1 頁
                  </div>
                  <div style={{ color: '#333' }}>
                    <strong>訪問時間:</strong> {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* 動作按鈕 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  保存設置
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  重置設置
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      {/* 右上角開啟按鈕 */}
      {!isOpen && 
              <motion.button
      onClick={handleOpen}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        cursor: 'pointer',
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        backdropFilter: 'blur(10px)',
        outline: 'none'
      }}
    >
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          style={{
            width: '20px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '1px'
          }}
        />
      ))}
    </motion.button>}
    </AnimatePresence>
    
  );
};
export default Sidebar