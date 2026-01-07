# AI 學習頁面產生器 - 策略改良計畫

> **版本**: 1.1  
> **日期**: 2025-01-07  
> **目標**: 使專案更能服務多樣化教學需求，提升系統可維護性與整合能力  
> **範圍**: 純前端方案，聚焦台灣 108 課綱  
> **相關文件**: [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) (技術債務實施計畫)

---

## 執行摘要

本計畫基於以下深度分析制定：

- **架構分析**: 完整審視專案結構、服務層、元件設計
- **內容生成系統**: AI 整合模式、Prompt 工程、驗證機制
- **UI/UX 評估**: 使用者旅程、響應式設計、無障礙性
- **業界研究**: EdTech 最佳實踐、類似專案競爭分析、教育標準 (LTI, SCORM, xAPI)
- **外部參考**: Learning Commons (CZI 2025)、1EdTech 標準、Educhain/PageLM 等開源專案

### 核心發現

| 領域         | 現況評分 | 關鍵優勢                              | 關鍵差距                 |
| ------------ | -------- | ------------------------------------- | ------------------------ |
| **AI 架構**  | ★★★★☆    | Provider 模式支援多 AI 後端；並行處理 | 部分生成器缺少 Zod 驗證  |
| **內容生成** | ★★★★☆    | 8 種內容類型；教學法整合              | 無課綱對齊功能           |
| **UI/UX**    | ★★★☆☆    | 即時回饋；視覺一致性                  | 無障礙性待加強；焦點管理 |
| **整合能力** | ★★☆☆☆    | URL/QR 分享                           | 無 LMS 整合；無 PDF 匯出 |
| **角色分流** | ★★☆☆☆    | 基於分享的區隔                        | 無教師儀表板；無班級管理 |

### 競爭定位

> **差異化定位聲明**:  
> 「唯一結合**教學法框架**、**課綱標準對齊**、**師生雙角色介面**，並支援**企業級匯出格式** (SCORM/xAPI) 的開源 AI 教育內容生成器」

---

## 策略主題

### 主題 1: 台灣 108 課綱對齊 (Curriculum Alignment)

讓教師能夠對應**台灣 108 課綱**產生內容，支援數學與英語領域。

- **價值**: 本地機構採用的關鍵；支援教學合規
- **差異化**: 目前無任何開源專案整合台灣課綱標準
- **範圍**: 國中小數學、英語領域

### 主題 2: 角色分流與班級管理 (Role-Based Workflows)

建立獨立的教師/學生體驗，支援持久性學習進度追蹤與分析。

- **價值**: 從內容工具轉型為教學平台
- **差異化**: 多數開源專案僅支援單一角色
- **實作**: 純前端，使用 IndexedDB 本地儲存

### 主題 3: 平台無障礙與包容性 (Accessibility & Inclusivity)

WCAG 2.1 AA 合規、差異化教學支援。

- **價值**: 法律合規；擴大使用者群
- **關鍵**: 博幼基金會服務特殊需求學生

### 主題 4: 內容匯出與可攜性 (Content Portability)

PDF 匯出、SCORM 套件生成（純前端實作）。

- **價值**: 教師可離線使用；支援 LMS 匯入
- **差異化**: 無開源專案支援純前端 SCORM 匯出

### 主題 5: 技術基礎與可維護性 (Technical Foundation)

統一驗證、改進錯誤處理、PWA 離線支援、全面測試覆蓋。

- **價值**: 降低維護成本；提高系統穩定性
- **基礎**: 支撐其他主題的技術先決條件

---

## 分階段路線圖

```
Phase 1: 基礎強化 (0-2 個月) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── 1.1 完成 Zod 驗證遷移 [P0, M] - 部分已完成 (見 IMPROVEMENT_PLAN.md)
├── 1.2 無障礙審計與修復 [P0, M]
├── 1.3 錯誤處理標準化 [P1, S]
└── 1.4 測試覆蓋率擴展 [P2, L]

Phase 2: 功能增強 (2-5 個月) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── 2.1 台灣 108 課綱框架 [P0, XL] ⭐ 差異化關鍵
├── 2.2 教師儀表板與班級管理 [P0, XL] ⭐ 差異化關鍵
├── 2.3 學生進度持久化 [P1, L]
├── 2.4 內容匯出 (PDF, 列印) [P1, M]
└── 2.5 離線內容存取 (PWA) [P2, L] - 偏鄉關鍵

Phase 3: 進階功能 (5-8 個月) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── 3.1 SCORM 套件匯出 (純前端) [P1, L] ⭐ 差異化關鍵
├── 3.2 學習分析儀表板 [P2, L]
└── 3.3 差異化教學支援 [P2, M]
```

**複雜度說明**: S = 1-2 天 | M = 3-5 天 | L = 1-2 週 | XL = 2-4 週

> ⚠️ **注意**: 本計畫為純前端方案，不包含任何需要後端服務的功能（如 LTI 整合、機構部署）

---

## Phase 1: 基礎強化 (0-2 個月)

### 1.1 完成 Zod 驗證遷移

| 屬性       | 值                                                           |
| ---------- | ------------------------------------------------------------ |
| **狀態**   | 🟡 進行中 (見 IMPROVEMENT_PLAN.md Phase 1)                   |
| **優先級** | P0                                                           |
| **複雜度** | M (3-5 天)                                                   |
| **說明**   | 將所有遺留生成器遷移至使用 Zod schema 進行一致的 AI 回應驗證 |

**已完成**:

- ✅ Zod 安裝與設定
- ✅ 核心 schemas 建立 (`services/ai/schemas/`)
- ✅ 驗證函數 (`parseAndValidate`)
- ✅ 測試覆蓋 (39 tests)

**待完成**:

- [ ] 將 `validatedGenerators.ts` 整合到所有調用點
- [ ] 替換所有 `Promise<any>` 為 Zod 推導類型
- [ ] 移除 `basicGenerators.ts` 中的 `as any`

---

### 1.2 無障礙審計與修復

| 屬性         | 值                                                            |
| ------------ | ------------------------------------------------------------- |
| **優先級**   | P0 (法律要求 - 歐洲無障礙法案 2025)                           |
| **複雜度**   | M (3-5 天)                                                    |
| **說明**     | 修復鍵盤導航、螢幕閱讀器支援、焦點管理，達成 WCAG 2.1 AA 合規 |
| **商業價值** | 使學校能採用；法律合規；服務更多學習者                        |

**關鍵修復項目**:

#### A. 記憶卡遊戲鍵盤支援

```typescript
// components/quizTypes/MemoryCardGameQuizItem.tsx
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleCardClick(index);
  }
};

<div
  role="button"
  tabIndex={0}
  aria-label={`卡片 ${index + 1}${flipped ? `: ${card.content}` : ''}`}
  aria-pressed={flipped}
  onKeyDown={(e) => handleKeyDown(e, index)}
>
```

#### B. 句子重組無障礙標籤

```typescript
// components/quizTypes/SentenceScrambleQuizItem.tsx
<button
  aria-label={`將「${word}」加入句子第 ${currentSentence.length + 1} 位置`}
  onClick={() => handleWordClick(word)}
>
```

#### C. 內容載入焦點管理

```typescript
// components/LearningContentDisplay.tsx
const firstSectionRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (content && firstSectionRef.current) {
    firstSectionRef.current.focus();
  }
}, [content]);
```

#### D. ESLint jsx-a11y 插件

```bash
pnpm add -D eslint-plugin-jsx-a11y
```

**成功標準**:

- [ ] 通過 axe-core 自動審計
- [ ] 所有互動元素可用鍵盤操作
- [ ] 螢幕閱讀器可正確讀取所有內容

---

### 1.3 錯誤處理標準化

| 屬性       | 值                                                 |
| ---------- | -------------------------------------------------- |
| **優先級** | P1                                                 |
| **複雜度** | S (1-2 天)                                         |
| **說明**   | 建立統一錯誤類型與使用者友善錯誤顯示，包含恢復動作 |

**錯誤類型定義**:

```typescript
// src/core/errors/index.ts
export enum ErrorCode {
  AI_GENERATION_FAILED = 'AI_001',
  AI_VALIDATION_FAILED = 'AI_002',
  AI_RATE_LIMITED = 'AI_003',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_001',
  NETWORK_OFFLINE = 'NETWORK_001',
  API_KEY_INVALID = 'AUTH_001',
  SHARE_FAILED = 'SHARE_001',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public userMessage: string,
    public recoveryActions?: Array<{ label: string; action: () => void }>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

**錯誤顯示元件**:

```typescript
// components/ErrorDisplay.tsx
const ErrorDisplay: React.FC<{ error: AppError; onDismiss?: () => void }> = ({ error, onDismiss }) => {
  return (
    <div role="alert" className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
      <div className="flex items-start">
        <ExclamationIcon className="h-5 w-5 text-red-500" />
        <div className="ml-3">
          <p className="text-red-700 font-medium">{error.userMessage}</p>
          {error.recoveryActions?.map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className="mt-2 mr-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

### 1.4 測試覆蓋率擴展

| 屬性       | 值                              |
| ---------- | ------------------------------- |
| **優先級** | P2                              |
| **複雜度** | L (1-2 週)                      |
| **說明**   | 將測試覆蓋率從 ~15% 提升至 60%+ |

**覆蓋率設定**:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/node_modules/**', '**/tests/**'],
      thresholds: { lines: 60, functions: 60, branches: 50 },
    },
  },
});
```

**優先測試清單**:
| 服務/函數 | 風險等級 | 優先級 | 需要 Fixture |
|----------|---------|--------|-------------|
| `generateLearningObjectives` | HIGH | P0 | Yes |
| `generateOnlineInteractiveQuizForLevel` | HIGH | P0 | Yes |
| `generateContentBreakdown` | HIGH | P0 | Yes |
| `parseAIResponse` (JSON 清理) | HIGH | P0 | Yes |
| `diagnosticService.generateReport` | MEDIUM | P1 | Yes |
| `jsonbinService.save/load` | MEDIUM | P1 | No (mock) |
| `providerService.selectProvider` | MEDIUM | P1 | No (mock) |

---

## Phase 2: 功能增強 (2-5 個月)

### 2.1 台灣 108 課綱框架 ⭐

| 屬性         | 值                                                      |
| ------------ | ------------------------------------------------------- |
| **優先級**   | P0                                                      |
| **複雜度**   | XL (2-4 週)                                             |
| **說明**     | 讓教師能對應**台灣 108 課綱**產生內容（數學、英語領域） |
| **商業價值** | 本地機構採用的關鍵；支援教學合規                        |
| **差異化**   | 目前無任何開源專案整合台灣課綱標準                      |

**資料結構**:

```typescript
// src/core/types/curriculum.ts
export interface CurriculumStandard {
  id: string; // e.g., "TW108-M-7-n-01"
  subject: Subject;
  gradeLevel: number; // 年級 (1-12)
  stage: Stage; // 學習階段
  competency: string; // 核心素養 (e.g., "數-J-A1")
  indicator: string; // 學習表現 (e.g., "n-Ⅳ-1")
  content: string; // 學習內容
  description: string;
  keywords: string[]; // For AI matching
}

export type Subject = 'math' | 'english';
export type Stage = 'E1' | 'E2' | 'E3' | 'J' | 'S'; // 國小低中高、國中、高中
```

**台灣 108 課綱資料範例**:

```json
// src/data/curriculum/taiwan-108-math.json
{
  "framework": "taiwan-108",
  "subject": "math",
  "version": "2024.1",
  "standards": [
    {
      "id": "TW108-M-7-n-01",
      "gradeRange": { "min": 7, "max": 7 },
      "competency": "數-J-A1",
      "indicator": "n-Ⅳ-1",
      "description": "能理解負數之意義、負數的四則運算",
      "keywords": ["負數", "正負數", "四則運算", "整數", "有理數"]
    },
    {
      "id": "TW108-M-7-n-02",
      "gradeRange": { "min": 7, "max": 7 },
      "competency": "數-J-A2",
      "indicator": "n-Ⅳ-2",
      "description": "能理解絕對值的意義及其運算",
      "keywords": ["絕對值", "數線", "距離"]
    }
  ]
}
```

**AI Prompt 增強**:

```typescript
// services/curriculum/alignmentService.ts
export const buildAlignedPrompt = (
  topic: string,
  standards: CurriculumStandard[]
): string => `
Based on these curriculum standards:
${standards.map(s => `- ${s.id}: ${s.description} (核心素養: ${s.competency})`).join('\n')}

Generate learning objectives for "${topic}" that explicitly address these standards.
Each objective MUST:
1. Align with at least one standard ID
2. Use appropriate Bloom's taxonomy verbs
3. Be measurable and observable

Output JSON: 
[{ 
  "objective": "...", 
  "description": "...", 
  "alignedStandards": ["TW108-M-7-n-01"],
  "bloomLevel": "understand|apply|analyze|evaluate|create"
}]
`;
```

**課綱選擇元件**:

```typescript
// components/StandardsSelector.tsx
const StandardsSelector: React.FC<{
  subject: Subject;
  gradeLevel: number;
  onSelect: (standards: CurriculumStandard[]) => void;
}> = ({ subject, gradeLevel, onSelect }) => {
  const [standards, setStandards] = useState<CurriculumStandard[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTaiwan108Standards(subject, gradeLevel).then(setStandards);
  }, [subject, gradeLevel]);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">選擇對應的 108 課綱指標</h3>
      {standards.map(std => (
        <label key={std.id} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded">
          <input
            type="checkbox"
            checked={selected.has(std.id)}
            onChange={(e) => {
              const newSelected = new Set(selected);
              if (e.target.checked) newSelected.add(std.id);
              else newSelected.delete(std.id);
              setSelected(newSelected);
              onSelect(standards.filter(s => newSelected.has(s.id)));
            }}
          />
          <div>
            <span className="font-mono text-sm text-indigo-600">{std.id}</span>
            <span className="ml-2 text-sm text-slate-600">({std.competency})</span>
            <p className="text-sm text-slate-700">{std.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
};
```

**新增檔案**:

- `src/core/types/curriculum.ts`
- `src/data/curriculum/taiwan-108-math.json`
- `src/data/curriculum/taiwan-108-english.json`
- `services/curriculum/standardsLoader.ts`
- `services/curriculum/alignmentService.ts`
- `components/StandardsSelector.tsx`

---

### 2.2 教師儀表板與班級管理 ⭐

| 屬性         | 值                                           |
| ------------ | -------------------------------------------- |
| **優先級**   | P0                                           |
| **複雜度**   | XL (2-4 週)                                  |
| **說明**     | 統一檢視介面管理教案、追蹤學生提交、檢視分析 |
| **商業價值** | 從內容工具轉型為教學平台；支援進度監控       |

**班級資料結構**:

```typescript
// src/core/types/class.ts
export interface ClassRoom {
  id: string;
  name: string;
  teacherId: string; // localStorage-based identity
  subject: Subject;
  gradeLevel: number;
  students: StudentEntry[];
  assignedContent: AssignedContent[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentEntry {
  id: string;
  name: string;
  resultBinIds: string[]; // JSONBin IDs for their quiz results
  diagnosticReports: string[];
  lastActivity: string;
  totalQuizzes: number;
  averageScore: number;
}

export interface AssignedContent {
  contentBinId: string;
  contentType: 'quiz' | 'writing' | 'interactive';
  assignedAt: string;
  dueDate?: string;
  completedBy: string[]; // Student IDs
}
```

**儀表板結構**:

```typescript
// components/TeacherDashboard/TeacherDashboard.tsx
const TeacherDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-800">教師儀表板</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="plans">
          <TabsList className="mb-6">
            <TabsTrigger value="plans">
              <DocumentIcon className="w-4 h-4 mr-2" />
              我的教案
            </TabsTrigger>
            <TabsTrigger value="classes">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              班級管理
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              學習分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <LessonPlanManager />
          </TabsContent>

          <TabsContent value="classes">
            <ClassManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
```

**班級管理元件**:

```typescript
// components/TeacherDashboard/ClassManager.tsx
const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);

  const handleAddStudentResult = async (classId: string, resultUrl: string) => {
    // 從 URL 提取 binId
    const url = new URL(resultUrl);
    const binId = url.searchParams.get('binId');
    if (!binId) return;

    // 獲取結果內容以提取學生名稱
    const resultData = await getLearningContent(binId);
    const studentName = resultData.studentName || '未命名學生';

    await classService.addStudentResult(classId, studentName, binId);
    // 刷新班級資料
    refreshClass(classId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 班級列表 */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">我的班級</h2>
          <button onClick={handleCreateClass} className="btn-primary">
            新增班級
          </button>
        </div>
        {classes.map(c => (
          <ClassCard
            key={c.id}
            classroom={c}
            isSelected={selectedClass?.id === c.id}
            onClick={() => setSelectedClass(c)}
          />
        ))}
      </div>

      {/* 班級詳情 */}
      <div className="lg:col-span-2">
        {selectedClass ? (
          <ClassDetail
            classroom={selectedClass}
            onAddResult={handleAddStudentResult}
          />
        ) : (
          <EmptyState message="選擇一個班級查看詳情" />
        )}
      </div>
    </div>
  );
};
```

---

### 2.4 內容匯出 (PDF, 列印)

| 屬性       | 值                           |
| ---------- | ---------------------------- |
| **優先級** | P1                           |
| **複雜度** | M (3-5 天)                   |
| **說明**   | 將教案和測驗匯出為可列印 PDF |

**技術選項比較**:

| 方案                  | 優點                 | 缺點                 | 推薦度 |
| --------------------- | -------------------- | -------------------- | ------ |
| `@react-pdf/renderer` | React 原生；精確控制 | 學習曲線；需重寫樣式 | ★★★★☆  |
| `html2pdf.js`         | 簡單；保留現有樣式   | 分頁控制較差         | ★★★☆☆  |
| `@media print` CSS    | 零依賴；原生支援     | 僅列印；無 PDF 檔案  | ★★☆☆☆  |

**推薦實作**: `@react-pdf/renderer` + `@media print` 混合方案

```typescript
// services/pdfExportService.ts
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

export const generateLessonPlanPDF = async (content: ExtendedLearningContent): Promise<Blob> => {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{content.topic}</Text>
          <Text style={styles.subtitle}>AI 學習頁面產生器</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>學習目標</Text>
          {content.learningObjectives.map((obj, i) => (
            <View key={i} style={styles.objective}>
              <Text style={styles.objectiveText}>
                {i + 1}. {obj.objective}
              </Text>
              <Text style={styles.description}>{obj.description}</Text>
            </View>
          ))}
        </View>

        {/* 更多區塊... */}
      </Page>
    </Document>
  );

  return await pdf(doc).toBlob();
};
```

---

### 2.5 離線內容存取 (PWA)

| 屬性         | 值                                                 |
| ------------ | -------------------------------------------------- |
| **優先級**   | P2                                                 |
| **複雜度**   | L (1-2 週)                                         |
| **說明**     | 無網路時可檢視已生成內容；排隊生成請求             |
| **商業價值** | 支援網路不佳地區（**博幼基金會偏鄉計畫關鍵需求**） |

**技術實作**:

```bash
pnpm add -D vite-plugin-pwa workbox-precaching workbox-routing workbox-strategies
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        name: 'AI 學習頁面產生器',
        short_name: 'AI-LearnGen',
        description: 'AI 驅動的教育內容生成工具',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
