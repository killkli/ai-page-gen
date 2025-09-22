/**
 * Gemini 服務適配器 - Provider 系統整合版
 *
 * 這個適配器將原始 geminiService.ts 的完整功能重新實現，
 * 但底層使用新的 Provider 系統來支援多 AI 提供商。
 *
 * 保持所有原始 prompt 的詳細度和結構，確保生成品質不降低。
 */

import { callProviderSystem } from './adapters/basicGenerators';

// 模組化功能導入
import * as studentContentTransformerFunctions from './adapters/studentContentTransformerFunctions';
import * as coreGenerationFunctions from './adapters/coreGenerationFunctions';
import * as providerManagementFunctions from './adapters/providerManagementFunctions';

// 重新導出基礎生成函數以維持向後兼容
export {
  generateLearningObjectives,
  generateContentBreakdown,
  generateConfusingPoints,
  generateClassroomActivities,
  generateOnlineInteractiveQuiz,
  generateEnglishConversation
} from './adapters/basicGenerators';

export {
  generateLearningObjectivesForLevel,
  generateContentBreakdownForLevel,
  generateConfusingPointsForLevel,
  generateClassroomActivitiesForLevel,
  generateOnlineInteractiveQuizForLevel,
  generateEnglishConversationForLevel
} from './adapters/levelSpecificGenerators';

export {
  generateLearningObjectivesForLevelAndVocabulary,
  generateContentBreakdownForLevelAndVocabulary,
  generateConfusingPointsForLevelAndVocabulary,
  generateClassroomActivitiesForLevelAndVocabulary,
  generateOnlineInteractiveQuizForLevelAndVocabulary,
  generateEnglishConversationForLevelAndVocabulary
} from './adapters/vocabularyLevelGenerators';

export {
  generateWritingPractice,
  regenerateQuizWithConfig,
  generateStepQuiz,
  getAIFeedback
} from './adapters/studentContentTransformers';

import {
  GeneratedLearningContent,
  LearningObjectiveItem,
  VocabularyLevel,
} from '../types';

// 為了向後兼容，保持 callGemini 別名
export const callGemini = callProviderSystem;

// =============================================================================
// 學生內容轉換函數群組
// =============================================================================

export const transformLearningObjectiveForStudent = async (
  objective: LearningObjectiveItem,
  apiKey: string
): Promise<any> => {
  return await studentContentTransformerFunctions.transformLearningObjectiveForStudent(objective, apiKey, callProviderSystem);
};

export const transformContentBreakdownForStudent = async (
  breakdown: any[],
  apiKey: string
): Promise<any> => {
  return await studentContentTransformerFunctions.transformContentBreakdownForStudent(breakdown, apiKey, callProviderSystem);
};

export const transformConfusingPointForStudent = async (
  confusingPoint: any,
  apiKey: string
): Promise<any> => {
  return await studentContentTransformerFunctions.transformConfusingPointForStudent(confusingPoint, apiKey, callProviderSystem);
};

// =============================================================================
// 學習程度建議和主要生成函數
// =============================================================================


// 生成學習程度建議函數
export const generateLearningLevelSuggestions = async (topic: string, apiKey: string): Promise<any> => {
  return await coreGenerationFunctions.generateLearningLevelSuggestions(topic, apiKey, callProviderSystem);
};

// 檢查是否為英語相關主題
export const isEnglishRelatedTopic = (topic: string): boolean => {
  return coreGenerationFunctions.isEnglishRelatedTopic(topic);
};

// 主要生成函數 - 完整版本
export const generateLearningPlan = async (topic: string, apiKey: string): Promise<GeneratedLearningContent> => {
  return await coreGenerationFunctions.generateLearningPlan(topic, apiKey, callProviderSystem);
};

// 帶程度的生成函數
export const generateLearningPlanWithLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<GeneratedLearningContent> => {
  return await coreGenerationFunctions.generateLearningPlanWithLevel(topic, selectedLevel, apiKey, callProviderSystem);
};

// 帶程度和詞彙量的生成函數
export const generateLearningPlanWithVocabularyLevel = async (
  topic: string,
  selectedLevel: any,
  vocabularyLevel: VocabularyLevel,
  apiKey: string
): Promise<GeneratedLearningContent> => {
  return await coreGenerationFunctions.generateLearningPlanWithVocabularyLevel(topic, selectedLevel, vocabularyLevel, apiKey, callProviderSystem);
};

// =============================================================================
// Provider 系統管理函數
// =============================================================================

export const hasConfiguredProviders = async (): Promise<boolean> => {
  return await providerManagementFunctions.hasConfiguredProviders();
};

export const addProvider = async (config: any) => {
  return await providerManagementFunctions.addProvider(config);
};

export const updateProvider = async (config: any) => {
  return await providerManagementFunctions.updateProvider(config);
};

export const removeProvider = async (providerId: string) => {
  return await providerManagementFunctions.removeProvider(providerId);
};

export const testProvider = async (providerId: string) => {
  return await providerManagementFunctions.testProvider(providerId);
};

export const testAllProviders = async () => {
  return await providerManagementFunctions.testAllProviders();
};

export const setDefaultProvider = async (providerId: string) => {
  return await providerManagementFunctions.setDefaultProvider(providerId);
};

export const getUsageStats = async () => {
  return await providerManagementFunctions.getUsageStats();
};

export const getProviderManager = () => {
  return providerManagementFunctions.getProviderManager();
};

export const clearAllProviderData = async () => {
  return await providerManagementFunctions.clearAllProviderData();
};

export const initializeProviderSystem = async () => {
  return await providerManagementFunctions.initializeProviderSystem();
};
