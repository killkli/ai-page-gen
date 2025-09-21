/**
 * Provider 調試組件
 * 用於調試 Provider 系統的具體錯誤
 */

import React, { useState } from 'react';
import { providerService } from '../services/providerService';

const ProviderDebug: React.FC = () => {
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLog = () => {
    setDebugLog([]);
  };

  const testProviderSystem = async () => {
    setIsTesting(true);
    clearLog();

    try {
      addLog('開始測試 Provider 系統...');

      // 1. 檢查是否有配置的 Provider
      addLog('檢查配置的 Provider...');
      const providers = await providerService.getProviders();
      addLog(`找到 ${providers.length} 個 Provider: ${providers.map(p => p.name).join(', ')}`);

      // 2. 檢查每個 Provider 的配置
      for (const provider of providers) {
        addLog(`Provider "${provider.name}" (${provider.type}): ${provider.enabled ? '啟用' : '停用'}, API Key: ${provider.apiKey ? '已設定' : '未設定'}`);
      }

      // 3. 測試 Provider Manager 初始化
      addLog('測試 Provider Manager...');
      const _manager = await providerService.getManager();
      addLog('Provider Manager 初始化成功');

      // 4. 測試每個 Provider 連接
      if (providers.length > 0) {
        addLog('開始測試 Provider 連接...');

        for (const provider of providers) {
          if (provider.enabled && provider.apiKey) {
            addLog(`測試 "${provider.name}" 連接...`);

            try {
              const testResult = await providerService.testProvider(provider.id);
              addLog(`"${provider.name}" 測試結果: ${JSON.stringify(testResult, null, 2)}`);
            } catch (error) {
              addLog(`"${provider.name}" 測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
              console.error(`Provider ${provider.name} 測試錯誤:`, error);
            }
          } else {
            addLog(`跳過 "${provider.name}": ${!provider.enabled ? '未啟用' : 'API Key 未設定'}`);
          }
        }
      } else {
        addLog('沒有找到任何 Provider');
      }

      // 5. 測試生成內容
      addLog('測試內容生成...');
      try {
        const generateResult = await providerService.generateContent({
          prompt: '測試：請回應 "Hello World"',
          options: { maxTokens: 50, responseFormat: 'text' }
        });
        addLog(`內容生成成功: ${JSON.stringify(generateResult, null, 2)}`);
      } catch (error) {
        addLog(`內容生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
        console.error('內容生成錯誤:', error);
      }

    } catch (error) {
      addLog(`測試過程發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
      console.error('Provider 系統測試錯誤:', error);
    } finally {
      setIsTesting(false);
      addLog('測試完成');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider 系統調試</h1>

        <div className="mb-6">
          <button
            onClick={testProviderSystem}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
          >
            {isTesting ? '測試中...' : '開始調試測試'}
          </button>

          <button
            onClick={clearLog}
            disabled={isTesting}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            清除日誌
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
          <div className="mb-2 text-gray-400">調試日誌:</div>
          {debugLog.length === 0 ? (
            <div className="text-gray-500">尚無日誌記錄</div>
          ) : (
            debugLog.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>說明：</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>這個工具會逐步測試 Provider 系統的各個組件</li>
            <li>檢查 Provider 配置、連接和內容生成功能</li>
            <li>詳細的錯誤信息會顯示在控制台中</li>
            <li>如果測試失敗，請檢查 API Key 設定和網路連接</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProviderDebug;