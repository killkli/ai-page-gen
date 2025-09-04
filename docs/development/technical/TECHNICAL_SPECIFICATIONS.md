# 技術實作規範

## 🏗️ 系統架構設計

### 整體架構原則
1. **模組化設計**: 核心功能可被三個分支共享和擴展
2. **配置驅動**: 通過配置文件控制不同分支的行為差異
3. **漸進式增強**: 基礎功能穩定，專業功能逐步添加
4. **向後兼容**: 確保現有功能在新架構下正常運行

---

## 📂 新架構目錄結構

```
ai-page-gen/
├── src/                          # 源代碼根目錄
│   ├── core/                     # 🔷 共享核心模組
│   │   ├── types/
│   │   │   ├── base.ts           # 基礎類型定義
│   │   │   ├── english.ts        # 英文特殊類型
│   │   │   ├── math.ts           # 數學特殊類型
│   │   │   └── index.ts          # 類型導出入口
│   │   ├── services/
│   │   │   ├── geminiCore.ts     # AI服務核心抽象
│   │   │   ├── storageCore.ts    # 存儲服務核心
│   │   │   ├── apiCore.ts        # API通用服務
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── helpers.ts        # 通用工具函數
│   │   │   ├── constants.ts      # 共享常數
│   │   │   ├── validators.ts     # 數據驗證
│   │   │   └── index.ts
│   │   └── hooks/
│   │       ├── useCore.ts        # 核心React Hooks
│   │       └── index.ts
│   ├── config/                   # 🔧 分支配置
│   │   ├── base.config.ts        # 基礎配置
│   │   ├── main.config.ts        # 通用分支配置
│   │   ├── english.config.ts     # 英文分支配置
│   │   ├── math.config.ts        # 數學分支配置
│   │   └── index.ts
│   ├── themes/                   # 🎨 主題與樣式
│   │   ├── base/                 # 基礎主題
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── components.ts
│   │   ├── english/              # 英文學習主題
│   │   │   ├── colors.ts
│   │   │   ├── components.ts
│   │   │   └── assets/
│   │   ├── math/                 # 數學學習主題
│   │   │   ├── colors.ts
│   │   │   ├── components.ts
│   │   │   └── assets/
│   │   └── index.ts
│   ├── components/               # 🧩 組件庫
│   │   ├── core/                 # 核心共享組件
│   │   │   ├── Layout/
│   │   │   ├── Forms/
│   │   │   ├── Navigation/
│   │   │   └── index.ts
│   │   ├── english/              # 英文特化組件
│   │   │   ├── VoiceRecorder/
│   │   │   ├── VocabularyCard/
│   │   │   ├── PronunciationTrainer/
│   │   │   └── index.ts
│   │   ├── math/                 # 數學特化組件
│   │   │   ├── FormulaRenderer/
│   │   │   ├── GraphPlotter/
│   │   │   ├── Calculator/
│   │   │   └── index.ts
│   │   └── legacy/               # 舊版組件 (逐步遷移)
│   ├── services/                 # 🔌 專業化服務
│   │   ├── english/
│   │   │   ├── speechService.ts
│   │   │   ├── vocabularyService.ts
│   │   │   └── index.ts
│   │   ├── math/
│   │   │   ├── mathRenderService.ts
│   │   │   ├── calculationService.ts
│   │   │   └── index.ts
│   │   └── shared/               # 舊版服務 (逐步重構)
│   ├── pages/                    # 📄 頁面組件
│   │   ├── MainApp.tsx           # 主應用入口
│   │   ├── EnglishApp.tsx        # 英文應用入口
│   │   ├── MathApp.tsx           # 數學應用入口
│   │   └── shared/               # 共享頁面
│   └── assets/                   # 🖼️ 靜態資源
│       ├── images/
│       │   ├── common/
│       │   ├── english/
│       │   └── math/
│       └── fonts/
├── docs/                         # 📚 文檔
├── tests/                        # 🧪 測試文件
├── scripts/                      # 🛠️ 構建腳本
└── deploy/                       # 🚀 部署配置
```

---

## 🔷 核心模組設計

### 1. 類型系統重構 (`core/types/`)

#### base.ts - 基礎類型
```typescript
// 通用學習內容基礎結構
export interface BaseLearningContent {
  id: string;
  topic: string;
  createdAt: string;
  lastModified: string;
  metadata: ContentMetadata;
}

// 通用測驗基礎結構
export interface BaseQuizQuestion {
  id: string;
  type: QuizType;
  difficulty: DifficultyLevel;
  topic: string;
  points: number;
}

// 通用用戶互動記錄
export interface BaseUserInteraction {
  userId?: string;
  sessionId: string;
  action: InteractionType;
  timestamp: number;
  context: Record<string, any>;
}
```

#### english.ts - 英文專業類型
```typescript
import { BaseLearningContent, BaseQuizQuestion } from './base';

// 英語技能類型
export type EnglishSkillType = 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary';

// CEFR等級
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// 語音相關
export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  accuracy: number;
  pronunciationScore: number;
  timing: number;
}

// 詞彙管理
export interface VocabularyItem {
  word: string;
  pronunciation: string;
  meanings: VocabularyMeaning[];
  cefrLevel: CEFRLevel;
  frequency: number;
  contexts: string[];
  learned: boolean;
  reviewCount: number;
  lastReviewed?: string;
}

// 英文學習內容
export interface EnglishLearningContent extends BaseLearningContent {
  skillFocus: EnglishSkillType[];
  targetLevel: CEFRLevel;
  vocabulary: VocabularyItem[];
  pronunciation: PronunciationGuide[];
  culturalNotes: CulturalNote[];
}
```

#### math.ts - 數學專業類型  
```typescript
import { BaseLearningContent, BaseQuizQuestion } from './base';

// 數學領域類型
export type MathDomain = 'algebra' | 'geometry' | 'calculus' | 'statistics' | 'trigonometry' | 'discrete';

// 數學概念節點
export interface MathConcept {
  id: string;
  name: string;
  domain: MathDomain;
  prerequisites: string[];
  description: string;
  difficulty: number;
  keywords: string[];
}

// 數學表達式
export interface MathExpression {
  latex: string;
  ascii: string;
  description: string;
  variables: Variable[];
}

// 幾何圖形
export interface GeometricShape {
  type: 'point' | 'line' | 'circle' | 'polygon' | 'curve';
  coordinates: number[][];
  properties: Record<string, any>;
  labels: string[];
}

// 數學學習內容
export interface MathLearningContent extends BaseLearningContent {
  domain: MathDomain;
  concepts: MathConcept[];
  expressions: MathExpression[];
  visualizations: GeometricShape[];
  proofSteps: ProofStep[];
}
```

### 2. 服務層抽象 (`core/services/`)

#### geminiCore.ts - AI服務核心
```typescript
export abstract class BaseGeminiService {
  protected apiKey: string;
  protected model: string;
  
  constructor(apiKey: string, model = 'gemini-2.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  // 通用AI調用方法
  protected async callGemini(prompt: string, options?: AICallOptions): Promise<any> {
    // 實現通用的AI調用邏輯
    // 包含錯誤處理、重試機制、響應解析
  }

  // 抽象方法，由子類實現
  abstract generateLearningContent(topic: string, options: any): Promise<any>;
  abstract generateQuiz(content: any, options: any): Promise<any>;
  abstract provideFeedback(userResponse: any, correctAnswer: any): Promise<any>;
}

// 英文專業服務
export class EnglishGeminiService extends BaseGeminiService {
  async generateLearningContent(topic: string, options: EnglishOptions) {
    // 英文特化的內容生成邏輯
  }
  
  async generateVocabularyList(text: string, level: CEFRLevel) {
    // 詞彙提取和分級
  }
  
  async evaluatePronunciation(audio: Blob, targetText: string) {
    // 發音評估 (可能需要額外的語音服務)
  }
}

// 數學專業服務
export class MathGeminiService extends BaseGeminiService {
  async generateLearningContent(topic: string, options: MathOptions) {
    // 數學特化的內容生成邏輯
  }
  
  async generateMathProblems(concept: MathConcept, count: number) {
    // 數學題目生成
  }
  
  async validateMathSolution(problem: string, solution: string) {
    // 數學解答驗證
  }
}
```

