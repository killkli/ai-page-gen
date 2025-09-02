export interface TrueFalseQuestion {
  statement: string; // The statement to be evaluated
  isTrue: boolean;   // Whether the statement is true or false
  explanation?: string; // Optional explanation for the answer
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // Index of the correct option in the options array
}

export interface FillBlankQuestion {
  sentenceWithBlank: string; // e.g., "The capital of France is ____."
  correctAnswer: string;
}

export interface SentenceScrambleQuestion {
  originalSentence: string; // The correct, unscrambled sentence
  scrambledWords: string[]; // An array of words from the original sentence, in scrambled order
}

export interface DialogueLine {
  speaker: string; // e.g., "A", "B", "Learner"
  line: string;    // The text of the dialogue line
}

export interface MemoryCardGameQuestion {
  pairs: { question: string; answer: string }[]; // Each pair is a card match (e.g., word/definition, term/translation)
  instructions?: string; // Optional instructions for the memory game
}

export interface QuizDifficultyContent {
  trueFalse: TrueFalseQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
  fillInTheBlanks: FillBlankQuestion[];
  sentenceScramble: SentenceScrambleQuestion[];
  memoryCardGame?: MemoryCardGameQuestion[]; // Optional: memory card game questions
}

export interface OnlineInteractiveQuiz {
  easy: QuizDifficultyContent;
  normal: QuizDifficultyContent;
  hard: QuizDifficultyContent;
}

export interface LearningObjectiveItem {
  objective: string;
  description: string;
  teachingExample?: string;
}

export interface ContentBreakdownItem {
  topic: string;
  details: string;
  teachingExample?: string;
  // Enhanced fields for English learning
  coreConcept?: string;              // 核心概念 - 該要點的核心學習概念
  teachingSentences?: string[];      // 教學例句 - 3~5句教學例句
  teachingTips?: string;             // 教學要點提示 - 教學說明與要點
}

export interface ConfusingPointItem {
  point: string;                        // 易混淆點標題
  clarification: string;                // 澄清說明
  teachingExample?: string;             // 教學示例（原有）
  // Enhanced fields for more comprehensive teaching guidance
  errorType?: string;                   // 誤區類型 - 概念性/程序性/語言性等
  commonErrors?: string[];              // 常見錯誤示例 - 學生典型錯誤案例
  correctVsWrong?: {                    // 正確與錯誤對比
    correct: string;                    // 正確示例
    wrong: string;                      // 錯誤示例
    explanation: string;                // 對比說明
  }[];
  preventionStrategy?: string;          // 預防策略 - 如何防止學生犯錯
  correctionMethod?: string;            // 糾正方法 - 發現錯誤後的補救措施
  practiceActivities?: string[];       // 練習建議 - 針對性練習活動
}

export interface ClassroomActivity {
  title: string;                    // 活動名稱/主題
  description: string;              // 活動的標題或核心概念
  objective?: string;               // 學習目標
  timing?: string;                  // 使用時機 - 適合在課程哪個階段使用
  materials?: string;               // 所需教具 - 進行活動需要的工具或教材
  environment?: string;             // 環境要求 - 座位安排、空間需求或設備條件
  steps?: string[];                 // 活動步驟 - 條列式流程，教師與學生的互動方式
  assessmentPoints?: string[];      // 評估重點 - 學生學習成效的觀察面向與評估標準
}

export interface GeneratedLearningContent {
  learningObjectives: LearningObjectiveItem[];
  contentBreakdown: ContentBreakdownItem[];
  confusingPoints: ConfusingPointItem[];
  classroomActivities: ClassroomActivity[];
  onlineInteractiveQuiz: OnlineInteractiveQuiz;
  englishConversation?: DialogueLine[]; // Added for English conversation practice
  learningLevels?: LearningLevelSuggestions; // Added for automatic learning level suggestions
}

export interface LearningLevel {
  id: string;
  name: string;
  description: string;
  order: number; // For sorting the levels
}

export interface LearningLevelSuggestions {
  suggestedLevels: LearningLevel[];
  defaultLevelId: string; // Which level to select by default
}

export enum QuizDifficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

// Vocabulary level for English-related topics
export interface VocabularyLevel {
  id: string;
  name: string;
  wordCount: number;
  description: string;
}

export interface VocabularyLevelSuggestions {
  suggestedLevels: VocabularyLevel[];
  defaultLevelId: string;
}

