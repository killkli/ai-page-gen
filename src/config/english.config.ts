/**
 * 英文分支專業配置
 * 繼承基礎配置並添加英語學習特有功能
 */

import { BaseConfig, baseConfig } from './base.config';
import { CEFRLevel, EnglishAccent } from '../core/types/english';

// 英文分支專業配置介面
export interface EnglishConfig extends BaseConfig {
  // 英語學習專業設定
  english: {
    // 預設等級和目標
    defaultCEFRLevel: CEFRLevel;
    supportedCEFRLevels: CEFRLevel[];
    levelProgression: {
      autoAdvance: boolean;
      advanceCriteria: {
        accuracyThreshold: number; // 0-100
        consistencyDays: number;
        skillBalance: boolean; // 是否要求四技能均衡發展
      };
    };

    // 語音識別和合成
    speech: {
      recognition: {
        language: string;
        continuous: boolean;
        interimResults: boolean;
        maxAlternatives: number;
        confidenceThreshold: number; // 0-1
        timeout: number; // 毫秒
        noiseThreshold: number; // 0-1
      };
      synthesis: {
        defaultVoice: string;
        defaultAccent: EnglishAccent;
        supportedAccents: EnglishAccent[];
        rate: number; // 語速 0.1-3.0
        pitch: number; // 音調 0-2
        volume: number; // 音量 0-1
        pauseOnPunctuation: boolean;
      };
      evaluation: {
        pronunciationWeight: number; // 發音評分權重 0-1
        fluencyWeight: number; // 流暢度權重 0-1
        accuracyWeight: number; // 準確度權重 0-1
        minRecordingTime: number; // 最短錄音時間（毫秒）
        maxRecordingTime: number; // 最長錄音時間（毫秒）
      };
    };

    // 詞彙管理系統
    vocabulary: {
      dailyGoal: number; // 每日學習新詞彙數量
      reviewSchedule: {
        intervals: number[]; // 復習間隔（天數）
        maxReviews: number; // 最大復習次數
        forgettingThreshold: number; // 遺忘閾值（天數）
      };
      difficulty: {
        autoAdjust: boolean;
        adjustmentFactor: number; // 調整係數 0-1
        minDifficulty: number; // 最低難度 1-5
        maxDifficulty: number; // 最高難度 1-5
      };
      categories: {
        academic: boolean;
        business: boolean;
        daily: boolean;
        technical: boolean;
        medical: boolean;
        legal: boolean;
      };
      integration: {
        contextExamples: number; // 每個詞彙的上下文例句數
        synonymsCount: number; // 同義詞數量
        antonymsCount: number; // 反義詞數量
        collocationsCount: number; // 搭配詞數量
      };
    };

    // 對話練習系統
    conversation: {
      scenarios: {
        enabled: string[]; // 啟用的情境類型
        difficulty: {
          adaptive: boolean; // 是否自適應難度
          basedOnLevel: boolean; // 是否基於 CEFR 等級
          userPreference: boolean; // 是否考慮用戶偏好
        };
        duration: {
          short: number; // 短對話時間（分鐘）
          medium: number; // 中等對話時間（分鐘）
          long: number; // 長對話時間（分鐘）
        };
      };
      interaction: {
        responseTime: number; // 回應時間限制（秒）
        hintDelay: number; // 提示延遲時間（秒）
        maxAttempts: number; // 最大嘗試次數
        encouragement: boolean; // 是否顯示鼓勵訊息
      };
      ai: {
        personalityTypes: string[]; // AI 對話夥伴人格類型
        adaptToUser: boolean; // 是否適應用戶風格
        emotionalResponse: boolean; // 是否提供情感回應
        culturalContext: boolean; // 是否包含文化背景
      };
    };

    // 技能評估和分析
    assessment: {
      skills: {
        listening: {
          enabled: boolean;
          testDuration: number; // 測驗時間（分鐘）
          questionTypes: string[]; // 題目類型
          adaptiveTesting: boolean; // 自適應測驗
        };
        speaking: {
          enabled: boolean;
          recordingQuality: 'low' | 'medium' | 'high';
          backgroundNoiseFilter: boolean;
          realTimeAnalysis: boolean;
        };
        reading: {
          enabled: boolean;
          textTypes: string[]; // 文章類型
          speedTracking: boolean; // 閱讀速度追蹤
          comprehensionLevels: string[]; // 理解層次
        };
        writing: {
          enabled: boolean;
          genres: string[]; // 寫作體裁
          autoCorrection: boolean; // 自動修正
          styleAnalysis: boolean; // 文體分析
        };
      };
      reporting: {
        detailLevel: 'basic' | 'detailed' | 'comprehensive';
        includeComparisons: boolean; // 包含同儕比較
        progressGraphs: boolean; // 進步圖表
        recommendations: boolean; // 學習建議
      };
    };

    // 文化學習整合
    culture: {
      regions: string[]; // 支援的英語地區
      contexts: {
        business: boolean;
        academic: boolean;
        social: boolean;
        travel: boolean;
        daily: boolean;
      };
      integration: {
        inDialogue: boolean; // 對話中整合
        inVocabulary: boolean; // 詞彙中整合
        inReading: boolean; // 閱讀中整合
        standalone: boolean; // 獨立文化課程
      };
    };

    // 遊戲化元素
    gamification: {
      enabled: boolean;
      elements: {
        points: boolean;
        badges: boolean;
        leaderboards: boolean;
        streaks: boolean;
        challenges: boolean;
        achievements: boolean;
      };
      rewards: {
        dailyLogin: number; // 每日登入獎勵點數
        skillImprovement: number; // 技能提升獎勵
        socialSharing: number; // 分享獎勵
        consistency: number; // 連續學習獎勵
      };
    };

    // 個人化學習
    personalization: {
      learningPath: {
        adaptive: boolean; // 自適應學習路徑
        goalOriented: boolean; // 目標導向
        timeConstraints: boolean; // 時間限制考量
        weaknessFirst: boolean; // 優先改善弱點
      };
      content: {
        topicPreferences: boolean; // 主題偏好
        difficultyAdjustment: boolean; // 難度自動調整
        paceControl: boolean; // 節奏控制
        styleMatching: boolean; // 學習風格匹配
      };
      feedback: {
        frequency: 'immediate' | 'session-end' | 'daily' | 'weekly';
        detail: 'minimal' | 'moderate' | 'comprehensive';
        tone: 'encouraging' | 'neutral' | 'challenging';
        visual: boolean; // 視覺化反饋
      };
    };

    // 整合功能
    integration: {
      calendar: boolean; // 行事曆整合
      notifications: {
        study: boolean; // 學習提醒
        review: boolean; // 復習提醒
        achievement: boolean; // 成就通知
        social: boolean; // 社交互動通知
      };
      export: {
        vocabulary: boolean; // 詞彙匯出
        progress: boolean; // 進度匯出
        certificates: boolean; // 證書匯出
        portfolio: boolean; // 學習作品集
      };
    };
  };
}

