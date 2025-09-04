/**
 * 通用分支（Main Branch）配置
 * 繼承基礎配置，保持跨領域通用性和向專業分支的橋接功能
 */

import { BaseConfig, baseConfig, ConfigManager } from './base.config';
import { Subject } from '../core/types';

// 通用分支配置介面
export interface MainConfig extends BaseConfig {
  // 通用學習功能設定
  main: {
    // 學科識別和分類
    subjectClassification: {
      enabled: boolean;
      confidence: {
        threshold: number; // 分類信心閾值 0-1
        multiSubject: number; // 跨學科判定閾值 0-1
      };
      supportedSubjects: Subject[];
      keywordSets: {
        [key in Subject]: string[]; // 各學科關鍵詞集
      };
      contextAnalysis: {
        enabled: boolean;
        sentenceWindow: number; // 分析視窗大小（句子數）
        semanticSimilarity: boolean; // 語意相似度分析
      };
    };

    // 內容適應性生成
    contentAdaptation: {
      templates: {
        science: {
          emphasizeExperiments: boolean;
          includeFormulas: boolean;
          visualDiagrams: boolean;
          practicalApplications: boolean;
        };
        humanities: {
          emphasizeContext: boolean;
          includePrimarySources: boolean;
          criticalThinking: boolean;
          caseStudies: boolean;
        };
        socialStudies: {
          currentEvents: boolean;
          multiplePeropectives: boolean;
          ethicalConsiderations: boolean;
          communityConnections: boolean;
        };
        arts: {
          creativePractice: boolean;
          historicalContext: boolean;
          personalExpression: boolean;
          criticalAnalysis: boolean;
        };
        general: {
          balancedApproach: boolean;
          crossDisciplinary: boolean;
          realWorldExamples: boolean;
          scaffoldedLearning: boolean;
        };
      };
      dynamicAdjustment: {
        enabled: boolean;
        userFeedback: boolean; // 基於用戶回饋調整
        performanceMetrics: boolean; // 基於表現指標調整
        contentEffectiveness: boolean; // 基於內容效果調整
      };
    };

    // 增強型測驗系統
    enhancedQuiz: {
      newTypes: {
        matching: {
          enabled: boolean;
          maxPairs: number;
          allowPartialCredit: boolean;
          shuffleOptions: boolean;
        };
        sequencing: {
          enabled: boolean;
          maxItems: number;
          dragAndDrop: boolean;
          showPositions: boolean;
        };
        annotation: {
          enabled: boolean;
          imageSupport: boolean;
          multipleAnnotations: boolean;
          freehandDrawing: boolean;
        };
        openEnded: {
          enabled: boolean;
          aiGrading: boolean;
          rubricBased: boolean;
          peerReview: boolean;
        };
      };
      adaptiveFeatures: {
        difficultyAdjustment: boolean;
        contentRelevance: boolean;
        learningStyleMatching: boolean;
        timeBasedAdaptation: boolean;
      };
      analytics: {
        questionAnalytics: boolean; // 題目分析
        learnerAnalytics: boolean; // 學習者分析
        contentAnalytics: boolean; // 內容分析
        predictionModels: boolean; // 預測模型
      };
    };

    // 品質保證系統
    qualityAssurance: {
      automated: {
        languageCheck: boolean;
        logicConsistency: boolean;
        difficultyAlignment: boolean;
        completenessCheck: boolean;
        factualAccuracy: boolean;
      };
      metrics: {
        readabilityScore: boolean;
        contentComplexity: boolean;
        learningObjectiveCoverage: boolean;
        assessmentAlignment: boolean;
      };
      validation: {
        crossReference: boolean; // 交叉驗證
        expertReview: boolean; // 專家審查（模擬）
        userFeedbackIntegration: boolean;
      };
    };

    // 分支推薦系統
    branchRecommendation: {
      enabled: boolean;
      analysisFactors: {
        subjectFrequency: number; // 學科頻率權重 0-1
        featureUsage: number; // 功能使用權重 0-1
        userPreference: number; // 用戶偏好權重 0-1
        performanceData: number; // 表現數據權重 0-1
      };
      thresholds: {
        englishRecommendation: number; // 推薦英文分支閾值 0-1
        mathRecommendation: number; // 推薦數學分支閾值 0-1
        confidenceLevel: number; // 推薦信心度閾值 0-1
      };
      presentation: {
        showBenefits: boolean;
        includeDemo: boolean;
        userTestimonials: boolean;
        migrationGuide: boolean;
      };
    };

    // 數據遷移和互操作
    migration: {
      dataExport: {
        formats: ('json' | 'csv' | 'xml')[];
        includeProgress: boolean;
        includeSettings: boolean;
        includeContent: boolean;
        compression: boolean;
      };
      compatibility: {
        backwardCompatible: boolean;
        versionTracking: boolean;
        schemaValidation: boolean;
        migrationScripts: boolean;
      };
      crossBranch: {
        dataSharing: boolean;
        progressSync: boolean;
        settingsSync: boolean;
        seamlessTransition: boolean;
      };
    };

    // 社群和協作功能
    community: {
      contentSharing: {
        enabled: boolean;
        publicLibrary: boolean;
        ratingSystem: boolean;
        commentSystem: boolean;
        moderationTools: boolean;
      };
      collaboration: {
        teacherNetworks: boolean;
        expertContributions: boolean;
        communityValidation: boolean;
        knowledgeBase: boolean;
      };
      social: {
        userProfiles: boolean;
        achievements: boolean;
        following: boolean;
        contentCuration: boolean;
      };
    };

    // 學習分析儀表板
    analytics: {
      usage: {
        featureUsage: boolean;
        contentPopularity: boolean;
        userEngagement: boolean;
        sessionAnalytics: boolean;
      };
      performance: {
        contentEffectiveness: boolean;
        learningOutcomes: boolean;
        difficultyOptimization: boolean;
        timeAnalysis: boolean;
      };
      insights: {
        trendAnalysis: boolean;
        predictiveAnalytics: boolean;
        personalizationInsights: boolean;
        recommendationEngine: boolean;
      };
      reporting: {
        dashboardViews: string[]; // 儀表板視圖類型
        exportFormats: string[]; // 導出格式
        scheduledReports: boolean; // 定期報告
        alertSystem: boolean; // 警報系統
      };
    };

    // 輔助功能和無障礙
    accessibility: {
      screenReader: {
        optimized: boolean;
        contentDescription: boolean;
        navigationAids: boolean;
        shortcutKeys: boolean;
      };
      visualAccessibility: {
        highContrast: boolean;
        fontSizeControl: boolean;
        colorBlindSupport: boolean;
        motionReduction: boolean;
      };
      cognitiveAccessibility: {
        simplifiedInterface: boolean;
        comprehensionAids: boolean;
        memorySupport: boolean;
        attentionManagement: boolean;
      };
      language: {
        multilingualSupport: boolean;
        translationTools: boolean;
        readingLevel: boolean;
        culturalAdaptation: boolean;
      };
    };

    // API 和整合
    integrations: {
      lms: {
        scorm: boolean; // SCORM 格式支援
        lti: boolean; // Learning Tools Interoperability
        xapi: boolean; // Experience API (Tin Can API)
        qti: boolean; // Question & Test Interoperability
      };
      platforms: {
        googleClassroom: boolean;
        microsoftTeams: boolean;
        zoom: boolean; // 視訊會議整合
        slack: boolean; // 通訊整合
      };
      external: {
        contentProviders: boolean; // 外部內容供應商
        assessmentTools: boolean; // 外部評估工具
        analyticsServices: boolean; // 外部分析服務
        aiServices: boolean; // 外部 AI 服務
      };
    };

    // 離線功能
    offline: {
      enabled: boolean;
      features: {
        contentCaching: boolean;
        offlineQuiz: boolean;
        progressSync: boolean;
        conflictResolution: boolean;
      };
      storage: {
        maxCacheSize: number; // MB
        cacheStrategy: 'aggressive' | 'conservative' | 'selective';
        syncStrategy: 'immediate' | 'periodic' | 'manual';
        compressionEnabled: boolean;
      };
    };
  };
}

