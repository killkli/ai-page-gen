import React, { useState, useCallback } from 'react';
import { ProviderConfig } from '../../src/core/types/providers';
import { ProviderSharingService } from '../../services/providerSharingService';
import { EncryptionService } from '../../services/encryptionService';

interface ProviderShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderConfig[];
  onShareCreated?: (shareUrl: string) => void;
}

const ProviderShareModal: React.FC<ProviderShareModalProps> = ({
  isOpen,
  onClose,
  providers,
  onShareCreated
}) => {
  const [shareName, setShareName] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 初始化時選擇所有可用的 providers
  React.useEffect(() => {
    if (providers.length > 0 && selectedProviders.length === 0) {
      const availableProviders = providers.filter(p => p.enabled && p.apiKey);
      setSelectedProviders(availableProviders.map(p => p.id));
    }
  }, [providers, selectedProviders.length]);

  const passwordStrength = React.useMemo(() => {
    return EncryptionService.validatePasswordStrength(sharePassword);
  }, [sharePassword]);

  const handleGeneratePassword = useCallback(() => {
    const generated = EncryptionService.generateRandomPassword();
    setSharePassword(generated);
  }, []);

  const handleProviderToggle = useCallback((providerId: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  }, []);

  const handleCreateShare = useCallback(async () => {
    if (!shareName.trim()) {
      setError('請輸入分享名稱');
      return;
    }

    if (!sharePassword) {
      setError('請設定分享密碼');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('密碼強度不足');
      return;
    }

    if (selectedProviders.length === 0) {
      setError('請至少選擇一個 Provider');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const providersToShare = providers.filter(p => selectedProviders.includes(p.id));
      const binId = await ProviderSharingService.createEncryptedShare(
        providersToShare,
        shareName,
        sharePassword,
        shareDescription || undefined
      );

      const url = ProviderSharingService.generateShareUrl(binId);
      setShareUrl(url);
      onShareCreated?.(url);
    } catch (err: any) {
      setError(err.message || '創建分享失敗');
    } finally {
      setIsCreating(false);
    }
  }, [shareName, sharePassword, shareDescription, selectedProviders, providers, passwordStrength.isValid, onShareCreated]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // 可以添加成功提示
    } catch (err) {
      console.error('複製失敗:', err);
    }
  }, [shareUrl]);

  const handleCopyPassword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sharePassword);
      // 可以添加成功提示
    } catch (err) {
      console.error('複製密碼失敗:', err);
    }
  }, [sharePassword]);

  if (!isOpen) return null;

  const availableProviders = providers.filter(p => p.enabled && p.apiKey);
  const stats = ProviderSharingService.generateShareStats(
    providers.filter(p => selectedProviders.includes(p.id))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">分享 Provider 配置</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {!shareUrl ? (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享名稱 *
                  </label>
                  <input
                    type="text"
                    value={shareName}
                    onChange={(e) => setShareName(e.target.value)}
                    placeholder="例如：我的 AI 助手配置"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享描述（可選）
                  </label>
                  <textarea
                    value={shareDescription}
                    onChange={(e) => setShareDescription(e.target.value)}
                    placeholder="描述這個配置的用途和特點..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 密碼設定 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享密碼 *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="設定一個強密碼來保護您的配置"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleGeneratePassword}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      生成
                    </button>
                    <button
                      onClick={handleCopyPassword}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      複製
                    </button>
                  </div>
                  {sharePassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              passwordStrength.score >= 4 ? 'bg-green-500' :
                              passwordStrength.score >= 3 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          passwordStrength.score >= 4 ? 'text-green-600' :
                          passwordStrength.score >= 3 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {passwordStrength.score >= 4 ? '強' :
                           passwordStrength.score >= 3 ? '中' : '弱'}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <ul className="mt-1 text-xs text-gray-600">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <li key={index}>• {feedback}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Provider 選擇 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    選擇要分享的 Provider
                  </label>
                  <span className="text-sm text-gray-500">
                    已選擇 {selectedProviders.length} / {availableProviders.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableProviders.map((provider) => (
                    <label key={provider.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.id)}
                        onChange={() => handleProviderToggle(provider.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {provider.type}
                          </span>
                        </div>
                        {provider.description && (
                          <p className="text-sm text-gray-500 mt-1">{provider.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {availableProviders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>沒有可用的 Provider 配置</p>
                    <p className="text-sm mt-1">請先配置至少一個 Provider 並確保已啟用</p>
                  </div>
                )}
              </div>

              {/* 分享統計 */}
              {selectedProviders.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">分享預覽</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Provider 數量:</span>
                      <span className="ml-2 font-medium">{stats.totalProviders}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">安全級別:</span>
                      <span className="ml-2 font-medium text-green-600">{stats.securityLevel === 'high' ? '高' : '中'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700">包含類型:</span>
                      <span className="ml-2">{Object.keys(stats.providerTypes).join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateShare}
                  disabled={isCreating || selectedProviders.length === 0 || !passwordStrength.isValid}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isCreating ? '創建中...' : '創建分享'}
                </button>
              </div>
            </div>
          ) : (
            /* 分享成功 */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">分享創建成功！</h3>
                <p className="text-gray-600">您的 Provider 配置已安全加密並準備分享</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享連結
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      複製
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    解密密碼
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sharePassword}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyPassword}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                    >
                      複製
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">重要提醒</p>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• 請將分享連結和密碼分別傳送給接收者</li>
                      <li>• 密碼包含敏感的 API Key 信息，請妥善保管</li>
                      <li>• 建議通過安全通道（如加密聊天）分享密碼</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  完成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderShareModal;