import React, { useState, useEffect, useRef } from 'react';
import notices from '../data/notices.json';
import '../style/NoticeBoard.css';

const MAX_LINES = 6;
const LINE_HEIGHT = 24;

const NoticeBoard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const notice = notices[currentIndex];

  // 切換公告時重設狀態
  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  // 測量是否需要顯示 read more
  useEffect(() => {
    if (!contentRef.current) return;

    const el = contentRef.current;

    // 強制更新 scrollHeight
    requestAnimationFrame(() => {
      const lineHeight = LINE_HEIGHT;
      const maxVisibleHeight = MAX_LINES * lineHeight;
      const actualHeight = el.scrollHeight;

      setShouldShowReadMore(actualHeight > maxVisibleHeight);
    });
  }, [notice.content]);

  const handleNext = () => {
    if (currentIndex < notices.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="notice-board-container">
      <div className="notice-stack-back" />
      <div className="notice-stack-middle" />
      <div className="notice-card-wrapper">
      <div className="notice-card">
      <div className="notice-title">{notice.title}</div>
      <div
        /* read more / 收起的狀態設定 */
        className={`notice-content ${isExpanded ? 'expanded' : 'collapsed'}`}
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? '2000px' : `${MAX_LINES * LINE_HEIGHT}px`,
           transition: 'max-height 1s ease',
        }}
      >
          {notice.content}
        </div>

        {/* 按下read more / 收起時會對應的狀態 */}
        {shouldShowReadMore && (
          <div className="notice-more" onClick={() => setIsExpanded((prev) => !prev)}>
            {isExpanded ? '收起 ▲' : 'read more ▼'}
          </div>
        )}

        {/* 按下read more / 收起時對應的日期顯示狀態 */}
        {(isExpanded || !shouldShowReadMore) && (
            <div className="notice-date">{notice.date}</div>
        )}
        </div>
      </div>

      {/* 公告導航圓點 */}
      <div className="notice-nav-dots-container"> {/* 公告導航圓點容器 */}
        {notices.map((_, index) => (
          <div
            key={index}
            className={`notice-nav-dots ${index === currentIndex ? 'active' : ''}`} /* 當前公告的導航圓點是否有 active 樣式 */
          />
        ))}
      </div>

      {/* 公告導航按鈕 */}
      <div className="notice-nav"> {/* 公告導航按鈕容器 */}
        <button
          className={`nav-button ${currentIndex === 0 ? 'hidden' : ''}`} /* 當前是第一個公告時隱藏上一頁按鈕 */
          onClick={handlePrev}
        >
          ←
        </button>
        <button
          className={`nav-button ${currentIndex === notices.length - 1 ? 'hidden' : ''}`} 
          onClick={handleNext}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default NoticeBoard;