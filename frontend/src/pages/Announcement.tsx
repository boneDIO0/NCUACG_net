import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import Sidebar from '../components/Sidebar';

const NoticeBoard: React.FC = () => {
  const navigate =useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
    },
    {
      id: 5,
      title: '系統維護公告',
      content: '本系統將於8/21(一)晚上 23:00 - 7/22(二)02:00 進行維護，期間可能無法正常使用。',
      type: 'warning',
      date: '2025-07-11',
      category: 'system'
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
      case 'editing': return '#1fefe1'
      case 'voice_acting':return '#ff3121'
      case 'anime_playing':return '#9e332a'
      case 'art': return '#334455'
      case 'figure': return '#aabbcc'
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
  <Dialog.Root key={notice.id}>
    <Dialog.Trigger asChild>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        style={getNoticeStyle(notice.type)}
      >
        {/* 標題與簡要內容 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: getCategoryColor(notice.category) }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{notice.title}</h3>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>{notice.date}</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {notice.content}
        </p>
         {/* 公告分類標籤 */}
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
    </Dialog.Trigger>

    {/* Modal Content */}
    <Dialog.Portal>
      <Dialog.Overlay style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        position: 'fixed',
        inset: 0
      }} />
      <Dialog.Content style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        width: '90%',
        maxWidth: '500px',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* 公告分類標籤 */}
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
        <Dialog.Title style={{ fontSize: '20px', fontWeight: 'bold' }}>{notice.title}</Dialog.Title>
        <Dialog.Description style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
          {notice.date}
        </Dialog.Description>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{notice.content}</p>
        <Dialog.Close asChild>
          <button style={{
            marginTop: '20px',
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>關閉</button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
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
          onClick={()=>navigate("/")}
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
          回首頁
        </motion.button>
      </div>
    </div>
   
  );
 
};
export default function Announcement() {
    return (<NoticeBoard />);
}