// 通用分支配置實作
export const mainConfig: MainConfig = {
  // 繼承基礎配置
  ...baseConfig,

  // 應用資訊保持原樣（通用版本）
  app: {
    ...baseConfig.app,
    name: 'AI Learning Page Generator',
    description: '跨領域通用學習內容生成器'
  },

  // 通用分支專業設定
  main: {
    subjectClassification: {
      enabled: true,
      confidence: {
        threshold: 0.7,
        multiSubject: 0.6
      },
      supportedSubjects: [
        'general',
        'english',
        'math',
        'science',
        'social',
        'humanities',
        'arts',
        'technology',
        'business',
        'health',
        'other'
      ],
      keywordSets: {
        general: ['學習', '教育', '課程', '知識'],
        english: ['英語', '英文', 'English', 'grammar', 'vocabulary', '文法', '單字'],
        math: ['數學', '算術', 'math', 'algebra', 'geometry', '代數', '幾何', '計算'],
        science: ['科學', '物理', '化學', '生物', 'science', 'physics', 'chemistry', '實驗'],
        social: ['社會', '歷史', '地理', '公民', 'history', 'geography', '政治'],
        humanities: ['人文', '文學', '哲學', '藝術', 'literature', 'philosophy', '思想'],
        arts: ['藝術', '美術', '音樂', '表演', 'art', 'music', '創作', '設計'],
        technology: ['科技', '電腦', '程式', 'technology', 'computer', 'programming'],
        business: ['商業', '經濟', '管理', 'business', 'economics', '行銷'],
        health: ['健康', '醫學', '體育', 'health', 'medical', 'fitness'],
        other: ['其他', 'other', '雜項', 'miscellaneous']
      },
      contextAnalysis: {
        enabled: true,
        sentenceWindow: 5,
        semanticSimilarity: true
      }
    },

    contentAdaptation: {
      templates: {
        science: {
          emphasizeExperiments: true,
          includeFormulas: true,
          visualDiagrams: true,
          practicalApplications: true
        },
        humanities: {
          emphasizeContext: true,
          includePrimarySources: true,
          criticalThinking: true,
          caseStudies: true
        },
        socialStudies: {
          currentEvents: true,
          multiplePeropectives: true,
          ethicalConsiderations: true,
          communityConnections: true
        },
        arts: {
          creativePractice: true,
          historicalContext: true,
          personalExpression: true,
          criticalAnalysis: true
        },
        general: {
          balancedApproach: true,
          crossDisciplinary: true,
          realWorldExamples: true,
          scaffoldedLearning: true
        }
      },
      dynamicAdjustment: {
        enabled: true,
        userFeedback: true,
        performanceMetrics: true,
        contentEffectiveness: true
      }
    },

    enhancedQuiz: {
      newTypes: {
        matching: {
          enabled: true,
          maxPairs: 10,
          allowPartialCredit: true,
          shuffleOptions: true
        },
        sequencing: {
          enabled: true,
          maxItems: 8,
          dragAndDrop: true,
          showPositions: true
        },
        annotation: {
          enabled: true,
          imageSupport: true,
          multipleAnnotations: true,
          freehandDrawing: false
        },
        openEnded: {
          enabled: true,
          aiGrading: true,
          rubricBased: true,
          peerReview: false
        }
      },
      adaptiveFeatures: {
        difficultyAdjustment: true,
        contentRelevance: true,
        learningStyleMatching: false,
        timeBasedAdaptation: true
      },
      analytics: {
        questionAnalytics: true,
        learnerAnalytics: true,
        contentAnalytics: true,
        predictionModels: false
      }
    },

    qualityAssurance: {
      automated: {
        languageCheck: true,
        logicConsistency: true,
        difficultyAlignment: true,
        completenessCheck: true,
        factualAccuracy: false // 需要外部服務支援
      },
      metrics: {
        readabilityScore: true,
        contentComplexity: true,
        learningObjectiveCoverage: true,
        assessmentAlignment: true
      },
      validation: {
        crossReference: false,
        expertReview: false,
        userFeedbackIntegration: true
      }
    },

    branchRecommendation: {
      enabled: true,
      analysisFactors: {
        subjectFrequency: 0.4,
        featureUsage: 0.3,
        userPreference: 0.2,
        performanceData: 0.1
      },
      thresholds: {
        englishRecommendation: 0.6,
        mathRecommendation: 0.6,
        confidenceLevel: 0.7
      },
      presentation: {
        showBenefits: true,
        includeDemo: true,
        userTestimonials: false,
        migrationGuide: true
      }
    },

    migration: {
      dataExport: {
        formats: ['json', 'csv'],
        includeProgress: true,
        includeSettings: true,
        includeContent: true,
        compression: true
      },
      compatibility: {
        backwardCompatible: true,
        versionTracking: true,
        schemaValidation: true,
        migrationScripts: true
      },
      crossBranch: {
        dataSharing: true,
        progressSync: true,
        settingsSync: true,
        seamlessTransition: true
      }
    },

    community: {
      contentSharing: {
        enabled: true,
        publicLibrary: true,
        ratingSystem: true,
        commentSystem: true,
        moderationTools: false
      },
      collaboration: {
        teacherNetworks: true,
        expertContributions: false,
        communityValidation: true,
        knowledgeBase: true
      },
      social: {
        userProfiles: false,
        achievements: true,
        following: false,
        contentCuration: true
      }
    },

    analytics: {
      usage: {
        featureUsage: true,
        contentPopularity: true,
        userEngagement: true,
        sessionAnalytics: true
      },
      performance: {
        contentEffectiveness: true,
        learningOutcomes: false,
        difficultyOptimization: true,
        timeAnalysis: true
      },
      insights: {
        trendAnalysis: true,
        predictiveAnalytics: false,
        personalizationInsights: true,
        recommendationEngine: true
      },
      reporting: {
        dashboardViews: ['usage', 'performance', 'content'],
        exportFormats: ['pdf', 'csv', 'json'],
        scheduledReports: false,
        alertSystem: false
      }
    },

    accessibility: {
      screenReader: {
        optimized: true,
        contentDescription: true,
        navigationAids: true,
        shortcutKeys: true
      },
      visualAccessibility: {
        highContrast: true,
        fontSizeControl: true,
        colorBlindSupport: true,
        motionReduction: true
      },
      cognitiveAccessibility: {
        simplifiedInterface: false,
        comprehensionAids: true,
        memorySupport: false,
        attentionManagement: true
      },
      language: {
        multilingualSupport: false,
        translationTools: false,
        readingLevel: true,
        culturalAdaptation: false
      }
    },

    integrations: {
      lms: {
        scorm: false,
        lti: false,
        xapi: false,
        qti: false
      },
      platforms: {
        googleClassroom: false,
        microsoftTeams: false,
        zoom: false,
        slack: false
      },
      external: {
        contentProviders: false,
        assessmentTools: false,
        analyticsServices: false,
        aiServices: false
      }
    },

    offline: {
      enabled: true,
      features: {
        contentCaching: true,
        offlineQuiz: true,
        progressSync: true,
        conflictResolution: true
      },
      storage: {
        maxCacheSize: 100, // 100MB
        cacheStrategy: 'selective',
        syncStrategy: 'periodic',
        compressionEnabled: true
      }
    }
  }
};