// 英文分支配置實作
export const englishConfig: EnglishConfig = {
  // 繼承基礎配置
  ...baseConfig,

  // 覆寫應用資訊
  app: {
    ...baseConfig.app,
    name: 'AI English Learning Generator',
    description: '專業英語教學與學習平台',
    homepage: 'https://killkli.github.io/ai-page-gen-english/'
  },

  // 調整功能開關
  features: {
    ...baseConfig.features,
    enabled: [
      ...baseConfig.features.enabled,
      'speech-recognition',
      'text-to-speech',
      'vocabulary-management',
      'conversation-practice',
      'pronunciation-training',
      'cultural-integration',
      'cefr-assessment',
      'skill-tracking'
    ],
    experimental: [
      ...baseConfig.features.experimental,
      'real-time-correction',
      'ai-conversation-partner',
      'accent-analysis',
      'emotion-detection'
    ]
  },

  // 英語學習專業設定
  english: {
    defaultCEFRLevel: 'B1',
    supportedCEFRLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    levelProgression: {
      autoAdvance: true,
      advanceCriteria: {
        accuracyThreshold: 85,
        consistencyDays: 7,
        skillBalance: true
      }
    },

    speech: {
      recognition: {
        language: 'en-US',
        continuous: false,
        interimResults: true,
        maxAlternatives: 3,
        confidenceThreshold: 0.6,
        timeout: 10000,
        noiseThreshold: 0.3
      },
      synthesis: {
        defaultVoice: 'Google US English',
        defaultAccent: 'american',
        supportedAccents: ['american', 'british', 'australian', 'canadian'],
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
        pauseOnPunctuation: true
      },
      evaluation: {
        pronunciationWeight: 0.4,
        fluencyWeight: 0.3,
        accuracyWeight: 0.3,
        minRecordingTime: 1000,
        maxRecordingTime: 30000
      }
    },

    vocabulary: {
      dailyGoal: 10,
      reviewSchedule: {
        intervals: [1, 3, 7, 14, 30, 90],
        maxReviews: 6,
        forgettingThreshold: 60
      },
      difficulty: {
        autoAdjust: true,
        adjustmentFactor: 0.1,
        minDifficulty: 1,
        maxDifficulty: 5
      },
      categories: {
        academic: true,
        business: true,
        daily: true,
        technical: false,
        medical: false,
        legal: false
      },
      integration: {
        contextExamples: 3,
        synonymsCount: 2,
        antonymsCount: 1,
        collocationsCount: 3
      }
    },

    conversation: {
      scenarios: {
        enabled: [
          'daily-life',
          'business',
          'travel',
          'academic',
          'social',
          'interview'
        ],
        difficulty: {
          adaptive: true,
          basedOnLevel: true,
          userPreference: true
        },
        duration: {
          short: 5,
          medium: 15,
          long: 30
        }
      },
      interaction: {
        responseTime: 30,
        hintDelay: 10,
        maxAttempts: 3,
        encouragement: true
      },
      ai: {
        personalityTypes: [
          'friendly',
          'professional',
          'casual',
          'supportive',
          'challenging'
        ],
        adaptToUser: true,
        emotionalResponse: true,
        culturalContext: true
      }
    },

    assessment: {
      skills: {
        listening: {
          enabled: true,
          testDuration: 20,
          questionTypes: [
            'multiple-choice',
            'fill-blank',
            'true-false',
            'matching'
          ],
          adaptiveTesting: true
        },
        speaking: {
          enabled: true,
          recordingQuality: 'medium',
          backgroundNoiseFilter: true,
          realTimeAnalysis: false
        },
        reading: {
          enabled: true,
          textTypes: [
            'news',
            'academic',
            'literature',
            'business',
            'casual'
          ],
          speedTracking: true,
          comprehensionLevels: [
            'literal',
            'inferential',
            'critical'
          ]
        },
        writing: {
          enabled: true,
          genres: [
            'essay',
            'letter',
            'report',
            'story',
            'review'
          ],
          autoCorrection: false,
          styleAnalysis: true
        }
      },
      reporting: {
        detailLevel: 'detailed',
        includeComparisons: false,
        progressGraphs: true,
        recommendations: true
      }
    },

    culture: {
      regions: [
        'US',
        'UK',
        'Australia',
        'Canada',
        'New Zealand'
      ],
      contexts: {
        business: true,
        academic: true,
        social: true,
        travel: true,
        daily: true
      },
      integration: {
        inDialogue: true,
        inVocabulary: true,
        inReading: true,
        standalone: true
      }
    },

    gamification: {
      enabled: true,
      elements: {
        points: true,
        badges: true,
        leaderboards: false,
        streaks: true,
        challenges: true,
        achievements: true
      },
      rewards: {
        dailyLogin: 10,
        skillImprovement: 25,
        socialSharing: 5,
        consistency: 50
      }
    },

    personalization: {
      learningPath: {
        adaptive: true,
        goalOriented: true,
        timeConstraints: true,
        weaknessFirst: true
      },
      content: {
        topicPreferences: true,
        difficultyAdjustment: true,
        paceControl: true,
        styleMatching: false
      },
      feedback: {
        frequency: 'session-end',
        detail: 'moderate',
        tone: 'encouraging',
        visual: true
      }
    },

    integration: {
      calendar: false,
      notifications: {
        study: true,
        review: true,
        achievement: true,
        social: false
      },
      export: {
        vocabulary: true,
        progress: true,
        certificates: true,
        portfolio: false
      }
    }
  }
};

// 英文配置管理器
export class EnglishConfigManager {
  private static instance: EnglishConfigManager;
  private config: EnglishConfig;

  private constructor() {
    this.config = { ...englishConfig };
  }

  public static getInstance(): EnglishConfigManager {
    if (!EnglishConfigManager.instance) {
      EnglishConfigManager.instance = new EnglishConfigManager();
    }
    return EnglishConfigManager.instance;
  }

  public getConfig(): EnglishConfig {
    return this.config;
  }

  public getEnglishConfig() {
    return this.config.english;
  }

  // 語音設定相關
  public getSpeechConfig() {
    return this.config.english.speech;
  }

  public getRecognitionConfig() {
    return this.config.english.speech.recognition;
  }

  public getSynthesisConfig() {
    return this.config.english.speech.synthesis;
  }

  // 詞彙設定相關
  public getVocabularyConfig() {
    return this.config.english.vocabulary;
  }

  public getDailyVocabularyGoal(): number {
    return this.config.english.vocabulary.dailyGoal;
  }

  public getReviewSchedule() {
    return this.config.english.vocabulary.reviewSchedule;
  }

  // 對話設定相關
  public getConversationConfig() {
    return this.config.english.conversation;
  }

  public getEnabledScenarios(): string[] {
    return this.config.english.conversation.scenarios.enabled;
  }

