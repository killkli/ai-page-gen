/**
 * Provider API Key 模態框
 * 支援新的 Provider 系統的 API Key 設定介面
 */

import React, { useState, useEffect } from 'react';
import { ProviderType, GeminiProviderConfig, OpenRouterProviderConfig } from '../src/core/types/providers';
import { addProvider } from '../services/geminiService';

interface ProviderApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  title?: string;
  message?: string;
}

const ProviderApiKeyModal: React.FC<ProviderApiKeyModalProps> = ({
  isOpen,
  onSave,
  title = "設定 AI Provider",
  message = "請選擇並設定您的 AI Provider 以開始使用"
}) => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(ProviderType.GEMINI);
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 進階設定狀態
  const [providerName, setProviderName] = useState('');
  const [geminiModel, setGeminiModel] = useState<'gemini-2.5-flash' | 'gemini-pro' | 'gemini-pro-vision'>('gemini-2.5-flash');
  const [openRouterModel, setOpenRouterModel] = useState('openai/gpt-4o');
  const [temperature, setTemperature] = useState(0.7);

  // 重置表單
  const resetForm = () => {
    setApiKey('');
    setError('');
    setProviderName('');
    setTemperature(0.7);
    setGeminiModel('gemini-2.5-flash');
    setOpenRouterModel('openai/gpt-4o');
    setShowAdvanced(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // 更新預設名稱
  useEffect(() => {
    if (!showAdvanced) {
      setProviderName(selectedProvider === ProviderType.GEMINI ? 'Gemini Provider' : 'OpenRouter Provider');
    }
  }, [selectedProvider, showAdvanced]);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError('請輸入 API Key');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 創建 Provider 配置
      const baseConfig = {
        id: `${selectedProvider}_${Date.now()}`,
        name: providerName || (selectedProvider === ProviderType.GEMINI ? 'Gemini Provider' : 'OpenRouter Provider'),
        type: selectedProvider,
        enabled: true,
        apiKey: apiKey.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let providerConfig;

      if (selectedProvider === ProviderType.GEMINI) {
        providerConfig = {
          ...baseConfig,
          type: ProviderType.GEMINI,
          model: geminiModel,
          settings: {
            responseMimeType: 'application/json' as const,
            temperature,
            maxOutputTokens: 8192
          }
        } as GeminiProviderConfig;
      } else {
        providerConfig = {
          ...baseConfig,
          type: ProviderType.OPENROUTER,
          model: openRouterModel,
          settings: {
            temperature,
            max_tokens: 4096,
            stream: false
          }
        } as OpenRouterProviderConfig;
      }

      // 添加 Provider
      await addProvider(providerConfig);

      // 為了兼容性，也設定舊版 API Key
      if (selectedProvider === ProviderType.GEMINI) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
      }

      onSave(apiKey.trim());
      resetForm();
    } catch (err) {
      console.error('設定 Provider 失敗:', err);
      setError(err instanceof Error ? err.message : '設定失敗，請檢查 API Key 是否正確');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSetup = async () => {
    // 快速設定：使用最少的配置
    setShowAdvanced(false);
    await handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Provider 選擇 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">選擇 AI Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedProvider(ProviderType.GEMINI)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedProvider === ProviderType.GEMINI
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">G</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Gemini</div>
                    <div className="text-xs text-gray-500">Google AI</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedProvider(ProviderType.OPENROUTER)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedProvider === ProviderType.OPENROUTER
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">O</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">OpenRouter</div>
                    <div className="text-xs text-gray-500">統一 API</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* API Key 輸入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedProvider === ProviderType.GEMINI ? 'Gemini API Key' : 'OpenRouter API Key'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={selectedProvider === ProviderType.GEMINI ? '輸入您的 Gemini API Key' : '輸入您的 OpenRouter API Key'}
            />
            <div className="mt-2 text-xs text-gray-500">
              {selectedProvider === ProviderType.GEMINI ? (
                <>
                  在 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a> 獲取 API Key
                </>
              ) : (
                <>
                  在 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">OpenRouter</a> 獲取 API Key
                </>
              )}
            </div>
          </div>

          {/* 進階設定切換 */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              進階設定
            </button>
          </div>

          {/* 進階設定 */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider 名稱</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="自訂 Provider 名稱"
                />
              </div>

              {selectedProvider === ProviderType.GEMINI && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模型</label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (推薦)</option>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  </select>
                </div>
              )}

              {selectedProvider === ProviderType.OPENROUTER && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模型</label>
                  <select
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="openai/gpt-4o">GPT-4o (推薦)</option>
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="mistralai/mistral-large-2411">Mistral Large</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  溫度 (Temperature): {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保守 (0)</span>
                  <span>平衡 (1)</span>
                  <span>創意 (2)</span>
                </div>
              </div>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {showAdvanced ? (
            <>
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isSubmitting}
              >
                簡化設定
              </button>
              <button
                onClick={handleSubmit}
                disabled={!apiKey.trim() || isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '設定中...' : '完成設定'}
              </button>
            </>
          ) : (
            <button
              onClick={handleQuickSetup}
              disabled={!apiKey.trim() || isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '設定中...' : '快速設定'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderApiKeyModal;