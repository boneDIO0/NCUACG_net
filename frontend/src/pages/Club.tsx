import React, { useState } from 'react';
import '../styles/Club.css';

// 定義六邊形項目的資料結構
type HexItemType = 'button' | 'text' | 'image' | 'empty';

interface HexItem {
  id: number;
  type: HexItemType;
  label?: string; // 文字
  url?: string; // 如果是按鈕，可以導向的網址
  imageSrc?: string; // 如果是圖案，圖案的來源
}

// 模擬六邊形資料，包含所有特徵
const initialHexItems: HexItem[] = [
  { id: 1, type: 'text', label: '社' },
  { id: 2, type: 'button', label: '動畫\n播放組', url: '/anime' },
  { id: 3, type: 'button', label: '御宅藝', url: '/otaku' },
  { id: 4, type: 'text', label: '課' },
  { id: 5, type: 'button', label: '模型\n製作', url: '/model' },
  { id: 6, type: 'text', label: '繪畫' },
  { id: 7, type: 'button', label: 'TRPG', url: '/trpg' },
  { id: 8, type: 'text', label: '介\n紹' },
  { id: 9, type: 'image', imageSrc: '/path/to/your-icon.png' },
  { id: 10, type: 'button', label: 'MV\n剪輯', url: '/mv' },
  { id: 11, type: 'button', label: '聲優', url: '/seiyuu' },
];

// 新增一個生成 'empty' 項目的函數
const generateEmptyHexItems = (startId: number, endId: number): HexItem[] => {
  const emptyItems: HexItem[] = [];
  for (let i = startId; i <= endId; i++) {
    emptyItems.push({
      id: i,
      type: 'empty',
    });
  }
  return emptyItems;
};

// 合併初始項目和新生成的空白項目
const hexItems: HexItem[] = [
  ...initialHexItems,
  ...generateEmptyHexItems(12, 50),
];

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
      <div className="hex-grid-container">
        {hexItems.map((item) => {
          const isButton = item.type === 'button';
          const isActive = activeHexId === item.id;

          return (
            <div key={item.id} className="hex-item-wrapper">
              <div
                className={`hex-item-content
                  ${isButton ? 'is-button' : ''}
                  ${isActive ? 'active' : ''}`}
                onClick={() => handleClick(item)}
                // 如果不是按鈕，就移除 cursor 樣式
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
          );
        })}
      </div>
    </div>
  );
};

export default Club;