import { ProviderConfig } from '../src/core/types/providers';
import { EncryptionService, EncryptedProviderShare, ProviderShareData } from './encryptionService';

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
// 注意：這裡需要配置真實的 JSONBin API Key，或者使用其他分享服務
const JSONBIN_API_KEY = process.env.VITE_JSONBIN_API_KEY || localStorage.getItem('jsonbin_api_key');

export class ProviderSharingService {

  // 創建加密分享
  static async createEncryptedShare(
    providers: ProviderConfig[],
    shareName: string,
    sharePassword: string,
    description?: string
  ): Promise<string> {
    try {
      // 準備要分享的數據
      const shareData: ProviderShareData = {
        providers: providers.map(provider => ({
          type: provider.type,
          name: provider.name,
          model: this.getProviderModel(provider),
          apiKey: provider.apiKey,
          settings: this.getProviderSettings(provider),
          description: provider.description
        })),
        sharedAt: new Date().toISOString()
      };

      // 加密數據
      const encryptedData = await EncryptionService.encrypt(
        JSON.stringify(shareData),
        sharePassword
      );

      // 創建分享對象
      const encryptedShare: EncryptedProviderShare = {
        id: `encrypted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: shareName,
        description,
        encryptedData,
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          providerTypes: [...new Set(providers.map(p => p.type))],
          providerCount: providers.length,
          hasEncryption: true
        }
      };

      // 上傳到 JSONBin
      if (!JSONBIN_API_KEY) {
        throw new Error('JSONBin API Key 未配置。請聯繫系統管理員或使用其他分享方式。');
      }

      const response = await fetch(`${JSONBIN_BASE_URL}/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(encryptedShare)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`上傳失敗: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result.metadata.id;
    } catch (error) {
      console.error('創建加密分享失敗:', error);
      throw error;
    }
  }

  // 創建非加密分享（向後兼容舊版本 API Key 分享）
  static createLegacyShare(apiKey: string): string {
    return `${window.location.origin}${import.meta.env.BASE_URL}?apikey=${encodeURIComponent(apiKey)}`;
  }

  // 載入加密分享
  static async loadEncryptedShare(
    binId: string,
    sharePassword: string
  ): Promise<ProviderShareData> {
    try {
      // 從 JSONBin 載入
      if (!JSONBIN_API_KEY) {
        throw new Error('JSONBin API Key 未配置。請聯繫系統管理員。');
      }

      const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}/latest`, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`載入失敗: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      const encryptedShare: EncryptedProviderShare = result.record;

      // 驗證是否為加密分享
      if (!encryptedShare.metadata?.hasEncryption) {
        throw new Error('這不是一個加密的分享配置');
      }

      // 解密數據
      const decryptedData = await EncryptionService.decrypt(
        encryptedShare.encryptedData,
        sharePassword
      );

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('載入加密分享失敗:', error);
      throw error;
    }
  }

  // 獲取分享預覽信息（不需要密碼）
  static async getSharePreview(binId: string): Promise<{
    name: string;
    description?: string;
    providerTypes: string[];
    providerCount: number;
    createdAt: string;
    hasEncryption: boolean;
  }> {
    try {
      if (!JSONBIN_API_KEY) {
        throw new Error('JSONBin API Key 未配置。請聯繫系統管理員。');
      }

      const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}/latest`, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`載入預覽失敗: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      const share: EncryptedProviderShare = result.record;

      return {
        name: share.name,
        description: share.description,
        providerTypes: share.metadata.providerTypes,
        providerCount: share.metadata.providerCount,
        createdAt: share.metadata.createdAt,
        hasEncryption: share.metadata.hasEncryption
      };
    } catch (error) {
      console.error('獲取分享預覽失敗:', error);
      throw error;
    }
  }

  // 生成分享 URL
  static generateShareUrl(binId: string): string {
    return `${window.location.origin}${import.meta.env.BASE_URL}?provider_share=${encodeURIComponent(binId)}`;
  }

  // 解析分享 URL 參數
  static parseShareUrl(): {
    type: 'legacy' | 'provider' | null;
    value: string | null;
  } {
    const params = new URLSearchParams(window.location.search);

    // 檢查新版本加密分享
    const providerShare = params.get('provider_share');
    if (providerShare) {
      return {
        type: 'provider',
        value: providerShare
      };
    }

    // 檢查舊版本 API Key 分享
    const legacyApiKey = params.get('apikey');
    if (legacyApiKey) {
      return {
        type: 'legacy',
        value: legacyApiKey
      };
    }

    return {
      type: null,
      value: null
    };
  }

  // 輔助方法：獲取 provider 的模型
  private static getProviderModel(provider: ProviderConfig): string {
    if (provider.type === 'gemini') {
      return (provider as any).model || 'gemini-2.5-flash';
    } else if (provider.type === 'openrouter') {
      return (provider as any).model || 'openai/gpt-4o';
    }
    return 'unknown';
  }

  // 輔助方法：獲取 provider 的設定
  private static getProviderSettings(provider: ProviderConfig): any {
    if (provider.type === 'gemini') {
      return (provider as any).settings || {};
    } else if (provider.type === 'openrouter') {
      return (provider as any).settings || {};
    }
    return {};
  }

  // 驗證分享配置的完整性
  static validateShareData(shareData: ProviderShareData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!shareData.providers || !Array.isArray(shareData.providers)) {
      errors.push('無效的 providers 數據');
    } else {
      shareData.providers.forEach((provider, index) => {
        if (!provider.type) {
          errors.push(`Provider ${index + 1}: 缺少類型`);
        }
        if (!provider.name) {
          errors.push(`Provider ${index + 1}: 缺少名稱`);
        }
        if (!provider.apiKey) {
          errors.push(`Provider ${index + 1}: 缺少 API Key`);
        }
        if (!provider.model) {
          errors.push(`Provider ${index + 1}: 缺少模型`);
        }
      });
    }

    if (!shareData.sharedAt) {
      errors.push('缺少分享時間');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 創建 Provider 配置從分享數據
  static createProviderConfigsFromShare(
    shareData: ProviderShareData,
    namePrefix: string = '分享的'
  ): ProviderConfig[] {
    return shareData.providers.map((shareProvider, index) => {
      const baseConfig = {
        id: `shared_${Date.now()}_${index}`,
        name: `${namePrefix} ${shareProvider.name}`,
        type: shareProvider.type as any,
        enabled: true,
        apiKey: shareProvider.apiKey,
        description: shareProvider.description || `從分享匯入的 ${shareProvider.type} 配置`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (shareProvider.type === 'gemini') {
        return {
          ...baseConfig,
          model: shareProvider.model,
          settings: shareProvider.settings || {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        } as any;
      } else if (shareProvider.type === 'openrouter') {
        return {
          ...baseConfig,
          model: shareProvider.model,
          settings: shareProvider.settings || {
            temperature: 0.7,
            max_tokens: 8192
          }
        } as any;
      }

      return baseConfig as any;
    });
  }

  // 生成分享統計
  static generateShareStats(providers: ProviderConfig[]): {
    totalProviders: number;
    providerTypes: Record<string, number>;
    estimatedCost: string;
    securityLevel: 'high' | 'medium' | 'low';
  } {
    const providerTypes: Record<string, number> = {};

    providers.forEach(provider => {
      providerTypes[provider.type] = (providerTypes[provider.type] || 0) + 1;
    });

    return {
      totalProviders: providers.length,
      providerTypes,
      estimatedCost: '免費',
      securityLevel: 'high'
    };
  }
}