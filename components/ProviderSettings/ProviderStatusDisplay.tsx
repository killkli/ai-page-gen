/**
 * Provider 狀態顯示組件
 * 顯示當前 Provider 狀態和簡化的管理界面
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProviderConfig, ProviderUsageStats } from '../../src/core/types/providers';
import { providerService } from '../../services/providerService';
import ProviderSettingsModal from './ProviderSettingsModal';
import ProviderSelector from './ProviderSelector';

interface ProviderStatusDisplayProps {
  onProviderChange?: (provider: ProviderConfig | null) => void;
  showSelector?: boolean;
  compact?: boolean;
  className?: string;
}

const ProviderStatusDisplay: React.FC<ProviderStatusDisplayProps> = ({
  onProviderChange,
  showSelector = true,
  compact = false,
  className = ''
}) => {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [usageStats, setUsageStats] = useState<ProviderUsageStats[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入 Provider 數據
  const loadProviderData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [providersData, statsData, manager] = await Promise.all([
        providerService.getProviders(),
        providerService.getUsageStats(),
        providerService.getManager()
      ]);

      setProviders(providersData);
      setUsageStats(statsData);

      // 獲取預設 Provider ID
      const _config = (manager as any).config;
      const defaultProviderId = _config?.defaultProviderId;

      // 設定預設選中的 Provider
      let targetProvider: ProviderConfig | undefined;
      if (defaultProviderId) {
        targetProvider = providersData.find(p => p.id === defaultProviderId && p.enabled);
      }
      if (!targetProvider) {
        targetProvider = providersData.find(p => p.enabled) || providersData[0];
      }

      if (targetProvider && !selectedProviderId) {
        setSelectedProviderId(targetProvider.id);
        onProviderChange?.(targetProvider);
      }
    } catch (err) {
      console.error('載入 Provider 數據失敗:', err);
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProviderId, onProviderChange]);

  useEffect(() => {
    loadProviderData();

    // 監聽 Provider 設定變更事件
    const handleProviderSettingsEvent = () => {
      setShowSettingsModal(true);
    };

    window.addEventListener('openProviderSettings', handleProviderSettingsEvent);

    return () => {
      window.removeEventListener('openProviderSettings', handleProviderSettingsEvent);
    };
  }, [loadProviderData]);

  // 處理 Provider 選擇
  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    const provider = providers.find(p => p.id === providerId);
    onProviderChange?.(provider || null);
  };

  // 處理設定保存
  const handleSettingsSave = async (updatedProviders: ProviderConfig[]) => {
    try {
      setProviders(updatedProviders);

      // 如果當前選中的 Provider 被刪除或禁用，選擇新的
      const currentProvider = updatedProviders.find(p => p.id === selectedProviderId);
      if (!currentProvider || !currentProvider.enabled) {
        const activeProvider = updatedProviders.find(p => p.enabled);
        if (activeProvider) {
          setSelectedProviderId(activeProvider.id);
          onProviderChange?.(activeProvider);
        } else {
          setSelectedProviderId('');
          onProviderChange?.(null);
        }
      }

      // 重新載入統計數據
      const statsData = await providerService.getUsageStats();
      setUsageStats(statsData);
    } catch (err) {
      console.error('更新 Provider 設定失敗:', err);
      setError(err instanceof Error ? err.message : '更新失敗');
    }
  };

  // 渲染緊湊版本
  if (compact) {
    const selectedProvider = providers.find(p => p.id === selectedProviderId);

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
            <span>載入中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>載入失敗</span>
          </div>
        ) : providers.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-1.732-.833-2.502 0l-6.928 12c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>尚未設定</span>
          </div>
        ) : (
          <>
            {selectedProvider ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{selectedProvider.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>未選擇</span>
              </div>
            )}
          </>
        )}

        <button
          onClick={() => setShowSettingsModal(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Provider 設定"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <ProviderSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSettingsSave}
          currentProviders={providers}
        />
      </div>
    );
  }

  // 渲染完整版本
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 標題和設定按鈕 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI Provider 設定</h3>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          管理 Provider
        </button>
      </div>

      {/* 載入和錯誤狀態 */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
            <span>載入 Provider 設定中...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">載入失敗</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={loadProviderData}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            重試
          </button>
        </div>
      )}

      {/* 沒有 Provider 的情況 */}
      {!isLoading && !error && providers.length === 0 && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <svg className="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-1.732-.833-2.502 0l-6.928 12c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h4 className="text-lg font-medium text-yellow-800 mb-2">尚未設定 AI Provider</h4>
          <p className="text-yellow-700 mb-4">
            請點擊上方的「管理 Provider」按鈕來添加 Gemini 或 OpenRouter Provider
          </p>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            立即設定
          </button>
        </div>
      )}

      {/* Provider 選擇器 */}
      {!isLoading && !error && providers.length > 0 && showSelector && (
        <ProviderSelector
          providers={providers}
          selectedProviderId={selectedProviderId}
          onProviderSelect={handleProviderSelect}
          usageStats={usageStats}
          showStrategy={true}
        />
      )}

      {/* Provider 統計資訊 */}
      {!isLoading && !error && usageStats.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">使用統計</h4>
          <div className="space-y-2">
            {usageStats.slice(0, 3).map((stats) => {
              const provider = providers.find(p => p.id === stats.providerId);
              if (!provider) return null;

              const successRate = stats.totalRequests > 0 ?
                (stats.successfulRequests / stats.totalRequests * 100) : 0;

              return (
                <div key={stats.providerId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{provider.name}</span>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>成功率: {successRate.toFixed(1)}%</span>
                    <span>請求數: {stats.totalRequests}</span>
                    {stats.averageResponseTime > 0 && (
                      <span>平均: {Math.round(stats.averageResponseTime)}ms</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Provider 設定模態框 */}
      <ProviderSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSettingsSave}
        currentProviders={providers}
      />
    </div>
  );
};

export default ProviderStatusDisplay;