// Helper type for quiz section props
export type QuizContentKey = keyof QuizDifficultyContent;

// Quiz customization types
export interface QuizTypeConfig {
  trueFalse: number;
  multipleChoice: number;
  fillInTheBlanks: number;
  sentenceScramble: number;
  memoryCardGame: number;
}

export interface QuizCustomConfig {
  easy: QuizTypeConfig;
  normal: QuizTypeConfig;
  hard: QuizTypeConfig;
}

// Default quiz configuration
export const DEFAULT_QUIZ_CONFIG: QuizCustomConfig = {
  easy: {
    trueFalse: 5,
    multipleChoice: 5,
    fillInTheBlanks: 5,
    sentenceScramble: 5,
    memoryCardGame: 1
  },
  normal: {
    trueFalse: 5,
    multipleChoice: 5,
    fillInTheBlanks: 5,
    sentenceScramble: 5,
    memoryCardGame: 1
  },
  hard: {
    trueFalse: 5,
    multipleChoice: 5,
    fillInTheBlanks: 5,
    sentenceScramble: 5,
    memoryCardGame: 1
  }
};

// Quiz configuration limits
export const QUIZ_TYPE_LIMITS: Record<QuizContentKey, number> = {
  trueFalse: 10,
  multipleChoice: 10,
  fillInTheBlanks: 10,
  sentenceScramble: 10,
  memoryCardGame: 2
};

