/**
 * Provider 選擇器組件
 * 允許用戶快速切換和選擇 AI Provider
 */

import React, { useState } from 'react';
import {
  ProviderConfig,
  ProviderUsageStats,
  ProviderSelectionStrategy
} from '../../src/core/types/providers';

interface ProviderSelectorProps {
  providers: ProviderConfig[];
  selectedProviderId?: string;
  onProviderSelect: (providerId: string) => void;
  onStrategyChange?: (strategy: ProviderSelectionStrategy) => void;
  usageStats?: ProviderUsageStats[];
  showStrategy?: boolean;
  className?: string;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProviderId,
  onProviderSelect,
  onStrategyChange,
  usageStats = [],
  showStrategy = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<ProviderSelectionStrategy>(
    ProviderSelectionStrategy.DEFAULT
  );

  const enabledProviders = providers.filter(p => p.enabled);
  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  // 獲取 Provider 的使用統計
  const getProviderStats = (providerId: string) => {
    return usageStats.find(stats => stats.providerId === providerId);
  };

  // 處理策略變更
  const handleStrategyChange = (strategy: ProviderSelectionStrategy) => {
    setSelectedStrategy(strategy);
    onStrategyChange?.(strategy);
  };

  // 渲染 Provider 狀態指示器
  const renderProviderStatus = (provider: ProviderConfig) => {
    const stats = getProviderStats(provider.id);

    if (!stats) {
      return <div className="w-2 h-2 bg-gray-400 rounded-full" title="未測試" />;
    }

    const successRate = stats.totalRequests > 0 ?
      (stats.successfulRequests / stats.totalRequests * 100) : 0;

    if (successRate >= 90) {
      return <div className="w-2 h-2 bg-green-500 rounded-full" title={`成功率: ${successRate.toFixed(1)}%`} />;
    } else if (successRate >= 70) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" title={`成功率: ${successRate.toFixed(1)}%`} />;
    } else {
      return <div className="w-2 h-2 bg-red-500 rounded-full" title={`成功率: ${successRate.toFixed(1)}%`} />;
    }
  };

  // 渲染 Provider 圖標
  const renderProviderIcon = (provider: ProviderConfig) => {
    const iconClasses = "w-4 h-4";

    switch (provider.type) {
      case 'gemini':
        return (
          <div className={`${iconClasses} bg-blue-500 rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">G</span>
          </div>
        );
      case 'openrouter':
        return (
          <div className={`${iconClasses} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">O</span>
          </div>
        );
      default:
        return (
          <div className={`${iconClasses} bg-gray-500 rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">?</span>
          </div>
        );
    }
  };

  if (enabledProviders.length === 0) {
    return (
      <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-800">尚未設定可用的 Provider</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 策略選擇器 (可選) */}
      {showStrategy && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">選擇策略</label>
          <select
            value={selectedStrategy}
            onChange={(e) => handleStrategyChange(e.target.value as ProviderSelectionStrategy)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={ProviderSelectionStrategy.DEFAULT}>預設 Provider</option>
            <option value={ProviderSelectionStrategy.FASTEST}>最快回應</option>
            <option value={ProviderSelectionStrategy.FALLBACK}>依序嘗試</option>
            <option value={ProviderSelectionStrategy.LOAD_BALANCE}>負載平衡</option>
          </select>
        </div>
      )}

      {/* Provider 選擇器 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedProvider ? (
                <>
                  {renderProviderIcon(selectedProvider)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{selectedProvider.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{selectedProvider.type}</div>
                  </div>
                  {renderProviderStatus(selectedProvider)}
                </>
              ) : (
                <span className="text-gray-500">選擇 Provider</span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* 下拉選單 */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {enabledProviders.map((provider) => {
              const stats = getProviderStats(provider.id);
              const isSelected = provider.id === selectedProviderId;

              return (
                <button
                  key={provider.id}
                  onClick={() => {
                    onProviderSelect(provider.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {renderProviderIcon(provider)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{provider.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{provider.type}</div>
                      {stats && (
                        <div className="text-xs text-gray-400 mt-1">
                          成功率: {stats.totalRequests > 0 ?
                            (stats.successfulRequests / stats.totalRequests * 100).toFixed(1) : 0}%
                          {stats.averageResponseTime > 0 && (
                            <span className="ml-2">平均: {Math.round(stats.averageResponseTime)}ms</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderProviderStatus(provider)}
                      {isSelected && (
                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* 設定按鈕 */}
            <div className="border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // 觸發設定模態框打開事件
                  window.dispatchEvent(new CustomEvent('openProviderSettings'));
                }}
                className="w-full px-4 py-3 text-left text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">管理 Provider</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 當前 Provider 資訊 (可選) */}
      {selectedProvider && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">當前選中:</span>
            <span className="font-medium text-gray-900">{selectedProvider.name}</span>
          </div>
          {selectedProvider.description && (
            <div className="mt-1 text-xs text-gray-500">{selectedProvider.description}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;