# 部署指南

本文件說明如何將上課即時反應系統部署到各種平台。

## 🚀 部署選項

### 1. Render.com（推薦）

Render 是一個現代化的雲端平台，提供免費的 Node.js 應用託管。

#### 步驟：
1. 註冊 [Render](https://render.com) 帳號
2. 點擊 "New" → "Web Service"
3. 連接你的 GitHub 倉庫
4. 配置設定：
   - **Name**: `classroom-reaction-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 點擊 "Create Web Service"

#### 環境變數（如果需要）：
```
NODE_ENV=production
PORT=10000
```

### 2. Heroku

#### 步驟：
1. 安裝 [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. 登入 Heroku：
   ```bash
   heroku login
   ```
3. 建立應用：
   ```bash
   heroku create your-app-name
   ```
4. 推送到 Heroku：
   ```bash
   git push heroku main
   ```

### 3. Vercel

#### 步驟：
1. 安裝 Vercel CLI：
   ```bash
   npm install -g vercel
   ```
2. 在專案目錄執行：
   ```bash
   vercel
   ```
3. 按照指示完成部署

### 4. Railway

#### 步驟：
1. 註冊 [Railway](https://railway.app) 帳號
2. 點擊 "Deploy from GitHub repo"
3. 選擇你的倉庫
4. Railway 會自動偵測並部署

## 🔧 本地開發

```bash
# 安裝依賴
npm install

# 開發模式（自動重啟）
npm run dev

# 生產模式
npm start
```

## 📝 部署前檢查清單

- [ ] 確保 `package.json` 包含正確的 `engines` 設定
- [ ] 檢查 `.gitignore` 是否正確排除 `node_modules`
- [ ] 確認所有依賴都在 `dependencies`（不是 `devDependencies`）
- [ ] 測試應用在本地環境正常運作
- [ ] 準備環境變數（如果有需要）

## 🌍 網域配置

部署完成後，你可以：

1. **使用平台提供的網域**（如 `your-app.render.com`）
2. **綁定自定義網域**：
   - 在平台設定中添加自定義網域
   - 更新 DNS 記錄指向平台提供的位址

## 🔒 生產環境建議

1. **環境變數**：敏感資訊應使用環境變數
2. **HTTPS**：確保使用 HTTPS（多數平台預設提供）
3. **監控**：設定應用監控和錯誤追蹤
4. **備份**：定期備份重要數據
5. **更新**：保持依賴套件最新版本

## 💡 效能優化

1. **啟用 gzip 壓縮**
2. **使用 CDN** 提供靜態檔案
3. **實作快取機制**
4. **監控記憶體使用量**

## 🐛 常見問題

### 問題 1: 應用無法啟動
- 檢查 `package.json` 中的 `start` 腳本
- 確認 `server.js` 檔案存在
- 檢查依賴是否正確安裝

### 問題 2: WebSocket 連接失敗
- 確認平台支援 WebSocket
- 檢查防火牆設定
- 驗證 Socket.io 配置

### 問題 3: 靜態檔案無法載入
- 檢查 `public` 資料夾路徑
- 確認 Express 靜態檔案配置正確

## 📞 技術支援

如果遇到部署問題，可以：
1. 查看平台的官方文件
2. 檢查應用日誌
3. 在 GitHub Issues 中提出問題