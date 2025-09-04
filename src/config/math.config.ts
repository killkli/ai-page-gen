/**
 * 數學分支專業配置
 * 繼承基礎配置並添加數學學習特有功能
 */

import { BaseConfig, baseConfig } from './base.config';
import { MathDomain, MathGradeLevel } from '../core/types/math';

// 數學分支專業配置介面
export interface MathConfig extends BaseConfig {
  // 數學學習專業設定
  math: {
    // 預設領域和等級
    defaultDomain: MathDomain;
    defaultGradeLevel: MathGradeLevel;
    supportedDomains: MathDomain[];
    supportedGradeLevels: MathGradeLevel[];
    
    // 進度管理
    progression: {
      autoAdvance: boolean;
      advanceCriteria: {
        conceptMastery: number; // 概念掌握度閾值 0-100
        problemSolving: number; // 解題能力閾值 0-100
        consistencyDays: number; // 連續學習天數要求
        errorRate: number; // 最大錯誤率 0-100
      };
      prerequisites: {
        enforce: boolean; // 是否強制前置概念
        bypassAllowed: boolean; // 是否允許跳過
        warningThreshold: number; // 警告閾值
      };
    };

    // 數學渲染系統
    rendering: {
      engine: 'katex' | 'mathjax' | 'both';
      katex: {
        version: string;
        displayMode: boolean;
        throwOnError: boolean;
        errorColor: string;
        macros: Record<string, string>;
        fleqn: boolean; // 左對齊公式
      };
      mathjax: {
        version: string;
        config: string;
        extensions: string[];
        showMathMenu: boolean;
      };
      fallback: {
        useAscii: boolean; // 渲染失敗時使用 ASCII
        showError: boolean; // 顯示錯誤訊息
        placeholder: string; // 錯誤佔位符
      };
    };

    // 互動工具系統
    tools: {
      calculator: {
        types: ('scientific' | 'graphing' | 'matrix')[];
        scientific: {
          precision: number; // 小數位數
          angleMode: 'degree' | 'radian';
          memorySlots: number;
          historySize: number;
        };
        graphing: {
          gridEnabled: boolean;
          axisLabels: boolean;
          gridSpacing: number;
          zoom: { min: number; max: number };
          colors: string[];
          lineWidth: number;
        };
        matrix: {
          maxSize: number; // 最大矩陣大小
          showSteps: boolean; // 顯示計算步驟
          precision: number;
        };
      };
      geometry: {
        canvas: {
          width: number;
          height: number;
          backgroundColor: string;
          gridColor: string;
          axisColor: string;
        };
        tools: string[]; // 可用工具列表
        precision: number; // 測量精度
        snapToGrid: boolean;
        showCoordinates: boolean;
        constraintSolving: boolean; // 約束求解
      };
      visualization: {
        engines: ('2d-canvas' | '3d-threejs' | 'svg')[];
        performance: {
          maxPoints: number; // 最大點數
          animationFPS: number;
          renderingTimeout: number;
        };
        interaction: {
          zoom: boolean;
          pan: boolean;
          rotate: boolean; // 3D 旋轉
          select: boolean;
        };
      };
    };

    // 解題系統
    problemSolving: {
      stepByStep: {
        enabled: boolean;
        autoGenerate: boolean; // 自動產生步驟
        userInput: boolean; // 允許用戶輸入步驟
        verification: boolean; // 步驟驗證
        hints: {
          maxHints: number;
          progressive: boolean; // 漸進式提示
          penaltyPerHint: number; // 每個提示的扣分
        };
      };
      verification: {
        numerical: {
          tolerance: number; // 數值誤差容忍度
          relativeTolerance: number; // 相對誤差
          significantFigures: number;
        };
        algebraic: {
          equivalenceCheck: boolean; // 代數等價檢查
          expandExpressions: boolean;
          simplifyFirst: boolean;
        };
        geometric: {
          coordinateTolerance: number;
          angleTolerance: number; // 角度誤差
          lengthTolerance: number; // 長度誤差
        };
      };
      feedback: {
        immediate: boolean; // 立即反饋
        detailed: boolean; // 詳細說明
        showCorrectAnswer: boolean;
        showAlternativeMethods: boolean;
        mistakeAnalysis: boolean; // 錯誤分析
      };
    };

    // 概念映射系統
    conceptMapping: {
      visualization: {
        layoutAlgorithm: 'force' | 'hierarchical' | 'circular';
        nodeSize: { min: number; max: number };
        edgeWidth: { min: number; max: number };
        colors: {
          mastered: string;
          learning: string;
          notStarted: string;
          prerequisite: string;
        };
        animation: {
          enabled: boolean;
          duration: number;
          easing: string;
        };
      };
      interaction: {
        clickToExpand: boolean;
        hoverDetails: boolean;
        dragNodes: boolean;
        zoomAndPan: boolean;
        search: boolean;
      };
      content: {
        showExamples: boolean;
        showApplications: boolean;
        showPrerequisites: boolean;
        showRelatedConcepts: boolean;
      };
    };

    // 評估和診斷
    assessment: {
      types: {
        diagnostic: boolean; // 診斷性評估
        formative: boolean; // 形成性評估
        summative: boolean; // 總結性評估
        adaptive: boolean; // 自適應評估
      };
      diagnostic: {
        initialAssessment: boolean;
        periodicReassessment: number; // 天數
        skillGranularity: 'domain' | 'concept' | 'skill';
        minimumQuestions: number;
        confidenceThreshold: number; // 0-1
      };
      adaptive: {
        enabled: boolean;
        algorithm: 'irt' | 'cat' | 'simple'; // Item Response Theory, Computerized Adaptive Testing
        difficultyRange: { min: number; max: number };
        stopCriteria: {
          maxQuestions: number;
          minPrecision: number;
          timeLimit: number; // 分鐘
        };
      };
      reporting: {
        skillProfile: boolean; // 技能概況
        learningPath: boolean; // 學習路徑建議
        weaknessAnalysis: boolean; // 弱點分析
        strengthsIdentification: boolean; // 優勢識別
        parentReport: boolean; // 家長報告
        teacherDashboard: boolean; // 教師儀表板
      };
    };

    // 錯誤分析系統
    errorAnalysis: {
      categories: {
        calculation: boolean; // 計算錯誤
        conceptual: boolean; // 概念錯誤
        procedural: boolean; // 程序錯誤
        representation: boolean; // 表示錯誤
        reasoning: boolean; // 推理錯誤
        application: boolean; // 應用錯誤
      };
      detection: {
        patternMatching: boolean; // 模式匹配
        commonMistakes: boolean; // 常見錯誤庫
        aiAnalysis: boolean; // AI 錯誤分析
      };
      remediation: {
        automaticSuggestions: boolean; // 自動建議
        targetedPractice: boolean; // 針對性練習
        conceptReview: boolean; // 概念復習
        tutorialGeneration: boolean; // 教程生成
      };
    };

    // 3D 視覺化和幾何
    visualization3D: {
      enabled: boolean;
      engine: 'threejs' | 'babylonjs';
      features: {
        geometry3D: boolean;
        vectorFields: boolean;
        surfaces: boolean;
        animations: boolean;
        vr: boolean; // 虛擬實境支援
        ar: boolean; // 擴增實境支援
      };
      performance: {
        maxVertices: number;
        maxTextures: number;
        antialiasing: boolean;
        shadows: boolean;
        lighting: 'basic' | 'advanced';
      };
    };

    // 協作功能
    collaboration: {
      enabled: boolean;
      features: {
        sharedWorkspace: boolean; // 共享工作空間
        realTimeEditing: boolean; // 即時編輯
        peerReview: boolean; // 同儕評議
        groupProjects: boolean; // 小組專案
        discussions: boolean; // 討論功能
      };
      permissions: {
        viewOnly: boolean;
        comment: boolean;
        edit: boolean;
        moderate: boolean;
      };
    };

    // 個人化學習
    personalization: {
      learningStyle: {
        detection: boolean; // 學習風格檢測
        adaptation: boolean; // 內容適應
        visualVsAnalytical: boolean; // 視覺 vs 分析
        concreteVsAbstract: boolean; // 具象 vs 抽象
      };
      difficulty: {
        adaptive: boolean;
        userControl: boolean; // 用戶控制
        automaticAdjustment: boolean;
        adjustmentFactor: number; // 0-1
      };
      content: {
        topicPreference: boolean;
        contextPreference: boolean; // 情境偏好
        representationPreference: boolean; // 表示偏好
      };
      pacing: {
        selfPaced: boolean;
        teacherPaced: boolean;
        adaptive: boolean;
        timeRecommendations: boolean;
      };
    };

    // 遊戲化
    gamification: {
      enabled: boolean;
      elements: {
        points: boolean;
        badges: boolean;
        leaderboards: boolean;
        achievements: boolean;
        challenges: boolean;
        quests: boolean; // 任務系統
        competitions: boolean;
      };
      progression: {
        experiencePoints: boolean;
        levelSystem: boolean;
        skillTrees: boolean;
        unlockableContent: boolean;
      };
      social: {
        friendsSystem: boolean;
        classroomRankings: boolean;
        teamChallenges: boolean;
        socialSharing: boolean;
      };
    };

    // 整合功能
    integration: {
      lms: {
        moodle: boolean;
        canvas: boolean;
        blackboard: boolean;
        googleClassroom: boolean;
      };
      tools: {
        graphingCalculator: boolean;
        statisticalSoftware: boolean;
        cas: boolean; // Computer Algebra System
        spreadsheet: boolean;
      };
      export: {
        formats: ('pdf' | 'latex' | 'mathml' | 'image')[];
        includeWork: boolean; // 包含解題過程
        includeGraphs: boolean;
        includeExplanations: boolean;
      };
      import: {
        mathml: boolean;
        latex: boolean;
        plainText: boolean;
        images: boolean; // 圖片識別
      };
    };
  };
}

