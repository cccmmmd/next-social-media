# Next.js 社群媒體應用程式

採用 Next.js 14 框架開發，結合了多項強大的功能和工具，為使用者提供流暢的社交體驗。

## 功能特點

- 註冊/登入、發佈貼文、按讚、留言、追蹤、網友互動通知、個人檔案、追蹤數/被追蹤數
- 整合 Clerk 提供安全的身份驗證系統
- 採用 Prisma 作為 ORM，確保高效的資料庫操作
- 支援深色模式與淺色模式切換
- 整合檔案上傳功能
- 響應式設計，支援各種裝置

## 技術架構

- **前端框架**: Next.js 14
- **程式語言**: TypeScript
- **資料庫 ORM**: Prisma
- **資料庫**: Neon PostgreSQL Database Platform
- **身份驗證**: Clerk
- **樣式解決方案**: Tailwind CSS
- **UI 元件**: Radix UI
- **檔案上傳**: uploadthing

## 開始使用

### 環境需求

- Node.js 18 或更高版本
- npm 或 yarn 套件管理器
- PostgreSQL 資料庫

### 安裝說明

1. 複製專案至本地：
```bash
git clone [專案網址]
cd next-social-media
```

2. 安裝相依套件＆初始化資料庫：
```bash
npm install
```

3. 環境設定：  
在根目錄建立 `.env` 文件，加入必要的環境變數：
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
UPLOADTHING_TOKEN=
```

4. 啟動開發伺服器：
```bash
npm run dev
```

現在您可以在 http://localhost:3000 開始使用這個應用程式。

