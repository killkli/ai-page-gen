/**
 * AI Provider 系統類型定義
 * 支援多個 AI Provider（Gemini、OpenRouter 等）的統一介面
 */

// Provider 類型枚舉
export enum ProviderType {
  GEMINI = 'gemini',
  OPENROUTER = 'openrouter'
}

// 基礎 Provider 配置介面
export interface BaseProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  enabled: boolean;
  apiKey: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Gemini Provider 特定配置
export interface GeminiProviderConfig extends BaseProviderConfig {
  type: ProviderType.GEMINI;
  model: 'gemini-2.5-flash' | 'gemini-pro' | 'gemini-pro-vision';
  settings: {
    responseMimeType: 'application/json' | 'text/plain';
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

// OpenRouter Provider 特定配置
export interface OpenRouterProviderConfig extends BaseProviderConfig {
  type: ProviderType.OPENROUTER;
  model: string; // 例如 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet' 等
  settings: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stream?: boolean;
    provider?: {
      order?: string[];
      allow_fallbacks?: boolean;
      require_parameters?: boolean;
    };
  };
}

// Provider 配置聯合類型
export type ProviderConfig = GeminiProviderConfig | OpenRouterProviderConfig;

// Provider 執行結果
export interface ProviderResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Provider 狀態
export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  TESTING = 'testing'
}

// Provider 測試結果
export interface ProviderTestResult {
  providerId: string;
  status: ProviderStatus;
  responseTime?: number;
  error?: string;
  testedAt: string;
}

// Provider 管理器配置
export interface ProviderManagerConfig {
  defaultProviderId?: string;
  fallbackEnabled: boolean;
  timeout: number; // 毫秒
  retryAttempts: number;
  providers: ProviderConfig[];
}

// Provider 選擇策略
export enum ProviderSelectionStrategy {
  DEFAULT = 'default',      // 使用預設 Provider
  FASTEST = 'fastest',      // 選擇最快的 Provider
  CHEAPEST = 'cheapest',    // 選擇最便宜的 Provider
  FALLBACK = 'fallback',    // 按順序嘗試 Provider
  LOAD_BALANCE = 'load_balance' // 負載平衡
}

// Provider 使用統計
export interface ProviderUsageStats {
  providerId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  lastUsed: string;
}

// 分享的 Provider 配置
export interface SharedProviderConfig {
  id: string;
  name: string;
  description?: string;
  configs: Omit<ProviderConfig, 'apiKey' | 'id' | 'createdAt' | 'updatedAt'>[];
  sharedBy?: string;
  isPublic: boolean;
  createdAt: string;
  tags?: string[];
}

// Provider 配置匯入/匯出格式
export interface ProviderConfigExport {
  version: string;
  exportedAt: string;
  configs: Omit<ProviderConfig, 'apiKey'>[];
  metadata?: {
    appVersion?: string;
    exportedBy?: string;
    description?: string;
  };
}

// API 調用請求介面
export interface AIRequest {
  prompt: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    responseFormat?: 'json' | 'text';
    model?: string; // 覆蓋預設模型
  };
}

// 統一的 AI 回應介面
export interface AIResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: {
    model: string;
    provider: string;
    responseTime: number;
    finishReason?: string;
  };
}

// Provider 錯誤類型
export enum ProviderErrorType {
  API_KEY_INVALID = 'api_key_invalid',
  QUOTA_EXCEEDED = 'quota_exceeded',
  MODEL_NOT_AVAILABLE = 'model_not_available',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  NETWORK_ERROR = 'network_error',
  PARSING_ERROR = 'parsing_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Provider 錯誤介面
export interface IProviderError {
  type: ProviderErrorType;
  message: string;
  provider: string;
  model?: string;
  originalError?: any;
  retryable: boolean;
}

// Provider 錯誤類別
export class ProviderError extends Error {
  public type: ProviderErrorType;
  public provider: string;
  public model?: string;
  public originalError?: any;
  public retryable: boolean;

  constructor(error: IProviderError) {
    super(error.message);
    this.name = 'ProviderError';
    this.type = error.type;
    this.provider = error.provider;
    this.model = error.model;
    this.originalError = error.originalError;
    this.retryable = error.retryable;
  }
}

// Provider 能力定義
export interface ProviderCapabilities {
  supportedFormats: ('json' | 'text')[];
  supportedFunctions: boolean;
  supportedVision: boolean;
  supportedStreaming: boolean;
  maxTokens: number;
  supportedLanguages: string[];
}

// Provider 資訊介面
export interface ProviderInfo {
  type: ProviderType;
  name: string;
  description: string;
  capabilities: ProviderCapabilities;
  models: Array<{
    id: string;
    name: string;
    description?: string;
    contextLength: number;
    pricing?: {
      input: number;  // 每 1K tokens 的價格
      output: number; // 每 1K tokens 的價格
    };
  }>;
  documentationUrl?: string;
  websiteUrl?: string;
}