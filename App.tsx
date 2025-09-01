import React, { useState, useCallback } from 'react';
import { ExtendedLearningContent, LearningLevelSuggestions, LearningLevel, VocabularyLevel } from './types';
import { generateLearningPlan, generateLearningLevelSuggestions, generateLearningPlanWithLevel, generateLearningPlanWithVocabularyLevel, isEnglishRelatedTopic } from './services/geminiService';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import LearningContentDisplay from './components/LearningContentDisplay';
import LearningLevelSelector from './components/LearningLevelSelector';
import VocabularyLevelSelector from './components/VocabularyLevelSelector';
import { LightbulbIcon } from './components/icons';
import ApiKeyModal from './components/ApiKeyModal';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { getLearningContent } from './services/jsonbinService';
import QuizPage from './components/QuizPage';
import StudentWritingPage from './components/StudentWritingPage';

const LOCALSTORAGE_KEY = 'gemini_api_key';

const SharePage: React.FC = () => {
  const [params] = useSearchParams();
  const binId = params.get('binId');
  const [content, setContent] = React.useState<ExtendedLearningContent | null>(null);
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
  const [generatedContent, setGeneratedContent] = useState<ExtendedLearningContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // 新增：程度建議相關狀態
  const [learningLevels, setLearningLevels] = useState<LearningLevelSuggestions | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | null>(null);
  const [showingLevelSelection, setShowingLevelSelection] = useState<boolean>(false);
  
  // 新增：單字程度相關狀態 (僅適用於英語主題)
  const [selectedVocabularyLevel, setSelectedVocabularyLevel] = useState<VocabularyLevel | null>(null);
  const [showingVocabularySelection, setShowingVocabularySelection] = useState<boolean>(false);
  const [isEnglishTopic, setIsEnglishTopic] = useState<boolean>(false);

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

  // 第一階段：產生程度建議
  const handleGenerateLevelSuggestions = useCallback(async () => {
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
    setLearningLevels(null);
    setGeneratedContent(null);
    setSelectedLevel(null);
    setSelectedVocabularyLevel(null);
    setShowingVocabularySelection(false);

    // 檢測是否為英語相關主題
    const englishTopic = isEnglishRelatedTopic(topic);
    setIsEnglishTopic(englishTopic);

    try {
      const levels = await generateLearningLevelSuggestions(topic, apiKey);
      setLearningLevels(levels);
      setShowingLevelSelection(true);
      
      // 如果是英語主題，也要顯示單字程度選擇器
      if (englishTopic) {
        setShowingVocabularySelection(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '產生學習程度建議時發生未知錯誤。');
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKey]);

  // 第二階段：根據選定程度產生完整內容
  const handleGenerateContentWithLevel = useCallback(async (level: LearningLevel) => {
    if (!apiKey) {
      setError('尚未設定 Gemini API 金鑰。');
      setShowApiKeyModal(true);
      return;
    }

    // 如果是英語主題但未選擇單字程度，顯示錯誤
    if (isEnglishTopic && !selectedVocabularyLevel) {
      setError('請先選擇英語單字程度。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedLevel(level);
    setGeneratedContent(null);

    try {
      let content: GeneratedLearningContent;
      
      // 根據是否為英語主題選擇不同的生成方式
      if (isEnglishTopic && selectedVocabularyLevel) {
        content = await generateLearningPlanWithVocabularyLevel(topic, level, selectedVocabularyLevel, apiKey);
      } else {
        content = await generateLearningPlanWithLevel(topic, level, apiKey);
      }
      
      setGeneratedContent(content);
      setShowingLevelSelection(false);
      setShowingVocabularySelection(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '產生學習內容時發生未知錯誤。');
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKey, isEnglishTopic, selectedVocabularyLevel]);

  // 保留原來的函數作為快速生成選項
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
    setShowingLevelSelection(false);
    setShowingVocabularySelection(false);
    setIsEnglishTopic(false);

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
    const url = `${window.location.origin}${import.meta.env.BASE_URL}?apikey=${encodeURIComponent(apiKey)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess('已複製分享連結！');
    } catch {
      setCopySuccess('複製失敗，請手動複製');
    }
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="share" element={<SharePage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="writing" element={<StudentWritingPage />} />
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
                onGenerateWithLevels={handleGenerateLevelSuggestions}
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

              {/* 顯示學習程度選擇 */}
              {showingLevelSelection && learningLevels && !isLoading && !error && (
                <LearningLevelSelector
                  learningLevels={learningLevels}
                  onLevelSelect={setSelectedLevel}
                  onGenerateWithLevel={handleGenerateContentWithLevel}
                  selectedLevelId={selectedLevel?.id}
                  isLoading={isLoading}
                />
              )}

              {/* 顯示英語單字程度選擇 (僅限英語主題) */}
              {showingVocabularySelection && isEnglishTopic && !isLoading && !error && (
                <VocabularyLevelSelector
                  onVocabularyLevelSelect={setSelectedVocabularyLevel}
                  selectedLevel={selectedVocabularyLevel}
                  isVisible={true}
                />
              )}

              {/* 顯示生成的完整內容 */}
              {generatedContent && !isLoading && !error && !showingLevelSelection && !showingVocabularySelection && (
                <LearningContentDisplay 
                  content={generatedContent} 
                  topic={topic}
                  selectedLevel={selectedLevel}
                  selectedVocabularyLevel={selectedVocabularyLevel}
                  apiKey={apiKey || undefined}
                  onContentUpdate={setGeneratedContent}
                />
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
