/**
 * Gemini 服務適配器 - Provider 系統整合版
 *
 * 這個適配器將原始 geminiService.ts 的完整功能重新實現，
 * 但底層使用新的 Provider 系統來支援多 AI 提供商。
 *
 * 保持所有原始 prompt 的詳細度和結構，確保生成品質不降低。
 */

import { providerService } from './providerService';

// 模組化功能導入
import * as studentContentTransformerFunctions from './adapters/studentContentTransformerFunctions';
import * as coreGenerationFunctions from './adapters/coreGenerationFunctions';
import * as providerManagementFunctions from './adapters/providerManagementFunctions';

import {
  GeneratedLearningContent,
  LearningObjectiveItem,
  VocabularyLevel,
} from '../types';

// Provider 系統的核心調用函數
const callProviderSystem = async (prompt: string, apiKey: string = 'provider-system-call'): Promise<any> => {
  try {
    // 檢查是否有配置的 Provider
    const hasProviders = await providerService.hasConfiguredProviders();

    if (!hasProviders && apiKey !== 'provider-system-call') {
      // 如果沒有配置的 Provider，嘗試遷移舊版 API Key
      console.log('尚未配置 Provider，嘗試使用傳統 API Key 模式');

      // 這裡可以嘗試自動遷移或給出提示
      throw new Error('請先設定 AI Provider 才能使用此功能。請到設定頁面配置您的 AI 服務商。');
    }

    const response = await providerService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 4000
    });

    if (!response) {
      throw new Error('沒有收到回應');
    }

    const text = response.text || response.content || response;

    // 嘗試解析 JSON
    try {
      return JSON.parse(text);
    } catch (_parseError) {
      // 如果解析失敗，嘗試修復常見的 JSON 問題
      const cleanedText = text
        .replace(/```json\s*/, '')
        .replace(/```\s*$/, '')
        .replace(/^[^{[]/, '')
        .replace(/[^}\]]$/, '')
        .trim();

      try {
        return JSON.parse(cleanedText);
      } catch (secondParseError) {
        console.error('JSON 解析失敗，原始回應:', text);
        throw new Error(`無法解析 AI 回應為有效的 JSON 格式: ${(secondParseError as Error).message}`);
      }
    }
  } catch (error) {
    console.error('呼叫 Provider 系統時發生錯誤:', error);
    throw error;
  }
};

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
