# AI 學習頁面產生器

一個基於人工智慧的教育工具，能夠自動生成結構化的學習內容，包含測驗、活動和診斷分析功能。由財團法人博幼社會福利基金會開發，致力於提供優質的教育資源。

## 🌟 核心功能

### 📚 智慧教案生成
- **AI 驅動內容創建**：使用 Google Gemini AI 自動生成高品質教案
- **多元學習目標**：包含學習目標、內容分解、易混淆知識點和課堂活動
- **學習程度適配**：支援初級、中級、高級三種程度自動調整
- **英語專屬功能**：針對英語主題提供詞彙程度選擇（基礎/中級/進階/學術）

### 🧠 互動測驗系統
- **多樣化題型**：
  - 是非題（含解釋說明）
  - 選擇題（多選項設計）
  - 填空題（智慧答案匹配）
  - 句子重組（邏輯思考訓練）
  - 記憶卡遊戲（配對學習）
- **難度分級**：每種題型都有簡單、普通、困難三個等級
- **即時反饋**：答題後立即顯示正確性和解釋

### ✍️ 寫作練習模組
- **主題式寫作**：根據學習內容生成寫作提示
- **多樣化格式**：支援作文、日記、報告等不同文體
- **寫作指導**：提供寫作技巧和結構建議

### 📊 學習診斷分析
- **智慧診斷報告**：AI 分析學習者答題表現，提供個人化建議
- **錯誤類型分析**：識別常見錯誤模式，提供針對性改進建議
- **學習進度追蹤**：監控答題正確率和學習軌跡
- **教師分析工具**：為教師提供班級整體學習狀況分析
- **報告持久化**：AI 診斷報告可自動保存並隨時查看，方便追蹤學習歷程
- **答題時間分析**：記錄學生答題時間，提供更全面的學習行為分析

### 💡 互動學習模組
- **AI 內容轉換**：將教師導向的教案內容（學習目標、內容分解、易混淆點）自動轉換為學生友好的互動式學習材料。
- **豐富內容呈現**：支援 Markdown 格式渲染，提供更生動的學習體驗。
- **分流學習路徑**：區分教師準備介面與學生互動介面，優化各自使用體驗。
- **沉浸式學習**：提供結構化的學習步驟，引導學生逐步掌握知識。
- **實踐與反思**：針對易混淆點提供具體練習範例，包含錯誤想法與正確思路對比。

### 🔄 分享與協作
- **學生結果分享**：學生可將測驗結果分享給教師
- **教師檢視工具**：教師可查看學生完整答題過程和原始題目
- **URL 連結分享**：支援教案、測驗、寫作練習、互動學習的 URL 分享
- **QR Code 分享**：支援透過 QR Code 快速分享測驗、寫作練習和學生作答結果連結。
- **離線存取**：分享內容可在無網路環境下查看

### 💾 本地教案管理
- **自動保存功能**：生成的教案自動保存到瀏覽器本地存儲
- **教案管理介面**：
  - 📋 查看所有歷史教案
  - 🔍 按主題搜尋教案
  - 📊 教案統計資訊
  - 🔗 一鍵重新分享教案
  - 🗑️ 教案刪除管理
- **分享教案管理**：自動保存透過分享連結打開的教案，並在教案庫中標示，方便管理。
- **隱私保護**：所有資料存儲在用戶本地，保護隱私安全

## 🚀 快速開始

### 系統需求
- Node.js 16 或更高版本
- pnpm 包管理器
- 現代瀏覽器（支援 ES2020）

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/killkli/ai-page-gen.git
   cd ai-page-gen
   ```

2. **安裝依賴**
   ```bash
   pnpm install
   ```

3. **設定環境變數**
   ```bash
   cp .env.example .env
   # 編輯 .env 文件，填入必要的 API 密鑰
   ```

4. **開發模式啟動**
   ```bash
   pnpm dev
   ```

5. **生產建置**
   ```bash
   pnpm build
   ```

6. **預覽生產版本**
   ```bash
   pnpm preview
   ```

### API 密鑰設定

本應用需要 Google Gemini API 密鑰來運作：

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 建立新的 API 密鑰
3. 在應用程式中點擊「設定 API Key」按鈕輸入密鑰

## 🛠️ 技術架構

### 前端技術棧
- **React 19.1.0**：現代化使用者介面框架
- **TypeScript**：型別安全的 JavaScript 超集
- **Vite**：快速的前端建置工具
- **Tailwind CSS**：實用優先的 CSS 框架
- **React Router**：單頁應用路由管理
- **React Markdown**：用於渲染 Markdown 內容

### AI 整合
- **Google Gemini API**：強大的生成式 AI 服務
- **並行處理**：多個 AI 請求並行執行，提升效能
- **錯誤處理**：完善的 API 錯誤處理和重試機制

### 資料存儲
- **IndexedDB**：瀏覽器本地資料庫，用於教案管理
- **JSONBin**：雲端 JSON 存儲服務，用於內容分享
- **localStorage**：用戶偏好設定和 API 密鑰存儲

### 核心服務
- **geminiService.ts**：AI 內容生成服務
- **jsonbinService.ts**：雲端分享服務
- **lessonPlanStorage.ts**：本地教案管理服務
- **diagnosticService.ts**：學習診斷分析服務
- **interactiveContentStorage.ts**：互動學習內容存儲服務

## 📁 專案結構

```
ai-page-gen/
├── src/
│   ├── components/          # React 元件
│   │   ├── quizTypes/      # 測驗題型元件
│   │   ├── InteractiveLearning/ # 互動學習相關元件
│   │   ├── StudentInteractive/ # 學生互動學習介面元件
│   │   ├── TeacherInteractivePrep/ # 教師互動教材準備介面元件
│   │   ├── MarkdownRenderer.tsx # Markdown 渲染元件
│   │   ├── LearningContentDisplay.tsx
│   │   ├── LessonPlanManager.tsx
│   │   └── ...
│   ├── services/           # 業務邏輯服務
│   │   ├── geminiService.ts
│   │   ├── jsonbinService.ts
│   │   ├── lessonPlanStorage.ts
│   │   ├── diagnosticService.ts
│   │   ├── interactiveContentStorage.ts # 互動學習內容存儲服務
│   │   └── ...
│   ├── types.ts           # TypeScript 型別定義
│   └── App.tsx            # 主應用元件
├── public/                # 靜態資源
├── dist/                  # 建置輸出
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 使用指南

### 教師使用流程

1. **設定 API 密鑰**
   - 首次使用時設定 Google Gemini API 密鑰
   - 可在設定中隨時更新密鑰

2. **生成教案**
   - 輸入教學主題（如「光合作用」、「英文現在式」）
   - 選擇學習程度（初級/中級/高級）
   - 如為英語主題，額外選擇詞彙程度
   - 點擊生成，等待 AI 建立完整教案

3. **內容檢視與編輯**
   - 檢視生成的學習目標、內容分解等
   - 確認易混淆知識點和建議活動
   - 可重新生成不滿意的部分

4. **分享給學生**
   - 點擊「分享測驗」或「分享寫作練習」按鈕
   - 複製生成的連結傳送給學生
   - 學生可直接透過連結存取內容
   - **新增**：點擊「教材準備」按鈕，進入互動教材準備介面，可將教案內容轉換為學生友好的互動學習材料，並生成分享連結。

5. **教案管理**
   - 在「我的教案庫」中查看所有歷史教案
   - 使用搜尋功能快速找到特定主題
   - 重新分享或刪除不需要的教案
   - **新增**：教案庫中會標示哪些是本地創建的，哪些是透過分享連結保存的教案。

### 學生使用流程

1. **存取測驗**
   - 透過教師提供的連結進入測驗頁面
   - 選擇要練習的難度等級
   - 開始答題，享受多樣化的題型

2. **即時學習回饋**
   - 每題答完立即看到結果和解釋
   - 錯誤題目會顯示正確答案和說明
   - 可重複練習直到熟練

3. **分享學習結果**
   - 完成測驗後可輸入姓名
   - 點擊「分享結果給教師」生成報告連結
   - 教師收到連結後可查看完整答題過程
   - **新增**：學生作答結果報告會自動保存 AI 診斷報告，方便教師隨時查看。

