# English Learning Branch - 功能規劃

## 🎯 分支概覽

**分支名稱**: `feature/english-specialized`  
**部署URL**: `https://killkli.github.io/ai-page-gen-english/`  
**目標用戶**: 英語學習者、英語教師、教育機構  
**核心價值**: 提供專業、全面的英語學習與教學解決方案  

---

## 🔤 核心功能模組

### 1. 四技能整合練習系統

#### 🎧 聽力練習 (Listening)
**功能特色**:
- **多層次聽力材料**: 根據CEFR等級提供A1-C2的聽力內容
- **互動式聽寫**: 邊聽邊寫，即時反饋
- **語速控制**: 0.5x - 2.0x 可調節播放速度
- **重複播放**: 句子級、段落級重複功能
- **聽力理解測驗**: 選擇題、填空題、判斷題

**技術實現**:
```typescript
// 聽力練習組件
export interface ListeningExercise {
  id: string;
  title: string;
  audioUrl: string;
  transcript: string;
  cefrLevel: CEFRLevel;
  duration: number; // 秒
  questions: ListeningQuestion[];
  playbackControls: {
    speed: number[];
    repeat: boolean;
    autoPlay: boolean;
  };
}

// 聽力題目類型
export interface ListeningQuestion {
  type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'ordering';
  timeStamp: number; // 對應音頻時間點
  question: string;
  options?: string[];
  correctAnswer: any;
  hints?: string[];
}
```

#### 🗣️ 口說練習 (Speaking)  
**功能特色**:
- **發音評估**: 使用Web Speech API進行發音準確度評分
- **流暢度分析**: 停頓頻率、語速一致性評估
- **角色扮演對話**: AI對話夥伴，模擬真實情境
- **朗讀練習**: 詩歌、文章朗讀，語調訓練
- **錄音回放**: 學習者可重複聽取自己的發音

**技術實現**:
```typescript
// 語音識別服務
export class SpeechRecognitionService {
  private recognition: SpeechRecognition;
  
  async startRecognition(options: SpeechOptions): Promise<VoiceRecognitionResult> {
    // 實現語音識別邏輯
  }
  
  async evaluatePronunciation(
    audioBlob: Blob, 
    targetText: string
  ): Promise<PronunciationScore> {
    // 發音評估算法
  }
}

// 發音評估結果
export interface PronunciationScore {
  overallScore: number; // 0-100
  accuracy: number;     // 發音準確度  
  fluency: number;      // 流暢度
  completeness: number; // 完整度
  wordScores: WordPronunciationScore[];
  suggestions: string[];
}
```

#### 📖 閱讀理解 (Reading)
**功能特色**:
- **分級閱讀材料**: 新聞、故事、學術文章等多樣化內容
- **詞彙標註**: 滑鼠懸停顯示詞彙釋義和發音
- **閱讀速度測試**: 測量WPM (Words Per Minute)
- **理解測驗**: 主旨理解、細節查找、推理判斷
- **筆記功能**: 高亮、標註、個人筆記儲存

**技術實現**:
```typescript
// 閱讀材料結構
export interface ReadingMaterial {
  id: string;
  title: string;
  content: string;
  cefrLevel: CEFRLevel;
  wordCount: number;
  estimatedReadingTime: number;
  vocabulary: VocabularyAnnotation[];
  questions: ReadingComprehensionQuestion[];
  categories: string[];
}

// 詞彙標註
export interface VocabularyAnnotation {
  word: string;
  startIndex: number;
  endIndex: number;
  definition: string;
  pronunciation: string;
  level: CEFRLevel;
  frequency: number;
}
```

#### ✍️ 寫作指導 (Writing)
**功能特色**:
- **結構化寫作指導**: Essay、Letter、Report等不同體裁範本
- **即時語法檢查**: 整合語法檢查API
- **詞彙建議**: 同義詞替換、語域適切性建議
- **寫作評估**: AI批改，提供詳細回饋
- **寫作進度追蹤**: 字數統計、寫作時間記錄

**技術實現**:
```typescript
// 寫作指導系統
export class WritingAssistant {
  async checkGrammar(text: string): Promise<GrammarError[]> {
    // 語法檢查邏輯
  }
  
  async suggestVocabulary(
    text: string, 
    targetLevel: CEFRLevel
  ): Promise<VocabularySuggestion[]> {
    // 詞彙建議邏輯
  }
  
  async evaluateWriting(
    essay: string, 
    prompt: WritingPrompt
  ): Promise<WritingEvaluation> {
    // AI寫作評估
  }
}
```

---

### 2. 詞彙管理系統

