import React, { useState } from 'react';
import '../styles/Club.css';
import Sidebar from '../components/Sidebar';

// 定義六邊形項目的資料結構
type HexItemType = 'button' | 'text' | 'image' | 'empty';

interface HexItem {
  id: number;
  type: HexItemType;
  label?: string;
  url?: string;
  imageSrc?: string;
}

// 你的初始資料
const initialHexItems: HexItem[] = [
  { id: 17, type: 'text', label: '社' },
  { id: 14, type: 'button', label: '動畫\n播放組', url: '/anime' },
  { id: 15, type: 'button', label: '御宅藝', url: '/otaku' },
  { id: 28, type: 'text', label: '課' },
  { id: 24, type: 'button', label: '模型\n製作', url: '/model' },
  { id: 25, type: 'button', label: '繪畫' },
  { id: 26, type: 'button', label: 'TRPG', url: '/trpg' },
  { id: 22, type: 'text', label: '介' },
  { id: 34, type: 'button', label: 'MV\n剪輯', url: '/mv' },
  { id: 35, type: 'button', label: '聲優', url: '/seiyuu' },
  { id: 32, type: 'text', label: '紹' },
];

// 決定 hex grid 最大 ID
const MAX_ID = 50;

// 產生完整的 hexItems 陣列
const hexItems: HexItem[] = Array.from({ length: MAX_ID }, (_, i) => ({
  id: i + 1,
  type: 'empty' as HexItemType,
}));

// 把 initialHexItems 覆蓋進去（確保 id 與 index 一致）
initialHexItems.forEach(item => {
  hexItems[item.id - 1] = item;
});


const Club: React.FC = () => {
  const [activeHexId, setActiveHexId] = useState<number | null>(null);

  // 處理按鈕點擊的邏輯
  const handleClick = (item: HexItem) => {
    // 只有 type 為 'button' 的項目才會有 HandleClick
    if (item.type === 'button') {
      setActiveHexId(item.id);
      console.log(`點擊了按鈕: ${item.label}`);
      // 這裡可以放你的導航或其他處理邏輯
      if (item.url) {
        // window.location.href = item.url;
      }
    } else {
      console.log(`點擊了非按鈕項目: ${item.label || item.imageSrc || '空'}`);
      // 非按鈕的項目也可以做一些其他處理，例如顯示彈窗
    }
  };

  return (
    <div className="full-page-container">
      <Sidebar />
      <div className="hex-grid-container">
        {hexItems.map((item, index) => {
          const isButton = item.type === 'button';
          const isActive = activeHexId === item.id;

          // 計算行數來決定偏移
          const row = Math.floor(index / 10);
          const isOddRow = row % 2 === 1;
          
          return (
            <div 
              key={item.id} 
              className={`hex-item-wrapper ${isOddRow ? 'offset' : ''}`}
            >
              <div className='hex-item-border'>
              <div
                className={`hex-item-content
                  ${item.type}
                  ${isButton ? 'is-button' : ''}
                  ${isActive ? 'active' : ''}`}
                onClick={() => handleClick(item)}
                style={!isButton ? { cursor: 'default' } : undefined}
              >
              
                {/* 根據項目類型渲染不同的內容 */}
                {item.type === 'text' && (
                  item.label?.split('\n').map((line, index) => (
                    <span key={index}>{line}</span>
                  ))
                )}
                {item.type === 'button' && (
                  item.label?.split('\n').map((line, index) => (
                    <span key={index}>{line}</span>
                  ))
                )}
                {item.type === 'image' && item.imageSrc && (
                  <img src={item.imageSrc} alt="" style={{ maxWidth: '80%', maxHeight: '80%' }} />
                )}
                
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Club;