```

**Service Worker**:

```typescript
// src/sw.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// 預快取建置資源
precacheAndRoute(self.__WB_MANIFEST);

// 快取 JSONBin API 回應（教案內容）
registerRoute(
  ({ url }) => url.hostname === 'api.jsonbin.io',
  new NetworkFirst({
    cacheName: 'jsonbin-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          // 只快取成功回應
          return response?.status === 200 ? response : null;
        },
      },
    ],
  })
);

// 快取靜態資源
registerRoute(
  ({ request }) =>
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style',
  new CacheFirst({ cacheName: 'static-assets', maxEntries: 100 })
);
```

**離線指示器**:

```typescript
// components/OfflineIndicator.tsx
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 z-50"
    >
      <WifiOffIcon className="inline w-4 h-4 mr-2" />
      離線模式 - 僅可查看已儲存的教案
    </div>
  );
};
```

---

## Phase 3: 進階功能 (5-8 個月)

> ✅ **純前端方案** - 不需要後端服務

### 3.1 SCORM 套件匯出 (純前端) ⭐

| 屬性       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| **優先級** | P1                                                   |
| **複雜度** | L (1-2 週)                                           |
| **說明**   | 純前端生成 SCORM 1.2 相容套件，支援所有主流 LMS 匯入 |
| **差異化** | **無任何開源專案提供純前端 SCORM 匯出功能**          |

**技術實作** (使用 JSZip 純前端打包):

```typescript
// services/scormExportService.ts
import JSZip from 'jszip';

