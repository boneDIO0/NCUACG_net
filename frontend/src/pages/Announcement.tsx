// Announcement.tsx
import NoticeBoard from '../components/NoticeBoard';
import Sidebar from '../components/Sidebar';
export default function Announcement() {
  const user = { username: 'admin' }; // 模擬登入使用者
  const canEdit = true; // 測試開啟編輯功能

  return (<><Sidebar/><NoticeBoard  /></>);
}

