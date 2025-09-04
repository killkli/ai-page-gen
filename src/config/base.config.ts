/**
 * 基礎配置 - 所有分支共享的配置項目
 */


// 基礎應用配置介面
export interface BaseConfig {
  // 應用基本資訊
  app: {
    name: string;
    version: string;
    description: string;
    author: string;
    homepage: string;
    repository: string;
  };

  // API 相關配置
  api: {
    gemini: {
      model: string;
      temperature: number;
      maxTokens: number;
      timeout: number;
      retryAttempts: number;
      rateLimitPerMinute: number;
    };
    jsonbin: {
      baseUrl: string;
      timeout: number;
    };
  };

  // UI 相關配置
  ui: {
    theme: {
      default: 'light' | 'dark' | 'system';
      storageKey: string;
    };
    language: {
      default: string;
      supported: string[];
      storageKey: string;
    };
    animations: {
      enabled: boolean;
      duration: number;
      easing: string;
    };
    layout: {
      maxWidth: string;
      containerPadding: string;
      borderRadius: string;
    };
  };

  // 功能開關
  features: {
    enabled: string[];
    experimental: string[];
    deprecated: string[];
  };

  // 本地存儲配置
  storage: {
    localStorage: {
      prefix: string;
      maxSize: number; // MB
    };
    indexedDB: {
      dbName: string;
      version: number;
      stores: string[];
    };
    sessionStorage: {
      prefix: string;
    };
  };

  // 性能配置
  performance: {
    loadingTimeout: number;
    debounceDelay: number;
    throttleDelay: number;
    cacheExpiry: number; // 分鐘
    maxCacheSize: number; // MB
  };

  // 安全性配置
  security: {
    apiKeyStorageKey: string;
    sessionTimeout: number; // 分鐘
    maxFailedAttempts: number;
    lockoutDuration: number; // 分鐘
  };

  // 分析和監控
  analytics: {
    enabled: boolean;
    trackingId?: string;
    events: {
      contentGeneration: boolean;
      quizCompletion: boolean;
      userInteraction: boolean;
      errorTracking: boolean;
    };
  };

  // 無障礙設定
  accessibility: {
    skipLinks: boolean;
    ariaLabels: boolean;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    highContrastMode: boolean;
  };

  // 開發模式配置
  development: {
    debug: boolean;
    verbose: boolean;
    mockApi: boolean;
    showDevTools: boolean;
  };
}

// 基礎配置實作
export const baseConfig: BaseConfig = {
  app: {
    name: 'AI Learning Page Generator',
    version: '2.0.0',
    description: 'AI-powered educational content generator',
    author: 'Development Team',
    homepage: 'https://killkli.github.io/ai-page-gen/',
    repository: 'https://github.com/killkli/ai-page-gen'
  },

  api: {
    gemini: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 4096,
      timeout: 30000,
      retryAttempts: 3,
      rateLimitPerMinute: 60
    },
    jsonbin: {
      baseUrl: 'https://api.jsonbin.io/v3',
      timeout: 10000
    }
  },

  ui: {
    theme: {
      default: 'system',
      storageKey: 'app-theme'
    },
    language: {
      default: 'zh-TW',
      supported: ['zh-TW', 'en-US', 'zh-CN'],
      storageKey: 'app-language'
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out'
    },
    layout: {
      maxWidth: '1200px',
      containerPadding: '1rem',
      borderRadius: '0.5rem'
    }
  },

  features: {
    enabled: [
      'content-generation',
      'quiz-system',
      'lesson-management',
      'progress-tracking',
      'sharing',
      'offline-support'
    ],
    experimental: [
      'ai-tutor',
      'voice-interaction',
      'collaboration'
    ],
    deprecated: [
      'legacy-quiz-format'
    ]
  },

  storage: {
    localStorage: {
      prefix: 'ailpg_',
      maxSize: 50 // 50MB
    },
    indexedDB: {
      dbName: 'AILearningPageGenerator',
      version: 1,
      stores: [
        'lessonPlans',
        'userProgress', 
        'cache',
        'settings',
        'analytics'
      ]
    },
    sessionStorage: {
      prefix: 'ailpg_session_'
    }
  },

  performance: {
    loadingTimeout: 10000,
    debounceDelay: 300,
    throttleDelay: 100,
    cacheExpiry: 60, // 60分鐘
    maxCacheSize: 100 // 100MB
  },

  security: {
    apiKeyStorageKey: 'gemini_api_key',
    sessionTimeout: 480, // 8小時
    maxFailedAttempts: 5,
    lockoutDuration: 15 // 15分鐘
  },

  analytics: {
    enabled: true,
    events: {
      contentGeneration: true,
      quizCompletion: true,
      userInteraction: true,
      errorTracking: true
    }
  },

  accessibility: {
    skipLinks: true,
    ariaLabels: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true
  },

  development: {
    debug: process.env.NODE_ENV === 'development',
    verbose: false,
    mockApi: false,
    showDevTools: process.env.NODE_ENV === 'development'
  }
};