export const generateSCORMPackage = async (
  quiz: OnlineInteractiveQuiz,
  topic: string
): Promise<Blob> => {
  const zip = new JSZip();

  // 1. imsmanifest.xml - SCORM 1.2 格式
  zip.file('imsmanifest.xml', generateManifest(topic));

  // 2. 測驗內容 JSON
  zip.file('content/questions.json', JSON.stringify(quiz));

  // 3. 啟動頁面 (嵌入式測驗播放器)
  zip.file('index.html', generateLaunchPage(topic));

  // 4. SCORM API 包裝器 (與 LMS 通訊)
  zip.file('scorm-api.js', SCORM_API_WRAPPER);

  // 5. 測驗邏輯
  zip.file('quiz.js', generateQuizPlayer());

  // 6. 樣式
  zip.file('styles.css', QUIZ_STYLES);

  return await zip.generateAsync({ type: 'blob' });
};

const generateManifest = (
  topic: string
) => `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="AI-LearnGen-Quiz" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>${topic} - AI 學習測驗</title>
      <item identifier="item1" identifierref="res1">
        <title>${topic}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="quiz.js"/>
      <file href="scorm-api.js"/>
      <file href="styles.css"/>
      <file href="content/questions.json"/>
    </resource>
  </resources>
</manifest>`;
```

**SCORM 套件結構**:

```
quiz_package.zip
├── imsmanifest.xml       # SCORM manifest
├── index.html            # Launch page
├── quiz.js               # Quiz logic (embedded player)
├── scorm-api.js          # SCORM API wrapper
├── styles.css            # Styling
└── content/
    └── questions.json    # Quiz data
