/**
 * 動態模型選擇組件
 * 根據 Provider 類型和 API Key 動態獲取可用模型
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProviderConfig, ProviderType } from '../../src/core/types/providers';
import { GeminiProvider } from '../../src/core/providers/GeminiProvider';
import { OpenRouterProvider } from '../../src/core/providers/OpenRouterProvider';

interface ModelSelectorProps {
  provider: ProviderConfig;
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  provider,
  selectedModel,
  onModelChange,
  disabled = false
}) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let providerInstance;

      // 根據 Provider 類型創建實例
      if (provider.type === ProviderType.GEMINI) {
        providerInstance = new GeminiProvider(provider as any);
      } else if (provider.type === ProviderType.OPENROUTER) {
        providerInstance = new OpenRouterProvider(provider as any);
      } else {
        throw new Error(`不支援的 Provider 類型`);
      }

      const availableModels = await providerInstance.getAvailableModels();

      // 轉換為統一格式
      const formattedModels: ModelInfo[] = availableModels.map(model => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        inputTokenLimit: model.inputTokenLimit || model.context_length,
        outputTokenLimit: model.outputTokenLimit || model.max_tokens
      }));

      setModels(formattedModels);

      // 如果目前選擇的模型不在新列表中，選擇第一個可用模型
      if (formattedModels.length > 0 && !formattedModels.some(m => m.id === selectedModel)) {
        onModelChange(formattedModels[0].id);
      }

    } catch (err) {
      console.error('獲取模型列表失敗:', err);
      setError(err instanceof Error ? err.message : '獲取模型列表失敗');

      // 使用預設模型作為備用
      setModels(getDefaultModels(provider.type));
    } finally {
      setLoading(false);
    }
  }, [provider, selectedModel, onModelChange]);

  // 當 API Key 或 Provider 類型改變時，重新獲取模型列表
  useEffect(() => {
    if (provider.apiKey && provider.apiKey.trim().length > 10) {
      fetchModels();
    } else {
      // 如果沒有 API Key，清空模型列表
      setModels([]);
      setError(null);
    }
  }, [provider.apiKey, provider.type, fetchModels]);

  // 獲取預設模型列表
  const getDefaultModels = (type: ProviderType): ModelInfo[] => {
    if (type === ProviderType.GEMINI) {
      return [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'gemini-pro', name: 'Gemini Pro' },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' }
      ];
    } else if (type === ProviderType.OPENROUTER) {
      return [
        { id: 'openai/gpt-4o', name: 'GPT-4o' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
        { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'mistralai/mistral-large-2411', name: 'Mistral Large' }
      ];
    }
    return [];
  };

  // 重新獲取模型列表
  const handleRefresh = () => {
    if (provider.apiKey && provider.apiKey.trim().length > 10) {
      fetchModels();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">模型</label>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || disabled || !provider.apiKey}
            className="text-xs text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            title="重新獲取模型列表"
          >
            ↻ 重新獲取
          </button>
        </div>
      </div>

      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled || loading || models.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {models.length === 0 ? (
          <option value="">
            {provider.apiKey ? '載入中...' : '請先輸入 API Key'}
          </option>
        ) : (
          models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
              {model.description && ` - ${model.description.substring(0, 50)}...`}
            </option>
          ))
        )}
      </select>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-2 text-indigo-600 hover:text-indigo-700 underline"
          >
            重試
          </button>
        </p>
      )}

      {models.length > 0 && !loading && (
        <div className="mt-2 text-xs text-gray-600">
          找到 {models.length} 個可用模型
          {selectedModel && (
            <>
              {' • 已選擇: '}
              <span className="font-medium">
                {models.find(m => m.id === selectedModel)?.name || selectedModel}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
