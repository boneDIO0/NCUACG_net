import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Introduction.css';

// 定義新的 props 介面
interface IntroductionContent {
  title: string;
  text: string;
  image?: string;
}

interface IntroductionProps {
  content: IntroductionContent;
  onClose: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ content, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            {content.title}
          </div>
          
          <div className="modal-content-list" style={{ backgroundImage: content.image ? `url(${content.image})` : 'none' }}>
            {/* 根據你的新 JSON 結構，渲染 text 內容 */}
            {content.text.split('\n').map((line, index) => (
              <div key={index} className="modal-content-item">
                {line}
              </div>
            ))}
          </div>
          
          {/* ... 底部導航按鈕部分保持不變 ... */}
          <div className="modal-footer">
            <button onClick={onClose}>
              <span role="img" aria-label="back">↩️</span>
            </button>
            <span className="nav-text">點擊箭頭查看更多</span>
            <button>
              <span role="img" aria-label="next">➡️</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Introduction;