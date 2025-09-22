/**
 * Gemini AI 服務核心抽象類別
 * 提供三分支共享的 AI 服務基礎功能
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  BaseApiResponse, 
  BranchType,
  OperationResult,
  ValidationResult
} from '../types';

// AI 調用選項
export interface AICallOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  responseMimeType?: string;
  retryAttempts?: number;
  timeout?: number;
}

// AI 提示配置
export interface PromptConfig {
  systemPrompt?: string;
  userPrompt: string;
  examples?: PromptExample[];
  constraints?: string[];
  outputFormat?: string;
  language?: string;
}

// 提示範例
export interface PromptExample {
  input: string;
  output: string;
  explanation?: string;
}

// AI 回應解析結果
export interface ParsedAIResponse<T = any> {
  success: boolean;
  data?: T;
  rawResponse: string;
  parseErrors?: string[];
  warnings?: string[];
}

// 重試策略
export interface RetryStrategy {
  maxAttempts: number;
  baseDelay: number; // 毫秒
  maxDelay: number; // 毫秒
  backoffMultiplier: number;
  retryableErrors: string[];
}

/**
 * Gemini AI 服務基礎抽象類別
 * 所有分支的 AI 服務都應繼承此類
 */
export abstract class BaseGeminiService {
  protected apiKey: string;
  protected model: string;
  protected branchType: BranchType;
  protected defaultOptions: AICallOptions;
  protected retryStrategy: RetryStrategy;

