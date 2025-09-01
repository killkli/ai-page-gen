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