### NCU ACG 社團網站｜NCU ACG Club Website



中央大學動畫社專屬平台，整合社團介紹、活動公告、歌謠祭資料平台、AI 助理等功能，打造專屬於動漫愛好者的互動空間。



---



#### 專案簡介



本專案旨在為【中央大學動畫研究社】建立一套完整的資訊平台，提供社團成員、幹部與訪客一站式服務，功能包含：



\- 首頁（最新消息、社內動態、導覽入口）

\- 社課介紹（各課程成果展示與分享）

\- 活動資訊（可整合 Google 日曆）

\- 登入驗證 / 個人資料頁面

\- 歌謠祭平台（點歌、投稿、排行榜）

\- 排歌與統計後台（限排歌組、超管）

\- 生成式 AI 助理（提供個性化回覆）



---



#### 專案結構



```

ncuacg/
├── manage.py                         # 專案啟動點
├── README.md                         # 說明文件

├── ncuacg/                           # 主設定目錄（與專案同名）
│   ├── __init__.py
│   ├── settings.py                   # 設定檔（可再拆為 base/dev/prod）
│   ├── urls.py                       # 主路由（整合各 app）
│   ├── wsgi.py
│   └── asgi.py

├── accounts/                         # 登入 / 使用者模組
│   ├── views.py
│   ├── models.py
│   ├── urls.py
│   └── templates/accounts/

├── home/                             # 首頁 + 共用導覽
│   ├── views.py
│   ├── urls.py
│   └── templates/home/home.html

├── club/                             # 社課介紹模組
│   ├── views.py
│   ├── urls.py
│   └── templates/club/club_home.html

├── event/                            # 活動資訊模組
│   ├── views.py
│   ├── urls.py
│   └── templates/event/event_home.html

├── templates/                        # 共用模板（navbar, base...）
│   ├── base.html
│   └── includes/
│       └── navbar.html

├── static/                           # 靜態資源
│   ├── css/
│   ├── js/
│   └── img/

├── backend_api/                      # 若使用 DRF：REST API 模組（預留）
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── ...

└── .gitignore                        # Git 忽略檔案（已整理）

````



---



#### 開發說明



##### 安裝依賴



```

python -m venv venv

source venv/bin/activate  # Windows 請使用 venv\\Scripts\\activate

pip install -r requirements.txt

````



##### 開發伺服器啟動



```

python manage.py runserver

```



---



#### 團隊成員與分工



PM / 文件：元風，負責規格整合、時程規劃、Notion 文件管理

前端：夜閃、影蒙，負責首頁切版、導覽列元件、互動樣式

後端：元風、夜閃、能量、主推，負責Django 架構、登入機制、資料串接、API 建置

UI/UX：可可，負責視覺設計、Figma 產出、元件命名風格

多媒體與動畫：主推、能量，負責loading 動畫、動畫呈現（SVG / Lottie）

資料與內容管理：影蒙，負責Markdown 轉檔、歌曲資料轉存、格式統整



---



#### 權限分級（簡要）



\* 一般訪客：可瀏覽首頁、社課、活動頁

\* 社員登入：可點歌 / 投稿 / 參與投票

\* 排歌組：可進入後台編輯歌單與排序

\* 超管：全域管理者（帳號、權限、資料）



---



#### 進度追蹤



使用 GitHub Projects + Notion 任務板進行每週進度協作。



> 最新進度請參見：\[Notion 開發進度追蹤](https://www.notion.so/216ccbce60cd8026a045e5ee044134de?v=21accbce60cd80318a00000c2a02930b\&p=222ccbce60cd80509b05cd95b25ead5b\&pm=s)



---



#### 授權條款



MIT License. All media / content assets used are for non-commercial and internal educational purposes.



---

