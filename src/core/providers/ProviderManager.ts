/**
 * Provider 管理器
 * 負責管理所有 AI Provider 的生命週期、配置和調用
 */

import {
  ProviderConfig,
  ProviderManagerConfig,
  ProviderType,
  ProviderStatus,
  ProviderTestResult,
  ProviderSelectionStrategy,
  ProviderUsageStats,
  AIRequest,
  AIResponse,
  ProviderError,
  ProviderErrorType,
} from '../types/providers';

import { GeminiProvider } from './GeminiProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { BaseProvider } from './BaseProvider';

export class ProviderManager {
  private providers: Map<string, BaseProvider> = new Map();
  private config: ProviderManagerConfig;
  private usageStats: Map<string, ProviderUsageStats> = new Map();
  private static instance: ProviderManager;

  private constructor(config: ProviderManagerConfig) {
    this.config = config;
    this.initializeProviders();
    this.loadUsageStats();
  }

  // 單例模式
  public static getInstance(config?: ProviderManagerConfig): ProviderManager {
    if (!ProviderManager.instance) {
      if (!config) {
        // 提供預設配置
        config = {
          providers: [],
          fallbackEnabled: true,
          timeout: 30000,
          retryAttempts: 3
        };
      }
      ProviderManager.instance = new ProviderManager(config);
    }
    return ProviderManager.instance;
  }

  // 重新載入配置
  public static reloadWithConfig(config: ProviderManagerConfig): ProviderManager {
    ProviderManager.instance = new ProviderManager(config);
    return ProviderManager.instance;
  }

  // 初始化所有 Provider
  private initializeProviders(): void {
    this.config.providers.forEach(config => {
      try {
        const provider = this.createProvider(config);
        this.providers.set(config.id, provider);
      } catch (error) {
        console.error(`初始化 Provider ${config.id} 失敗:`, error);
      }
    });
  }

  // 創建特定類型的 Provider
  private createProvider(config: ProviderConfig): BaseProvider {
    switch (config.type) {
      case ProviderType.GEMINI:
        return new GeminiProvider(config);
      case ProviderType.OPENROUTER:
        return new OpenRouterProvider(config);
    }
  }

  // 添加新的 Provider
  public async addProvider(config: ProviderConfig): Promise<void> {
    try {
      const provider = this.createProvider(config);

      // 測試 Provider 是否可用
      const testResult = await this.testProvider(config.id, provider);
      if (testResult.status === ProviderStatus.ERROR) {
        throw new Error(`Provider 測試失敗: ${testResult.error}`);
      }

      this.providers.set(config.id, provider);
      this.config.providers.push(config);
      this.saveConfig();

      console.log(`Provider ${config.id} 已成功添加`);
    } catch (error) {
      console.error(`添加 Provider ${config.id} 失敗:`, error);
      throw error;
    }
  }

  // 移除 Provider
  public removeProvider(providerId: string): void {
    this.providers.delete(providerId);
    this.config.providers = this.config.providers.filter(p => p.id !== providerId);
    this.usageStats.delete(providerId);
    this.saveConfig();
    console.log(`Provider ${providerId} 已移除`);
  }

  // 更新 Provider 配置
  public async updateProvider(config: ProviderConfig): Promise<void> {
    try {
      const provider = this.createProvider(config);

      // 測試更新後的配置
      const testResult = await this.testProvider(config.id, provider);
      if (testResult.status === ProviderStatus.ERROR) {
        throw new Error(`Provider 測試失敗: ${testResult.error}`);
      }

      this.providers.set(config.id, provider);
      const index = this.config.providers.findIndex(p => p.id === config.id);
      if (index >= 0) {
        this.config.providers[index] = config;
      }
      this.saveConfig();

      console.log(`Provider ${config.id} 已更新`);
    } catch (error) {
      console.error(`更新 Provider ${config.id} 失敗:`, error);
      throw error;
    }
  }

  // 測試 Provider 連接
  public async testProvider(providerId: string, provider?: BaseProvider): Promise<ProviderTestResult> {
    const startTime = Date.now();
    const testProvider = provider || this.providers.get(providerId);

    if (!testProvider) {
      return {
        providerId,
        status: ProviderStatus.ERROR,
        error: 'Provider 不存在',
        testedAt: new Date().toISOString()
      };
    }

    try {
      const testRequest: AIRequest = {
        prompt: '測試連接：請回應 "OK"',
        options: { maxTokens: 500, responseFormat: 'text' }
      };

      const response = await testProvider.generateContent(testRequest);
      const responseTime = Date.now() - startTime;

      return {
        providerId,
        status: response.success ? ProviderStatus.ACTIVE : ProviderStatus.ERROR,
        responseTime,
        error: response.error,
        testedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        providerId,
        status: ProviderStatus.ERROR,
        error: error instanceof Error ? error.message : '未知錯誤',
        testedAt: new Date().toISOString()
      };
    }
  }

