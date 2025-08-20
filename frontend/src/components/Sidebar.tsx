﻿import React, { useState, useEffect,useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; //接後端時把這個刪掉
import { useAuth } from '../contexts/AuthContext';
import '../styles/Sidebar.css';
const Sidebar: React.FC = () => {
  const { isAuthenticated, user,logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // ← 由自己管理開關狀態
  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  // 根據按鈕文字導航
  const navigate = useNavigate();
  const [activeMenu, setActive] = useState<string | null>(null);
  const [subpanelPosition, setSubpanelPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

interface Requirement {
  name: string;
  requirement?: 'public'|'member' | 'admin';
}
interface Option {
  name: string;
  children?: Requirement[];
}

const menuOptions: Option[] = [
  {
    name: '歌謠祭平台',
    children: [
      { name: '舊曲清單', requirement: 'public' },
      { name: '新曲投稿', requirement: 'public' },
      { name: '亂入投稿說明/投票', requirement: 'public' },
      { name: '歌單瀏覽', requirement: 'public' },
      { name: '點歌系統', requirement: 'member' },
      { name: '管理歌單', requirement: 'admin' }
    ]
  },
  {
    name: '社課介紹',
    children: [
      { name: '動畫播放組', requirement: 'public' },
      { name: 'MV剪輯組', requirement: 'public' },
      { name: '繪畫組', requirement: 'public' },
      { name: 'TRPG組', requirement: 'public' },
      { name: '聲優組', requirement: 'public' },
      { name: '御宅藝組', requirement: 'public' },
      { name: '模型製作組', requirement: 'public' }
    ]
  },
  {
    name: '活動資訊',
    children: [
      { name: '行事曆', requirement: 'public' },
      { name: '活動公告一覽', requirement: 'public' }
    ]
  }
];
  const handleArrowClick = (optionName: string, event: React.MouseEvent) => {
    
    // 阻止事件冒泡，避免點擊箭頭時也觸發了母按鈕的導向功能
    event.stopPropagation();
     // 如果點擊的是同一個按鈕，則關閉子區塊
    if (activeMenu === optionName) {
      setActive(null);
      return;
    }
     // 獲取被點擊按鈕的 DOM 元素
    const targetButton = (event.currentTarget as HTMLElement).closest('.option-buttons');

    if (targetButton) {
      const rect = targetButton.getBoundingClientRect();
      
      // 子區塊的寬度，需要與你的 CSS .left-subpanel 的 width 相符
      const subpanelWidth = 200; 
      // 按鈕和子區塊之間的間距
      const spacing = 8;
      
      // 計算子區塊的 top 和 left 位置
      const top = rect.top; 
      
      // *** 關鍵修改：將 left 值設置為按鈕左側 - 子區塊寬度 - 間距 ***
      const left = rect.left - subpanelWidth - spacing;
      
      setSubpanelPosition({ top, left });
    }
    // 開關子選單
    setActive(activeMenu === optionName ? null : optionName);
    };


  const handleClick = (item: string) => {
  
    switch (item) {
      /*
      case '首頁':
        window.location.href = '/';
        break;
        */
      case '歌謠祭平台':
        window.location.href = '/about';
        break;
      case '社課介紹':
        navigate('/club');
        break;
      case '活動資訊':
        window.location.href = '/contact';
        break;
        
      case '登入':
        navigate('/Login');
        break;
      case '註冊':
        navigate('/register');
        break;
      
      default:
        break;
    }
    setIsOpen(false); // ← 點完選單自動關閉 Sidebar
  };
  const handleChildClick = (item: string) => {
  
    switch (item) {
      case '聲優組':
      navigate('/club/works');
      break;
      default:
        break;
    }
    setIsOpen(false); // ← 點完選單自動關閉 Sidebar
  };
  const handleClose = () =>
    { setIsOpen(false)
      setActive(null)
    };
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
            <div>
              {/* 子組件區域 */}
              <div style={{ marginBottom: '30px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                  {/* --- 新：主按鈕列 + 左側共享面板（往左開新區塊） --- */}
                    <div className="menu-right-side">
                      {/* 主按鈕直欄 */}
                      <div className="menu-main-column">
                        {menuOptions.map((option) => (
                          <div key={option.name} className="menu-item-wrapper">
                            <motion.button
                              onClick={() => handleClick(option.name)}
                              whileHover={{ scale: 1.05, backgroundColor: '#f0f8ff' }}
                              whileTap={{ scale: 0.95 }}
                              className="option-buttons"
                              aria-expanded={activeMenu === option.name}
                            >
                              {/* 按鈕內容的容器，用於 flexbox 佈局 */}
                            <div className="button-content">
                              <span>{option.name}</span>
                
                            {/* 這是箭頭圖示，點擊它來開關子選單 */}
                            {/* 只有當 option 有 children 時才顯示箭頭 */}
                            {option.children && option.children.length > 0 && (
                              <span
                                className={`arrow-icon ${activeMenu === option.name ? 'arrow-open' : ''}`}
                                onClick={(event) => handleArrowClick(option.name, event)}
                              >
                                 {/* 使用不同的箭頭圖標 */}
                                {activeMenu === option.name ? '»' : '«'} 
                              </span>
                            )}
                          </div>
                            
                            </motion.button>
                          </div>
                        ))}
                      </div>

                      {/* 左側共享子面板（僅渲染一次） */}
                      <AnimatePresence>
                        {activeMenu && (
                          <motion.div
                            key={activeMenu}
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -40, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="left-subpanel"
                            style={{ 
                              top: `${subpanelPosition.top}px`, 
                              left: `${subpanelPosition.left}px` 
                            }}
                          >
                            {(menuOptions.find(o => o.name === activeMenu)?.children ?? []).filter(child=>
                              {
                              // 如果沒有 requiredPermission，就顯示
                              if (child.requirement=== 'public') return true;
                              // 如果需要登入且已登入，就顯示
                              if (child.requirement === 'member' && isMember) return true;
                              // 如果需要管理員權限且是管理員，就顯示
                              if (child.requirement === 'admin' && isAdmin) return true;
                              // 其他情況一律不顯示
                              return false;
                            }


                            ).map(child => (
                              <motion.button
                                key={child.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="sub-option-button"
                                onClick={()=>handleChildClick(child.name)}
                              >
                                {child.name}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  {/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                  {/* 註冊按鈕*/}
                  {!isAuthenticated ? (
                  <>
                    <motion.button
                      onClick={() =>handleClick("註冊")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className='signup-button'                      
                    >
                      註冊
                    </motion.button>
                    
                  </>
                ) : (
                  <p style={{ fontSize: '14px', color: '#555', marginTop: '10px' }}>
                      ciallo~(∠・ω&lt; )⌒☆，{user?.username}
                  </p>
                )}
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