
import React, { useState, useCallback } from 'react';
import { GeneratedLearningContent } from './types';
import { generateLearningPlan } from './services/geminiService';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import LearningContentDisplay from './components/LearningContentDisplay';
import { LightbulbIcon } from './components/icons';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedLearningContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissingError, setApiKeyMissingError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissingError("Gemini API 金鑰 (process.env.API_KEY) 未設定。應用程式無法產生內容。請確保您的環境變數中已設定 API 金鑰。");
    }
  }, []);

  const handleGenerateContent = useCallback(async () => {
    if (!topic.trim()) {
      setError('請輸入學習主題。');
      return;
    }
    if (apiKeyMissingError) {
      setError(apiKeyMissingError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const content = await generateLearningPlan(topic);
      setGeneratedContent(content);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '產生內容時發生未知錯誤。');
      setGeneratedContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKeyMissingError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-700 tracking-tight">
          AI 學習頁面 <span className="text-indigo-600">產生器</span>
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          輸入一個主題，讓 AI 為您打造包含互動測驗的結構化學習計劃！
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <InputBar
          topic={topic}
          setTopic={setTopic}
          onGenerate={handleGenerateContent}
          isLoading={isLoading}
        />

        {apiKeyMissingError && !isLoading && (
          <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2 flex items-center"><LightbulbIcon className="w-6 h-6 mr-2 text-red-600" />設定錯誤</h3>
            <p>{apiKeyMissingError}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-10">
            <LoadingSpinner />
          </div>
        )}

        {error && !isLoading && (
          <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
             <h3 className="font-bold text-lg mb-2 flex items-center"><LightbulbIcon className="w-6 h-6 mr-2 text-red-600" />產生內容時發生錯誤</h3>
            <p>{error}</p>
            <p className="mt-2 text-sm">請嘗試修改您的主題或重試。如果問題持續存在，AI 模型可能暫時不可用，或者 API 金鑰可能存在問題。</p>
          </div>
        )}

        {generatedContent && !isLoading && !error && (
          <LearningContentDisplay content={generatedContent} topic={topic} />
        )}
      </main>

      <footer className="text-center mt-12 py-6 border-t border-slate-300">
        <p className="text-sm text-slate-500">
          由 Gemini API 驅動。AI 設計，為學習而生。
        </p>
      </footer>
    </div>
  );
};

export default App;