// 通用配置管理器
export class MainConfigManager extends ConfigManager {
  private static instance: MainConfigManager;
  private mainSpecificConfig: MainConfig;

  private constructor() {
    super();
    this.mainSpecificConfig = { ...mainConfig };
    this.merge(mainConfig);
  }

  public static getInstance(): MainConfigManager {
    if (!MainConfigManager.instance) {
      MainConfigManager.instance = new MainConfigManager();
    }
    return MainConfigManager.instance;
  }

  public getConfig(): MainConfig {
    return this.mainSpecificConfig;
  }

  public getMainConfig() {
    return this.mainSpecificConfig.main;
  }

  // 學科分類相關
  public getSubjectClassificationConfig() {
    return this.mainSpecificConfig.main.subjectClassification;
  }

  public getSupportedSubjects(): Subject[] {
    return this.mainSpecificConfig.main.subjectClassification.supportedSubjects;
  }

  public getSubjectKeywords(subject: Subject): string[] {
    return this.mainSpecificConfig.main.subjectClassification.keywordSets[subject] || [];
  }

  // 內容適應相關
  public getContentAdaptationConfig() {
    return this.mainSpecificConfig.main.contentAdaptation;
  }

  public getTemplateConfig(type: 'science' | 'humanities' | 'socialStudies' | 'arts' | 'general') {
    return this.mainSpecificConfig.main.contentAdaptation.templates[type];
  }

  // 增強測驗相關
  public getEnhancedQuizConfig() {
    return this.mainSpecificConfig.main.enhancedQuiz;
  }

  public isQuizTypeEnabled(type: 'matching' | 'sequencing' | 'annotation' | 'openEnded'): boolean {
    return this.mainSpecificConfig.main.enhancedQuiz.newTypes[type].enabled;
  }

  // 品質保證相關
  public getQualityAssuranceConfig() {
    return this.mainSpecificConfig.main.qualityAssurance;
  }

  // 分支推薦相關
  public getBranchRecommendationConfig() {
    return this.mainSpecificConfig.main.branchRecommendation;
  }

  public isBranchRecommendationEnabled(): boolean {
    return this.mainSpecificConfig.main.branchRecommendation.enabled;
  }

  // 遷移相關
  public getMigrationConfig() {
    return this.mainSpecificConfig.main.migration;
  }

  // 社群相關
  public getCommunityConfig() {
    return this.mainSpecificConfig.main.community;
  }

  public isContentSharingEnabled(): boolean {
    return this.mainSpecificConfig.main.community.contentSharing.enabled;
  }

  // 分析相關
  public getAnalyticsConfig() {
    return this.mainSpecificConfig.main.analytics;
  }

  // 無障礙相關
  public getAccessibilityConfig() {
    return this.mainSpecificConfig.main.accessibility;
  }

  // 整合相關
  public getIntegrationsConfig() {
    return this.mainSpecificConfig.main.integrations;
  }

  // 離線功能相關
  public getOfflineConfig() {
    return this.mainSpecificConfig.main.offline;
  }

  public isOfflineEnabled(): boolean {
    return this.mainSpecificConfig.main.offline.enabled;
  }

  // 設定更新方法
  public updateSubjectClassification(updates: Partial<typeof this.config.main.subjectClassification>): void {
    this.mainSpecificConfig.main.subjectClassification = {
      ...this.config.main.subjectClassification,
      ...updates
    };
  }

  public enableBranchRecommendation(enabled: boolean): void {
    this.mainSpecificConfig.main.branchRecommendation.enabled = enabled;
  }

  // 匯出配置
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }
}

// 匯出單例實例
export const mainConfigManager = MainConfigManager.getInstance();