// 配置工具函數
export class ConfigManager {
  private static instance: ConfigManager;
  protected config: BaseConfig;

  protected constructor() {
    this.config = { ...baseConfig };
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // 獲取完整配置
  public getConfig(): BaseConfig {
    return this.config;
  }

  // 獲取特定配置項
  public get<T>(path: string): T | undefined {
    return this.getNestedValue(this.config, path) as T;
  }

  // 設定配置項
  public set(path: string, value: any): void {
    this.setNestedValue(this.config, path, value);
  }

  // 合併配置
  public merge(partialConfig: Partial<BaseConfig>): void {
    this.config = this.deepMerge(this.config, partialConfig);
  }

  // 檢查功能是否啟用
  public isFeatureEnabled(feature: string): boolean {
    return this.config.features.enabled.includes(feature);
  }

  // 檢查實驗性功能是否啟用
  public isExperimentalFeatureEnabled(feature: string): boolean {
    return this.config.features.experimental.includes(feature);
  }

  // 檢查功能是否已廢棄
  public isFeatureDeprecated(feature: string): boolean {
    return this.config.features.deprecated.includes(feature);
  }

  // 獲取主題配置
  public getThemeConfig() {
    return this.config.ui.theme;
  }

  // 獲取 API 配置
  public getApiConfig(service: 'gemini' | 'jsonbin') {
    return this.config.api[service];
  }

  // 獲取存儲配置
  public getStorageConfig() {
    return this.config.storage;
  }

  // 獲取性能配置
  public getPerformanceConfig() {
    return this.config.performance;
  }

  // 獲取安全配置
  public getSecurityConfig() {
    return this.config.security;
  }

  // 深度合併物件
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // 獲取嵌套值
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // 設定嵌套值
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // 驗證配置完整性
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 檢查必要配置項
    if (!this.config.app.name) {
      errors.push('app.name is required');
    }

    if (!this.config.api.gemini.model) {
      errors.push('api.gemini.model is required');
    }

    if (this.config.api.gemini.timeout <= 0) {
      errors.push('api.gemini.timeout must be greater than 0');
    }

    if (this.config.performance.loadingTimeout <= 0) {
      errors.push('performance.loadingTimeout must be greater than 0');
    }

    // 檢查語言支援
    if (!this.config.ui.language.supported.includes(this.config.ui.language.default)) {
      errors.push('ui.language.default must be in supported languages list');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 重置為預設配置
  public reset(): void {
    this.config = { ...baseConfig };
  }

  // 匯出配置為 JSON
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // 從 JSON 匯入配置
  public importConfig(jsonConfig: string): void {
    try {
      const imported = JSON.parse(jsonConfig);
      this.config = this.deepMerge(baseConfig, imported);
    } catch (error) {
      throw new Error('Invalid JSON configuration');
    }
  }
}

// 匯出單例實例
export const configManager = ConfigManager.getInstance();

// 便利函數
export const getConfig = () => configManager.getConfig();
export const isFeatureEnabled = (feature: string) => configManager.isFeatureEnabled(feature);
export const getApiConfig = (service: 'gemini' | 'jsonbin') => configManager.getApiConfig(service);