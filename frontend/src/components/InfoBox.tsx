import React from 'react';
import '../style/InfoBox.css';
import aboutInfo from '../data/aboutInfo.json'; // ✅ 用 import 載入 JSON

const InfoBox: React.FC = () => {
  return (
    <div className="info-box">
      {aboutInfo.map((item, index) => (
        <p key={index} className="info-item">{item}</p>
      ))}
    </div>
  );
};

export default InfoBox;
