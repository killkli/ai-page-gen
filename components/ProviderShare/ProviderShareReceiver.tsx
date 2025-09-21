import React, { useState, useCallback } from 'react';
import { ProviderSharingService } from '../../services/providerSharingService';
import { ProviderShareData } from '../../services/encryptionService';
import { providerService } from '../../services/providerService';

interface ProviderShareReceiverProps {
  binId: string;
  onProviderImported?: (count: number) => void;
  onClose?: () => void;
}

const ProviderShareReceiver: React.FC<ProviderShareReceiverProps> = ({
  binId,
  onProviderImported,
  onClose
}) => {
  const [sharePassword, setSharePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sharePreview, setSharePreview] = useState<any>(null);
  const [shareData, setShareData] = useState<ProviderShareData | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [step, setStep] = useState<'preview' | 'password' | 'import' | 'success'>('preview');

  // 載入分享預覽
  React.useEffect(() => {
    const loadPreview = async () => {
      try {
        setIsLoading(true);
        const preview = await ProviderSharingService.getSharePreview(binId);
        setSharePreview(preview);
        setStep('password');
      } catch (err: any) {
        setError(err.message || '載入分享信息失敗');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [binId]);

  const handleDecrypt = useCallback(async () => {
    if (!sharePassword.trim()) {
      setError('請輸入分享密碼');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await ProviderSharingService.loadEncryptedShare(binId, sharePassword);

      // 驗證數據完整性
      const validation = ProviderSharingService.validateShareData(data);
      if (!validation.isValid) {
        throw new Error(`分享數據無效: ${validation.errors.join(', ')}`);
      }

      setShareData(data);
      setStep('import');
    } catch (err: any) {
      setError(err.message || '解密失敗，請檢查密碼是否正確');
    } finally {
      setIsLoading(false);
    }
  }, [binId, sharePassword]);

  const handleImport = useCallback(async () => {
    if (!shareData) return;

    setIsLoading(true);
    setError('');

    try {
      const providerConfigs = ProviderSharingService.createProviderConfigsFromShare(shareData);

      // 逐個導入 provider
      let successCount = 0;
      for (const config of providerConfigs) {
        try {
          await providerService.addProvider(config);
          successCount++;
        } catch (err) {
          console.error(`導入 Provider ${config.name} 失敗:`, err);
        }
      }

      setImportedCount(successCount);
      setStep('success');
      onProviderImported?.(successCount);
    } catch (err: any) {
      setError(err.message || '導入 Provider 配置失敗');
    } finally {
      setIsLoading(false);
    }
  }, [shareData, onProviderImported]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case 'gemini': return 'Google Gemini';
      case 'openrouter': return 'OpenRouter';
      default: return type;
    }
  };

  if (step === 'preview' && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">載入分享信息中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 標題 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              接收 Provider 配置分享
            </h1>
            <p className="text-gray-600">
              安全地導入他人分享的 AI Provider 配置
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 步驟指示 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${step === 'password' ? 'text-blue-600' : step === 'import' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'password' ? 'bg-blue-600 text-white' : step === 'import' || step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="text-sm font-medium">輸入密碼</span>
              </div>
              <div className={`w-12 h-0.5 ${step === 'import' || step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center gap-2 ${step === 'import' ? 'text-blue-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'import' ? 'bg-blue-600 text-white' : step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="text-sm font-medium">確認導入</span>
              </div>
              <div className={`w-12 h-0.5 ${step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center gap-2 ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="text-sm font-medium">完成</span>
              </div>
            </div>
          </div>

          {/* 分享預覽信息 */}
          {sharePreview && (
            <div className="mb-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-3">分享信息</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700">分享名稱:</span>
                  <span className="ml-2 font-medium">{sharePreview.name}</span>
                </div>
                <div>
                  <span className="text-blue-700">Provider 數量:</span>
                  <span className="ml-2 font-medium">{sharePreview.providerCount}</span>
                </div>
                <div>
                  <span className="text-blue-700">分享時間:</span>
                  <span className="ml-2">{formatDate(sharePreview.createdAt)}</span>
                </div>
                <div>
                  <span className="text-blue-700">安全性:</span>
                  <span className="ml-2 text-green-600 font-medium">
                    {sharePreview.hasEncryption ? '✓ 已加密' : '⚠️ 未加密'}
                  </span>
                </div>
                {sharePreview.description && (
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-blue-700">描述:</span>
                    <p className="ml-2 mt-1">{sharePreview.description}</p>
                  </div>
                )}
                <div className="col-span-1 sm:col-span-2">
                  <span className="text-blue-700">包含類型:</span>
                  <div className="ml-2 mt-1 flex flex-wrap gap-1">
                    {sharePreview.providerTypes.map((type: string) => (
                      <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {getProviderTypeLabel(type)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步驟內容 */}
          {step === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  請輸入分享密碼
                </label>
                <input
                  type="password"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  placeholder="輸入分享者提供的密碼"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                />
                <p className="mt-2 text-sm text-gray-500">
                  密碼用於解密 Provider 配置中的 API Key 等敏感信息
                </p>
              </div>

              <div className="flex gap-3">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    取消
                  </button>
                )}
                <button
                  onClick={handleDecrypt}
                  disabled={isLoading || !sharePassword.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? '解密中...' : '解密並預覽'}
                </button>
              </div>
            </div>
          )}

          {step === 'import' && shareData && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">確認要導入的 Provider 配置</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {shareData.providers.map((provider, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {getProviderTypeLabel(provider.type)}
                        </span>
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-sm text-gray-500">({provider.model})</span>
                      </div>
                      {provider.description && (
                        <p className="text-sm text-gray-600 mt-2">{provider.description}</p>
                      )}
                      <div className="mt-2 text-xs text-green-600">
                        ✓ API Key 已包含並加密保護
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">導入說明</p>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• 這些配置將添加到您現有的 Provider 列表中</li>
                      <li>• 如果已存在同名配置，將創建帶有"分享的"前綴的新配置</li>
                      <li>• 您可以在導入後修改或刪除這些配置</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('password')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  返回
                </button>
                <button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? '導入中...' : '確認導入'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">導入成功！</h3>
                <p className="text-gray-600">
                  已成功導入 {importedCount} 個 Provider 配置
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  您現在可以在 Provider 設定中查看和使用這些新配置。
                  建議您檢查並測試這些配置以確保正常工作。
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href={`${import.meta.env.BASE_URL}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
                >
                  返回首頁
                </a>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    關閉
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderShareReceiver;