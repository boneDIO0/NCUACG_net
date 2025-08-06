import React, { useState, useEffect, } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './components/Home.tsx';
import './Start.css';

const Start: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 5秒後切換到首頁
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);     // 2秒後消失

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          /* 顯示啟動動畫 */
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="splash-screen"
        >
          {/* 顯示動畫社logo */}
          <motion.img
            src="/images/logo.jpg"
            alt="Logo"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="splash-logo"
          />
        </motion.div>
      ) : (
        <Home key="Home" />
      )}
    </AnimatePresence>
  );
};

export default Start;