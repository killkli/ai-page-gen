// 基礎類型 - 所有分支共享
export * from './base';

// 為了向後兼容，重新匯出一些常用的舊類型別名
import {
  BaseQuizQuestion,
  DifficultyLevel,
  BaseLearningContent,
  BaseUserInteraction
} from './base';


// 舊版兼容性類型別名
export type QuizQuestion = BaseQuizQuestion;
export type LearningContent = BaseLearningContent;
export type UserInteraction = BaseUserInteraction;

// 分支特定內容的聯合類型
export type BranchLearningContent =
  | BaseLearningContent

// 分支識別類型
export type BranchType = 'main' | 'english' | 'math';

// 分支配置介面
export interface BranchConfig {
  type: BranchType;
  name: string;
  description: string;
  supportedFeatures: string[];
  defaultSettings: Record<string, any>;
}

// 測驗系統的聯合類型
export type QuizDifficultyContent = {
  trueFalse: BaseQuizQuestion[];
  multipleChoice: BaseQuizQuestion[];
  fillInTheBlanks: BaseQuizQuestion[];
  sentenceScramble: BaseQuizQuestion[];
  memoryCardGame?: BaseQuizQuestion[];
};

// 學習目標結構（向後兼容）
export interface LearningObjectiveItem {
  objective: string;
  description: string;
  teachingExample?: string;
}

// 內容細分項目（向後兼容）
export interface ContentBreakdownItem {
  topic: string;
  details: string;
  teachingExample?: string;
  // 英文學習擴展
  coreConcept?: string;
  teachingSentences?: string[];
  teachingTips?: string;
}

// 容易混淆點（向後兼容）
export interface ConfusingPointItem {
  point: string;
  clarification: string;
  teachingExample?: string;
  errorType?: string;
  commonErrors?: string[];
  correctVsWrong?: {
    correct: string;
    wrong: string;
    explanation: string;
  }[];
  preventionStrategy?: string;
  correctionMethod?: string;
  practiceActivities?: string[];
}

// 課堂活動（向後兼容）
export interface ClassroomActivity {
  title: string;
  description: string;
  objective?: string;
  timing?: string;
  materials?: string;
  environment?: string;
  steps?: string[];
  assessmentPoints?: string[];
}

// 學習等級相關（向後兼容）
export interface LearningLevel {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface LearningLevelSuggestions {
  suggestedLevels: LearningLevel[];
  defaultLevelId: string;
}

// 詞彙等級（向後兼容）
export interface VocabularyLevel {
  id: string;
  name: string;
  wordCount: number;
  description: string;
}

// 對話行（向後兼容）
export interface DialogueLine {
  speaker: string;
  line: string;
}

// 寫作練習相關（向後兼容）
export interface SentencePracticePrompt {
  id: string;
  instruction: string;
  keywords: string[];
  exampleSentence?: string;
  hints?: string[];
  difficulty: DifficultyLevel;
}

export interface WritingPracticePrompt {
  id: string;
  title: string;
  instruction: string;
  structure: string[];
  keywords?: string[];
  minLength: number;
  maxLength: number;
  exampleOutline?: string;
  difficulty: DifficultyLevel;
}

export interface WritingPracticeContent {
  sentencePractice: SentencePracticePrompt[];
  writingPractice: WritingPracticePrompt[];
  instructions: string;
}

// AI 回饋相關（向後兼容）
export interface AIFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  grammarCorrections?: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  vocabularyTips?: string[];
  structureFeedback?: string;
  overallComment: string;
}

// 工具函數

export function createBranchConfig(type: BranchType): BranchConfig {
  const configs: Record<BranchType, BranchConfig> = {
    main: {
      type: 'main',
      name: 'AI 學習頁面產生器',
      description: '跨領域通用學習內容生成器',
      supportedFeatures: [
        'content-generation',
        'quiz-system',
        'lesson-management',
        'progress-tracking',
        'subject-classification'
      ],
      defaultSettings: {
        theme: 'default',
        difficulty: 'normal',
        language: 'zh-TW'
      }
    },
    english: {
      type: 'english',
      name: 'AI 英語學習產生器',
      description: '專業英語教學與學習平台',
      supportedFeatures: [
        'content-generation',
        'quiz-system',
        'lesson-management',
        'progress-tracking',
        'speech-recognition',
        'vocabulary-management',
        'conversation-practice',
        'pronunciation-training'
      ],
      defaultSettings: {
        theme: 'english',
        difficulty: 'normal',
        language: 'en-US',
        cefrLevel: 'B1',
        accent: 'american'
      }
    },
    math: {
      type: 'math',
      name: 'AI 數學學習產生器',
      description: '專業數學概念理解與解題能力培養平台',
      supportedFeatures: [
        'content-generation',
        'quiz-system',
        'lesson-management',
        'progress-tracking',
        'formula-rendering',
        'interactive-tools',
        'visualization',
        'proof-checking'
      ],
      defaultSettings: {
        theme: 'math',
        difficulty: 'normal',
        language: 'zh-TW',
        mathDomain: 'algebra',
        gradeLevel: 'high-school'
      }
    }
  };

  return configs[type];
}