  // 評估設定相關
  public getAssessmentConfig() {
    return this.config.english.assessment;
  }

  public isSkillEnabled(skill: 'listening' | 'speaking' | 'reading' | 'writing'): boolean {
    return this.config.english.assessment.skills[skill].enabled;
  }

  // CEFR 等級相關
  public getDefaultCEFRLevel(): CEFRLevel {
    return this.config.english.defaultCEFRLevel;
  }

  public getSupportedCEFRLevels(): CEFRLevel[] {
    return this.config.english.supportedCEFRLevels;
  }

  public isCEFRLevelSupported(level: CEFRLevel): boolean {
    return this.config.english.supportedCEFRLevels.includes(level);
  }

  // 遊戲化相關
  public getGamificationConfig() {
    return this.config.english.gamification;
  }

  public isGamificationEnabled(): boolean {
    return this.config.english.gamification.enabled;
  }

  // 個人化設定相關
  public getPersonalizationConfig() {
    return this.config.english.personalization;
  }

  public isAdaptiveLearning(): boolean {
    return this.config.english.personalization.learningPath.adaptive;
  }

  // 文化學習相關
  public getCultureConfig() {
    return this.config.english.culture;
  }

  public getSupportedRegions(): string[] {
    return this.config.english.culture.regions;
  }

  // 設定更新方法
  public updateSpeechConfig(updates: Partial<typeof this.config.english.speech>): void {
    this.config.english.speech = {
      ...this.config.english.speech,
      ...updates
    };
  }

  public updateVocabularyConfig(updates: Partial<typeof this.config.english.vocabulary>): void {
    this.config.english.vocabulary = {
      ...this.config.english.vocabulary,
      ...updates
    };
  }

  public updateDefaultCEFRLevel(level: CEFRLevel): void {
    if (this.isCEFRLevelSupported(level)) {
      this.config.english.defaultCEFRLevel = level;
    }
  }

  // 匯出配置
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }
}

// 匯出單例實例
export const englishConfigManager = EnglishConfigManager.getInstance();