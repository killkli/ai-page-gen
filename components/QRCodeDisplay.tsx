import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  url: string;
  title?: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
  onError?: (error: string) => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  title = 'QR Code',
  size = 256,
  className = '',
  showDownload = true,
  onError
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // QR Code 生成選項
        const options = {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M' as const
        };

        // 生成 QR Code 為 data URL
        const dataUrl = await QRCode.toDataURL(url, options);
        setQrDataUrl(dataUrl);
        
        // 同時生成到 canvas（用於下載功能）
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, url, options);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'QR Code 生成失敗';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      generateQRCode();
    }
  }, [url, size, onError]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    try {
      // 創建下載連結
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('下載 QR Code 失敗:', err);
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    
    try {
      // 將 canvas 轉換為 blob
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.clipboard) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('QR Code 已複製到剪貼簿！');
          } catch (err) {
            console.error('複製圖片失敗:', err);
            alert('複製圖片失敗，請使用下載功能。');
          }
        }
      });
    } catch (err) {
      console.error('複製 QR Code 失敗:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
        <p className="text-sm text-gray-600">生成 QR Code 中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center p-4 text-red-600 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
          {title}
        </h3>
      )}
      
      {/* QR Code 圖片顯示 */}
      <div className="bg-white p-4 rounded-lg shadow-md border">
        <img 
          src={qrDataUrl} 
          alt={`QR Code for ${title}`}
          className="block"
          style={{ width: size, height: size }}
        />
      </div>
      
      {/* 隱藏的 canvas 用於下載 */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
        width={size}
        height={size}
      />
      
      {/* URL 顯示 */}
      <div className="mt-3 max-w-xs w-full">
        <p className="text-xs text-gray-500 text-center break-all">
          {url}
        </p>
      </div>
      
      {/* 操作按鈕 */}
      {showDownload && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            下載
          </button>
          
          <button
            onClick={handleCopyImage}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
            </svg>
            複製
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;