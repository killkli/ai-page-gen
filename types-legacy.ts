/**
 * 舊版類型定義 - 向後兼容性層
 * 這個文件保存原始的類型定義，用於向後兼容
 * 新的開發應使用 src/core/types/ 中的模組化類型
 * 
 * @deprecated 請使用 src/core/types 中的新類型定義
 */

// 重新匯出新的類型，保持向後兼容
export type {
  // 基礎類型
  DifficultyLevel,
  Subject,
  BaseEntity,
  ContentMetadata,
  BaseLearningContent,
  BaseQuizQuestion,
  BaseUserInteraction,
  QuizType,
  InteractionType,
  OperationResult,
  ValidationResult,
  
  // 向後兼容的類型別名
  QuizQuestion,
  LearningContent,
  UserInteraction,
  BranchLearningContent,
  QuizDifficultyContent,
  OnlineInteractiveQuiz,
  
  // 學習相關類型
  LearningObjectiveItem,
  ContentBreakdownItem,
  ConfusingPointItem,
  ClassroomActivity,
  GeneratedLearningContent,
  ExtendedLearningContent,
  LearningLevel,
  LearningLevelSuggestions,
  
  // 英文學習類型
  CEFRLevel,
  VocabularyLevel,
  VocabularyItem,
  DialogueLine,
  EnglishLearningContent,
  
  // 數學學習類型
  MathDomain,
  MathGradeLevel,
  MathConcept,
  MathFormula,
  MathLearningContent,
  
  // 寫作練習類型
  SentencePracticePrompt,
  WritingPracticePrompt,
  WritingPracticeContent,
  AIFeedback,
  
  // 工具函數
  isEnglishContent,
  isMathContent,
  isBaseContent,
  getBranchFromContent,
  
} from './src/core/types';

// 保留原有的具體類型定義，用於不想立即升級的代碼
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

// 遷移輔助函數
export function migrateToNewTypes() {
  console.warn('⚠️ 您正在使用舊版類型定義。請考慮遷移到 src/core/types 中的新類型定義以獲得更好的類型安全性和功能支援。');
  console.warn('📖 遷移指南: https://github.com/killkli/ai-page-gen/docs/migration-guide.md');
}

// 類型檢查函數（向後兼容）
export function isLegacyQuizFormat(quiz: any): quiz is { 
  easy: { trueFalse: TrueFalseQuestion[] };
  normal: { trueFalse: TrueFalseQuestion[] };
  hard: { trueFalse: TrueFalseQuestion[] };
} {
  return quiz && 
         quiz.easy && 
         Array.isArray(quiz.easy.trueFalse) &&
         quiz.easy.trueFalse.length > 0 &&
         'statement' in quiz.easy.trueFalse[0];
}

// 類型轉換函數
export function convertLegacyQuizToNew(legacyQuiz: any) {
  // 轉換邏輯...
  migrateToNewTypes();
  return legacyQuiz; // 簡化版本，實際需要轉換
}