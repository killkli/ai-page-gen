import React, { useState, useCallback } from 'react';
import { GeneratedLearningContent } from './types';
import { generateLearningPlan } from './services/geminiService';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import LearningContentDisplay from './components/LearningContentDisplay';
import { LightbulbIcon } from './components/icons';
import ApiKeyModal from './components/ApiKeyModal';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { getLearningContent } from './services/jsonbinService';

const LOCALSTORAGE_KEY = 'gemini_api_key';

const SharePage: React.FC = () => {
  const [params] = useSearchParams();
  const binId = params.get('binId');
  const [content, setContent] = React.useState<GeneratedLearningContent | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!binId) {
      setError('缺少 binId');
      return;
    }
    setLoading(true);
    getLearningContent(binId)
      .then(data => setContent(data))
      .catch(e => setError(e.message || '讀取失敗'))
      .finally(() => setLoading(false));
  }, [binId]);

  if (loading) return <div className="flex justify-center my-10"><LoadingSpinner /></div>;
  if (error) return <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">{error}</div>;
  if (!content) return null;
  return <LearningContentDisplay content={content} topic={('topic' in content && typeof content.topic === 'string') ? content.topic : ''} />;
};

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedLearningContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  React.useEffect(() => {
    // 1. 先檢查 URL 參數
    const params = new URLSearchParams(window.location.search);
    const urlApiKey = params.get('apikey');
    if (urlApiKey) {
      localStorage.setItem(LOCALSTORAGE_KEY, urlApiKey);
      setApiKey(urlApiKey);
      setShowApiKeyModal(false);
      // 清除網址參數但不刷新頁面
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return;
    }
    // 2. 再檢查 localStorage
    const storedKey = localStorage.getItem(LOCALSTORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(LOCALSTORAGE_KEY, key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const handleGenerateContent = useCallback(async () => {
    if (!topic.trim()) {
      setError('請輸入學習主題。');
      return;
    }
    if (!apiKey) {
      setError('尚未設定 Gemini API 金鑰。');
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const content = await generateLearningPlan(topic, apiKey);
      setGeneratedContent(content);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '產生內容時發生未知錯誤。');
      setGeneratedContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKey]);

  const handleShareLink = async () => {
    if (!apiKey) {
      setCopySuccess('請先設定 API 金鑰');
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}?apikey=${encodeURIComponent(apiKey)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess('已複製分享連結！');
    } catch {
      setCopySuccess('複製失敗，請手動複製');
    }
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <Router basename={(typeof import.meta.env !== 'undefined' && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/'}>
      <Routes>
        <Route path="share" element={<SharePage />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <ApiKeyModal isOpen={showApiKeyModal} onSave={handleSaveApiKey} />
            <header className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-700 tracking-tight">
                AI 學習頁面 <span className="text-indigo-600">產生器</span>
              </h1>
              <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
                輸入一個主題，讓 AI 為您打造包含互動測驗的結構化學習計劃！
              </p>
              <div className="mt-6 max-w-2xl mx-auto bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 text-left shadow-sm">
                <div className="flex items-start mb-2">
                  <svg className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  <span className="font-semibold text-yellow-800 text-base">使用注意事項</span>
                </div>
                <ul className="list-disc pl-8 text-yellow-900 text-sm space-y-1">
                  <li>內容審查：請在分享AI生成內容給學生前仔細檢查，確保內容適合且無誤</li>
                  <li>隱私保護：請勿輸入學生個人識別資訊</li>
                </ul>
              </div>
            </header>

            <main className="max-w-4xl mx-auto">
              <InputBar
                topic={topic}
                setTopic={setTopic}
                onGenerate={handleGenerateContent}
                isLoading={isLoading}
              />

              {error && !isLoading && (
                <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                   <h3 className="font-bold text-lg mb-2 flex items-center"><LightbulbIcon className="w-6 h-6 mr-2 text-red-600" />產生內容時發生錯誤</h3>
                  <p>{error}</p>
                  <p className="mt-2 text-sm">請嘗試修改您的主題或重試。如果問題持續存在，AI 模型可能暫時不可用，或者 API 金鑰可能存在問題。</p>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center my-10">
                  <LoadingSpinner />
                </div>
              )}

              {generatedContent && !isLoading && !error && (
                <LearningContentDisplay content={generatedContent} topic={('topic' in generatedContent && typeof generatedContent.topic === 'string') ? generatedContent.topic : ''} />
              )}
            </main>

            <footer className="text-center mt-12 py-6 border-t border-slate-300">
              <p className="text-sm text-slate-500">
                由 Gemini API 驅動。AI 設計，為學習而生。
              </p>
              <button
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition"
                onClick={handleShareLink}
                disabled={!apiKey}
              >
                產生分享連結並複製
              </button>
              {copySuccess && (
                <div className="mt-2 text-green-600 text-sm">{copySuccess}</div>
              )}
            </footer>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