```

---

### 3.2 學習分析儀表板

| 屬性       | 值                                     |
| ---------- | -------------------------------------- |
| **優先級** | P2                                     |
| **複雜度** | L (1-2 週)                             |
| **說明**   | 視覺化學生表現數據，識別學習趨勢與弱點 |

**功能範圍** (純前端，基於本地儲存數據):

- 班級平均分數趨勢圖
- 題型正確率分佈
- 學生進步追蹤
- 常見錯誤模式識別

---

### 3.3 差異化教學支援

| 屬性       | 值                                           |
| ---------- | -------------------------------------------- |
| **優先級** | P2                                           |
| **複雜度** | M (3-5 天)                                   |
| **說明**   | 支援不同學習需求的學生（學習障礙、資優生等） |

**功能範圍**:

- 可調整字體大小與行距
- 高對比模式
- 簡化介面選項
- 延長作答時間設定
- AI 生成不同難度版本的內容

---

## 快速勝利 (Quick Wins)

可立即實施的低成本高影響項目：

| #   | 功能               | 工時 | 影響 | 實作說明                                         |
| --- | ------------------ | ---- | ---- | ------------------------------------------------ |
| 1   | **記憶卡鍵盤支援** | 2h   | 高   | 在 `MemoryCardGameQuizItem.tsx` 加入 `onKeyDown` |
| 2   | **列印樣式**       | 2h   | 中   | 在 `index.css` 加入 `@media print` 規則          |
| 3   | **骨架載入器**     | 3h   | 中   | 用 Skeleton 取代內容區塊的 Spinner               |
| 4   | **測驗嘗試計數**   | 1h   | 低   | 顯示「嘗試 2/3」於測驗介面                       |
| 5   | **難度偏好保存**   | 30m  | 低   | 將上次難度存入 localStorage                      |
| 6   | **導航確認**       | 1h   | 中   | 未完成測驗時 `beforeunload` 警告                 |
| 7   | **可操作錯誤訊息** | 2h   | 中   | 錯誤顯示加入重試按鈕                             |
| 8   | **焦點管理**       | 2h   | 高   | 內容載入完成後自動聚焦第一區塊                   |

**總計**: ~14 小時

---

## 架構建議

### 建議的服務層結構

```
services/
├── ai/                          # AI 生成 (現有，重構後)
│   ├── generators/              # 按類型分類的生成器
│   │   ├── learningObjectives.ts
│   │   ├── contentBreakdown.ts
│   │   ├── quizzes.ts
│   │   └── index.ts
│   ├── schemas/                 # Zod schemas (現有)
│   ├── validation/              # 驗證工具 (現有)
│   └── prompts/                 # 提取的 Prompt 模板
│       ├── basePrompts.ts
│       └── curriculumPrompts.ts
├── storage/                     # 整合持久化
│   ├── lessonPlanStorage.ts     # (現有)
│   ├── studentProgressStorage.ts  # 新增
│   ├── classManagementStorage.ts  # 新增
│   └── settingsStorage.ts
├── sharing/                     # 雲端 + 匯出
│   ├── jsonbinService.ts        # (現有)
│   ├── pdfExportService.ts      # 新增
│   └── scormExportService.ts    # Phase 3
├── curriculum/                  # 新增: 標準對齊
│   ├── standardsLoader.ts
│   ├── alignmentService.ts
│   └── data/
│       ├── taiwan-108-math.json
│       └── taiwan-108-english.json
└── analytics/                   # 新增: 學習分析
    ├── diagnosticService.ts     # (現有，移動至此)
    └── aggregationService.ts