// 數學分支配置實作
export const mathConfig: MathConfig = {
  // 繼承基礎配置
  ...baseConfig,

  // 覆寫應用資訊
  app: {
    ...baseConfig.app,
    name: 'AI Math Learning Generator',
    description: '專業數學概念理解與解題能力培養平台',
    homepage: 'https://killkli.github.io/ai-page-gen-math/'
  },

  // 調整功能開關
  features: {
    ...baseConfig.features,
    enabled: [
      ...baseConfig.features.enabled,
      'formula-rendering',
      'interactive-tools',
      'step-by-step-solutions',
      'concept-mapping',
      'error-analysis',
      '3d-visualization',
      'proof-checking',
      'adaptive-assessment'
    ],
    experimental: [
      ...baseConfig.features.experimental,
      'ai-tutor-math',
      'handwriting-recognition',
      'ar-visualization',
      'collaborative-solving'
    ]
  },

  // 數學學習專業設定
  math: {
    defaultDomain: 'algebra',
    defaultGradeLevel: 'high-school',
    supportedDomains: [
      'arithmetic',
      'algebra', 
      'geometry',
      'trigonometry',
      'calculus',
      'statistics',
      'probability',
      'discrete',
      'linear-algebra'
    ],
    supportedGradeLevels: [
      'elementary',
      'middle-school',
      'high-school',
      'undergraduate',
      'graduate'
    ],

    progression: {
      autoAdvance: true,
      advanceCriteria: {
        conceptMastery: 80,
        problemSolving: 75,
        consistencyDays: 5,
        errorRate: 20
      },
      prerequisites: {
        enforce: true,
        bypassAllowed: false,
        warningThreshold: 60
      }
    },

    rendering: {
      engine: 'katex',
      katex: {
        version: '0.16.8',
        displayMode: false,
        throwOnError: false,
        errorColor: '#cc0000',
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
          "\\QQ": "\\mathbb{Q}"
        },
        fleqn: false
      },
      mathjax: {
        version: '3.2.2',
        config: 'TeX-MML-AM_CHTML',
        extensions: ['tex2jax.js', 'MathMenu.js', 'MathZoom.js'],
        showMathMenu: true
      },
      fallback: {
        useAscii: true,
        showError: true,
        placeholder: '[Math Expression]'
      }
    },

    tools: {
      calculator: {
        types: ['scientific', 'graphing', 'matrix'],
        scientific: {
          precision: 12,
          angleMode: 'radian',
          memorySlots: 5,
          historySize: 50
        },
        graphing: {
          gridEnabled: true,
          axisLabels: true,
          gridSpacing: 1,
          zoom: { min: 0.1, max: 10 },
          colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
          lineWidth: 2
        },
        matrix: {
          maxSize: 10,
          showSteps: true,
          precision: 6
        }
      },
      geometry: {
        canvas: {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          gridColor: '#e0e0e0',
          axisColor: '#333333'
        },
        tools: [
          'point', 'line', 'circle', 'polygon', 
          'measure', 'angle', 'perpendicular', 'parallel'
        ],
        precision: 0.01,
        snapToGrid: true,
        showCoordinates: true,
        constraintSolving: true
      },
      visualization: {
        engines: ['2d-canvas', '3d-threejs', 'svg'],
        performance: {
          maxPoints: 10000,
          animationFPS: 60,
          renderingTimeout: 5000
        },
        interaction: {
          zoom: true,
          pan: true,
          rotate: true,
          select: true
        }
      }
    },

    problemSolving: {
      stepByStep: {
        enabled: true,
        autoGenerate: true,
        userInput: true,
        verification: true,
        hints: {
          maxHints: 3,
          progressive: true,
          penaltyPerHint: 10
        }
      },
      verification: {
        numerical: {
          tolerance: 1e-10,
          relativeTolerance: 1e-8,
          significantFigures: 6
        },
        algebraic: {
          equivalenceCheck: true,
          expandExpressions: true,
          simplifyFirst: false
        },
        geometric: {
          coordinateTolerance: 0.01,
          angleTolerance: 0.1,
          lengthTolerance: 0.01
        }
      },
      feedback: {
        immediate: false,
        detailed: true,
        showCorrectAnswer: true,
        showAlternativeMethods: true,
        mistakeAnalysis: true
      }
    },

    conceptMapping: {
      visualization: {
        layoutAlgorithm: 'force',
        nodeSize: { min: 20, max: 60 },
        edgeWidth: { min: 1, max: 5 },
        colors: {
          mastered: '#4caf50',
          learning: '#ff9800',
          notStarted: '#9e9e9e',
          prerequisite: '#2196f3'
        },
        animation: {
          enabled: true,
          duration: 1000,
          easing: 'ease-in-out'
        }
      },
      interaction: {
        clickToExpand: true,
        hoverDetails: true,
        dragNodes: true,
        zoomAndPan: true,
        search: true
      },
      content: {
        showExamples: true,
        showApplications: true,
        showPrerequisites: true,
        showRelatedConcepts: true
      }
    },

    assessment: {
      types: {
        diagnostic: true,
        formative: true,
        summative: true,
        adaptive: true
      },
      diagnostic: {
        initialAssessment: true,
        periodicReassessment: 30,
        skillGranularity: 'concept',
        minimumQuestions: 10,
        confidenceThreshold: 0.8
      },
      adaptive: {
        enabled: true,
        algorithm: 'simple',
        difficultyRange: { min: 1, max: 10 },
        stopCriteria: {
          maxQuestions: 50,
          minPrecision: 0.3,
          timeLimit: 60
        }
      },
      reporting: {
        skillProfile: true,
        learningPath: true,
        weaknessAnalysis: true,
        strengthsIdentification: true,
        parentReport: true,
        teacherDashboard: true
      }
    },

    errorAnalysis: {
      categories: {
        calculation: true,
        conceptual: true,
        procedural: true,
        representation: true,
        reasoning: true,
        application: true
      },
      detection: {
        patternMatching: true,
        commonMistakes: true,
        aiAnalysis: true
      },
      remediation: {
        automaticSuggestions: true,
        targetedPractice: true,
        conceptReview: true,
        tutorialGeneration: false
      }
    },

    visualization3D: {
      enabled: true,
      engine: 'threejs',
      features: {
        geometry3D: true,
        vectorFields: true,
        surfaces: true,
        animations: true,
        vr: false,
        ar: false
      },
      performance: {
        maxVertices: 50000,
        maxTextures: 10,
        antialiasing: true,
        shadows: false,
        lighting: 'basic'
      }
    },

    collaboration: {
      enabled: false,
      features: {
        sharedWorkspace: false,
        realTimeEditing: false,
        peerReview: false,
        groupProjects: false,
        discussions: false
      },
      permissions: {
        viewOnly: true,
        comment: false,
        edit: false,
        moderate: false
      }
    },

    personalization: {
      learningStyle: {
        detection: false,
        adaptation: false,
        visualVsAnalytical: true,
        concreteVsAbstract: true
      },
      difficulty: {
        adaptive: true,
        userControl: true,
        automaticAdjustment: true,
        adjustmentFactor: 0.2
      },
      content: {
        topicPreference: true,
        contextPreference: true,
        representationPreference: true
      },
      pacing: {
        selfPaced: true,
        teacherPaced: false,
        adaptive: true,
        timeRecommendations: true
      }
    },

    gamification: {
      enabled: true,
      elements: {
        points: true,
        badges: true,
        leaderboards: false,
        achievements: true,
        challenges: true,
        quests: false,
        competitions: false
      },
      progression: {
        experiencePoints: true,
        levelSystem: false,
        skillTrees: true,
        unlockableContent: true
      },
      social: {
        friendsSystem: false,
        classroomRankings: false,
        teamChallenges: false,
        socialSharing: true
      }
    },

    integration: {
      lms: {
        moodle: false,
        canvas: false,
        blackboard: false,
        googleClassroom: false
      },
      tools: {
        graphingCalculator: true,
        statisticalSoftware: false,
        cas: true,
        spreadsheet: false
      },
      export: {
        formats: ['pdf', 'latex', 'image'],
        includeWork: true,
        includeGraphs: true,
        includeExplanations: true
      },
      import: {
        mathml: true,
        latex: true,
        plainText: true,
        images: false
      }
    }
  }
};