  // 測試所有 Provider
  public async testAllProviders(): Promise<ProviderTestResult[]> {
    const results: ProviderTestResult[] = [];

    for (const [providerId, provider] of this.providers) {
      const result = await this.testProvider(providerId, provider);
      results.push(result);
    }

    return results;
  }

  // 主要的內容生成方法
  public async generateContent(
    request: AIRequest,
    strategy: ProviderSelectionStrategy = ProviderSelectionStrategy.DEFAULT
  ): Promise<AIResponse> {
    const selectedProvider = await this.selectProvider(strategy);

    if (!selectedProvider) {
      throw new ProviderError({
        type: ProviderErrorType.UNKNOWN_ERROR,
        message: '沒有可用的 Provider',
        provider: 'none',
        retryable: false
      });
    }

    const startTime = Date.now();

    try {
      const response = await selectedProvider.provider.generateContent(request);
      const responseTime = Date.now() - startTime;

      if (!response.success) {
        throw new ProviderError({
          type: this.mapErrorType(response.error || ''),
          message: response.error || '未知錯誤',
          provider: selectedProvider.id,
          retryable: true
        });
      }

      // 更新使用統計
      this.updateUsageStats(selectedProvider.id, true, responseTime, response.usage?.totalTokens || 0);

      return {
        content: response.data,
        usage: response.usage,
        metadata: {
          model: response.model,
          provider: response.provider,
          responseTime,
          finishReason: 'stop'
        }
      };
    } catch (error) {
      this.updateUsageStats(selectedProvider.id, false, Date.now() - startTime, 0);

      if (this.config.fallbackEnabled && strategy !== ProviderSelectionStrategy.FALLBACK) {
        console.warn(`Provider ${selectedProvider.id} 失敗，嘗試 fallback...`);
        return this.generateContent(request, ProviderSelectionStrategy.FALLBACK);
      }

      throw error;
    }
  }

  // Provider 選擇邏輯
  private async selectProvider(strategy: ProviderSelectionStrategy): Promise<{ id: string; provider: BaseProvider } | null> {
    const availableProviders = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isEnabled())
      .map(([id, provider]) => ({ id, provider }));

    console.log('ProviderManager: 可用的 Provider:', availableProviders.map(p => ({ id: p.id, type: (p.provider as any).config.type })));

    if (availableProviders.length === 0) {
      console.log('ProviderManager: 沒有可用的 Provider');
      return null;
    }