// Writing and sentence practice types
export interface SentencePracticePrompt {
  id: string;
  instruction: string;        // 造句指示
  keywords: string[];         // 必須使用的關鍵詞
  exampleSentence?: string;   // 範例句子
  hints?: string[];          // 提示要點
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface WritingPracticePrompt {
  id: string;
  title: string;              // 寫作題目
  instruction: string;        // 寫作指示
  structure: string[];        // 建議結構（段落安排）
  keywords?: string[];        // 建議使用詞彙
  minLength: number;          // 最少字數
  maxLength: number;          // 最多字數
  exampleOutline?: string;    // 範例大綱
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface AIFeedback {
  score: number;              // 分數 (0-100)
  strengths: string[];        // 優點
  improvements: string[];     // 改進建議
  grammarCorrections?: {      // 語法修正
    original: string;
    corrected: string;
    explanation: string;
  }[];
  vocabularyTips?: string[];  // 詞彙建議
  structureFeedback?: string; // 結構回饋
  overallComment: string;     // 整體評語
}

export interface StudentSubmission {
  id: string;
  promptId: string;           // 對應的題目ID
  studentWork: string;        // 學生作品
  submittedAt: string;        // 提交時間
  aiFeedback?: AIFeedback;    // AI批改結果
  teacherFeedback?: string;   // 教師額外回饋
}

export interface WritingPracticeContent {
  sentencePractice: SentencePracticePrompt[];
  writingPractice: WritingPracticePrompt[];
  instructions: string;       // 使用說明
}

// Extended learning content with writing practice
export interface ExtendedLearningContent extends GeneratedLearningContent {
  writingPractice?: WritingPracticeContent;
}

// 學習診斷報告相關類型定義

// 單個題目的回答記錄
export interface QuestionResponse {
  questionId: string;                    // 題目ID
  questionType: QuizContentKey;          // 題目類型
  difficulty: 'easy' | 'normal' | 'hard'; // 題目難度
  userAnswer: any;                       // 學生答案
  correctAnswer: any;                    // 正確答案
  isCorrect: boolean;                    // 是否正確
  responseTime?: number;                 // 回答時間(毫秒)
  attempts?: number;                     // 嘗試次數
}

// 題目類型表現統計
export interface QuestionTypePerformance {
  questionType: QuizContentKey;          // 題目類型
  totalQuestions: number;                // 總題數
  correctCount: number;                  // 正確數量
  accuracy: number;                      // 正確率(0-100)
  averageTime?: number;                  // 平均回答時間
  commonErrors: string[];                // 常見錯誤模式
  difficultyBreakdown: {                 // 各難度表現
    easy: { total: number; correct: number; accuracy: number };
    normal: { total: number; correct: number; accuracy: number };
    hard: { total: number; correct: number; accuracy: number };
  };
}

// 學習弱點分析
export interface LearningWeakness {
  area: string;                          // 弱點領域
  description: string;                   // 詳細描述
  severity: 'low' | 'medium' | 'high';   // 嚴重程度
  affectedTopics: string[];              // 影響的主題
  recommendedActions: string[];          // 建議行動
}

// 學習強項分析
export interface LearningStrength {
  area: string;                          // 強項領域
  description: string;                   // 詳細描述
  level: 'good' | 'excellent' | 'outstanding'; // 表現水準
  examples: string[];                    // 表現實例
  leverageOpportunities: string[];       // 運用機會
}

// 個人化學習建議
export interface PersonalizedRecommendation {
  category: 'immediate' | 'short-term' | 'long-term'; // 建議類別
  priority: 'high' | 'medium' | 'low';   // 優先級
  title: string;                         // 建議標題
  description: string;                   // 詳細說明
  actionSteps: string[];                 // 具體行動步驟
  expectedOutcome: string;               // 預期成果
  estimatedTime: string;                 // 預估時間投入
  resources?: string[];                  // 推薦資源
}

// 學生版學習回饋
export interface StudentLearningFeedback {
  studentId?: string;                    // 學生ID（可選）
  overallScore: number;                  // 總體得分(0-100)
  overallLevel: 'beginner' | 'intermediate' | 'advanced'; // 整體水準
  encouragementMessage: string;          // 鼓勵訊息
  keyStrengths: string[];               // 主要強項（簡化版）
  improvementAreas: string[];           // 改進領域（簡化版）
  nextSteps: string[];                  // 下一步行動（3-5個）
  studyTips: string[];                  // 學習小貼士
  motivationalQuote: string;            // 激勵語句
}

// 老師版診斷報告
export interface TeacherDiagnosticReport {
  studentId?: string;                   // 學生ID（可選）
  assessmentDate: string;               // 評估日期
  topic: string;                        // 評估主題
  
  // 整體表現摘要
  overallPerformance: {
    totalScore: number;                 // 總分(0-100)
    level: 'beginner' | 'intermediate' | 'advanced';
    percentile?: number;                // 百分位數（如果有參考群體）
    timeSpent: number;                  // 總測驗時間(分鐘)
  };
  
  // 各題型表現詳情
  performanceByType: QuestionTypePerformance[];
  
  // 學習分析
  learningAnalysis: {
    strengths: LearningStrength[];       // 學習強項
    weaknesses: LearningWeakness[];      // 學習弱點
    learningStyle?: string;              // 學習風格推測
    cognitivePattern?: string;           // 認知模式
  };
  
  // 教學建議
  teachingRecommendations: {
    immediateInterventions: string[];    // 立即介入建議
    instructionalStrategies: string[];   // 教學策略
    differentiation: string[];           // 差異化教學建議
    parentGuidance?: string[];           // 家長指導建議
  };
  
  // 個人化建議
  personalizedRecommendations: PersonalizedRecommendation[];
  
  // 進度追蹤建議
  progressTracking: {
    keyMetrics: string[];               // 關鍵指標
    checkpoints: string[];              // 檢查點
    reassessmentSuggestion: string;     // 重新評估建議
  };
}

// 學習診斷會話記錄
export interface DiagnosticSession {
  sessionId: string;                    // 會話ID
  studentId?: string;                   // 學生ID（可選）
  topic: string;                        // 主題
  startTime: string;                    // 開始時間
  endTime?: string;                     // 結束時間
  responses: QuestionResponse[];        // 所有回答記錄
  isCompleted: boolean;                 // 是否完成
  metadata?: {                          // 元數據
    userAgent?: string;
    deviceType?: string;
    location?: string;
  };
}

// 完整的學習診斷結果
export interface LearningDiagnosticResult {
  session: DiagnosticSession;           // 測驗會話
  studentFeedback: StudentLearningFeedback; // 學生版回饋
  teacherReport: TeacherDiagnosticReport;   // 老師版報告
  rawData: {                            // 原始數據
    responses: QuestionResponse[];
    statistics: QuestionTypePerformance[];
  };
  generatedAt: string;                  // 報告生成時間
  resultsBinId?: string;                // 對應的學生作答結果 BinId
}

// 診斷報告配置選項
export interface DiagnosticReportConfig {
  includeDetailedAnalysis: boolean;     // 包含詳細分析
  includeComparativeData: boolean;      // 包含比較數據
  includeVisualCharts: boolean;         // 包含視覺化圖表
  language: 'zh-TW' | 'en' | 'zh-CN';   // 報告語言
  reportFormat: 'standard' | 'detailed' | 'summary'; // 報告格式
}