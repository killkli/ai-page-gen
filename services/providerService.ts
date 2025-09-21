/**
 * Provider 服務層
 * 提供 Provider 管理和配置分享功能
 */

import {
  ProviderConfig,
  ProviderManagerConfig,
  SharedProviderConfig,
  ProviderConfigExport,
  ProviderType,
  GeminiProviderConfig,
  OpenRouterProviderConfig
} from '../src/core/types/providers';
import { ProviderManager } from '../src/core/providers/ProviderManager';

// JSONBin 服務用於分享配置
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

export class ProviderService {
  private manager: ProviderManager | null = null;
  private static instance: ProviderService;

  private constructor() {
    this.initializeManager();
  }

  public static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService();
    }
    return ProviderService.instance;
  }

  // 初始化 Provider Manager
  private async initializeManager(): Promise<void> {
    try {
      const config = this.loadManagerConfig();
      // 使用重新載入配置的方法
      this.manager = ProviderManager.reloadWithConfig(config);
    } catch (error) {
      console.error('初始化 Provider Manager 失敗:', error);
      // 使用預設配置
      const defaultConfig: ProviderManagerConfig = {
        providers: [],
        fallbackEnabled: true,
        timeout: 30000,
        retryAttempts: 3
      };
      this.manager = ProviderManager.reloadWithConfig(defaultConfig);
    }
  }

  // 從 localStorage 載入管理器配置
  private loadManagerConfig(): ProviderManagerConfig {
    const stored = localStorage.getItem('provider_manager_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('解析 Provider 配置失敗:', error);
      }
    }

    // 檢查是否有舊版 Gemini API Key
    const legacyApiKey = localStorage.getItem('gemini_api_key');
    const defaultProviders: ProviderConfig[] = [];

    if (legacyApiKey) {
      // 遷移舊版 Gemini 配置
      const geminiConfig: GeminiProviderConfig = {
        id: 'gemini_migrated',
        name: 'Gemini (已遷移)',
        type: ProviderType.GEMINI,
        enabled: true,
        apiKey: legacyApiKey,
        model: 'gemini-2.5-flash',
        settings: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 8192
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      defaultProviders.push(geminiConfig);
    }

    return {
      providers: defaultProviders,
      defaultProviderId: defaultProviders.length > 0 ? defaultProviders[0].id : undefined,
      fallbackEnabled: true,
      timeout: 30000,
      retryAttempts: 3
    };
  }

  // 獲取 Provider Manager 實例
  public async getManager(): Promise<ProviderManager> {
    if (!this.manager) {
      await this.initializeManager();
    }
    return this.manager!;
  }

  // 獲取所有 Provider
  public async getProviders(): Promise<ProviderConfig[]> {
    const manager = await this.getManager();
    return manager.getProviders();
  }

  // 添加新 Provider
  public async addProvider(config: ProviderConfig): Promise<void> {
    const manager = await this.getManager();
    await manager.addProvider(config);
    // 重新初始化以確保配置同步
    await this.initializeManager();
  }

  // 更新 Provider
  public async updateProvider(config: ProviderConfig): Promise<void> {
    const manager = await this.getManager();
    await manager.updateProvider(config);
    // 重新初始化以確保配置同步
    await this.initializeManager();
  }

  // 刪除 Provider
  public async removeProvider(providerId: string): Promise<void> {
    const manager = await this.getManager();
    manager.removeProvider(providerId);
    // 重新初始化以確保配置同步
    await this.initializeManager();
  }

  // 測試 Provider 連接
  public async testProvider(providerId: string): Promise<any> {
    const manager = await this.getManager();
    return await manager.testProvider(providerId);
  }

  // 測試所有 Provider
  public async testAllProviders(): Promise<any[]> {
    const manager = await this.getManager();
    return await manager.testAllProviders();
  }

  // 設定預設 Provider
  public async setDefaultProvider(providerId: string): Promise<void> {
    const manager = await this.getManager();
    manager.setDefaultProvider(providerId);
  }

  // 獲取使用統計
  public async getUsageStats(): Promise<any[]> {
    const manager = await this.getManager();
    return manager.getUsageStats();
  }

  // 生成內容 (使用 Provider Manager)
  public async generateContent(request: any, strategy?: any): Promise<any> {
    const manager = await this.getManager();
    return await manager.generateContent(request, strategy);
  }

  // 匯出 Provider 配置
  public async exportProviderConfig(): Promise<string> {
    const manager = await this.getManager();
    return manager.exportConfig();
  }

  // 匯入 Provider 配置
  public async importProviderConfig(configJson: string): Promise<void> {
    const manager = await this.getManager();
    await manager.importConfig(configJson);
  }

  // 分享 Provider 配置到 JSONBin
  public async shareProviderConfig(
    configs: ProviderConfig[],
    name: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<string> {
    try {
      const sharedConfig: SharedProviderConfig = {
        id: `share_${Date.now()}`,
        name,
        description,
        configs: configs.map(config => ({
          ...config,
          apiKey: '', // 移除 API Key
          id: '',
          createdAt: '',
          updatedAt: ''
        })),
        isPublic,
        createdAt: new Date().toISOString(),
        tags: this.extractTagsFromConfigs(configs)
      };

      const response = await fetch(`${JSONBIN_BASE_URL}/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': '$2a$10$...' // 需要配置 JSONBin API Key
        },
        body: JSON.stringify(sharedConfig)
      });

      if (!response.ok) {
        throw new Error(`分享失敗: ${response.statusText}`);
      }

      const result = await response.json();
      return result.metadata.id;
    } catch (error) {
      console.error('分享 Provider 配置失敗:', error);
      throw error;
    }
  }

  // 從 JSONBin 載入分享的配置
  public async loadSharedProviderConfig(binId: string): Promise<SharedProviderConfig> {
    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}/latest`, {
        headers: {
          'X-Master-Key': '$2a$10$...' // 需要配置 JSONBin API Key
        }
      });

      if (!response.ok) {
        throw new Error(`載入失敗: ${response.statusText}`);
      }

      const result = await response.json();
      return result.record;
    } catch (error) {
      console.error('載入分享的 Provider 配置失敗:', error);
      throw error;
    }
  }

  // 從分享配置創建 Provider
  public async createProvidersFromShared(
    sharedConfig: SharedProviderConfig,
    apiKeys: Record<string, string>
  ): Promise<ProviderConfig[]> {
    const createdProviders: ProviderConfig[] = [];

    for (const config of sharedConfig.configs) {
      const apiKey = apiKeys[config.type];
      if (!apiKey) {
        console.warn(`跳過 ${config.name}：缺少 ${config.type} API Key`);
        continue;
      }

      const fullConfig: ProviderConfig = {
        ...config,
        id: `${config.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        apiKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: `${config.name} (已匯入)`
      } as ProviderConfig;

      await this.addProvider(fullConfig);
      createdProviders.push(fullConfig);
    }

    return createdProviders;
  }

  // 從配置中提取標籤
  private extractTagsFromConfigs(configs: ProviderConfig[]): string[] {
    const tags = new Set<string>();

    configs.forEach(config => {
      tags.add(config.type);

      // 根據模型添加標籤
      if (config.type === ProviderType.GEMINI) {
        tags.add('google');
        tags.add('multimodal');
      } else if (config.type === ProviderType.OPENROUTER) {
        tags.add('unified-api');
        const model = (config as OpenRouterProviderConfig).model;
        if (model.includes('openai')) tags.add('openai');
        if (model.includes('anthropic')) tags.add('anthropic');
        if (model.includes('google')) tags.add('google');
        if (model.includes('meta')) tags.add('meta');
      }
    });

    return Array.from(tags);
  }

  // 清除所有 Provider 數據
  public async clearAllData(): Promise<void> {
    localStorage.removeItem('provider_manager_config');
    localStorage.removeItem('provider_usage_stats');

    // 重新初始化
    this.manager = null;
    await this.initializeManager();
  }

  // 檢查是否有配置的 Provider
  public async hasConfiguredProviders(): Promise<boolean> {
    const providers = await this.getProviders();
    return providers.length > 0 && providers.some(p => p.enabled && p.apiKey);
  }

  // 獲取第一個可用的 Provider
  public async getFirstAvailableProvider(): Promise<ProviderConfig | null> {
    const providers = await this.getProviders();
    return providers.find(p => p.enabled && p.apiKey) || null;
  }

  // 遷移舊版 API Key
  public async migrateLegacyApiKey(): Promise<void> {
    const legacyApiKey = localStorage.getItem('gemini_api_key');
    if (!legacyApiKey) return;

    const existingProviders = await this.getProviders();
    const hasGeminiProvider = existingProviders.some(p => p.type === ProviderType.GEMINI);

    if (!hasGeminiProvider) {
      const geminiConfig: GeminiProviderConfig = {
        id: 'gemini_migrated',
        name: 'Gemini (已遷移)',
        type: ProviderType.GEMINI,
        enabled: true,
        apiKey: legacyApiKey,
        model: 'gemini-2.5-flash',
        settings: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 8192
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await this.addProvider(geminiConfig);

        // 設為預設 Provider
        await this.setDefaultProvider(geminiConfig.id);

        console.log('已成功遷移 Gemini API Key 到新的 Provider 系統');
      } catch (error) {
        console.error('遷移 Gemini API Key 失敗:', error);
        // 即使遷移失敗，也不應該阻止應用程式啟動
      }
    }
  }

  // 獲取向後兼容的 API Key (用於現有代碼)
  public async getLegacyApiKey(): Promise<string | null> {
    const provider = await this.getFirstAvailableProvider();
    return provider?.apiKey || null;
  }
}

// 導出單例實例
export const providerService = ProviderService.getInstance();