export interface TrueFalseQuestion {
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface FillBlankQuestion {
  sentenceWithBlank: string;
  correctAnswer: string;
}

export interface SentenceScrambleQuestion {
  originalSentence: string;
  scrambledWords: string[];
}

export interface MemoryCardGameQuestion {
  pairs: {
    question?: string;
    answer?: string;
    left?: string;
    right?: string;
  }[];
  instructions?: string;
  title?: string;
}


export interface OnlineInteractiveQuiz {
  easy: QuizDifficultyContent;
  normal: QuizDifficultyContent;
  hard: QuizDifficultyContent;
}


export interface GeneratedLearningContent {
  topic?: string;
  selectedLevel?: LearningLevel | null;
  selectedVocabularyLevel?: VocabularyLevel;
  learningObjectives: LearningObjectiveItem[];
  contentBreakdown: ContentBreakdownItem[];
  confusingPoints: ConfusingPointItem[];
  classroomActivities: ClassroomActivity[];
  onlineInteractiveQuiz: OnlineInteractiveQuiz;
  englishConversation?: DialogueLine[]; // Added for English conversation practice
  learningLevels?: LearningLevelSuggestions; // Added for automatic learning level suggestions
  writingPractice?: WritingPracticeContent;
}



export enum QuizDifficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
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



export interface StudentSubmission {
  id: string;
  promptId: string;           // 對應的題目ID
  studentWork: string;        // 學生作品
  submittedAt: string;        // 提交時間
  aiFeedback?: AIFeedback;    // AI批改結果
  teacherFeedback?: string;   // 教師額外回饋
}


// Extended learning content with writing practice
export interface ExtendedLearningContent extends GeneratedLearningContent {
  transformedData?: object
  writingPractice?: WritingPracticeContent;
  stepQuizData?: { [stepId: string]: any };
}

// 互動學習相關類型定義
export interface LearningProgress {
  currentObjectiveIndex: number;           // 目前學習目標索引
  completedObjectives: string[];           // 已完成的學習目標ID
  timeSpent: number;                       // 學習時間(毫秒)
  interactionCount: number;                // 互動次數
  startTime: number;                       // 開始學習時間
  lastUpdateTime: number;                  // 最後更新時間
  completedActivities: string[];           // 已完成的活動ID
}

export interface InteractiveElement {
  id: string;
  type: 'flip-card' | 'drag-drop' | 'click-reveal' | 'comparison' | 'voice-practice';
  content: any;
  completed: boolean;
  attempts?: number;
  timeSpent?: number;
}

export interface InteractiveLearningSession {
  contentId: string;
  topic: string;
  progress: LearningProgress;
  interactions: InteractiveElement[];
  createdAt: number;
  updatedAt: number;
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

// 英文對話練習相關類型定義

// 對話回合
export interface ConversationTurn {
  id: string;
  speaker: string;                      // 說話者角色
  text: string;                        // 對話內容
  translation: string;                 // 中文翻譯
  pronunciation?: string;              // IPA 音標
  keyWords: string[];                  // 關鍵詞彙
  difficulty: 'easy' | 'normal' | 'hard'; // 難度
  practicePoint: string;               // 練習重點
  expectedResponseHints?: string[];    // 期待學生回應的提示
}

// 詞彙項目
export interface ConversationVocabulary {
  word: string;                        // 單詞
  pronunciation: string;               // 音標
  meaning: string;                     // 中文意思
  example: string;                     // 例句
  difficulty: 'easy' | 'normal' | 'hard';
}

// 對話練習內容
export interface ConversationPractice {
  id: string;                          // 對話練習ID
  title: string;                       // 對話標題
  scenario: string;                    // 情境描述
  description: string;                 // 學習描述
  difficulty: 'easy' | 'normal' | 'hard'; // 整體難度
  duration: number;                    // 預估時間（分鐘）
  participants: string[];              // 參與角色列表
  dialogue: ConversationTurn[];        // 對話內容
  vocabulary: ConversationVocabulary[]; // 相關詞彙
  practiceGoals: string[];            // 練習目標
  evaluationCriteria: {               // 評估標準
    pronunciation: number;             // 發音權重
    grammar: number;                   // 語法權重
    fluency: number;                   // 流暢度權重
    appropriateness: number;           // 適切性權重
  };
  culturalNotes?: string[];           // 文化背景說明
  commonMistakes?: string[];          // 常見錯誤
}

// 對話練習生成選項
export interface ConversationGenerationOptions {
  topic: string;                       // 主題
  scenario: string;                    // 情境
  difficulty: 'easy' | 'normal' | 'hard'; // 難度等級
  participantCount: 2 | 3;             // 參與人數
  duration: number;                    // 目標時長
  focusAreas?: string[];              // 重點練習領域
  culturalContext?: string;            // 文化背景
}

// 學生語音回應記錄
export interface StudentVoiceResponse {
  turnId: string;                      // 對話回合ID
  text: string;                        // 識別文字
  confidence: number;                  // 信心度 (0-1)
  audioBlob?: Blob;                    // 音頻數據
  timestamp: number;                   // 時間戳
  feedback?: ConversationFeedback;     // AI 回饋
}

// 對話練習回饋
export interface ConversationFeedback {
  overallScore: number;                // 整體得分 (0-100)
  pronunciationScore: number;          // 發音得分
  grammarScore: number;                // 語法得分
  fluencyScore: number;                // 流暢度得分
  appropriatenessScore: number;        // 適切性得分
  feedback: string[];                  // 回饋意見
  suggestions: string[];               // 改進建議
  encouragement: string;               // 鼓勵話語
}

// 對話練習會話
export interface ConversationSession {
  practiceId: string;                  // 練習ID
  startTime: number;                   // 開始時間
  currentTurnIndex: number;            // 當前回合索引
  studentRole: string;                 // 學生角色
  responses: StudentVoiceResponse[];   // 回應記錄
  completed: boolean;                  // 是否完成
}

// 語音設定
export interface VoiceSettings {
  lang: string;                        // 語言設定
  rate: number;                        // 語速 (0.1-10)
  pitch: number;                       // 音調 (0-2)
  volume: number;                      // 音量 (0-1)
}

// 語音識別結果
export interface SpeechRecognitionResult {
  text: string;                        // 識別文字
  confidence: number;                  // 信心度
  isFinal: boolean;                    // 是否最終結果
}

// 語音識別選項
export interface SpeechRecognitionOptions {
  lang: string;                        // 語言
  continuous: boolean;                 // 連續識別
  interimResults: boolean;             // 中間結果
  maxAlternatives: number;             // 最大候選數
}

// Stored lesson plan interface - for backward compatibility
export interface StoredLessonPlan {
  id: string;
  topic: string;
  selectedLevel?: LearningLevel | null;
  selectedVocabularyLevel?: VocabularyLevel | null;
  learningObjectives: LearningObjectiveItem[];
  contentBreakdown: ContentBreakdownItem[];
  confusingPoints: ConfusingPointItem[];
  classroomActivities: ClassroomActivity[];
  onlineInteractiveQuiz: OnlineInteractiveQuiz;
  englishConversation?: DialogueLine[];
  learningLevels?: LearningLevelSuggestions;
  writingPractice?: WritingPracticeContent;
  stepQuizData?: { [stepId: string]: any };
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// New Types for Material Generation Update
// ==========================================

// Common Types
export type TeachingContext = 'physical' | 'online';
export type PriorExperience = 'special_needs' | 'none' | 'partial';

// Math Specific Types
export type MathTeachingMethod =
  | 'visual' // 圖像化教學法
  | 'cpa' // CPA教學法
  | 'concept_oriented' // 概念導向教學
  | 'discovery' // 發現學習法
  | 'gamification' // 遊戲化教學
  | 'contextual'; // 情境教學法

export interface MathGenerationParams {
  studentCount: number;
  classDuration: number; // minutes
  teachingContext: TeachingContext;
  priorExperience: PriorExperience;
  selectedMaterials: MaterialItem[];
  teachingMethod: MathTeachingMethod;
  studentGrade: StudentGrade;
}

// English Specific Types
export type EnglishTeachingMethod =
  | 'clt' // 溝通式教學法
  | 'tbl' // 任務導向學習
  | 'pbl' // 專題導向學習
  | 'tpr' // 全身反應法
  | 'phonics' // 自然發音法
  | 'grammar_translation' // 文法翻譯法
  | 'ppp' // PPP教學模式
  | 'cooperative' // 合作學習
  | 'gamification' // 遊戲化教學
  | 'flipped' // 翻轉教室
  | 'scaffolding' // 教育戲劇法 (Scaffolding/Drama?) - Image says "教育戲劇法"
  | 'clil'; // CLIL 雙語整合教學

export type StudentGrade =
  | 'preschool'
  | 'elementary_low' // 1-2
  | 'elementary_mid' // 3-4
  | 'elementary_high' // 5-6
  | 'junior_7'
  | 'junior_8'
  | 'junior_9'
  | 'high_school_review';

export interface EnglishGenerationParams {
  studentCount: number;
  classDuration: number;
  teachingContext: TeachingContext;
  priorExperience: PriorExperience;
  studentGrade: StudentGrade;
  selectedMaterials: MaterialItem[];
  teachingMethod: EnglishTeachingMethod;
}

// Material Structure
export interface MaterialItem {
  unit: string;
  title: string;
  content: string;
  grade: number;
}

export interface MaterialNode {
  id: string;
  label: string;
  children?: MaterialNode[];
}
