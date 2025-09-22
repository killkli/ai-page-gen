/**
 * OpenRouter Provider 實現
 * 支援通過 OpenRouter 統一 API 存取多個 AI 模型
 */

import { BaseProvider } from './BaseProvider';
import {
  OpenRouterProviderConfig,
  ProviderResponse,
  AIRequest,
  ProviderInfo,
  ProviderType,
} from '../types/providers';

export class OpenRouterProvider extends BaseProvider {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(config: OpenRouterProviderConfig) {
    super(config);
  }

  public async generateContent(request: AIRequest): Promise<ProviderResponse> {
    try {
      if (!this.validateApiKey(this.config.apiKey)) {
        return this.handleError('API Key 無效', '生成內容');
      }

      const params = this.prepareRequestParams(request);
      const response = await this.executeApiCall(params);
      const parsedData = this.parseApiResponse(response);

      return this.formatResponse(parsedData, this.getEffectiveModel(request));
    } catch (error) {
      return this.handleError(error, '生成內容');
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const testRequest: AIRequest = {
        prompt: '測試連接：請以 JSON 格式回應 {"status": "OK"}',
        options: { maxTokens: 100, responseFormat: 'json' }
      };

      const response = await this.generateContent(testRequest);
      return response.success && response.data && typeof response.data === 'object';
    } catch (error) {
      console.error('OpenRouter Provider 連接測試失敗:', error);
      return false;
    }
  }

