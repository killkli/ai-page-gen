import React, { useState, useEffect } from 'react';
import { KeyIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XMarkIcon } from './icons';

interface ApiKeyManagerProps {
  onClose?: () => void;
  className?: string;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onClose, className = '' }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hasStoredKey, setHasStoredKey] = useState<boolean>(false);

  useEffect(() => {
    // 載入已存儲的 API Key
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setHasStoredKey(true);
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      localStorage.setItem('gemini_api_key', trimmedKey);
      setApiKey(trimmedKey);
      setHasStoredKey(true);
      setIsEditing(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleEditApiKey = () => {
    setIsEditing(true);
    setShowKey(true);
  };

  const handleDeleteApiKey = () => {
    if (confirm('確定要刪除 API Key 嗎？刪除後將無法使用 AI 功能。')) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      setHasStoredKey(false);
      setIsEditing(true);
      setShowKey(false);
    }
  };

  const handleCancel = () => {
    if (hasStoredKey) {
      const storedKey = localStorage.getItem('gemini_api_key');
      setApiKey(storedKey || '');
      setIsEditing(false);
      setShowKey(false);
    }
    if (onClose) {
      onClose();
    }
  };

  const displayKey = showKey ? apiKey : apiKey.replace(/./g, '•');

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Gemini API Key 設定</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* API Key 狀態 */}
        {hasStoredKey && !isEditing && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">API Key 已設定</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded border flex-1">
                {displayKey}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title={showKey ? '隱藏 API Key' : '顯示 API Key'}
              >
                {showKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* 編輯表單 */}
        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入您的 Gemini API Key"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg transition-colors"
                title={showKey ? '隱藏' : '顯示'}
              >
                {showKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              請前往 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a> 取得您的 API Key
            </p>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex gap-2 justify-end">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                儲存
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDeleteApiKey}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                刪除
              </button>
              <button
                onClick={handleEditApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                編輯
              </button>
            </>
          )}
        </div>

        {/* 說明資訊 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-1">關於 API Key</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• API Key 會安全地存儲在您的瀏覽器本地存儲中</li>
            <li>• 不會傳送到我們的伺服器，僅用於直接調用 Google AI 服務</li>
            <li>• 您可以隨時修改或刪除已保存的 API Key</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;