### 3. 配置系統 (`config/`)

#### base.config.ts - 基礎配置
```typescript
export interface BaseConfig {
  app: {
    name: string;
    version: string;
    description: string;
  };
  api: {
    geminiModel: string;
    timeout: number;
    retryAttempts: number;
  };
  ui: {
    theme: string;
    language: string;
    animations: boolean;
  };
  features: {
    enabled: string[];
    experimental: string[];
  };
}
```

#### english.config.ts - 英文分支配置
```typescript
import { BaseConfig } from './base.config';

export interface EnglishConfig extends BaseConfig {
  english: {
    defaultCEFRLevel: CEFRLevel;
    speechRecognition: {
      language: string;
      confidence: number;
      timeout: number;
    };
    tts: {
      voice: string;
      rate: number;
      pitch: number;
    };
    vocabulary: {
      dailyGoal: number;
      reviewInterval: number[];
    };
  };
}

export const englishConfig: EnglishConfig = {
  // 繼承基礎配置並添加英文特有配置
  ...baseConfig,
  app: {
    ...baseConfig.app,
    name: 'AI English Learning Generator',
    description: '專業英語教學與學習平台',
  },
  english: {
    defaultCEFRLevel: 'B1',
    speechRecognition: {
      language: 'en-US',
      confidence: 0.7,
      timeout: 5000,
    },
    // ... 其他英文特有配置
  },
};
```

### 4. 主題系統 (`themes/`)

#### english/colors.ts - 英文主題色彩
```typescript
export const englishColors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  accent: {
    speaking: '#f59e0b',  // 口說練習
    listening: '#8b5cf6', // 聽力練習
    reading: '#06b6d4',   // 閱讀理解
    writing: '#ef4444',   // 寫作練習
  },
};
```

#### math/colors.ts - 數學主題色彩
```typescript
export const mathColors = {
  primary: {
    50: '#fdf4ff',
    500: '#a855f7',
    600: '#9333ea',
    900: '#581c87',
  },
  secondary: {
    50: '#fff7ed',
    500: '#f97316',
    600: '#ea580c',
  },
  accent: {
    algebra: '#10b981',    // 代數
    geometry: '#f59e0b',   // 幾何
    calculus: '#ef4444',   // 微積分
    statistics: '#06b6d4', // 統計
  },
};
```

---

## 🔧 開發工具與流程

### Git 分支策略

```bash
# 主要分支
main                 # 通用版本生產分支
stable-backup       # 安全備份分支

# 開發分支
develop             # 開發整合分支
feature/english-specialized   # 英文特化開發
feature/math-specialized     # 數學特化開發

# 功能分支 (從相應的特化分支分出)
feature/english-voice-recognition
feature/english-vocabulary-system
feature/math-formula-renderer  
feature/math-interactive-tools

# 修復分支
hotfix/critical-bug-fix
hotfix/security-patch
```

### 建置與部署流程

#### 多分支部署策略
```yaml
# .github/workflows/deploy-branches.yml
name: Multi-Branch Deployment

on:
  push:
    branches: 
      - main
      - feature/english-specialized
      - feature/math-specialized

jobs:
  deploy-main:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to main site
        env:
          BASE_URL: '/ai-page-gen/'
          TARGET_BRANCH: 'main'
        run: |
          npm run build
          npm run deploy:main

  deploy-english:
    if: github.ref == 'refs/heads/feature/english-specialized'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to English site
        env:
          BASE_URL: '/ai-page-gen-english/'
          TARGET_BRANCH: 'english-gh-pages'
        run: |
          npm run build:english
          npm run deploy:english

  deploy-math:
    if: github.ref == 'refs/heads/feature/math-specialized'  
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Math site
        env:
          BASE_URL: '/ai-page-gen-math/'
          TARGET_BRANCH: 'math-gh-pages'
        run: |
          npm run build:math
          npm run deploy:math
```

### 套件管理策略

#### 分支特定依賴
```json
{
  "dependencies": {
    // 通用核心依賴
    "@google/genai": "^1.6.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.2"
  },
  "optionalDependencies": {
    // 英文分支特定
    "react-speech-kit": "^3.0.1",
    "web-speech-cognitive-services": "^7.0.0",
    
    // 數學分支特定  
    "katex": "^0.16.8",
    "mathjs": "^11.5.0",
    "plotly.js": "^2.26.0",
    "react-plotly.js": "^2.6.0"
  }
}
```

### 測試策略

#### 多層次測試架構
```typescript
// tests/core/ - 核心功能測試
// tests/english/ - 英文功能測試  
// tests/math/ - 數學功能測試
// tests/integration/ - 整合測試
// tests/e2e/ - 端到端測試

// 測試配置
export const testConfig = {
  // 通用測試
  core: {
    unit: ['src/core/**/*.test.ts'],
    integration: ['tests/integration/core/*.test.ts'],
  },
  
  // 英文分支測試
  english: {
    unit: ['src/services/english/**/*.test.ts'],
    integration: ['tests/integration/english/*.test.ts'],
    e2e: ['tests/e2e/english/*.spec.ts'],
  },
  
  // 數學分支測試
  math: {
    unit: ['src/services/math/**/*.test.ts'],
    integration: ['tests/integration/math/*.test.ts'],
    e2e: ['tests/e2e/math/*.spec.ts'],
  },
};
```

---

## 📊 性能與監控

### 性能目標
- **首頁加載時間**: < 3秒
- **功能響應時間**: < 500ms  
- **記憶體使用**: < 100MB
- **包體積**: < 2MB (gzipped)

### 監控指標
```typescript
// 分支特定性能監控
export const performanceMetrics = {
  main: {
    bundleSize: '1.8MB',
    loadTime: '2.1s',
    interactiveTime: '2.8s',
  },
  english: {
    bundleSize: '2.2MB', // 包含語音功能
    loadTime: '2.4s',
    speechRecognitionLatency: '150ms',
  },
  math: {
    bundleSize: '2.5MB', // 包含數學渲染
    loadTime: '2.6s',
    formulaRenderTime: '80ms',
  },
};
```

### 錯誤監控與日誌
```typescript
// 分支特定錯誤追蹤
export class BranchErrorTracker {
  static track(error: Error, branch: 'main' | 'english' | 'math', context: any) {
    const errorData = {
      branch,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // 發送到監控服務
    this.sendToMonitoring(errorData);
  }
}
```

---

## 🔒 安全性考量

### API 密鑰管理
- 不同分支可以使用不同的API配額
- 實作密鑰輪替機制
- 分支特定的使用限制

### 用戶數據隔離
- 英文學習數據與數學學習數據分別儲存
- 實作數據遷移和同步機制
- 隱私設置按分支管理

### 內容安全策略
```typescript
// 分支特定的CSP設置
export const cspConfig = {
  main: {
    'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'"],
  },
  english: {
    'script-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://speech-api.microsoft.com'],
    'media-src': ["'self'", 'blob:', 'data:'],
  },
  math: {
    'script-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://cdn.plot.ly'],
    'img-src': ["'self'", 'data:', 'https://latex.codecogs.com'],
  },
};
```

---

這個技術規範提供了完整的架構重構指南，確保三個分支能夠：
1. **共享核心功能**維持代碼一致性
2. **專業化擴展**滿足不同領域需求  
3. **獨立部署**避免相互影響
4. **統一維護**降低長期維護成本