  public getProviderInfo(): ProviderInfo {
    return {
      type: ProviderType.OPENROUTER,
      name: 'OpenRouter',
      description: '統一存取多個 AI 提供商的模型，包括 OpenAI、Anthropic、Google 等',
      capabilities: {
        supportedFormats: ['json', 'text'],
        supportedFunctions: true,
        supportedVision: true,
        supportedStreaming: true,
        maxTokens: 200000, // 取決於具體模型
        supportedLanguages: ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
      },
      models: [
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          description: 'OpenAI 的旗艦模型，支援文字和視覺',
          contextLength: 128000,
          pricing: {
            input: 0.005,
            output: 0.015
          }
        },
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Anthropic 的高性能模型',
          contextLength: 200000,
          pricing: {
            input: 0.003,
            output: 0.015
          }
        },
        {
          id: 'google/gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          description: 'Google 的先進大型語言模型',
          contextLength: 2000000,
          pricing: {
            input: 0.00125,
            output: 0.005
          }
        },
        {
          id: 'mistralai/mistral-large-2411',
          name: 'Mistral Large',
          description: 'Mistral AI 的旗艦模型',
          contextLength: 128000,
          pricing: {
            input: 0.002,
            output: 0.006
          }
        },
        {
          id: 'meta-llama/llama-3.2-90b-vision-instruct',
          name: 'Llama 3.2 90B Vision',
          description: 'Meta 的開源視覺語言模型',
          contextLength: 131072,
          pricing: {
            input: 0.0009,
            output: 0.0009
          }
        }
      ],
      documentationUrl: 'https://openrouter.ai/docs',
      websiteUrl: 'https://openrouter.ai/'
    };
  }

  protected getDefaultModel(): string {
    return (this.config as OpenRouterProviderConfig).model || 'openai/gpt-4o';
  }

  protected prepareRequestParams(request: AIRequest): any {
    const config = this.config as OpenRouterProviderConfig;
    const model = request.options?.model || config.model;

    // 準備 prompt，如果需要 JSON 格式，確保 prompt 中包含 "json"
    let promptContent = request.prompt;
    const needsJsonFormat = request.options?.responseFormat === 'json';

    if (needsJsonFormat && !promptContent.toLowerCase().includes('json')) {
      // 如果需要 JSON 但 prompt 中沒有 "json" 這個詞，則添加指示
      promptContent = `${promptContent}\n\nPlease respond in JSON format.`;
    }

    // 準備訊息格式 (OpenAI Chat Completions 格式)
    const messages = [
      {
        role: 'user',
        content: promptContent
      }
    ];

    const params: any = {
      model: model,
      messages: messages,
      stream: request.options?.stream ?? config.settings.stream ?? false,
      max_tokens: request.options?.maxTokens ?? config.settings.max_tokens,
      temperature: request.options?.temperature ?? config.settings.temperature,
      top_p: config.settings.top_p,
      frequency_penalty: config.settings.frequency_penalty,
      presence_penalty: config.settings.presence_penalty
    };

    // // 添加 response_format 如果需要 JSON
    // if (needsJsonFormat) {
    //   params.response_format = { type: 'json_object' };
    // }

    // 添加 provider 配置如果存在
    if (config.settings.provider) {
      params.provider = config.settings.provider;
    }

    // 移除 undefined 值
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  }

  protected async executeApiCall(params: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Learning Page Generator'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  protected parseApiResponse(response: any): any {
    if (!response.choices || response.choices.length === 0) {
      throw new Error('OpenRouter 回應格式錯誤：缺少 choices');
    }

    const choice = response.choices[0];
    if (!choice.message || !choice.message.content) {
      throw new Error('OpenRouter 回應格式錯誤：缺少訊息內容');
    }

    const content = choice.message.content.trim();
    console.log('OpenRouter 回應內容長度:', content.length);
    console.log('OpenRouter 回應內容前100字:', content.substring(0, 100));
    console.log('OpenRouter 回應內容後100字:', content.substring(Math.max(0, content.length - 100)));

    // 先清理 JSON 格式標記，然後嘗試解析
    const cleanedContent = content
      .replace(/```json\n/g, '')       // 移除開頭的 ```json
      .replace(/\n```/g, '')           // 移除結尾的 ```
      .replace(/```\n/g, '')           // 移除其他 ```
      .replace(/```/g, '')             // 移除剩餘的 ```
      .trim();                         // 去除前後空白

    console.log('OpenRouter 清理後內容前100字:', cleanedContent.substring(0, 100));

    // 嘗試解析 JSON（如果內容看起來像 JSON）
    if (cleanedContent.startsWith('{') || cleanedContent.startsWith('[')) {
      try {
        const parsed = JSON.parse(cleanedContent);
        console.log('OpenRouter JSON 解析成功:', typeof parsed, Object.keys(parsed || {}));
        return parsed;
      } catch (error) {
        console.error('OpenRouter 回應 JSON 解析失敗:', String(error));
        console.log('JSON 解析失敗的內容:', cleanedContent);
        return cleanedContent;
      }
    }

    console.log('OpenRouter 回應不是 JSON 格式，返回清理後文字');
    return cleanedContent;
  }

  protected extractUsageInfo(_rawData: any, ...args: any[]): { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined {
    // OpenRouter 提供詳細的使用資訊
    const response = args[0]; // 從 executeApiCall 傳回的完整回應

    if (response && response.usage) {
      return {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      };
    }

    return undefined;
  }

  protected formatResponse(rawData: any, model: string, ...args: any[]): ProviderResponse {
    try {
      // 保存原始回應以提取使用資訊
      const originalResponse = args[0];

      return {
        success: true,
        data: rawData,
        provider: this.config.name,
        model: model,
        usage: originalResponse?.usage ? {
          promptTokens: originalResponse.usage.prompt_tokens,
          completionTokens: originalResponse.usage.completion_tokens,
          totalTokens: originalResponse.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      return this.handleError(error, '格式化回應數據');
    }
  }

  private getEffectiveModel(request: AIRequest): string {
    const config = this.config as OpenRouterProviderConfig;
    return request.options?.model || config.model;
  }

  // 覆蓋父類的錯誤處理，提供 OpenRouter 特定的錯誤訊息
  protected handleError(error: any, _context: string): ProviderResponse {
    let errorMessage = "無法產生內容。";

    if (error instanceof Error) {
      errorMessage += ` 詳細資料： ${error.message}`;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const typedError = error as { message: string };

      if (typedError.message.includes("Unauthorized") || typedError.message.includes("401")) {
        errorMessage = "OpenRouter API 金鑰無效。請檢查您的設定。";
      } else if (typedError.message.includes("rate limit") || typedError.message.includes("429")) {
        errorMessage = "已超出 API 速率限制。請稍後再試。";
      } else if (typedError.message.includes("quota") || typedError.message.includes("insufficient")) {
        errorMessage = "已超出 API 配額或餘額不足。請檢查您的 OpenRouter 帳戶。";
      } else if (typedError.message.includes("model") || typedError.message.includes("not found")) {
        errorMessage = "所選模型不可用。請嘗試其他模型。";
      } else if (typedError.message.includes("timeout") || typedError.message.includes("network")) {
        errorMessage = "網路連接超時。請檢查網路連接後重試。";
      }
    }

    return {
      success: false,
      error: errorMessage,
      provider: this.config.name,
      model: this.getDefaultModel()
    };
  }

  // 特別方法：獲取可用模型清單
  public async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('獲取 OpenRouter 模型清單失敗:', error);
      return [];
    }
  }
}
