# 主題系統使用指南

## 📋 概覽

本指南說明如何在 AI Learning Page Generator 的三分支架構中使用主題系統。

## 🚀 快速開始

### 1. 基本使用

```typescript
// 在 React 組件中使用主題
import { useTheme, useBranchTheme } from '@/src/themes/ThemeProvider';

const MyComponent = () => {
  const { currentBranch, currentTheme, applyTheme } = useTheme();
  const { config, styles, tailwindClasses } = useBranchTheme();
  
  return (
    <div className={styles.cardBorder}>
      <h1 style={{ color: currentTheme.primary }}>
        {config.name}
      </h1>
    </div>
  );
};
```

### 2. 主題初始化

```typescript
// 在應用根部引入主題初始化
import '@/src/themes/init';

// 或在 main.tsx 中手動初始化
import { initializeTheme } from '@/src/themes/init';

initializeTheme();
```

### 3. 使用主題提供者

```tsx
import { ThemeProvider } from '@/src/themes/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <YourAppComponents />
    </ThemeProvider>
  );
}
```

## 🎨 主題系統架構

### 核心文件結構

```
src/themes/
├── index.ts           # 主題管理器核心
├── base.css           # 基礎CSS變量和樣式
├── ThemeProvider.tsx  # React上下文和Hooks
├── icons.tsx          # 分支特定圖標系統
└── init.ts           # 初始化和工具函數
```

## 🔧 主要功能

### 1. 動態主題切換

```typescript
import { themeManager } from '@/src/themes';

// 切換到英文分支主題
themeManager.applyBranchTheme('english');

// 獲取當前分支
const currentBranch = themeManager.getCurrentBranch();

// 獲取當前主題色彩
const currentTheme = themeManager.getCurrentTheme();
```

### 2. 分支檢測

系統會自動從以下來源檢測分支：

1. 環境變量 `VITE_BRANCH_TYPE`
2. URL 路徑或主機名
3. URL 參數 `?branch=english`
4. 本地存儲的偏好設定

### 3. CSS 變量使用

```css
.my-component {
  background-color: var(--color-primary);
  border-color: var(--color-secondary);
  color: var(--color-text-primary);
}
```

### 4. Tailwind 類別生成

```typescript
const { getTailwindClasses } = useTheme();
const classes = getTailwindClasses();

// 使用生成的類別
<button className={classes.primary}>
  主要按鈕
</button>
```

## 🎯 分支特定功能

### Main Branch (通用)
- **主色調**: Sky Blue (`#0ea5e9`)
- **設計風格**: 簡潔專業
- **特殊樣式**: `.branch-pattern` (點狀圖案)

```tsx
import { MainLogo, KnowledgeIcon } from '@/src/themes/icons';

<MainLogo size={32} />
<KnowledgeIcon size={24} />
```

### English Branch (英語)
- **主色調**: Blue (`#3b82f6`) + Emerald (`#10b981`)
- **設計風格**: 國際化溝通
- **特殊樣式**: `.conversation-bubble` (對話氣泡)

```tsx
import { EnglishLogo, ConversationIcon, SpeechIcon } from '@/src/themes/icons';

<div className="conversation-bubble">
  英語對話內容
</div>
```

### Math Branch (數學)
- **主色調**: Violet (`#8b5cf6`) + Cyan (`#06b6d4`)
- **設計風格**: 邏輯精確
- **特殊樣式**: `.formula-block` (公式區塊)

```tsx
import { MathLogo, GeometryIcon, FormulaIcon } from '@/src/themes/icons';

<div className="formula-block">
  數學公式內容
</div>
```

## 🧩 組件使用示例

### 1. 主題切換器

```tsx
import { ThemeSwitcher } from '@/src/themes/ThemeProvider';

<ThemeSwitcher 
  showLabels={true}
  className="my-custom-class"
/>
```

### 2. 分支標識

```tsx
import { BranchBadge } from '@/src/themes/ThemeProvider';

<BranchBadge size="md" />
```

### 3. 動態 Logo

```tsx
import { BranchLogo } from '@/src/themes/icons';

// 自動根據當前分支顯示對應 Logo
<BranchLogo size={40} />

// 或指定特定分支
<BranchLogo branch="english" size={40} />
```

## 🎪 進階使用

### 1. 自定義主題監聽

```typescript
import { themeManager } from '@/src/themes';

const cleanup = themeManager.onThemeChange((branch, theme) => {
  console.log(`主題切換到: ${branch}`, theme);
  // 執行自定義邏輯
});

// 清理監聽器
cleanup();
```

### 2. 主題健康檢查

```typescript
import { checkThemeHealth } from '@/src/themes/init';

const isHealthy = checkThemeHealth();
if (!isHealthy) {
  console.warn('主題系統可能存在問題');
}
```

### 3. 開發模式調試

在開發環境中，可以使用全域調試工具：

```javascript
// 在瀏覽器控制台中
__themeDebug.getCurrentTheme();     // 獲取當前主題
__themeDebug.applyTheme('math');    // 切換主題
__themeDebug.showCSS();             // 顯示CSS變量表格
__themeDebug.checkHealth();         // 健康檢查
```

## 📱 響應式設計

### 斷點系統

```css
/* 手機端 */
@media (max-width: 640px) {
  /* 調整字體大小和間距 */
}

/* 平板端 */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 中等尺寸調整 */
}

/* 桌面端 */
@media (min-width: 1025px) {
  /* 完整功能展示 */
}
```

### 響應式組件

```tsx
const MyResponsiveComponent = () => {
  const { styles } = useBranchTheme();
  
  return (
    <div className={`
      flex flex-col space-y-4
      sm:flex-row sm:space-y-0 sm:space-x-4
      md:max-w-4xl md:mx-auto
      lg:px-8
      ${styles.cardBorder}
    `}>
      內容
    </div>
  );
};
```

## ♿ 無障礙設計

### 1. 高對比度支援

系統自動支援 `prefers-contrast: high` 媒體查詢。

### 2. 減少動畫

系統自動支援 `prefers-reduced-motion: reduce` 媒體查詢。

### 3. 色彩無障礙

所有主題色彩都經過對比度檢查，確保符合 WCAG 標準。

### 4. 螢幕閱讀器

```tsx
<button aria-label="切換到英語學習主題">
  <EnglishIcon />
</button>
```

## 🔍 故障排除

### 常見問題

1. **主題沒有正確應用**
   ```typescript
   // 檢查主題管理器是否正確初始化
   import '@/src/themes/init';
   ```

2. **CSS 變量未定義**
   ```css
   /* 確保基礎樣式已載入 */
   @import '@/src/themes/base.css';
   ```

3. **分支檢測不正確**
   ```typescript
   // 手動設定分支
   themeManager.applyBranchTheme('english');
   ```

### 調試步驟

1. 打開瀏覽器開發者工具
2. 檢查 `document.documentElement.className` 是否包含 `theme-*`
3. 檢查 CSS 變量是否正確設定
4. 使用 `__themeDebug` 工具進行診斷

## 🚀 性能優化

### 1. 主題切換優化

- 使用 CSS 變量實現即時切換
- 避免重新渲染整個組件樹
- 利用 CSS 過渡動畫提升體驗

### 2. 資源載入優化

- 字體預載入
- CSS 變量快取
- 圖標按需載入

### 3. 構建優化

- CSS 變量在構建時保持動態
- Tree-shaking 移除未使用的圖標
- 主題相關代碼單獨打包

## 📈 最佳實踐

### 1. 組件設計

```tsx
// ✅ 好的做法
const GoodComponent = () => {
  const { styles, theme } = useBranchTheme();
  
  return (
    <div 
      className={styles.cardBorder}
      style={{ 
        backgroundColor: theme.surface,
        color: theme.text.primary 
      }}
    >
      內容
    </div>
  );
};

// ❌ 避免的做法
const BadComponent = () => {
  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      硬編碼顏色
    </div>
  );
};
```

### 2. 樣式組織

```css
/* ✅ 使用CSS變量 */
.my-component {
  background: var(--color-surface);
  border: 1px solid var(--color-primary);
}

/* ❌ 硬編碼顏色 */
.bad-component {
  background: #ffffff;
  border: 1px solid #0ea5e9;
}
```

### 3. 條件樣式

```tsx
const ConditionalComponent = () => {
  const { branch } = useBranchTheme();
  
  return (
    <div className={`
      base-styles
      ${branch === 'english' ? 'conversation-bubble' : ''}
      ${branch === 'math' ? 'formula-block' : ''}
    `}>
      內容
    </div>
  );
};
```

## 🔮 未來擴展

### 計劃中的功能

1. **深色模式支援**
2. **自定義主題編輯器**
3. **主題動畫效果**
4. **A/B 測試支援**
5. **用戶個性化設定**

### 擴展接口

```typescript
// 為未來功能預留的接口
interface FutureThemeFeatures {
  darkMode: boolean;
  customColors: Record<string, string>;
  animations: AnimationConfig;
  userPreferences: UserThemePreferences;
}
```

---

**總結**: 主題系統提供了完整的分支差異化解決方案，支援動態切換、無障礙設計和性能優化。遵循本指南可以確保一致的用戶體驗和維護性。