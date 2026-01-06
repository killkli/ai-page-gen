/**
 * Provider 設定模態框組件
 * 允許用戶管理 AI Provider 配置
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ProviderConfig,
  ProviderType,
  GeminiProviderConfig,
  OpenRouterProviderConfig,
  ProviderTestResult,
  ProviderStatus,
} from '../../src/core/types/providers';
import { ProviderManager } from '../../src/core/providers/ProviderManager';
import { providerService } from '../../services/providerService';
import ModelSelector from './ModelSelector';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (providers: ProviderConfig[]) => void;
  currentProviders: ProviderConfig[];
}

const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProviders,
}) => {
  const [providers, setProviders] =
    useState<ProviderConfig[]>(currentProviders);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testResults, setTestResults] = useState<
    Map<string, ProviderTestResult>
  >(new Map());
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [defaultProviderId, setDefaultProviderId] = useState<
    string | undefined
  >(undefined);

  // ProviderService 實例已在頂部導入

  useEffect(() => {
    if (isOpen) {
      setProviders([...currentProviders]);
      loadDefaultProviderId();
    }
  }, [isOpen, currentProviders]); // eslint-disable-line react-hooks/exhaustive-deps

  // 載入預設 Provider ID
  const loadDefaultProviderId = useCallback(async () => {
    try {
      const _manager = await providerService.getManager();
      const _config = (_manager as any).config;
      setDefaultProviderId(_config?.defaultProviderId);
    } catch (error) {
      console.error('載入預設 Provider ID 失敗:', error);
    }
  }, []);

  // 重新載入 Provider 配置
  const loadProviders = async () => {
    try {
      const updatedProviders = await providerService.getProviders();
      setProviders(updatedProviders);
      onSave(updatedProviders); // 同步到父組件
      await loadDefaultProviderId(); // 同時更新預設 Provider ID
    } catch (error) {
      console.error('載入 Provider 配置失敗:', error);
    }
  };

  // 設置預設 Provider
  const handleSetDefaultProvider = async (providerId: string) => {
    try {
      await providerService.setDefaultProvider(providerId);
      setDefaultProviderId(providerId);
    } catch (error) {
      console.error('設置預設 Provider 失敗:', error);
      alert(
        `設置預設 Provider 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      );
    }
  };

  // 創建新的 Provider 配置模板
  const createNewProvider = (type: ProviderType): ProviderConfig => {
    const baseConfig = {
      id: `${type}_${Date.now()}`,
      name: `新 ${type === ProviderType.GEMINI ? 'Gemini' : 'OpenRouter'} Provider`,
      type,
      enabled: true,
      apiKey: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (type === ProviderType.GEMINI) {
      return {
        ...baseConfig,
        type: ProviderType.GEMINI,
        model: 'gemini-2.5-flash',
        settings: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      } as GeminiProviderConfig;
    } else {
      return {
        ...baseConfig,
        type: ProviderType.OPENROUTER,
        model: 'openai/gpt-4o',
        settings: {
          temperature: 0.7,
          max_tokens: 4096,
          stream: false,
        },
      } as OpenRouterProviderConfig;
    }
  };

  // 添加新 Provider
  const handleAddProvider = (type: ProviderType) => {
    const newProvider = createNewProvider(type);
    setSelectedProvider(newProvider);
    setIsEditing(true);
  };

  // 編輯 Provider
  const handleEditProvider = (provider: ProviderConfig) => {
    setSelectedProvider({ ...provider });
    setIsEditing(true);
  };

  // 刪除 Provider
  const handleDeleteProvider = async (providerId: string) => {
    if (isDeleting || !confirm('確定要刪除這個 Provider 嗎？')) return;

    setIsDeleting(providerId);
    try {
      await providerService.removeProvider(providerId);
      setProviders(prev => prev.filter(p => p.id !== providerId));
      setTestResults(prev => {
        const newResults = new Map(prev);
        newResults.delete(providerId);
        return newResults;
      });
      // 重新載入 providers 以確保數據同步
      await loadProviders();
    } catch (error) {
      console.error('刪除 Provider 失敗:', error);
      alert(`刪除失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // 保存 Provider 配置
  const handleSaveProvider = async () => {
    if (!selectedProvider || isSaving) return;

    setIsSaving(true);
    try {
      selectedProvider.updatedAt = new Date().toISOString();

      const existingIndex = providers.findIndex(
        p => p.id === selectedProvider.id
      );

      if (existingIndex >= 0) {
        // 更新現有 Provider
        await providerService.updateProvider(selectedProvider);
        setProviders(prev =>
          prev.map((p, index) =>
            index === existingIndex ? selectedProvider : p
          )
        );
      } else {
        // 添加新 Provider
        await providerService.addProvider(selectedProvider);
        setProviders(prev => [...prev, selectedProvider]);
      }

      setSelectedProvider(null);
      setIsEditing(false);

      // 重新載入 providers 以確保數據同步
      await loadProviders();
    } catch (error) {
      console.error('保存 Provider 失敗:', error);
      alert(`保存失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 測試單個 Provider
  const handleTestProvider = async (provider: ProviderConfig) => {
    try {
      setTestResults(
        prev =>
          new Map(
            prev.set(provider.id, {
              providerId: provider.id,
              status: ProviderStatus.TESTING,
              testedAt: new Date().toISOString(),
            })
          )
      );

      // 創建臨時的 Provider Manager 進行測試
      const tempManager = ProviderManager.getInstance({
        providers: [provider],
        fallbackEnabled: false,
        timeout: 30000,
        retryAttempts: 1,
      });

      const result = await tempManager.testProvider(provider.id);
      setTestResults(prev => new Map(prev.set(provider.id, result)));
    } catch (error) {
      setTestResults(
        prev =>
          new Map(
            prev.set(provider.id, {
              providerId: provider.id,
              status: ProviderStatus.ERROR,
              error: error instanceof Error ? error.message : '測試失敗',
              testedAt: new Date().toISOString(),
            })
          )
      );
    }
  };

  // 測試所有 Provider
  const handleTestAllProviders = async () => {
    setIsTestingAll(true);

    for (const provider of providers) {
      if (provider.enabled && provider.apiKey) {
        await handleTestProvider(provider);
      }
    }

    setIsTestingAll(false);
  };

  const renderTestStatus = (providerId: string) => {
    const result = testResults.get(providerId);
    if (!result) return null;

    const statusColors = {
      [ProviderStatus.TESTING]: 'text-yellow-600 bg-yellow-50',
      [ProviderStatus.ACTIVE]: 'text-green-600 bg-green-50',
      [ProviderStatus.ERROR]: 'text-red-600 bg-red-50',
      [ProviderStatus.INACTIVE]: 'text-gray-600 bg-gray-50',
    };

    const statusText = {
      [ProviderStatus.TESTING]: '測試中...',
      [ProviderStatus.ACTIVE]: `正常 (${result.responseTime}ms)`,
      [ProviderStatus.ERROR]: result.error || '錯誤',
      [ProviderStatus.INACTIVE]: '未啟用',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[result.status]}`}
      >
        {statusText[result.status]}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Provider 設定
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            管理您的 AI Provider 配置和 API 金鑰
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Provider List */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Provider 清單
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddProvider(ProviderType.GEMINI)}
                    disabled={isSaving || isDeleting !== null}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Gemini
                  </button>
                  <button
                    onClick={() => handleAddProvider(ProviderType.OPENROUTER)}
                    disabled={isSaving || isDeleting !== null}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + OpenRouter
                  </button>
                </div>
              </div>
              <button
                onClick={handleTestAllProviders}
                disabled={isTestingAll}
                className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {isTestingAll ? '測試中...' : '測試所有 Provider'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {providers.map(provider => (
                  <div
                    key={provider.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProvider?.id === provider.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEditProvider(provider)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {provider.name}
                          </h4>
                          {defaultProviderId === provider.id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              預設
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 capitalize">
                          {provider.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderTestStatus(provider.id)}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleTestProvider(provider);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="測試連接"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </button>
                        {provider.enabled &&
                          defaultProviderId !== provider.id && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleSetDefaultProvider(provider.id);
                              }}
                              className="p-1 text-blue-400 hover:text-blue-600"
                              title="設為預設"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                            </button>
                          )}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteProvider(provider.id);
                          }}
                          disabled={isDeleting === provider.id}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            isDeleting === provider.id ? '刪除中...' : '刪除'
                          }
                        >
                          {isDeleting === provider.id ? (
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {provider.enabled ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        啟用
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        停用
                      </span>
                    )}
                  </div>
                ))}

                {providers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>尚未設定任何 Provider</p>
                    <p className="text-sm mt-1">
                      點擊上方按鈕添加新的 Provider
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Provider Editor */}
          <div className="w-1/2 flex flex-col">
            {isEditing && selectedProvider ? (
              <ProviderEditor
                provider={selectedProvider}
                onChange={setSelectedProvider}
                onSave={handleSaveProvider}
                onCancel={() => {
                  setSelectedProvider(null);
                  setIsEditing(false);
                }}
                isSaving={isSaving}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p>選擇左側的 Provider 進行編輯</p>
                  <p className="text-sm mt-1">
                    或點擊上方按鈕添加新的 Provider
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {providers.length > 0
              ? `已配置 ${providers.length} 個 Provider，${providers.filter(p => p.enabled).length} 個已啟用`
              : '尚未配置任何 Provider'}
          </p>
          <button
            onClick={() => {
              // 發送事件通知其他組件 Provider 設定已更新
              window.dispatchEvent(new CustomEvent('providerConfigUpdated'));
              onClose();
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

// Provider 編輯器組件
interface ProviderEditorProps {
  provider: ProviderConfig;
  onChange: (provider: ProviderConfig) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const ProviderEditor: React.FC<ProviderEditorProps> = ({
  provider,
  onChange,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const updateProvider = (updates: Partial<ProviderConfig>) => {
    onChange({ ...provider, ...updates } as ProviderConfig);
  };

  const updateSettings = (settings: any) => {
    onChange({ ...provider, settings: { ...provider.settings, ...settings } });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {provider.id.includes('_') &&
          provider.id.split('_')[1] === Date.now().toString()
            ? '新增'
            : '編輯'}{' '}
          Provider
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* 基本設定 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">基本設定</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名稱
                </label>
                <input
                  type="text"
                  value={provider.name}
                  onChange={e => updateProvider({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  類型
                </label>
                <select
                  value={provider.type}
                  onChange={e =>
                    updateProvider({ type: e.target.value as ProviderType })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={ProviderType.GEMINI}>Gemini</option>
                  <option value={ProviderType.OPENROUTER}>OpenRouter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={provider.apiKey}
                  onChange={e => updateProvider({ apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="請輸入 API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述 (可選)
                </label>
                <textarea
                  value={provider.description || ''}
                  onChange={e =>
                    updateProvider({ description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="描述這個 Provider 的用途..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={e => updateProvider({ enabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  啟用此 Provider
                </label>
              </div>
            </div>
          </div>

          {/* Gemini 特定設定 */}
          {provider.type === ProviderType.GEMINI && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Gemini 設定
              </h4>
              <div className="space-y-4">
                <ModelSelector
                  provider={provider}
                  selectedModel={(provider as GeminiProviderConfig).model}
                  onModelChange={model => updateProvider({ model })}
                  disabled={isSaving}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    溫度 (Temperature)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={provider.settings.temperature || 0.7}
                    onChange={e =>
                      updateSettings({
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大輸出 Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="32768"
                    value={
                      (provider.settings as GeminiProviderConfig['settings'])
                        .maxOutputTokens || 8192
                    }
                    onChange={e =>
                      updateSettings({
                        maxOutputTokens: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OpenRouter 特定設定 */}
          {provider.type === ProviderType.OPENROUTER && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                OpenRouter 設定
              </h4>
              <div className="space-y-4">
                <ModelSelector
                  provider={provider}
                  selectedModel={(provider as OpenRouterProviderConfig).model}
                  onModelChange={model => updateProvider({ model })}
                  disabled={isSaving}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    溫度 (Temperature)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={provider.settings.temperature || 0.7}
                    onChange={e =>
                      updateSettings({
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大 Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200000"
                    value={
                      (
                        provider.settings as OpenRouterProviderConfig['settings']
                      ).max_tokens || 4096
                    }
                    onChange={e =>
                      updateSettings({ max_tokens: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      (
                        provider.settings as OpenRouterProviderConfig['settings']
                      ).stream || false
                    }
                    onChange={e => updateSettings({ stream: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    啟用串流回應
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回清單
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || !provider.apiKey}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isSaving ? '儲存中...' : '儲存 Provider'}
        </button>
      </div>
    </div>
  );
};

export default ProviderSettingsModal;
