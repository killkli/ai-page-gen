/**
 * 英文學習專業類型定義
 */

import { BaseLearningContent, BaseQuizQuestion, BaseUserInteraction, BaseEntity, DifficultyLevel } from './base';

// CEFR 歐洲語言共同參考框架等級
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// 英語技能類型
export type EnglishSkillType = 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary' | 'pronunciation';

// 英語學習內容
export interface EnglishLearningContent extends BaseLearningContent {
  skillFocus: EnglishSkillType[];
  targetLevel: CEFRLevel;
  currentLevel?: CEFRLevel;
  vocabulary: VocabularyItem[];
  pronunciation: PronunciationGuide[];
  culturalNotes: CulturalNote[];
  dialogues?: DialoguePractice[];
  exercises: EnglishExercise[];
}

// 詞彙項目
export interface VocabularyItem extends BaseEntity {
  word: string;
  pronunciation: string;
  phonetic: string; // IPA 音標
  meanings: VocabularyMeaning[];
  cefrLevel: CEFRLevel;
  frequency: number; // 使用頻率分數 1-10000
  partOfSpeech: PartOfSpeech[];
  
  // 學習追蹤
  learningStage: VocabularyLearningStage;
  correctCount: number;
  incorrectCount: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  reviewInterval: number; // 天數
  
  // 上下文和例句
  contexts: VocabularyContext[];
  examples: VocabularyExample[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  
  // 個人化
  userNotes: string;
  customTags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5; // 用戶主觀難度評級
  bookmarked: boolean;
}

// 詞性
export type PartOfSpeech = 
  | 'noun' | 'verb' | 'adjective' | 'adverb' 
  | 'pronoun' | 'preposition' | 'conjunction' 
  | 'interjection' | 'article' | 'determiner'
  | 'modal' | 'auxiliary';

// 詞彙學習階段
export type VocabularyLearningStage = 'new' | 'learning' | 'reviewing' | 'mastered' | 'forgotten';

// 詞彙釋義
export interface VocabularyMeaning {
  definition: string;
  translation: string; // 中文翻譯
  example: string;
  context: string; // 使用情境
  register?: LanguageRegister; // 語域
}

// 語域（正式程度）
export type LanguageRegister = 'formal' | 'informal' | 'colloquial' | 'slang' | 'technical' | 'academic';

// 詞彙上下文
export interface VocabularyContext {
  situation: string; // 使用情境
  sentence: string;
  translation: string;
  audioUrl?: string;
}

// 詞彙例句
export interface VocabularyExample {
  sentence: string;
  translation: string;
  difficulty: DifficultyLevel;
  source?: string; // 來源（新聞、文學等）
  audioUrl?: string;
}

// 發音指導
export interface PronunciationGuide {
  phoneme: string;
  ipa: string;
  description: string;
  commonMistakes: string[];
  practiceWords: string[];
  audioUrls: {
    phoneme: string;
    examples: string[];
  };
}

// 文化背景說明
export interface CulturalNote {
  id: string;
  title: string;
  content: string;
  category: CulturalCategory;
  relevantSituations: string[];
  examples: string[];
  regions: string[]; // 適用地區
  importance: 'high' | 'medium' | 'low';
}

// 文化類別
export type CulturalCategory = 
  | 'etiquette'     // 禮儀
  | 'customs'       // 習俗
  | 'business'      // 商務文化
  | 'social'        // 社交文化
  | 'academic'      // 學術文化
  | 'historical'    // 歷史背景
  | 'contemporary'; // 當代文化

// 對話練習
export interface DialoguePractice extends BaseEntity {
  title: string;
  scenario: DialogueScenario;
  participants: DialogueParticipant[];
  turns: DialogueTurn[];
  learningGoals: string[];
  vocabulary: string[]; // 關鍵詞彙
  culturalNotes?: string[];
  difficulty: DifficultyLevel;
  estimatedDuration: number; // 分鐘
}

// 對話場景
export interface DialogueScenario {
  name: string;
  description: string;
  setting: string; // 場所
  context: string; // 背景情境
  objectives: string[]; // 對話目標
}

// 對話參與者
export interface DialogueParticipant {
  id: string;
  name: string;
  role: string;
  description: string;
  personality?: string[];
}

// 對話輪次
export interface DialogueTurn {
  id: string;
  speakerId: string;
  text: string;
  translation?: string;
  audioUrl?: string;
  emotion?: EmotionalTone;
  keyPoints: string[];
  alternatives?: string[]; // 替代說法
  practiceNotes?: string;
}

// 語調情感
export type EmotionalTone = 
  | 'neutral' | 'friendly' | 'formal' | 'casual'
  | 'enthusiastic' | 'concerned' | 'apologetic'
  | 'assertive' | 'questioning' | 'explaining';

// 英語練習
export interface EnglishExercise extends BaseEntity {
  type: EnglishExerciseType;
  skill: EnglishSkillType;
  instructions: string;
  content: any; // 根據練習類型而定
  expectedResponse: any;
  hints?: string[];
  timeLimit?: number; // 秒
  autoGrade: boolean;
}

// 英語練習類型
export type EnglishExerciseType =
  | 'listening-comprehension'
  | 'speaking-practice'
  | 'reading-comprehension'
  | 'writing-composition'
  | 'grammar-drill'
  | 'vocabulary-match'
  | 'pronunciation-drill'
  | 'dictation'
  | 'role-play'
  | 'translation';

// 語音識別結果
export interface VoiceRecognitionResult {
  text: string;
  confidence: number; // 0-1
  accuracy: number; // 發音準確度 0-100
  pronunciationScore: number; // 0-100
  timing: number; // 說話時間（毫秒）
  wordScores: WordPronunciationScore[];
  overallFeedback: string;
}

// 單詞發音評分
export interface WordPronunciationScore {
  word: string;
  score: number; // 0-100
  phonemes: PhonemeScore[];
  commonError?: string;
  improvement?: string;
}

// 音素評分
export interface PhonemeScore {
  phoneme: string;
  score: number; // 0-100
  feedback?: string;
}

// 語音設定
export interface VoiceSettings {
  language: string;
  accent: EnglishAccent;
  rate: number; // 語速 0.1-3.0
  pitch: number; // 音調 0-2
  volume: number; // 音量 0-1
}

// 英語口音
export type EnglishAccent = 
  | 'american'    // 美式英語
  | 'british'     // 英式英語
  | 'australian'  // 澳式英語
  | 'canadian'    // 加拿大英語
  | 'indian'      // 印度英語
  | 'neutral';    // 中性口音

// 語言技能評估
export interface EnglishSkillAssessment {
  skill: EnglishSkillType;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: SkillRecommendation[];
  lastAssessment: string;
  progressHistory: SkillProgressPoint[];
}

// 技能建議
export interface SkillRecommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  resources: RecommendedResource[];
  estimatedTime: string;
  expectedImprovement: string;
}

