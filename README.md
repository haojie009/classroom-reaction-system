# 上課即時反應系統

一個讓學生能夠即時向老師表達上課聽不懂等問題的系統。

## 🌟 線上展示

- 🚀 [線上展示](https://your-app.render.com)（部署後更新連結）
- 📱 響應式設計，支援各種裝置

## 功能特色

- 🎓 **學生端**：可以即時表達各種上課反應（聽不懂、太快、太慢等）
- 👨‍🏫 **教師端**：即時接收並管理學生反應
- 💬 **即時通訊**：使用 WebSocket 確保反應即時傳達
- 📱 **響應式設計**：支援電腦、平板、手機等各種裝置
- 🏫 **課堂管理**：教師可建立課堂，學生透過代碼加入

## 🚀 快速開始

### 線上使用
訪問 [線上版本](https://your-app.render.com)（部署後更新）

### 本地安裝

## 系統架構

### 前端
- 主頁面：系統介紹和角色選擇
- 教師端：課堂管理、即時查看學生反應
- 學生端：加入課堂、發送反應

### 後端
- Node.js + Express：網站伺服器
- Socket.io：即時通訊
- 記憶體儲存：課堂和反應數據

## 反應類型

- 😵‍💫 **聽不懂**：學生表示對當前內容有困惑
- 🏃‍♂️ **講太快**：希望老師放慢講課速度
- 🐌 **可以快一點**：希望老師加快講課速度
- 🔊 **聽不清楚**：音量或發音問題
- ❓ **我有問題**：想要提問
- ☕ **想要休息**：希望休息一下

## 安裝與執行

### 1. 克隆專案
```bash
git clone https://github.com/haojie009/classroom-reaction-system.git
cd classroom-reaction-system
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 啟動系統
```bash
npm start
```

### 4. 開發模式（自動重啟）
```bash
npm run dev
```

## 🌐 部署

詳細的部署說明請參考 [DEPLOYMENT.md](DEPLOYMENT.md)

### 推薦平台：
- **Render.com**（免費，易用）
- **Heroku**（功能完整）
- **Vercel**（快速部署）
- **Railway**（現代化介面）

## 使用方式

### 教師使用流程
1. 打開瀏覽器訪問 `http://localhost:3000`
2. 點擊「教師端」
3. 輸入課堂名稱，建立新課堂
4. 將生成的課堂代碼告訴學生
5. 即時查看學生反應並進行處理

### 學生使用流程
1. 打開瀏覽器訪問 `http://localhost:3000`
2. 點擊「學生端」
3. 輸入姓名和課堂代碼
4. 選擇反應類型並發送給老師

## 技術規格

### 依賴套件
- `express`: 網站框架
- `socket.io`: 即時通訊
- `uuid`: 產生唯一識別碼

### 開發依賴
- `nodemon`: 開發時自動重啟

## 目錄結構
```
上課反應系統/
├── server.js          # 主要伺服器檔案
├── package.json       # 專案設定檔
├── README.md          # 說明文件
└── public/            # 前端檔案
    ├── index.html     # 主頁面
    ├── teacher.html   # 教師端
    └── student.html   # 學生端
```

## 瀏覽器支援

- Chrome（建議）
- Firefox
- Safari
- Edge

## 注意事項

- 系統使用記憶體儲存，重啟後數據會遺失
- 適合課堂即時使用，不適合長期數據保存
- 建議在區域網路環境使用以確保連線穩定

## 未來擴展

- 數據庫儲存（MongoDB、PostgreSQL）
- 用戶驗證系統
- 歷史記錄查詢
- 數據統計分析
- 多課堂同時進行
- 檔案上傳功能

## 授權

MIT License

## 🤝 貢獻

歡迎提交 Pull Request 或建立 Issue！

### 開發流程
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📸 螢幕截圖

### 主頁面
![主頁面](screenshots/home.png)

### 教師端
![教師端](screenshots/teacher.png)

### 學生端
![學生端](screenshots/student.png)

## 📞 支援

如有任何問題或建議：
- 📧 Email: your-email@example.com
- 🐛 [GitHub Issues](https://github.com/haojie009/classroom-reaction-system/issues)
- 💬 [Discussions](https://github.com/haojie009/classroom-reaction-system/discussions)