import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; //接後端時把這個刪掉
import Sidebar from '../components/Sidebar';
import NoticeBoard from '../components/NoticeBoard';
// 公告欄組件
const Home: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const totalPages = 3;
  const [direction, setDirection] = useState(0); // +1 或 -1
  const [isAnimating, setIsAnimating] = useState(false); // 🔧 防止連續觸發動畫
  // 頁面數據
  const pages = [
    {
      id: 0,
      title: '第一頁',
      subtitle: 'ようこそ　アニメ部の世界へ',
      content: '啊布拉布拉吧吧吧',
      bgColor: '#1f1e33',
      textColor: '#ffffff'
    },
    {
      id: 1,
      title: '第二頁',
      subtitle: '探索更多可能',
      content: '我需要愛音',
      bgColor: '#DDFFDD',
      textColor: '#2d3748'
    },
    {
      id: 2,
      title: '第三頁',
      subtitle: '想要社團嗎?買回去啊 窮窮們',
      content: '感謝你的觀看！',
      bgColor: '#ee45e4',
      textColor: '#ffffff'
    }
  ] as const;
  
  // 監聽滾輪事件
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating) return;

      const next = e.deltaY > 0 ? currentPage + 1 : currentPage - 1;
      if (next >= 0 && next < totalPages) {
        setDirection(e.deltaY > 0 ? 1 : -1); // 🔧 新增方向
        setCurrentPage(next);
        setIsAnimating(true);
        
      }
    };

    // 監聽鍵盤事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        setCurrentPage(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalPages]);

  // 頁面變換動畫變體
  const pageVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 1000 : -1000, // ✅ 根據方向滑入
    opacity: 0
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -1000 : 1000, // ✅ 根據方向滑出
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

  const contentVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 }
  };
  //根據按鈕類型切換網頁
  //const handleClick = (item: string)
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* 側邊欄 */}
      <Sidebar />
      <AnimatePresence custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction} // 🔧 傳遞 direction 給 variants
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          onAnimationComplete={() => setIsAnimating(false)}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: pages[currentPage].bgColor,
            color: pages[currentPage].textColor,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            style={{
              textAlign: 'center',
              maxWidth: '600px',
              padding: '2rem'
            }}
          >
            <motion.h1
              variants={itemVariants}
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: pages[currentPage].bgColor === '#DDFFDD' ? '#2d3748' : 'transparent',
                backgroundClip: 'text'
              }}
            >
              {pages[currentPage].title}
            </motion.h1>

            <motion.h2
              variants={itemVariants}
              style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                opacity: 0.8
              }}
            >
              {pages[currentPage].subtitle}
            </motion.h2>

            <motion.div
              variants={itemVariants}
              style={{
                fontSize: '1.2rem',
                lineHeight: '1.6',
                marginBottom: '3rem'
              }}
            >
              {currentPage === 1 ? (
                <>
                  <NoticeBoard />
                  {/*測試用按鈕 與公告結合後刪掉 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/announcement')}
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  >
                    回首頁
                  </motion.button>
                </>
              ) : (
                pages[currentPage].content
              )}
            </motion.div>

            {/* 裝飾動畫球 */}
            <motion.div
              variants={itemVariants}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: pages[currentPage].textColor,
                    opacity: 0.6
                  }}
                />
              ))}
            </motion.div>

            {/* 導航提示 */}
            <motion.p
              variants={itemVariants}
              style={{
                fontSize: '0.9rem',
                opacity: 0.6,
                marginTop: '2rem'
              }}
            >
              {currentPage === 0 && "向下滾動或按 ↓ 鍵繼續"}
              {currentPage === totalPages - 1 && "向上滾動或按 ↑ 鍵返回"}
              {currentPage > 0 && currentPage < totalPages - 1 && "使用滾輪或方向鍵導航"}
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* 右側導航點 */}
      <div style={{
        position: 'fixed',
        right: '30px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {pages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentPage(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.7)',
              backgroundColor: index === currentPage ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          />
        ))}
      </div>

      {/* 頁面指示器 */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1rem',
        fontWeight: 'bold'
      }}>
        {currentPage + 1} / {totalPages}
      </div>
    </div>
  );
};
export default Home;