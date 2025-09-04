/**
 * 配置系統匯出入口
 * 提供統一的配置管理介面
 */

import { BranchType } from '../core/types';

// 匯出所有配置
export * from './base.config';
export * from './main.config';
export * from './english.config';
export * from './math.config';

// 匯出配置管理器
export { ConfigManager, configManager } from './base.config';
export { MainConfigManager, mainConfigManager } from './main.config';
export { EnglishConfigManager, englishConfigManager } from './english.config';
export { MathConfigManager, mathConfigManager } from './math.config';

// 統一配置管理器
export class UnifiedConfigManager {
  private static instance: UnifiedConfigManager;
  
  private constructor() {}

  public static getInstance(): UnifiedConfigManager {
    if (!UnifiedConfigManager.instance) {
      UnifiedConfigManager.instance = new UnifiedConfigManager();
    }
    return UnifiedConfigManager.instance;
  }

  /**
   * 根據分支類型獲取相應的配置管理器
   */
  public getConfigManager(branchType: BranchType) {
    switch (branchType) {
      case 'main':
        return import('./main.config').then(m => m.mainConfigManager);
      case 'english':
        return import('./english.config').then(m => m.englishConfigManager);
      case 'math':
        return import('./math.config').then(m => m.mathConfigManager);
      default:
        return import('./base.config').then(m => m.configManager);
    }
  }

  /**
   * 獲取當前分支配置
   */
  public async getCurrentConfig(branchType: BranchType) {
    const manager = await this.getConfigManager(branchType);
    return manager.getConfig();
  }

  /**
   * 檢查功能是否在指定分支中啟用
   */
  public async isFeatureEnabled(branchType: BranchType, feature: string): Promise<boolean> {
    const manager = await this.getConfigManager(branchType);
    return manager.isFeatureEnabled(feature);
  }

  /**
   * 獲取API配置
   */
  public async getApiConfig(branchType: BranchType, service: 'gemini' | 'jsonbin') {
    const manager = await this.getConfigManager(branchType);
    return manager.getApiConfig(service);
  }

  /**
   * 動態檢測當前分支類型
   */
  public detectCurrentBranch(): BranchType {
    // 檢查 URL 路徑
    const path = window.location.pathname;
    const hostname = window.location.hostname;

    // 檢查主機名是否包含分支標識
    if (hostname.includes('english') || path.includes('english')) {
      return 'english';
    }
    
    if (hostname.includes('math') || path.includes('math')) {
      return 'math';
    }

    // 檢查本地存儲的分支偏好
    const storedBranch = localStorage.getItem('preferred_branch') as BranchType;
    if (storedBranch && ['main', 'english', 'math'].includes(storedBranch)) {
      return storedBranch;
    }

    // 預設返回 main
    return 'main';
  }

  /**
   * 設定分支偏好
   */
  public setBranchPreference(branchType: BranchType): void {
    localStorage.setItem('preferred_branch', branchType);
  }

  /**
   * 清除分支偏好
   */
  public clearBranchPreference(): void {
    localStorage.removeItem('preferred_branch');
  }

  /**
   * 獲取分支特定的主題配置
   */
  public async getBranchTheme(branchType: BranchType) {
    const themes = {
      main: {
        name: 'default',
        primary: '#0ea5e9',
        secondary: '#64748b',
        accent: '#f59e0b'
      },
      english: {
        name: 'english',
        primary: '#3b82f6',
        secondary: '#22c55e',
        accent: '#8b5cf6'
      },
      math: {
        name: 'math',
        primary: '#a855f7',
        secondary: '#f97316',
        accent: '#10b981'
      }
    };

    return themes[branchType];
  }

  /**
   * 驗證分支間的配置兼容性
   */
  public async validateCrossBranchCompatibility(): Promise<{
    isCompatible: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // 檢查各分支的基礎配置
      const [mainManager, englishManager, mathManager] = await Promise.all([
        this.getConfigManager('main'),
        this.getConfigManager('english'),
        this.getConfigManager('math')
      ]);

      const mainConfig = mainManager.getConfig();
      const englishConfig = englishManager.getConfig();
      const mathConfig = mathManager.getConfig();

      // 檢查 API 配置一致性
      if (mainConfig.api.gemini.model !== englishConfig.api.gemini.model) {
        warnings.push('英文分支使用不同的 Gemini 模型');
      }

      if (mainConfig.api.gemini.model !== mathConfig.api.gemini.model) {
        warnings.push('數學分支使用不同的 Gemini 模型');
      }

      // 檢查存儲配置兼容性
      if (mainConfig.storage.indexedDB.dbName !== englishConfig.storage.indexedDB.dbName) {
        errors.push('分支間數據庫名稱不一致，可能導致數據隔離問題');
      }

      // 檢查功能重疊
      const mainFeatures = new Set(mainConfig.features.enabled);
      const englishFeatures = new Set(englishConfig.features.enabled);
      const mathFeatures = new Set(mathConfig.features.enabled);

      // 檢查是否有互斥功能同時啟用
      const conflictingFeatures: string[] = [];
      englishFeatures.forEach(feature => {
        if (feature.startsWith('speech-') && mathFeatures.has(feature)) {
          conflictingFeatures.push(feature);
        }
      });

      if (conflictingFeatures.length > 0) {
        warnings.push(`發現可能衝突的功能: ${conflictingFeatures.join(', ')}`);
      }

    } catch (error) {
      errors.push(`配置驗證時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }

    return {
      isCompatible: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * 匯出所有分支配置
   */
  public async exportAllConfigs() {
    const [mainManager, englishManager, mathManager] = await Promise.all([
      this.getConfigManager('main'),
      this.getConfigManager('english'),
      this.getConfigManager('math')
    ]);

    return {
      main: mainManager.getConfig(),
      english: englishManager.getConfig(),
      math: mathManager.getConfig(),
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    };
  }

  /**
   * 從匯出數據恢復配置
   */
  public async importAllConfigs(configData: any) {
    try {
      const { main: mainConfig, english: englishConfig, math: mathConfig } = configData;

      if (mainConfig) {
        const mainManager = await this.getConfigManager('main');
        mainManager.importConfig(JSON.stringify(mainConfig));
      }

      if (englishConfig) {
        const englishManager = await this.getConfigManager('english');
        englishManager.importConfig(JSON.stringify(englishConfig));
      }

      if (mathConfig) {
        const mathManager = await this.getConfigManager('math');
        mathManager.importConfig(JSON.stringify(mathConfig));
      }

      return { success: true, message: '配置匯入成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `配置匯入失敗: ${error instanceof Error ? error.message : '未知錯誤'}` 
      };
    }
  }
}

// 匯出統一配置管理器實例
export const unifiedConfigManager = UnifiedConfigManager.getInstance();

// 便利函數
export const getCurrentBranch = () => unifiedConfigManager.detectCurrentBranch();
export const setBranchPreference = (branch: BranchType) => unifiedConfigManager.setBranchPreference(branch);
export const getCurrentConfig = (branch?: BranchType) => {
  const currentBranch = branch || getCurrentBranch();
  return unifiedConfigManager.getCurrentConfig(currentBranch);
};
export const isFeatureEnabled = async (feature: string, branch?: BranchType) => {
  const currentBranch = branch || getCurrentBranch();
  return unifiedConfigManager.isFeatureEnabled(currentBranch, feature);
};
export const getBranchTheme = (branch?: BranchType) => {
  const currentBranch = branch || getCurrentBranch();
  return unifiedConfigManager.getBranchTheme(currentBranch);
};