  constructor(
    apiKey: string, 
    branchType: BranchType,
    model: string = 'gemini-2.5-flash'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.branchType = branchType;
    this.defaultOptions = {
      temperature: 0.7,
      responseMimeType: "application/json",
      retryAttempts: 3,
      timeout: 30000
    };
    this.retryStrategy = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryableErrors: [
        'RESOURCE_EXHAUSTED',
        'INTERNAL',
        'UNAVAILABLE',
        'DEADLINE_EXCEEDED'
      ]
    };
  }

  /**
   * 核心 AI 調用方法
   * 包含錯誤處理、重試機制、響應解析
   */
  protected async callGemini<T = any>(
    promptConfig: PromptConfig,
    options: AICallOptions = {}
  ): Promise<ParsedAIResponse<T>> {
    const finalOptions = { ...this.defaultOptions, ...options };
    const prompt = this.buildPrompt(promptConfig);

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < this.retryStrategy.maxAttempts) {
      try {
        const response = await this.makeAPICall(prompt, finalOptions);
        const parseResult = await this.parseResponse<T>(response);

        if (parseResult.success) {
          return parseResult;
        }

        // 解析失敗，但不算API錯誤，直接返回
        return parseResult;

      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (!this.shouldRetry(error as Error) || attempt >= this.retryStrategy.maxAttempts) {
          break;
        }

        // 計算延遲時間並等待
        const delay = Math.min(
          this.retryStrategy.baseDelay * Math.pow(this.retryStrategy.backoffMultiplier, attempt - 1),
          this.retryStrategy.maxDelay
        );
        await this.delay(delay);
      }
    }

    // 所有重試都失敗，返回錯誤
    return {
      success: false,
      rawResponse: '',
      parseErrors: [this.formatError(lastError!)],
    };
  }

  /**
   * 實際的 API 調用
   */
  private async makeAPICall(
    prompt: string, 
    options: AICallOptions
  ): Promise<GenerateContentResponse> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: options.responseMimeType,
        temperature: options.temperature,
        topP: options.topP,
        maxOutputTokens: options.maxTokens,
        stopSequences: options.stopSequences,
      },
    });

    if (!response.text) {
      throw new Error("AI_EMPTY_RESPONSE: AI 回傳內容為空，請重試或檢查 API 金鑰。");
    }

    return response;
  }

  /**
   * 建構提示字串
   */
  protected buildPrompt(config: PromptConfig): string {
    let prompt = '';

    // 系統提示
    if (config.systemPrompt) {
      prompt += `${config.systemPrompt}\n\n`;
    }

    // 範例（Few-shot learning）
    if (config.examples && config.examples.length > 0) {
      prompt += "範例:\n";
      config.examples.forEach((example, index) => {
        prompt += `範例 ${index + 1}:\n`;
        prompt += `輸入: ${example.input}\n`;
        prompt += `輸出: ${example.output}\n`;
        if (example.explanation) {
          prompt += `說明: ${example.explanation}\n`;
        }
        prompt += "\n";
      });
    }

    // 約束條件
    if (config.constraints && config.constraints.length > 0) {
      prompt += "限制條件:\n";
      config.constraints.forEach((constraint, index) => {
        prompt += `${index + 1}. ${constraint}\n`;
      });
      prompt += "\n";
    }

    // 輸出格式說明
    if (config.outputFormat) {
      prompt += `輸出格式: ${config.outputFormat}\n\n`;
    }

    // 主要提示
    prompt += config.userPrompt;

    return prompt;
  }

  /**
   * 解析 AI 回應
   */
  protected async parseResponse<T>(response: GenerateContentResponse): Promise<ParsedAIResponse<T>> {
    const rawText = response.text?.trim() || '';
    
    try {
      const cleanedJson = this.cleanJsonResponse(rawText);
      const parsed = JSON.parse(cleanedJson) as T;
      
      const validationResult = await this.validateResponse(parsed);
      
      return {
        success: validationResult.isValid,
        data: validationResult.isValid ? parsed : undefined,
        rawResponse: rawText,
        parseErrors: validationResult.isValid ? undefined : validationResult.errors.map(e => e.message),
        warnings: validationResult.warnings?.map(w => w.message)
      };

    } catch (parseError) {
      return {
        success: false,
        rawResponse: rawText,
        parseErrors: [`JSON 解析失敗: ${parseError instanceof Error ? parseError.message : '未知錯誤'}`]
      };
    }
  }

  /**
   * 清理 JSON 回應
   * 移除 markdown 代碼區塊、多餘文字等
   */
  protected cleanJsonResponse(response: string): string {
    let cleaned = response.trim();

    // 移除 markdown 代碼區塊
    const codeBlockRegex = /^```(?:\w+)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleaned.match(codeBlockRegex);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }

    // 嘗試提取第一個有效的 JSON 物件或陣列
    if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
      const jsonStart = Math.max(cleaned.indexOf('{'), cleaned.indexOf('['));
      if (jsonStart !== -1) {
        const jsonEnd = cleaned.lastIndexOf('}') > cleaned.lastIndexOf(']') 
          ? cleaned.lastIndexOf('}') 
          : cleaned.lastIndexOf(']');
        
        if (jsonEnd > jsonStart) {
          cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }
      }
    }

    return cleaned;
  }

  /**
   * 驗證 AI 回應內容
   * 子類別可以覆寫此方法來實作特定的驗證邏輯
   */
  protected async validateResponse(data: any): Promise<ValidationResult> {
    // 基礎驗證 - 檢查是否為空值
    if (data === null || data === undefined) {
      return {
        isValid: false,
        errors: [{
          field: 'root',
          code: 'EMPTY_RESPONSE',
          message: '回應內容為空',
          severity: 'error'
        }]
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * 格式化錯誤訊息
   */
  protected formatError(error: Error): string {
    const message = error.message;

    if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
      return "Gemini API 金鑰無效。請檢查您的設定。";
    }
    
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      return "已超出 API 配額。請稍後再試。";
    }
    
    if (message.includes("DEADLINE_EXCEEDED")) {
      return "API 請求超時。請檢查網路連接或稍後再試。";
    }
    
    if (message.includes("INTERNAL")) {
      return "AI 服務暫時不可用。請稍後再試。";
    }
    
    if (message.includes("INVALID_ARGUMENT")) {
      return "請求參數無效。請檢查輸入內容。";
    }

    return `無法產生內容: ${message}`;
  }

  /**
   * 判斷錯誤是否可重試
   */
  protected shouldRetry(error: Error): boolean {
    const message = error.message;
    return this.retryStrategy.retryableErrors.some(errorCode => 
      message.includes(errorCode)
    );
  }

  /**
   * 延遲執行
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 抽象方法 - 生成學習內容
   * 子類別必須實作此方法
   */
  abstract generateLearningContent(
    topic: string, 
    options: any
  ): Promise<OperationResult<any>>;

  /**
   * 抽象方法 - 生成測驗
   * 子類別必須實作此方法
   */
  abstract generateQuiz(
    content: any, 
    options: any
  ): Promise<OperationResult<any>>;

  /**
   * 抽象方法 - 提供學習回饋
   * 子類別必須實作此方法
   */
  abstract provideFeedback(
    userResponse: any, 
    correctAnswer: any,
    options?: any
  ): Promise<OperationResult<any>>;

  /**
   * 工具方法 - 建立安全的 API 回應
   */
  protected createApiResponse<T>(
    success: boolean, 
    data?: T, 
    error?: string
  ): BaseApiResponse<T> {
    return {
      success,
      data,
      error: error ? {
        code: 'UNKNOWN_ERROR',
        message: error,
        details: '',
        retryable: false
      } : undefined,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    };
  }

  /**
   * 生成請求 ID
   */
  protected generateRequestId(): string {
    return `${this.branchType}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * 取得分支特定的預設選項
   */
  protected getBranchDefaults(): Record<string, any> {
    const defaults: Record<BranchType, Record<string, any>> = {
      main: {
        language: 'zh-TW',
        includeExamples: true,
        difficulty: 'normal'
      },
      english: {
        language: 'en-US',
        cefrLevel: 'B1',
        includeAudio: true,
        includeTranslation: true
      },
      math: {
        language: 'zh-TW',
        includeFormulas: true,
        includeVisualizations: true,
        showSteps: true
      }
    };

    return defaults[this.branchType] || defaults.main;
  }

  /**
   * 記錄 API 使用情況
   */
  protected async logApiUsage(
    operation: string, 
    tokensUsed?: number, 
    success: boolean = true
  ): Promise<void> {
    // 這裡可以實作 API 使用統計記錄
    // 例如發送到分析服務或本地儲存
    console.log(`[${this.branchType}] ${operation}:`, {
      timestamp: new Date().toISOString(),
      tokensUsed,
      success,
      model: this.model
    });
  }
}
