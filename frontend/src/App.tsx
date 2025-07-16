import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 公告欄組件
const NoticeBoard: React.FC = () => {
  const [notices] = useState([
    {
      id: 1,
      title: '系統維護公告',
      content: '本系統將於7/21(一)晚上 23:00 - 7/22(二)02:00 進行維護，期間可能無法正常使用。',
      type: 'warning',
      date: '2025-07-11',
      category: 'system'
    },
    {
      id: 2,
      title: '8/30社團博覽會',
      content: '動畫社將在8/30在社團博覽會展出，歡迎各位新生前來參加。',
      type: 'info',
      date: '2025-07-16',
      category: 'anime_club'
    },
    {
      id: 3,
      title: '御宅藝北區團練',
      content: '北區御宅藝社課朋友們好，我們將在7/26(六)晚上在圓山花博進行團練',
      type: 'success',
      date: '2024-07-15',
      category: 'wotage'
    },
    {
      id: 4,
      title: '7/12檢討會',
      content: 'TRPG社課將在7/12日進行檢討會議，請友參加的社員們在當天下午2點加入DC...。',
      type: 'warning',
      date: '2024-01-12',
      category: 'trpg'
    }
  ]);

  const getNoticeStyle = (type: string) => {
    const baseStyle = {
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '15px',
      border: '1px solid',
      position: 'relative' as const,
      overflow: 'hidden' as const
    };

    switch (type) {
      case 'warning':
        return { ...baseStyle, backgroundColor: '#fff3cd', borderColor: '#ffeaa7', color: '#856404' };
      case 'info':
        return { ...baseStyle, backgroundColor: '#d1ecf1', borderColor: '#74b9ff', color: '#0c5460' };
      case 'success':
        return { ...baseStyle, backgroundColor: '#d4edda', borderColor: '#00b894', color: '#155724' };
      default:
        return { ...baseStyle, backgroundColor: '#f8f9fa', borderColor: '#ddd', color: '#495057' };
    }
  };
  {/* 公告列表 */}
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return '#e74c3c';
      case 'anime_club': return '#f39c12';
      case 'otage': return '#27ae60';
      case 'trpg': return '#45ff13';
      default: return '#95a5a6';
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      height: '500px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      overflow: 'hidden'
    }}>
      {/* 公告欄標題 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#ff6b6b',
            borderRadius: '50%',
            marginRight: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          !
        </motion.div>
        <h2 style={{
          margin: 0,
          color: '#2d3748',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          📢 公告欄
        </h2>
      </div>

      {/* 公告列表 */}
      <div style={{
        height: '400px',
        overflowY: 'auto',
        paddingRight: '10px'
      }}>
        {notices.map((notice, index) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            style={getNoticeStyle(notice.type)}
          >
            {/* 優先級指示器 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: getCategoryColor(notice.category)
            }} />

            {/* 公告標題 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {notice.title}
              </h3>
              <span style={{
                fontSize: '12px',
                opacity: 0.7,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                {notice.date}
              </span>
            </div>

            {/* 公告內容 */}
            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              {notice.content}
            </p>

            {/* 優先級標籤 */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: getCategoryColor(notice.category),
              color: 'white',
              padding: '2px 6px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {notice.category}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 底部操作區 */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '25px',
        right: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: '1px solid #e9ecef'
      }}>
        <span style={{
          fontSize: '12px',
          color: '#6c757d'
        }}>
          共 {notices.length} 則公告
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          查看全部
        </motion.button>
      </div>
    </div>
  );
};
const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩層 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              onClick={onClose}
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
                  {['首頁', '關於', '服務', '聯絡'].map((item, index) => (
                    <motion.button
                      key={item}
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
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalPages = 3;

  // 頁面數據
  const pages = [
    {
      id: 0,
      title: '第一頁',
      subtitle: '歡迎來到我的世界',
      content: '啊布拉布拉吧吧吧',
      bgColor: '#1f1e33',
      textColor: '#ffffff'
    },
    {
      id: 1,
      title: '第二頁',
      subtitle: '探索更多可能',
      content: '把我關進女面去',
      bgColor: '#DDFFDD',
      textColor: '#2d3748'
    },
    {
      id: 2,
      title: '第三頁',
      subtitle: '未來就在這裡',
      content: '感謝你的觀看！',
      bgColor: '#ee45e4',
      textColor: '#ffffff'
    }
  ] as const;

  // 監聽滾輪事件
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 0) {
        // 向下滾動
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
      } else {
        // 向上滾動
        setCurrentPage(prev => Math.max(prev - 1, 0));
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
    initial: {
      y: 1000,
      opacity: 0,
      scale: 0.8
    },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      y: -1000,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  // 內容動畫變體
  const contentVariants = {
    initial: {
      opacity: 0,
      y: 50
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: {
      opacity: 0,
      y: 30
    },
    animate: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 右上角菜單按鈕 */}
      <motion.button
        onClick={() => setSidebarOpen(true)}
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
        {/* 漢堡菜單圖標 */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              width: sidebarOpen ? '0px' : '20px',
              opacity: sidebarOpen ? 0 : 1
            }}
            transition={{ duration: 0.3 }}
            style={{
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1px'
            }}
          />
        ))}
      </motion.button>

      {/* 側邊欄 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
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
            {/* 標題 */}
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

            {/* 副標題 */}
            <motion.h2
              variants={itemVariants}
              style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                opacity: 0.8,
                fontWeight: 'normal'
              }}
            >
              {pages[currentPage].subtitle}
            </motion.h2>

            {/* 內容 */}
            <motion.div
              variants={itemVariants}
              style={{
                fontSize: '1.2rem',
                lineHeight: '1.6',
                marginBottom: '3rem'
              }}
            >
              {currentPage === 1 ? (
                <NoticeBoard />
              ) : (
                pages[currentPage].content
              )}
            </motion.div>

            {/* 動畫裝飾元素 */}
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
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
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

export default App;
