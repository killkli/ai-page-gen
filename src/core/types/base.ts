/**
 * 基礎類型定義 - 三分支共享的核心類型
 */

// 基礎識別和元數據
export interface BaseEntity {
  id: string;
  createdAt: string;
  lastModified: string;
}

// 內容元數據
export interface ContentMetadata {
  version: string;
  author?: string;
  tags: string[];
  difficulty: DifficultyLevel;
  estimatedDuration: number; // 分鐘
  subject: Subject;
  language: string;
}

// 難度等級
export type DifficultyLevel = 'easy' | 'normal' | 'hard';

// 學科類型
export type Subject = 
  | 'general'       // 通用
  | 'english'       // 英語
  | 'math'          // 數學
  | 'science'       // 自然科學
  | 'social'        // 社會科學
  | 'humanities'    // 人文學科
  | 'arts'          // 藝術
  | 'technology'    // 技術
  | 'business'      // 商業
  | 'health'        // 健康
  | 'other';        // 其他

// 學習內容基礎結構
export interface BaseLearningContent extends BaseEntity {
  topic: string;
  metadata: ContentMetadata;
  learningObjectives: BaseLearningObjective[];
  contentSections: BaseContentSection[];
}

// 學習目標基礎結構
export interface BaseLearningObjective {
  id: string;
  objective: string;
  description: string;
  teachingExample?: string;
  assessmentCriteria?: string[];
}

// 內容區塊基礎結構
export interface BaseContentSection {
  id: string;
  type: ContentSectionType;
  title: string;
  content: string;
  order: number;
  metadata?: Record<string, any>;
}

// 內容區塊類型
export type ContentSectionType = 
  | 'introduction'
  | 'concept'
  | 'example'
  | 'practice'
  | 'assessment'
  | 'summary'
  | 'extension';

// 測驗題目基礎結構
export interface BaseQuizQuestion extends BaseEntity {
  type: QuizType;
  difficulty: DifficultyLevel;
  topic: string;
  points: number;
  timeLimit?: number; // 秒
  hints?: string[];
  explanation?: string;
}

// 測驗類型
export type QuizType = 
  | 'true-false'
  | 'multiple-choice'
  | 'fill-blank'
  | 'sentence-scramble'
  | 'memory-card'
  | 'matching'
  | 'sequencing'
  | 'annotation'
  | 'open-ended';

// 用戶互動基礎記錄
export interface BaseUserInteraction extends BaseEntity {
  userId?: string;
  sessionId: string;
  action: InteractionType;
  timestamp: number;
  context: Record<string, any>;
  result?: InteractionResult;
}

// 互動類型
export type InteractionType =
  | 'content-view'
  | 'quiz-attempt'
  | 'hint-request'
  | 'bookmark'
  | 'share'
  | 'feedback'
  | 'search'
  | 'navigation';

// 互動結果
export interface InteractionResult {
  success: boolean;
  score?: number;
  timeSpent: number; // 毫秒
  errorCount?: number;
  data?: Record<string, any>;
}

// API 回應基礎結構
export interface BaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId: string;
}

// API 錯誤結構
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
}

// 學習進度基礎結構
export interface BaseLearningProgress {
  userId?: string;
  contentId: string;
  startedAt: string;
  lastAccessedAt: string;
  completionPercentage: number; // 0-100
  timeSpent: number; // 總時間，毫秒
  interactions: BaseUserInteraction[];
  achievements: Achievement[];
}

// 成就系統
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  unlockedAt: string;
  category: AchievementCategory;
  points: number;
}

// 成就類別
export type AchievementCategory =
  | 'learning'
  | 'practice'
  | 'social'
  | 'milestone'
  | 'special';

// 設定基礎結構
export interface BaseSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

// 通知設定
export interface NotificationSettings {
  enabled: boolean;
  email: boolean;
  push: boolean;
  reminders: boolean;
  achievements: boolean;
}

// 隱私設定
export interface PrivacySettings {
  shareProgress: boolean;
  allowAnalytics: boolean;
  showInLeaderboard: boolean;
}

// 無障礙設定
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
}

// 搜尋和篩選
export interface BaseSearchOptions {
  query?: string;
  subjects?: Subject[];
  difficulty?: DifficultyLevel[];
  tags?: string[];
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 排序選項
export type SortOption = 
  | 'relevance'
  | 'date'
  | 'difficulty'
  | 'popularity'
  | 'rating';

// 分頁結果
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

// 驗證結果
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

// 驗證錯誤
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// 驗證警告
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// 操作結果通用介面
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
}

// 檔案處理相關
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

export interface FileUploadResult extends OperationResult {
  fileInfo?: FileInfo;
  uploadUrl?: string;
}

// 匯出/匯入相關
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'docx' | 'html';
  includeMetadata: boolean;
  includeProgress?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ImportOptions {
  format: 'json' | 'csv';
  overwriteExisting: boolean;
  validateData: boolean;
  batchSize?: number;
}