// 數學配置管理器
export class MathConfigManager {
  private static instance: MathConfigManager;
  private config: MathConfig;

  private constructor() {
    this.config = { ...mathConfig };
  }

  public static getInstance(): MathConfigManager {
    if (!MathConfigManager.instance) {
      MathConfigManager.instance = new MathConfigManager();
    }
    return MathConfigManager.instance;
  }

  public getConfig(): MathConfig {
    return this.config;
  }

  public getMathConfig() {
    return this.config.math;
  }

  // 領域和等級相關
  public getDefaultDomain(): MathDomain {
    return this.config.math.defaultDomain;
  }

  public getDefaultGradeLevel(): MathGradeLevel {
    return this.config.math.defaultGradeLevel;
  }

  public getSupportedDomains(): MathDomain[] {
    return this.config.math.supportedDomains;
  }

  public getSupportedGradeLevels(): MathGradeLevel[] {
    return this.config.math.supportedGradeLevels;
  }

  public isDomainSupported(domain: MathDomain): boolean {
    return this.config.math.supportedDomains.includes(domain);
  }

  public isGradeLevelSupported(level: MathGradeLevel): boolean {
    return this.config.math.supportedGradeLevels.includes(level);
  }

  // 渲染引擎相關
  public getRenderingConfig() {
    return this.config.math.rendering;
  }

  public getRenderingEngine(): 'katex' | 'mathjax' | 'both' {
    return this.config.math.rendering.engine;
  }

  public getKatexConfig() {
    return this.config.math.rendering.katex;
  }

  public getMathJaxConfig() {
    return this.config.math.rendering.mathjax;
  }

  // 工具相關
  public getToolsConfig() {
    return this.config.math.tools;
  }

  public getCalculatorConfig() {
    return this.config.math.tools.calculator;
  }

  public getGeometryConfig() {
    return this.config.math.tools.geometry;
  }

  public getVisualizationConfig() {
    return this.config.math.tools.visualization;
  }

  // 解題系統相關
  public getProblemSolvingConfig() {
    return this.config.math.problemSolving;
  }

  public isStepByStepEnabled(): boolean {
    return this.config.math.problemSolving.stepByStep.enabled;
  }

  public getHintsConfig() {
    return this.config.math.problemSolving.stepByStep.hints;
  }

  // 概念映射相關
  public getConceptMappingConfig() {
    return this.config.math.conceptMapping;
  }

  // 評估相關
  public getAssessmentConfig() {
    return this.config.math.assessment;
  }

  public isAssessmentTypeEnabled(type: 'diagnostic' | 'formative' | 'summative' | 'adaptive'): boolean {
    return this.config.math.assessment.types[type];
  }

