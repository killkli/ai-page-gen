/**
 * Provider 測試組件
 * 用於測試 Provider 系統的功能
 */

import React, { useState, useEffect } from 'react';
import {
  getConfiguredProviders,
  testAllProviders,
  generateLearningLevelSuggestions,
  hasConfiguredProviders
} from '../services/geminiServiceAdapter';
import ProviderSettingsModal from './ProviderSettings/ProviderSettingsModal';

const ProviderTest: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [generateResult, setGenerateResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasProviders, setHasProviders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 載入 Provider 列表
  const loadProviders = async () => {
    try {
      const providersData = await getConfiguredProviders();
      setProviders(providersData);

      const hasConfigured = await hasConfiguredProviders();
      setHasProviders(hasConfigured);
    } catch (error) {
      console.error('載入 Provider 失敗:', error);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // 測試所有 Provider
  const handleTestAllProviders = async () => {
    setIsTesting(true);
    setTestResults([]);

    try {
      const results = await testAllProviders();
      setTestResults(results);
    } catch (error) {
      console.error('測試 Provider 失敗:', error);
    } finally {
      setIsTesting(false);
    }
  };

  // 測試生成功能
  const handleTestGeneration = async () => {
    setIsGenerating(true);
    setGenerateResult(null);

    try {
      // 檢查是否有配置的 Provider
      const hasProviders = await hasConfiguredProviders();

      if (!hasProviders) {
        throw new Error('請先配置至少一個 Provider 並設置為預設');
      }

      // 傳遞一個假的 API Key，讓適配器系統處理 Provider 選擇
      const result = await generateLearningLevelSuggestions('JavaScript 基礎程式設計', 'provider-system-placeholder-key');
      setGenerateResult(result);
    } catch (error) {
      console.error('測試生成功能失敗:', error);
      setGenerateResult({ error: error.message || '生成失敗' });
    } finally {
      setIsGenerating(false);
    }
  };

  // 處理設定保存
  const handleSettingsSave = async (_updatedProviders: any[]) => {
    await loadProviders();
    setShowSettings(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider 系統測試</h1>

        {/* Provider 狀態 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Provider 狀態</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">
                已配置的 Provider: <span className="font-medium">{providers.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                系統狀態: {hasProviders ? (
                  <span className="text-green-600 font-medium">已就緒</span>
                ) : (
                  <span className="text-red-600 font-medium">未配置</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              管理 Provider
            </button>
          </div>

          {providers.length > 0 && (
            <div className="grid gap-3">
              {providers.map((provider, _index) => (
                <div key={provider.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{provider.name}</span>
                      <span className="ml-2 text-sm text-gray-500 capitalize">({provider.type})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {provider.enabled ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          啟用
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          停用
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 測試按鈕 */}
        <div className="mb-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">功能測試</h2>

          <div className="flex gap-3">
            <button
              onClick={handleTestAllProviders}
              disabled={isTesting || providers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? '測試中...' : '測試 Provider 連接'}
            </button>

            <button
              onClick={handleTestGeneration}
              disabled={isGenerating || !hasProviders}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '生成中...' : '測試內容生成'}
            </button>
          </div>
        </div>

        {/* 測試結果 */}
        {testResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">連接測試結果</h3>
            <div className="space-y-2">
              {testResults.map((result, _index) => (
                <div key={result.providerId} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {providers.find(p => p.id === result.providerId)?.name || result.providerId}
                    </span>
                    <div className="flex items-center space-x-3">
                      {result.responseTime && (
                        <span className="text-sm text-gray-500">{result.responseTime}ms</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'active' ? '成功' : '失敗'}
                      </span>
                    </div>
                  </div>
                  {result.error && (
                    <p className="mt-2 text-sm text-red-600">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 生成測試結果 */}
        {generateResult && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">內容生成測試結果</h3>
            <div className="p-4 border rounded bg-gray-50">
              {generateResult.error ? (
                <div className="text-red-600">
                  <p className="font-medium">生成失敗</p>
                  <p className="text-sm mt-1">{generateResult.error}</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-green-600 mb-3">生成成功</p>
                  <div className="text-sm text-gray-700">
                    <p>預設程度: {generateResult.defaultLevelId}</p>
                    <p>建議程度數: {generateResult.suggestedLevels?.length || 0}</p>
                    {generateResult.suggestedLevels && (
                      <div className="mt-2">
                        <p className="font-medium">程度列表:</p>
                        <ul className="list-disc list-inside ml-4">
                          {generateResult.suggestedLevels.map((level: any, index: number) => (
                            <li key={index}>{level.name}: {level.description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 系統資訊 */}
        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>Provider 系統版本: 1.0.0</p>
          <p>支援的 Provider: Gemini, OpenRouter</p>
          <p>測試時間: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Provider 設定模態框 */}
      <ProviderSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSettingsSave}
        currentProviders={providers}
      />
    </div>
  );
};

export default ProviderTest;