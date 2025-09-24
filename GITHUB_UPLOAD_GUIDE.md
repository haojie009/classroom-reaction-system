# GitHub 上傳指南

## 📋 上傳步驟

### 1. 在 GitHub 建立新倉庫
1. 登入 [GitHub](https://github.com)
2. 點擊右上角的 "+" → "New repository"
3. 填寫倉庫資訊：
   - **Repository name**: `classroom-reaction-system`
   - **Description**: `上課即時反應系統 - 讓學生可以表達上課聽不懂的情況`
   - ✅ **Public**（或選擇 Private）
   - ❌ **不要勾選** "Add a README file"
   - ❌ **不要勾選** "Add .gitignore"
   - ❌ **不要勾選** "Choose a license"
4. 點擊 "Create repository"

### 2. 連接本地倉庫到 GitHub
在你的專案資料夾中執行以下命令：

```bash
# 添加遠程倉庫（請將 YOUR_USERNAME 替換為你的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/classroom-reaction-system.git

# 推送到 GitHub
git push -u origin main
```

### 3. 上傳完成後的工作

#### 更新 README.md 中的連結
上傳完成後，編輯 README.md 文件，將以下連結更新為你的實際連結：
- `https://github.com/your-username/classroom-reaction-system.git`
- `https://github.com/your-username/classroom-reaction-system/issues`
- `https://github.com/your-username/classroom-reaction-system/discussions`

#### 更新個人資訊
1. 編輯 `LICENSE` 文件，將 "Your Name" 替換為你的真實姓名
2. 編輯 `README.md` 中的聯絡資訊
3. 更新 `package.json` 中的 author 欄位

### 4. 部署到線上平台

#### 使用 Render.com（推薦）
1. 註冊 [Render](https://render.com) 帳號
2. 點擊 "New" → "Web Service"
3. 選擇 "Connect a repository" → 選擇你的 GitHub 倉庫
4. 配置設定：
   - **Name**: `classroom-reaction-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 點擊 "Create Web Service"
6. 部署完成後，更新 README.md 中的線上展示連結

#### 使用 Heroku
```bash
# 安裝 Heroku CLI 後執行
heroku login
heroku create your-app-name
git push heroku main
```

#### 使用 Vercel
```bash
# 安裝 Vercel CLI 後執行
npm install -g vercel
vercel
```

### 5. 設置 GitHub Pages（可選）
如果你想要一個簡單的專案說明頁面：
1. 在倉庫設定中啟用 GitHub Pages
2. 選擇 main 分支作為來源
3. GitHub 會自動使用你的 README.md 作為首頁

## 🔧 維護建議

### 定期更新
```bash
# 拉取最新變更
git pull origin main

# 添加新變更
git add .
git commit -m "描述你的變更"
git push origin main
```

### 版本標記
```bash
# 建立版本標記
git tag -a v1.0.0 -m "版本 1.0.0"
git push origin v1.0.0
```

### 分支管理
```bash
# 建立功能分支
git checkout -b feature/new-feature

# 合併分支
git checkout main
git merge feature/new-feature
```

## 🎉 恭喜！

完成上述步驟後，你的上課即時反應系統就成功上傳到 GitHub 了！

記得：
- ⭐ 為你的專案加上 star
- 📢 分享給需要的老師和同學
- 🐛 持續改進和修復問題
- 📝 記錄使用回饋和建議

Happy coding! 🚀