```

### 類型系統建議

- 持續遷移至 `src/core/types/`
- 使用 Zod schemas 作為唯一真實來源（推導 TypeScript 類型）
- 新增領域特定類型檔案：
  - `src/core/types/curriculum.ts`
  - `src/core/types/class.ts`
  - `src/core/types/analytics.ts`

---

## 競爭分析摘要

### 與主要開源專案比較

| 功能             | AI Page Gen | Educhain  | PageLM    | EduAid    | kvizAI |
| ---------------- | ----------- | --------- | --------- | --------- | ------ |
| **多題型支援**   | ✅ (6 種)   | ✅ (4 種) | ⚠️ (3 種) | ⚠️ (1 種) | ⚠️     |
| **多 AI 支援**   | ✅          | ✅        | ✅        | ⚠️        | ✅     |
| **教案生成**     | ✅          | ✅        | ❌        | ❌        | ❌     |
| **教學法框架**   | ⚠️          | ✅ (8 種) | ❌        | ❌        | ❌     |
| **課綱對齊**     | ❌ → ✅     | ❌        | ❌        | ❌        | ❌     |
| **師生角色分流** | ⚠️ → ✅     | ❌        | ⚠️        | ⚠️        | ⚠️     |
| **SCORM/xAPI**   | ❌ → ✅     | ❌        | ❌        | ❌        | ❌     |
| **內容分享**     | ✅          | ❌        | ⚠️        | ⚠️        | ❌     |
| **學習診斷**     | ✅          | ❌        | ❌        | ❌        | ❌     |
| **離線支援**     | ❌ → ✅     | ❌        | ✅        | ❌        | ✅     |

**圖例**: ✅ 完整實現 | ⚠️ 部分/基本 | ❌ 未實現 | → 計畫中

### 市場時機優勢

- **6-12 個月窗口期**：在競爭者填補差距前搶佔市場
- **Learning Commons 整合**：2025 年最具潛力的 EdTech 基礎設施
- **SCORM/xAPI 缺口**：無開源專案提供此功能

---

## 風險評估

| 風險                       | 機率 | 影響 | 緩解措施                                      |
| -------------------------- | ---- | ---- | --------------------------------------------- |
| **LTI 整合複雜度**         | 高   | 高   | 使用認證庫 (ltijs)；從 LTI Advantage 子集開始 |
| **AI Prompt 變更破壞內容** | 中   | 高   | 維護 Prompt 回歸測試；版本化 Prompts          |
| **課綱資料維護**           | 高   | 中   | 與博幼基金會合作更新；社群貢獻                |
| **多語言 Prompt 品質**     | 中   | 中   | 各語言徹底測試；維護語言特定變體              |
| **PWA 快取問題**           | 中   | 低   | 版本化快取策略；手動清除選項                  |
| **範圍蔓延**               | 高   | 高   | 嚴格階段關卡；階段間使用者回饋驗證            |
| **後端需求延遲 Phase 3**   | 中   | 中   | 提前評估後端選項；考慮 BaaS 方案              |

---

## 成功指標

### Phase 1 完成標準 (0-3 個月)

- [ ] 100% AI 生成器使用 Zod 驗證
- [ ] 通過 WCAG 2.1 AA 自動審計 (axe-core)
- [ ] UI 支援 zh-TW 和 en-US
- [ ] 測試覆蓋率 ≥60% (CI 強制)
- [ ] 錯誤率降低 50%

### Phase 2 完成標準 (3-6 個月)

- [ ] 台灣 108 數學/英語課綱可用
- [ ] 80% 活躍使用者採用教師儀表板
- [ ] PDF 匯出支援所有內容類型
- [ ] PWA 可安裝並支援離線檢視
- [ ] 至少 3 個班級使用班級管理功能

### Phase 3 完成標準 (6-12 個月)

- [ ] LTI 1.3 整合通過 Canvas/Moodle 測試
- [ ] 至少 1 個機構使用集中式部署
- [ ] SCORM 套件在 3+ LMS 平台驗證通過

---

## 待決定問題

1. **優先級平衡**: 應先優先 **無障礙合規** (P0 法律) 還是 **課綱對齊** (P0 採用)?
   - 建議: 並行進行，無障礙為持續性任務

2. **後端決策**: Phase 3 功能需要後端，偏好哪種？
   - 選項 A: 輕量 Node.js 服務 (自託管) - 完全控制
   - 選項 B: BaaS 方案 (Supabase, Firebase) - 快速上線
   - 選項 C: 延後所有需後端的功能 - 聚焦前端

3. **課綱範圍**: 哪些課綱框架優先級最高？
   - 台灣 108 (本地市場) - **建議首選**
   - Common Core (美國市場)
   - IB (國際學校)

4. **資源配置**: 考慮複雜度估計，實際可行的時程？
   - 積極: 3-6-12 個月 (如計畫)
   - 穩健: 6-9-18 個月 (含緩衝)
   - 保守: 僅聚焦 Phase 1-2

5. **Quick Wins**: 是否立即開始實施 8 項快速勝利？
   - 建議: 是，可與 Phase 1 並行

---

## 後續步驟建議

### 立即執行 (本週)

1. ✅ 開始 Quick Wins 實施 (8 項，~14 小時)
2. ✅ 完成 IMPROVEMENT_PLAN.md Phase 2 (服務層測試)
3. ✅ 進行無障礙審計 (axe-core + 手動測試)

### 短期執行 (本月)

4. 完成 Phase 1.2 無障礙修復
5. 開始 Phase 1.3 i18n 框架
6. 與博幼基金會討論課綱優先級

### 中期規劃 (下季)

7. 開始 Phase 2.1 課綱標準框架
8. 開始 Phase 2.2 教師儀表板
9. 評估後端選項 (為 Phase 3 準備)

---

_本計畫可直接轉換為 GitHub Issues 或作為專案文件使用。_

**相關文件**:

- [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) - 技術債務實施計畫 (Phase 0-1 已完成)
- [CLAUDE.md](./CLAUDE.md) - 開發指南
- [README.md](./README.md) - 專案概述