#### 📚 個人化詞彙本
**功能特色**:
- **智能詞彙收集**: 從閱讀、聽力材料自動提取生詞
- **間隔重複學習**: 基於遺忘曲線的復習提醒
- **多維度分類**: 按主題、等級、使用頻率分組
- **視覺化進度**: 學習進度圖表和統計
- **自定義標籤**: 用戶可自行標記詞彙特性

**技術實現**:
```typescript
// 詞彙管理服務
export class VocabularyManagerService {
  private vocabularyStorage: IndexedDBVocabularyStore;
  
  async addVocabulary(word: VocabularyItem): Promise<void> {
    // 添加詞彙到個人詞彙本
  }
  
  async getReviewList(date: Date): Promise<VocabularyItem[]> {
    // 獲取當日復習清單
  }
  
  async updateLearningProgress(
    wordId: string, 
    result: LearningResult
  ): Promise<void> {
    // 更新學習進度，調整復習間隔
  }
}

// 詞彙項目擴展
export interface VocabularyItem {
  id: string;
  word: string;
  pronunciation: string;
  definitions: VocabularyDefinition[];
  cefrLevel: CEFRLevel;
  frequency: number;
  
  // 學習追蹤
  learningStage: 'new' | 'learning' | 'reviewing' | 'mastered';
  correctCount: number;
  incorrectCount: number;
  lastReviewDate?: string;
  nextReviewDate: string;
  reviewInterval: number; // 天數
  
  // 上下文和例句
  contexts: VocabularyContext[];
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  
  // 個人化標記
  userNotes: string;
  customTags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5; // 用戶主觀難度評級
}
```

#### 🏷️ CEFR等級分類系統
**功能特色**:
- **自動等級判定**: 基於詞彙頻率和複雜度自動分級
- **學習路徑規劃**: 從當前等級到目標等級的詞彙學習計劃
- **等級測試**: 詞彙量測試，確定學習者水平
- **進階建議**: 針對不同等級提供學習建議

**等級特色**:
- **A1**: 最基礎500個高頻詞彙
- **A2**: 基礎生活詞彙1000個
- **B1**: 中級詞彙2000個，包含學術和工作常用詞
- **B2**: 高中級詞彙3500個，專業領域詞彙
- **C1**: 高級詞彙5000個，抽象概念和正式語言
- **C2**: 接近母語水平，8000+詞彙，包含俚語和專業術語

---

### 3. 情境對話擴展

#### 🎭 多情境對話模板
**預設情境清單**:
1. **日常生活**: 問路、購物、餐廳用餐、醫院看病
2. **商務英語**: 會議討論、產品介紹、客戶服務、談判技巧
3. **學術英語**: 課堂討論、論文報告、學術會議、圖書館
4. **旅遊英語**: 機場通關、酒店住宿、觀光導遊、交通工具
5. **社交英語**: 自我介紹、聚會寒暄、興趣愛好、文化交流
6. **面試英語**: 求職面試、工作描述、職涯規劃、薪資談判

**技術實現**:
```typescript
// 情境對話系統
export interface ConversationScenario {
  id: string;
  title: string;
  category: ConversationCategory;
  description: string;
  cefrLevel: CEFRLevel;
  
  // 角色設定
  participants: ConversationParticipant[];
  userRole: string;
  
  // 對話流程
  dialogueFlow: ConversationNode[];
  
  // 學習目標
  learningObjectives: string[];
  keyPhrases: string[];
  culturalNotes: string[];
  
  // 評估標準
  evaluationCriteria: EvaluationCriterion[];
}

// 對話節點 - 支援分支對話
export interface ConversationNode {
  id: string;
  type: 'ai-speech' | 'user-response' | 'choice' | 'evaluation';
  content: string;
  audioUrl?: string;
  
  // 分支選項
  choices?: ConversationChoice[];
  nextNodeId?: string;
  
  // 評估相關
  expectedResponses?: string[];
  evaluationPoints?: string[];
}
```

#### 🌍 文化背景整合
**功能特色**:
- **文化小知識**: 在對話過程中穿插文化背景說明
- **禮貌用語指南**: 不同情境下的適當用語
- **非語言交流**: 手勢、表情、個人空間等文化差異
- **節日慶典**: 西方節日相關詞彙和對話
- **商務文化**: 商務場合的文化禮儀

**實現範例**:
```typescript
// 文化背景註釋
export interface CulturalNote {
  id: string;
  context: string; // 觸發上下文
  title: string;
  explanation: string;
  examples: string[];
  relatedPhrases: string[];
  importance: 'high' | 'medium' | 'low';
  region: string[]; // 適用地區：US, UK, AU等
}
```

---

### 4. 語言能力評估系統

