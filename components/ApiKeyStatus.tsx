import React, { useState, useEffect } from 'react';
import { KeyIcon, CogIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';
import ApiKeyManager from './ApiKeyManager';

interface ApiKeyStatusProps {
  className?: string;
  compact?: boolean;
}

const ApiKeyStatus: React.FC<ApiKeyStatusProps> = ({ className = '', compact = false }) => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showManager, setShowManager] = useState<boolean>(false);
  const [apiKeyPreview, setApiKeyPreview] = useState<string>('');

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = () => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey && storedKey.trim()) {
      setHasApiKey(true);
      // 顯示前6位和後4位，中間用...代替
      const preview = storedKey.length > 10 
        ? `${storedKey.substring(0, 6)}...${storedKey.substring(storedKey.length - 4)}`
        : '••••••';
      setApiKeyPreview(preview);
    } else {
      setHasApiKey(false);
      setApiKeyPreview('');
    }
  };

  const handleManagerClose = () => {
    setShowManager(false);
    checkApiKey(); // 重新檢查 API Key 狀態
  };

  if (compact) {
    return (
      <>
        <div className={`flex items-center ${className}`}>
          {hasApiKey ? (
            <button
              onClick={() => setShowManager(true)}
              className="flex items-center gap-2 px-3 py-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm"
              title="點擊管理 API Key"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>API Key 已設定</span>
              <CogIcon className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => setShowManager(true)}
              className="flex items-center gap-2 px-3 py-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
              title="點擊設定 API Key"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>未設定 API Key</span>
              <CogIcon className="w-3 h-3" />
            </button>
          )}
        </div>

        {showManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <ApiKeyManager onClose={handleManagerClose} />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyIcon className={`w-5 h-5 ${hasApiKey ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <h3 className="text-sm font-medium text-gray-800">API Key 狀態</h3>
              {hasApiKey ? (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">已設定</span>
                  <code className="text-xs text-gray-500">{apiKeyPreview}</code>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-yellow-600">未設定 - 請設定以使用 AI 功能</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CogIcon className="w-4 h-4" />
            {hasApiKey ? '管理' : '設定'}
          </button>
        </div>
      </div>

      {showManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <ApiKeyManager onClose={handleManagerClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyStatus;