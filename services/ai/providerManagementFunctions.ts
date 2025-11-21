/**
 * Provider 系統管理函數模組
 *
 * 處理 Provider 的配置、測試、統計等管理功能
 */

import { providerService } from '../providerService';

export const hasConfiguredProviders = async (): Promise<boolean> => {
  return await providerService.hasConfiguredProviders();
};

export const addProvider = async (config: any) => {
  return await providerService.addProvider(config);
};

export const updateProvider = async (config: any) => {
  return await providerService.updateProvider(config);
};

export const removeProvider = async (providerId: string) => {
  return await providerService.removeProvider(providerId);
};

export const testProvider = async (providerId: string) => {
  return await providerService.testProvider(providerId);
};

export const testAllProviders = async () => {
  return await providerService.testAllProviders();
};

export const setDefaultProvider = async (providerId: string) => {
  return await providerService.setDefaultProvider(providerId);
};

export const getUsageStats = async () => {
  return await providerService.getUsageStats();
};

export const getProviderManager = () => providerService;

export const clearAllProviderData = async () => {
  return await providerService.clearAllData();
};

export const initializeProviderSystem = async () => {
  console.log('Provider 系統初始化中...');
  // Provider 系統已在導入時自動初始化
  return true;
};