    switch (strategy) {
      case ProviderSelectionStrategy.DEFAULT: {
        const defaultId = this.config.defaultProviderId;
        console.log('ProviderManager: 預設 Provider ID:', defaultId);
        if (defaultId && this.providers.has(defaultId)) {
          const selectedProvider = { id: defaultId, provider: this.providers.get(defaultId)! };
          console.log('ProviderManager: 選擇預設 Provider:', { id: selectedProvider.id, type: (selectedProvider.provider as any).config.type });
          return selectedProvider;
        }
        console.log('ProviderManager: 預設 Provider 不可用，使用第一個可用的 Provider:', availableProviders[0].id);
        return availableProviders[0];
      }

      case ProviderSelectionStrategy.FASTEST:
        return this.selectFastestProvider(availableProviders);

      case ProviderSelectionStrategy.FALLBACK:
        return this.selectFallbackProvider(availableProviders);

      case ProviderSelectionStrategy.LOAD_BALANCE:
        return this.selectLoadBalanceProvider(availableProviders);

      default:
        return availableProviders[0];
    }
  }

  // 選擇最快的 Provider
  private selectFastestProvider(providers: Array<{ id: string; provider: BaseProvider }>): { id: string; provider: BaseProvider } {
    let fastest = providers[0];
    let fastestTime = this.getAverageResponseTime(fastest.id);

    for (const provider of providers.slice(1)) {
      const avgTime = this.getAverageResponseTime(provider.id);
      if (avgTime < fastestTime) {
        fastest = provider;
        fastestTime = avgTime;
      }
    }

    return fastest;
  }

  // 選擇 Fallback Provider
  private selectFallbackProvider(providers: Array<{ id: string; provider: BaseProvider }>): { id: string; provider: BaseProvider } {
    // 按配置順序返回第一個可用的 Provider
    for (const configProvider of this.config.providers) {
      const provider = providers.find(p => p.id === configProvider.id);
      if (provider) {
        return provider;
      }
    }
    return providers[0];
  }

  // 選擇負載平衡 Provider
  private selectLoadBalanceProvider(providers: Array<{ id: string; provider: BaseProvider }>): { id: string; provider: BaseProvider } {
    // 簡單的輪詢選擇
    const timestamp = Date.now();
    const index = Math.floor(timestamp / 1000) % providers.length;
    return providers[index];
  }

  // 獲取平均回應時間
  private getAverageResponseTime(providerId: string): number {
    const stats = this.usageStats.get(providerId);
    return stats?.averageResponseTime || Infinity;
  }

  // 更新使用統計
  private updateUsageStats(providerId: string, success: boolean, responseTime: number, tokens: number): void {
    const stats = this.usageStats.get(providerId) || {
      providerId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      lastUsed: new Date().toISOString()
    };

    stats.totalRequests++;
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    // 更新平均回應時間
    const totalTime = stats.averageResponseTime * (stats.totalRequests - 1) + responseTime;
    stats.averageResponseTime = totalTime / stats.totalRequests;

    stats.totalTokensUsed += tokens;
    stats.lastUsed = new Date().toISOString();

    this.usageStats.set(providerId, stats);
    this.saveUsageStats();
  }

  // 錯誤類型映射
  private mapErrorType(error: string): ProviderErrorType {
    const errorLower = error.toLowerCase();

    if (errorLower.includes('api key') || errorLower.includes('invalid')) {
      return ProviderErrorType.API_KEY_INVALID;
    }
    if (errorLower.includes('quota') || errorLower.includes('exhausted')) {
      return ProviderErrorType.QUOTA_EXCEEDED;
    }
    if (errorLower.includes('rate limit')) {
      return ProviderErrorType.RATE_LIMIT_EXCEEDED;
    }
    if (errorLower.includes('model') || errorLower.includes('not found')) {
      return ProviderErrorType.MODEL_NOT_AVAILABLE;
    }
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return ProviderErrorType.NETWORK_ERROR;
    }
    if (errorLower.includes('json') || errorLower.includes('parsing')) {
      return ProviderErrorType.PARSING_ERROR;
    }

    return ProviderErrorType.UNKNOWN_ERROR;
  }

  // 獲取所有 Provider 配置
  public getProviders(): ProviderConfig[] {
    return [...this.config.providers];
  }

  // 獲取特定 Provider 配置
  public getProvider(providerId: string): ProviderConfig | undefined {
    return this.config.providers.find(p => p.id === providerId);
  }

  // 獲取使用統計
  public getUsageStats(): ProviderUsageStats[] {
    return Array.from(this.usageStats.values());
  }

  // 設定預設 Provider
  public setDefaultProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider ${providerId} 不存在`);
    }
    this.config.defaultProviderId = providerId;
    this.saveConfig();
  }

  // 保存配置到 localStorage
  private saveConfig(): void {
    try {
      localStorage.setItem('provider_manager_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('保存 Provider 配置失敗:', error);
    }
  }

  // 載入使用統計
  private loadUsageStats(): void {
    try {
      const stored = localStorage.getItem('provider_usage_stats');
      if (stored) {
        const stats = JSON.parse(stored);
        this.usageStats = new Map(Object.entries(stats));
      }
    } catch (error) {
      console.error('載入使用統計失敗:', error);
    }
  }

  // 保存使用統計
  private saveUsageStats(): void {
    try {
      const stats = Object.fromEntries(this.usageStats);
      localStorage.setItem('provider_usage_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('保存使用統計失敗:', error);
    }
  }

  // 清除使用統計
  public clearUsageStats(): void {
    this.usageStats.clear();
    localStorage.removeItem('provider_usage_stats');
  }

  // 匯出配置
  public exportConfig(): string {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      configs: this.config.providers.map(config => ({
        ...config,
        apiKey: '' // 不匯出 API Key
      })),
      metadata: {
        appVersion: '1.0.0',
        description: 'AI Provider 配置匯出'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  // 匯入配置
  public async importConfig(configJson: string): Promise<void> {
    try {
      const importData = JSON.parse(configJson);

      // 驗證匯入格式
      if (!importData.configs || !Array.isArray(importData.configs)) {
        throw new Error('無效的配置格式');
      }

      // 添加匯入的配置（需要用戶提供 API Key）
      for (const config of importData.configs) {
        if (!config.apiKey) {
          console.warn(`跳過 ${config.name}：缺少 API Key`);
          continue;
        }

        await this.addProvider({
          ...config,
          id: `${config.type}_${Date.now()}`, // 生成新的 ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('匯入配置失敗:', error);
      throw error;
    }
  }
}