#### 📊 細化技能診斷
**評估維度**:
- **語音識別準確率**: 發音清晰度評估
- **語法掌握程度**: 各語法點的熟練度分析
- **詞彙豐富度**: 詞彙使用的多樣性和準確性
- **流暢度指標**: 語言產出的自然程度
- **理解力測試**: 聽力和閱讀理解能力

**技術實現**:
```typescript
// 語言能力評估引擎
export class LanguageAssessmentEngine {
  async comprehensiveAssessment(
    userId: string
  ): Promise<LanguageAssessmentReport> {
    const listeningScore = await this.assessListening(userId);
    const speakingScore = await this.assessSpeaking(userId);
    const readingScore = await this.assessReading(userId);
    const writingScore = await this.assessWriting(userId);
    
    return this.generateReport({
      listening: listeningScore,
      speaking: speakingScore,
      reading: readingScore,
      writing: writingScore,
    });
  }
  
  async trackProgress(
    userId: string,
    timeRange: DateRange
  ): Promise<ProgressAnalytics> {
    // 分析指定時間範圍內的進步情況
  }
}

// 評估報告結構
export interface LanguageAssessmentReport {
  userId: string;
  assessmentDate: string;
  overallCEFRLevel: CEFRLevel;
  
  skillBreakdown: {
    listening: SkillAssessment;
    speaking: SkillAssessment;
    reading: SkillAssessment;
    writing: SkillAssessment;
  };
  
  strengthsAndWeaknesses: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  
  learningPlan: PersonalizedLearningPlan;
}
```

#### 📈 學習進度可視化
**視覺化元素**:
- **技能雷達圖**: 四技能發展平衡性展示
- **進度時間軸**: 長期學習軌跡
- **詞彙成長曲線**: 詞彙量增長趨勢
- **準確率趨勢**: 各類練習的正確率變化
- **學習時間統計**: 每日/每週學習時數分析

---

## 🚀 創新特色功能

### 1. AI對話夥伴
**特色描述**: 24/7可用的智能對話練習夥伴  
**核心功能**:
- **個性化對話風格**: 基於學習者水平調整對話複雜度
- **話題引導**: AI主動提出話題，保持對話流暢
- **即時糾錯**: 語法和用詞錯誤的即時反饋
- **情感回應**: 辨識學習者情緒，給予適當鼓勵

### 2. 語音日記功能
**特色描述**: 通過錄音日記提升口說表達能力  
**核心功能**:
- **每日話題提示**: AI生成個人化的日記話題
- **語音轉文字**: 自動將錄音轉換為文字並校正
- **表達能力分析**: 分析語言複雜度和表達多樣性
- **成長軌跡**: 追蹤口說能力的長期發展

### 3. 發音診所
**特色描述**: 專精發音問題的診斷和改善工具  
**核心功能**:
- **音素級別分析**: 細粒度的發音問題定位
- **視覺化發音指導**: 口型圖示、舌位圖解
- **對比練習**: 學習者發音與標準發音的波形對比
- **個人化練習計畫**: 針對問題音素的專項練習

---

## 📱 用戶介面設計

### 主題色彩系統
- **主色調**: 深藍色 (#2563eb) - 專業、信任、學習
- **次色調**: 綠色 (#22c55e) - 成功、成長、鼓勵  
- **功能色**:
  - 聽力: 紫色 (#8b5cf6)
  - 口說: 橙色 (#f59e0b)  
  - 閱讀: 青色 (#06b6d4)
  - 寫作: 紅色 (#ef4444)

### 響應式設計重點
- **Mobile First**: 優先考慮手機用戶體驗
- **語音功能適配**: 大按鈕、清晰反饋
- **閱讀優化**: 舒適的字體大小和行距
- **快捷操作**: 常用功能一鍵直達

---

## 📊 成功指標

### 功能性指標
- **語音識別準確率**: >90%
- **發音評估精確度**: 與人工評估相關性 >0.8
- **內容生成質量**: 教師滿意度 >4.0/5.0
- **系統穩定性**: 99.5% uptime

### 用戶體驗指標  
- **學習完成率**: >70% (相比通用版提升20%)
- **用戶留存率**: 30天留存 >50%
- **功能使用廣度**: 平均每用戶使用功能數 >5個
- **學習成效**: 用戶自評能力提升 >4.0/5.0

### 教學效果指標
- **教師採用率**: 試用教師中 >60% 持續使用
- **教案品質**: AI生成內容可直接使用率 >80%
- **客製化適配**: 不同程度學習者適用性 >85%

---

這個英文分支將成為專業的語言學習平台，不僅保持原有的內容生成優勢，更加入了大量實用的語言學習工具，為學習者提供全方位的英語學習體驗。