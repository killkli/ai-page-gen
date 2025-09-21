import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {  WritingPracticeContent } from '../types';
import { HomeIcon } from './icons';
import { getWritingPracticeContent } from '../services/jsonbinService';
import { extractApiKeyFromParams } from '../utils/cryptoUtils';
import WritingPracticeView from './WritingPracticeView';
import LoadingSpinner from './LoadingSpinner';

const StudentWritingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState<WritingPracticeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeySource, setApiKeySource] = useState<'url' | 'localStorage' | 'manual'>('manual');

  const binId = searchParams.get('binId');

  useEffect(() => {
    const loadContent = async () => {
      if (!binId) {
        setError('缺少內容 ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 使用新的寫作練習專用分享服務
        const data = await getWritingPracticeContent(binId);
        setContent(data.writingPractice);
        
        // 檢查是否有來自 URL 的加密 API Key
        try {
          const urlApiKey = await extractApiKeyFromParams(searchParams);
          if (urlApiKey) {
            setApiKey(urlApiKey);
            setApiKeySource('url');
            localStorage.setItem('gemini_api_key', urlApiKey);
            console.log('使用 URL 中的 API Key 進行 AI 批改');
          }
        } catch (error) {
          console.warn('解析 URL API Key 失敗:', error);
        }
      } catch (err) {
        console.error('載入分享內容失敗:', err);
        setError('載入分享內容失敗，請檢查連結是否正確');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [binId, searchParams]);

  useEffect(() => {
    // 只有在沒有從 URL 獲取到 API Key 時才從 localStorage 載入
    if (!apiKey) {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setApiKeySource('localStorage');
      }
    }
  }, [apiKey]); // 只在組件掛載時執行一次

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      localStorage.setItem('gemini_api_key', trimmedKey);
      setApiKey(trimmedKey);
      setApiKeySource('manual');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">載入寫作練習內容中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📝 寫作練習平台</h1>
              <p className="text-gray-600">完成練習後可獲得 AI 即時批改回饋</p>
            </div>
            <a 
              href={`${import.meta.env.BASE_URL}`}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              返回首頁
            </a>
          </div>

          {/* API Key 設定區域 */}
          {!apiKey && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">設定 API Key 以使用 AI 批改功能</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    輸入您的 Google Gemini API Key 來啟用 AI 自動批改功能。
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      點此取得 API Key
                    </a>
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleApiKeySubmit} className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="請輸入您的 Gemini API Key"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!apiKey.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  設定
                </button>
              </form>
            </div>
          )}

          {apiKey && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <span className="text-sm font-medium">API Key 已設定，可以使用 AI 批改功能</span>
                    {apiKeySource === 'url' && (
                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span>🔗</span>
                        <span>來自分享連結 - 老師已為您配置好 AI 功能</span>
                      </div>
                    )}
                    {apiKeySource === 'localStorage' && (
                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span>💾</span>
                        <span>來自本地存儲</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('gemini_api_key');
                    setApiKey('');
                    setApiKeySource('manual');
                  }}
                  className="text-sm text-green-600 hover:text-green-800 underline"
                >
                  重新設定
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 寫作練習內容 */}
        {content && (
          <WritingPracticeView
            content={content}
            apiKey={apiKey}
            isStudentMode={true}
          />
        )}

        {/* 頁腳說明 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🤖 本平台使用 Google Gemini AI 提供智能批改回饋</p>
          <p className="mt-1">💡 建議：完成練習後點擊「獲得 AI 批改」按鈕，即可獲得詳細的學習建議</p>
        </div>
      </div>
    </div>
  );
};

export default StudentWritingPage;