4. **寫作練習**
   - 透過寫作練習連結開始創作
   - 參考提供的寫作提示和結構建議
   - 完成後可儲存或列印作品

5. **互動學習**
   - 透過教師提供的互動學習連結進入學習頁面。
   - 內容會自動轉換為學生友好的語言和格式。
   - 逐步引導學習，包含重點概念、生活實例、學習技巧等。
   - 針對易混淆點提供具體練習，幫助學生釐清觀念。

## 🔧 設定與客製化

### 環境變數設定

```bash
# JSONBin 服務設定（用於分享功能）
VITE_JSONBIN_API_KEY=your_jsonbin_key_here

# 部署設定
VITE_BASE_URL=/ai-page-gen/
```

### Tailwind CSS 客製化

在 `tailwind.config.js` 中可調整：
- 色彩配置
- 字型設定
- 響應式斷點
- 自訂元件樣式

### AI 提示詞調整

在 `src/services/geminiService.ts` 中可以：
- 調整 AI 生成內容的風格
- 修改題目數量和難度分布
- 自訂特定科目的生成邏輯
- 優化提示詞以提升生成品質
- **新增**：調整 AI 轉換教案內容為學生友好格式的邏輯和風格。

## 🌐 部署指南

### GitHub Pages 部署

1. **設定 GitHub Actions**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: pnpm install
         - run: pnpm build
         - uses: peaceiris/actions-gh-pages@v3
   ```

2. **配置 Repository Settings**
   - 在 GitHub repository 設定中啟用 GitHub Pages
   - 選擇 `gh-pages` 分支作為來源

### Vercel 部署

1. **連接 Repository**
   - 登入 Vercel 並連接你的 GitHub repository

2. **設定環境變數**
   - 在 Vercel Dashboard 中設定必要的環境變數

3. **自動部署**
   - 每次推送到 main 分支時自動觸發部署

### 自託管部署

1. **建置應用**
   ```bash
   pnpm build
   ```

2. **部署到網頁伺服器**
   - 將 `dist/` 資料夾內容複製到網頁伺服器
   - 設定伺服器支援 SPA 路由（重要）

3. **Nginx 設定範例**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## 🤝 貢獻指南

我們歡迎社群貢獻！請遵循以下流程：

1. **Fork 專案**
   - 點擊右上角的 Fork 按鈕

2. **建立功能分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **提交變更**
   ```bash
   git commit -m 'feat: 加入絕佳的新功能'
   ```

4. **推送分支**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **建立 Pull Request**
   - 提供詳細的變更描述
   - 確保所有測試通過

### 開發規範

- 使用 TypeScript 進行開發
- 遵循 ESLint 和 Prettier 規範
- 元件使用函式式寫法和 Hooks
- 提交訊息使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式

## 🐛 問題回報

如果您遇到問題或有功能建議，請：

1. 先搜尋現有的 [Issues](https://github.com/your-org/ai-page-gen/issues)
2. 如未找到相關問題，建立新的 Issue
3. 提供詳細的重現步驟和環境資訊

## 📄 授權條款

本專案採用 [MIT License](LICENSE) 開源授權條款。

## 👥 開發團隊

由財團法人博幼社會福利基金會開發和維護。

### 特別感謝

- Google AI 團隊提供的 Gemini API 服務
- React 和 Vite 開源社群
- 所有貢獻者和測試用戶

## 📞 聯絡資訊

- **官方網站**：[財團法人博幼社會福利基金會](https://www.boyo.org.tw)
- **專案 Issues**：[GitHub Issues](https://github.com/your-org/ai-page-gen/issues)
- **功能建議**：歡迎透過 Issues 提出您的想法

## 🗺️ 發展藍圖

### 即將推出的功能

- [ ] 多語言介面支援（英文、日文）
- [ ] 教案範本系統
- [ ] 學習進度分析儀表板
- [ ] 批量匯入/匯出功能
- [ ] 離線模式支援
- [ ] 行動應用版本

### 長期規劃

- [ ] 整合更多 AI 服務提供商
- [ ] 擴展到其他教育領域
- [ ] 建立教師社群平台
- [ ] 開發進階分析工具

---

**讓我們一起用 AI 的力量，為教育帶來更多可能性！** 🚀📚✨
