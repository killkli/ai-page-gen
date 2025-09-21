/**
 * Gemini Provider 實現
 * 適配現有的 Gemini API 調用邏輯
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BaseProvider } from './BaseProvider';
import {
  GeminiProviderConfig,
  ProviderResponse,
  AIRequest,
  ProviderInfo,
  ProviderType,
  ProviderCapabilities
} from '../types/providers';

export class GeminiProvider extends BaseProvider {
  private ai: GoogleGenAI;

  constructor(config: GeminiProviderConfig) {
    super(config);
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
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
      console.error('Gemini Provider 連接測試失敗:', error);
      return false;
    }
  }

  public getProviderInfo(): ProviderInfo {
    return {
      type: ProviderType.GEMINI,
      name: 'Google Gemini',
      description: 'Google 的多模態大型語言模型，支援文字和圖像處理',
      capabilities: {
        supportedFormats: ['json', 'text'],
        supportedFunctions: false,
        supportedVision: true,
        supportedStreaming: false,
        maxTokens: 32768,
        supportedLanguages: ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es']
      },
      models: [
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: '最新版本的 Gemini Flash 模型，速度快且準確',
          contextLength: 32768,
          pricing: {
            input: 0.00015,
            output: 0.0006
          }
        },
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          description: 'Gemini Pro 模型，平衡效能和準確性',
          contextLength: 32768,
          pricing: {
            input: 0.0005,
            output: 0.0015
          }
        },
        {
          id: 'gemini-pro-vision',
          name: 'Gemini Pro Vision',
          description: '支援視覺理解的 Gemini Pro 模型',
          contextLength: 16384,
          pricing: {
            input: 0.00025,
            output: 0.0005
          }
        }
      ],
      documentationUrl: 'https://ai.google.dev/docs',
      websiteUrl: 'https://ai.google.dev/'
    };
  }

  protected getDefaultModel(): string {
    return (this.config as GeminiProviderConfig).model || 'gemini-2.5-flash';
  }

  protected prepareRequestParams(request: AIRequest): any {
    const config = this.config as GeminiProviderConfig;
    const model = request.options?.model || config.model;

    return {
      model: model,
      contents: [{ parts: [{ text: request.prompt }] }],
      config: {
        responseMimeType: request.options?.responseFormat === 'json' ?
          'application/json' : 'text/plain',
        temperature: request.options?.temperature ?? config.settings.temperature,
        maxOutputTokens: request.options?.maxTokens ?? config.settings.maxOutputTokens,
        topP: config.settings.topP,
        topK: config.settings.topK
      }
    };
  }

  protected async executeApiCall(params: any): Promise<GenerateContentResponse> {
    return await this.ai.models.generateContent(params);
  }

  protected parseApiResponse(response: GenerateContentResponse): any {
    if (!response.text) {
      throw new Error("AI 回傳內容為空，請重試或檢查 API 金鑰。");
    }

    let jsonStr = response.text.trim();

    // 先移除 code block fence
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    // 嘗試抓出第一個合法 JSON 區塊（{} 或 []）
    if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[") && (jsonStr.includes("{") || jsonStr.includes("["))) {
      const objStart = jsonStr.indexOf("{");
      const arrStart = jsonStr.indexOf("[");
      let jsonStart = -1;
      let jsonEnd = -1;

      if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
        // 以 { 開頭
        jsonStart = objStart;
        jsonEnd = jsonStr.lastIndexOf("}");
      } else if (arrStart !== -1) {
        // 以 [ 開頭
        jsonStart = arrStart;
        jsonEnd = jsonStr.lastIndexOf("]");
      }

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
      }
    }

    try {
      return JSON.parse(jsonStr);
    } catch (_err) {
      // 如果 JSON 解析失敗，返回原始文字
      console.warn("Gemini 回應 JSON 解析失敗，返回原始文字:", response.text);
      return response.text;
    }
  }

  protected extractUsageInfo(_rawData: any): { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined {
    // Gemini API 通常不提供詳細的 token 使用資訊
    // 這裡可以根據文字長度估算，或返回 undefined
    return undefined;
  }

  private getEffectiveModel(request: AIRequest): string {
    const _config = this.config as GeminiProviderConfig;
    return request.options?.model || _config.model;
  }

  // 覆蓋父類的錯誤處理，提供 Gemini 特定的錯誤訊息
  protected handleError(error: any, _context: string): ProviderResponse {
    let errorMessage = "無法產生內容。";

    if (error instanceof Error) {
      errorMessage += ` 詳細資料： ${error.message}`;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const typedError = error as { message: string };
      if (typedError.message.includes("API key not valid") || typedError.message.includes("API_KEY_INVALID")) {
        errorMessage = "Gemini API 金鑰無效。請檢查您的設定。";
      } else if (typedError.message.includes("quota") || typedError.message.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "已超出 API 配額。請稍後再試。";
      } else if (typedError.message.toLowerCase().includes("json") || typedError.message.includes("Unexpected token")) {
        errorMessage = "AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。";
      }
    }

    return {
      success: false,
      error: errorMessage,
      provider: this.config.name,
      model: this.getDefaultModel()
    };
  }

  // 獲取可用模型清單
  public async getAvailableModels(): Promise<any[]> {
    try {
      // 使用 Google AI API 的 listModels 端點
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + this.config.apiKey);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 過濾出支援 generateContent 的模型
      const models = (data.models || [])
        .filter((model: any) =>
          model.supportedGenerationMethods &&
          model.supportedGenerationMethods.includes('generateContent')
        )
        .map((model: any) => ({
          id: model.name.replace('models/', ''), // 移除 'models/' 前缀
          name: model.displayName || model.name,
          description: model.description || '',
          inputTokenLimit: model.inputTokenLimit || 0,
          outputTokenLimit: model.outputTokenLimit || 0
        }));

      return models;
    } catch (error) {
      console.error('獲取 Gemini 模型清單失敗:', error);

      // 返回預設模型清單作為備用
      return [
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: '快速響應的 Gemini 模型',
          inputTokenLimit: 1048576,
          outputTokenLimit: 8192
        },
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          description: 'Gemini 專業版模型',
          inputTokenLimit: 30720,
          outputTokenLimit: 2048
        },
        {
          id: 'gemini-pro-vision',
          name: 'Gemini Pro Vision',
          description: '支援視覺輸入的 Gemini 模型',
          inputTokenLimit: 12288,
          outputTokenLimit: 4096
        }
      ];
    }
  }
}