// 推薦資源
export interface RecommendedResource {
  type: 'exercise' | 'content' | 'practice' | 'reference';
  title: string;
  description: string;
  url?: string;
  difficulty: DifficultyLevel;
}

// 技能進步點
export interface SkillProgressPoint {
  date: string;
  level: CEFRLevel;
  score: number; // 0-100
  notes?: string;
}

// 英語學習統計
export interface EnglishLearningStats {
  totalWordsLearned: number;
  vocabularyByLevel: Record<CEFRLevel, number>;
  skillProgress: Record<EnglishSkillType, number>; // 0-100
  timeSpentBySkill: Record<EnglishSkillType, number>; // 分鐘
  streakDays: number;
  totalSessions: number;
  averageSessionTime: number; // 分鐘
  achievements: EnglishAchievement[];
}

// 英語成就系統
export interface EnglishAchievement {
  id: string;
  name: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing' | 'streak' | 'accuracy';
  criteria: {
    target: number;
    unit: string;
    timeframe?: string;
  };
  earned: boolean;
  earnedDate?: string;
  progress: number; // 0-100
  icon?: string;
  category: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// 英語互動記錄
export interface EnglishUserInteraction extends BaseUserInteraction {
  skill: EnglishSkillType;
  exerciseType: EnglishExerciseType;
  vocabularyUsed?: string[];
  cefrLevel?: CEFRLevel;
  voiceData?: VoiceRecognitionResult;
}

// 英語測驗題擴展
export interface EnglishQuizQuestion extends BaseQuizQuestion {
  skill: EnglishSkillType;
  cefrLevel: CEFRLevel;
  vocabulary?: string[]; // 涉及的詞彙
  grammar?: GrammarPoint[]; // 涉及的語法點
  audioUrl?: string; // 聽力題音頻
  imageUrl?: string; // 配圖
}

// 語法點
export interface GrammarPoint {
  name: string;
  category: GrammarCategory;
  level: CEFRLevel;
  description: string;
  examples: string[];
  commonMistakes: string[];
}

// 語法類別
export type GrammarCategory =
  | 'tenses'        // 時態
  | 'conditionals'  // 條件句
  | 'passive'       // 被動語態
  | 'modals'        // 情態動詞
  | 'articles'      // 冠詞
  | 'prepositions'  // 介詞
  | 'conjunctions'  // 連詞
  | 'clauses'       // 子句
  | 'phrases'       // 片語
  | 'punctuation';  // 標點符號

// 寫作評估結果
export interface WritingAssessmentResult {
  overallScore: number; // 0-100
  cefrLevel: CEFRLevel;
  wordCount: number;
  readabilityScore: number;
  
  // 各面向評分
  scores: {
    grammar: number;
    vocabulary: number;
    coherence: number;
    taskResponse: number;
    fluency: number;
  };
  
  // 詳細回饋
  strengths: string[];
  weaknesses: string[];
  suggestions: WritingSuggestion[];
  corrections: GrammarCorrection[];
  
  // 改進建議
  nextSteps: string[];
  practiceAreas: string[];
}

// 寫作建議
export interface WritingSuggestion {
  type: 'grammar' | 'vocabulary' | 'structure' | 'style' | 'content';
  location: TextLocation;
  issue: string;
  suggestion: string;
  examples?: string[];
  importance: 'high' | 'medium' | 'low';
}

// 語法修正
export interface GrammarCorrection {
  original: string;
  corrected: string;
  rule: string;
  explanation: string;
  location: TextLocation;
}

// 文字位置
export interface TextLocation {
  start: number;
  end: number;
  line?: number;
  paragraph?: number;
}

// 英語學習偏好
export interface EnglishLearningPreferences {
  preferredAccent: EnglishAccent;
  learningPace: 'slow' | 'normal' | 'fast';
  focusSkills: EnglishSkillType[];
  interestTopics: string[];
  studyGoals: EnglishStudyGoal[];
  availableTime: number; // 每日學習時間（分鐘）
  reminderSettings: ReminderSettings;
}

// 學習目標
export interface EnglishStudyGoal {
  type: 'exam' | 'travel' | 'business' | 'academic' | 'personal';
  description: string;
  targetDate?: string;
  targetLevel: CEFRLevel;
  priority: number; // 1-5
}

// 提醒設定
export interface ReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  preferredTime: string; // HH:MM 格式
  motivationalMessage: boolean;
}

// Achievement 英語專業化
export interface EnglishAchievement extends Achievement {
  skill?: EnglishSkillType;
  cefrLevel?: CEFRLevel;
  vocabularyCount?: number;
  streakDays?: number;
}