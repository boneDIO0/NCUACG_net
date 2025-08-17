import React, { useState, useEffect,useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; //接後端時把這個刪掉
import { useAuth } from '../contexts/AuthContext';
import '../styles/Sidebar.css';
const Introduction: React.FC = () => {
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
        <motion.div className="div">

        </motion.div>
    </AnimatePresence>
    
  );
};
export default Introduction;