/**
 * Gemini 服務 - Provider 系統整合版
 *
 * Provider系統整合版，維持完整生成功能。
 * 但底層使用新的 Provider 系統來支援多 AI 提供商。
 *
 * 保持所有原始 prompt 的詳細度和結構，確保生成品質不降低。
 */

import { callProviderSystem } from './adapters/basicGenerators';

// 模組化功能導入
import * as studentContentTransformerFunctions from './adapters/studentContentTransformerFunctions';
import * as coreGenerationFunctions from './adapters/coreGenerationFunctions';
import * as providerManagementFunctions from './adapters/providerManagementFunctions';
import * as subjectGenerators from './adapters/subjectGenerators';

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
  MathGenerationParams,
  EnglishGenerationParams
} from '../types';

// 導出 callProviderSystem 供外部使用
export { callProviderSystem };

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

export const generateLearningPlanFromObjectives = async (topic: string, learningObjectives: LearningObjectiveItem[], apiKey: string): Promise<GeneratedLearningContent> => {
  return await coreGenerationFunctions.generateLearningPlanFromObjectives(topic, learningObjectives, apiKey, callProviderSystem);
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

// 數學學習計畫生成
export const generateMathLearningPlan = async (params: MathGenerationParams, apiKey: string): Promise<GeneratedLearningContent> => {
  return await subjectGenerators.generateMathLearningPlan(params, apiKey, callProviderSystem);
};

export const generateMathObjectives = async (params: MathGenerationParams, apiKey: string): Promise<{ topic: string, learningObjectives: LearningObjectiveItem[] }> => {
  return await subjectGenerators.generateMathObjectives(params, apiKey);
};

export const generateMathContent = async (topic: string, learningObjectives: LearningObjectiveItem[], apiKey: string): Promise<GeneratedLearningContent> => {
  return await subjectGenerators.generateMathContent(topic, learningObjectives, apiKey, callProviderSystem);
};

// 英語學習計畫生成
export const generateEnglishLearningPlan = async (params: EnglishGenerationParams, apiKey: string): Promise<GeneratedLearningContent> => {
  return await subjectGenerators.generateEnglishLearningPlan(params, apiKey, callProviderSystem);
};

export const generateEnglishObjectives = async (params: EnglishGenerationParams, apiKey: string): Promise<{ topic: string, learningObjectives: LearningObjectiveItem[] }> => {
  return await subjectGenerators.generateEnglishObjectives(params, apiKey);
};

export const generateEnglishContent = async (topic: string, learningObjectives: LearningObjectiveItem[], apiKey: string): Promise<GeneratedLearningContent> => {
  return await subjectGenerators.generateEnglishContent(topic, learningObjectives, apiKey, callProviderSystem);
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
