/**
 * 核心類型定義匯出入口
 * 提供三分支共享的類型定義
 */

// 基礎類型 - 所有分支共享
export * from './base';

// 英文分支專業類型
export * from './english';

// 數學分支專業類型
export * from './math';

// 為了向後兼容，重新匯出一些常用的舊類型別名
import {
  BaseQuizQuestion,
  QuizType,
  DifficultyLevel,
  BaseLearningContent,
  BaseUserInteraction
} from './base';

import {
  EnglishLearningContent,
  VocabularyItem,
  DialoguePractice,
  CEFRLevel
} from './english';

import {
  MathLearningContent,
  MathConcept,
  MathFormula,
  MathDomain
} from './math';

// 舊版兼容性類型別名
export type QuizQuestion = BaseQuizQuestion;
export type LearningContent = BaseLearningContent;
export type UserInteraction = BaseUserInteraction;

// 分支特定內容的聯合類型
export type BranchLearningContent = 
  | BaseLearningContent 
  | EnglishLearningContent 
  | MathLearningContent;

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
  // 新增的測驗類型
  matching?: BaseQuizQuestion[];
  sequencing?: BaseQuizQuestion[];
  annotation?: BaseQuizQuestion[];
  openEnded?: BaseQuizQuestion[];
};

// 完整的測驗結構
export interface OnlineInteractiveQuiz {
  easy: QuizDifficultyContent;
  normal: QuizDifficultyContent;
  hard: QuizDifficultyContent;
}

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
  correctVsWrong?: Array<{
    correct: string;
    wrong: string;
    explanation: string;
  }>;
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

// 完整生成內容（向後兼容）
export interface GeneratedLearningContent {
  topic?: string;
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
}

// 擴展的學習內容（向後兼容）
export interface ExtendedLearningContent extends GeneratedLearningContent {
  writingPractice?: WritingPracticeContent;
  stepQuizData?: { [stepId: string]: any };
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
  grammarCorrections?: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  vocabularyTips?: string[];
  structureFeedback?: string;
  overallComment: string;
}

// 類型守衛函數
export function isEnglishContent(content: BranchLearningContent): content is EnglishLearningContent {
  return 'skillFocus' in content && 'targetLevel' in content;
}

export function isMathContent(content: BranchLearningContent): content is MathLearningContent {
  return 'domain' in content && 'concepts' in content;
}

export function isBaseContent(content: BranchLearningContent): content is BaseLearningContent {
  return !isEnglishContent(content) && !isMathContent(content);
}

// 工具函數
export function getBranchFromContent(content: BranchLearningContent): BranchType {
  if (isEnglishContent(content)) return 'english';
  if (isMathContent(content)) return 'math';
  return 'main';
}

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