  // 錯誤分析相關
  public getErrorAnalysisConfig() {
    return this.config.math.errorAnalysis;
  }

  // 3D 視覺化相關
  public get3DVisualizationConfig() {
    return this.config.math.visualization3D;
  }

  public is3DVisualizationEnabled(): boolean {
    return this.config.math.visualization3D.enabled;
  }

  // 個人化相關
  public getPersonalizationConfig() {
    return this.config.math.personalization;
  }

  public isAdaptiveDifficulty(): boolean {
    return this.config.math.personalization.difficulty.adaptive;
  }

  // 遊戲化相關
  public getGamificationConfig() {
    return this.config.math.gamification;
  }

  public isGamificationEnabled(): boolean {
    return this.config.math.gamification.enabled;
  }

  // 整合功能相關
  public getIntegrationConfig() {
    return this.config.math.integration;
  }

  // 設定更新方法
  public updateDefaultDomain(domain: MathDomain): void {
    if (this.isDomainSupported(domain)) {
      this.config.math.defaultDomain = domain;
    }
  }

  public updateDefaultGradeLevel(level: MathGradeLevel): void {
    if (this.isGradeLevelSupported(level)) {
      this.config.math.defaultGradeLevel = level;
    }
  }

  public updateRenderingEngine(engine: 'katex' | 'mathjax' | 'both'): void {
    this.config.math.rendering.engine = engine;
  }

  // 匯出配置
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }
}

// 匯出單例實例
export const mathConfigManager = MathConfigManager.getInstance();