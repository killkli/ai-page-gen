# 三分支主題與品牌差異化設計方案

## 📋 設計概覽

**設計目標**: 為三個分支創建獨特的視覺識別，同時保持品牌一致性  
**技術實現**: 基於 CSS 變數和配置驅動的動態主題系統  
**用戶體驗**: 清晰的分支識別，符合各領域的專業特色  

## 🎨 分支主題定義

### 1. Main Branch - 通用學習主題
**品牌定位**: 跨領域通用教育平台  
**設計理念**: 簡潔、通用、專業

**主色調**:
- 主色: `#0ea5e9` (Sky Blue 500) - 知識的廣闊
- 次色: `#64748b` (Slate 500) - 穩重專業
- 強調色: `#f59e0b` (Amber 500) - 啟發創意

**視覺特點**:
- 簡潔的幾何線條
- 平衡的色彩搭配
- 通用性圖標系統
- 清晰的資訊層次

### 2. English Branch - 英語學習主題
**品牌定位**: 專業英語教學平台  
**設計理念**: 國際化、溝通、文化融合

**主色調**:
- 主色: `#3b82f6` (Blue 500) - 溝通的橋樑
- 次色: `#1e40af` (Blue 700) - 深度學習
- 強調色: `#10b981` (Emerald 500) - 成長進步
- 輔助色: `#f97316` (Orange 500) - 熱情活力

**視覺特點**:
- 流暢的曲線元素
- 語言相關的圖標
- 多文化色彩元素
- 對話氣泡設計語言

### 3. Math Branch - 數學學習主題
**品牌定位**: 數學概念理解平台  
**設計理念**: 邏輯、精確、探索

**主色調**:
- 主色: `#8b5cf6` (Violet 500) - 邏輯思考
- 次色: `#6366f1` (Indigo 500) - 深度分析
- 強調色: `#06b6d4` (Cyan 500) - 清晰洞察
- 輔助色: `#f43f5e` (Rose 500) - 重點標示

**視覺特點**:
- 幾何圖形元素
- 數學符號整合
- 網格系統設計
- 精確的比例關係

## 🏗️ 技術實現架構

### CSS 變數系統
```css
/* 基礎變數定義 */
:root {
  /* 通用變數 */
  --font-family-primary: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
  
  /* 分支特定變數 (由 JS 動態設定) */
  --color-primary: var(--branch-primary);
  --color-secondary: var(--branch-secondary);
  --color-accent: var(--branch-accent);
  --color-auxiliary: var(--branch-auxiliary);
}

/* 分支特定主題 */
.theme-main {
  --branch-primary: #0ea5e9;
  --branch-secondary: #64748b;
  --branch-accent: #f59e0b;
}

.theme-english {
  --branch-primary: #3b82f6;
  --branch-secondary: #1e40af;
  --branch-accent: #10b981;
  --branch-auxiliary: #f97316;
}

.theme-math {
  --branch-primary: #8b5cf6;
  --branch-secondary: #6366f1;
  --branch-accent: #06b6d4;
  --branch-auxiliary: #f43f5e;
}
```

### 動態主題切換系統
```typescript
// 主題管理器
class ThemeManager {
  private currentBranch: BranchType;
  
  public applyBranchTheme(branch: BranchType) {
    const themes = {
      main: 'theme-main',
      english: 'theme-english',
      math: 'theme-math'
    };
    
    document.documentElement.className = themes[branch];
    this.currentBranch = branch;
  }
}
```

## 🎯 組件差異化設計

### 1. 導航欄差異化
**Main Branch**:
- 簡潔的水平導航
- 通用學習圖標
- 扁平化按鈕樣式

**English Branch**:
- 語言切換選項顯著
- 對話氣泡風格按鈕
- 文化背景色彩點綴

**Math Branch**:
- 網格化佈局元素
- 幾何形狀按鈕
- 數學符號裝飾

### 2. 學習內容卡片設計
**共通基礎**:
- 卡片陰影與圓角
- 清晰的內容層次
- 響應式佈局

**分支特化**:
- **Main**: 均衡的內容區塊
- **English**: 對話框風格的內容呈現
- **Math**: 公式區塊的特殊樣式

### 3. 測驗組件風格
**Main Branch**:
- 標準的選擇按鈕
- 中性的回饋顏色
- 簡潔的進度指示

**English Branch**:
- 語音練習的波形視覺
- 發音正確性的色彩回饋
- 對話練習的角色標示

**Math Branch**:
- 公式輸入的特殊介面
- 步驟解析的流程圖
- 幾何圖形的繪製區域

## 📱 響應式設計考量

### 桌面端 (>768px)
- 完整的品牌元素展示
- 豐富的視覺細節
- 多欄位佈局

### 平板端 (480-768px)
- 重點品牌元素保留
- 適度簡化視覺
- 雙欄佈局

### 手機端 (<480px)
- 核心品牌色彩保持
- 極簡化圖標
- 單欄佈局

## 🚀 實施計劃

### Phase 1: 基礎主題系統 (1-2 天)
1. 建立 CSS 變數體系
2. 創建主題切換管理器
3. 實現基本的顏色差異化

### Phase 2: 組件主題化 (2-3 天)
1. 導航欄主題適配
2. 學習卡片差異化
3. 測驗組件特化

### Phase 3: 視覺元素強化 (1-2 天)
1. 分支特定圖標設計
2. 背景圖案與裝飾元素
3. 動畫效果差異化

### Phase 4: 測試與優化 (1 天)
1. 跨瀏覽器兼容性測試
2. 性能優化
3. 用戶體驗調整

## 📊 設計系統文件

### 顏色規範表
| 分支 | 主色 | 次色 | 強調色 | 輔助色 |
|------|------|------|--------|--------|
| Main | Sky 500 | Slate 500 | Amber 500 | - |
| English | Blue 500 | Blue 700 | Emerald 500 | Orange 500 |
| Math | Violet 500 | Indigo 500 | Cyan 500 | Rose 500 |

### 字體規範
- **標題**: Inter Bold 24-32px
- **內文**: Inter Regular 16px
- **程式碼**: JetBrains Mono 14px
- **數學公式**: KaTeX 渲染

### 間距系統
- 基礎間距: 4px 倍數系統
- 卡片內距: 16px / 24px
- 組件間距: 12px / 16px / 24px
- 版面邊距: 16px (mobile) / 24px (tablet) / 32px (desktop)

## 🎨 品牌識別資產

### Logo 變化
- **Main**: 通用學習圖標 + 文字標誌
- **English**: 地球/對話氣泡 + 文字標誌
- **Math**: 幾何圖形組合 + 文字標誌

### 圖標系統
- **Main**: 簡潔線條圖標
- **English**: 溝通相關圖標
- **Math**: 幾何數學圖標

### 裝飾元素
- **Main**: 抽象幾何圖案
- **English**: 語言文字雲、對話線條
- **Math**: 網格、坐標系、公式背景

## 🔄 維護與擴展

### 主題管理
- 配置檔案驱動
- 支援主題預設
- 動態載入機制

### 未來擴展性
- 深色模式支援
- 高對比模式
- 自定義主題能力
- A/B 測試支援

---

**設計原則**: 在保持品牌一致性的基礎上，突出各分支的專業特色  
**技術原則**: 以性能和維護性為優先，採用現代 CSS 技術  
**用戶原則**: 提升用戶的分支識別度和使用體驗