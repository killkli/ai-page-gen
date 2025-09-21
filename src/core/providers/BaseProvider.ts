/**
 * 基礎 Provider 抽象類
 * 定義所有 AI Provider 必須實現的介面
 */

import {
  ProviderConfig,
  ProviderResponse,
  AIRequest,
  ProviderInfo,
  ProviderCapabilities
} from '../types/providers';

export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected enabled: boolean = true;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.enabled = config.enabled;
  }

  // 抽象方法：生成內容
  public abstract generateContent(request: AIRequest): Promise<ProviderResponse>;

  // 抽象方法：測試連接
  public abstract testConnection(): Promise<boolean>;

  // 抽象方法：獲取 Provider 資訊
  public abstract getProviderInfo(): ProviderInfo;

  // 抽象方法：獲取可用模型清單
  public abstract getAvailableModels(): Promise<any[]>;

  // 獲取配置
  public getConfig(): ProviderConfig {
    return { ...this.config };
  }

  // 更新配置
  public updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 檢查是否啟用
  public isEnabled(): boolean {
    return this.enabled && this.config.enabled;
  }

  // 啟用/禁用 Provider
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // 獲取 Provider ID
  public getId(): string {
    return this.config.id;
  }

  // 獲取 Provider 名稱
  public getName(): string {
    return this.config.name;
  }

  // 獲取 Provider 類型
  public getType(): string {
    return this.config.type;
  }

  // 驗證 API Key 格式
  protected validateApiKey(apiKey: string): boolean {
    return apiKey && apiKey.trim().length > 0;
  }

  // 處理 API 錯誤
  protected handleError(error: any, _context: string): ProviderResponse {
    console.error(`${this.config.name} - ${_context}:`, error);

    let errorMessage = '未知錯誤';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      provider: this.config.name,
      model: this.getDefaultModel()
    };
  }

  // 獲取預設模型
  protected abstract getDefaultModel(): string;

  // 格式化回應數據
  protected formatResponse(_rawData: any, model: string): ProviderResponse {
    try {
      return {
        success: true,
        data: _rawData,
        provider: this.config.name,
        model: model,
        usage: this.extractUsageInfo(_rawData)
      };
    } catch (error) {
      return this.handleError(error, '格式化回應數據');
    }
  }

  // 提取使用資訊（可由子類覆蓋）
  protected extractUsageInfo(_rawData: any): { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined {
    // 預設實現，子類可以覆蓋
    return undefined;
  }

  // 準備請求參數（由子類實現）
  protected abstract prepareRequestParams(request: AIRequest): any;

  // 執行 API 調用（由子類實現）
  protected abstract executeApiCall(params: any): Promise<any>;

  // 解析 API 回應（由子類實現）
  protected abstract parseApiResponse(response: any): any;
}