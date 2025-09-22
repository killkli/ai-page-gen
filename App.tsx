import React, { useState, useCallback } from 'react';
import { ExtendedLearningContent, LearningLevelSuggestions, LearningLevel, VocabularyLevel } from './types';
import { generateLearningPlan, generateLearningPlanWithLevel, generateLearningPlanWithVocabularyLevel, generateLearningLevelSuggestions, isEnglishRelatedTopic, initializeProviderSystem, hasConfiguredProviders } from './services/geminiServiceAdapter';
import { providerService } from './services/providerService';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import LearningContentDisplay from './components/LearningContentDisplay';
import LearningLevelSelector from './components/LearningLevelSelector';
import VocabularyLevelSelector from './components/VocabularyLevelSelector';
import { LightbulbIcon, AcademicCapIcon, HomeIcon } from './components/icons';
import ProviderApiKeyModal from './components/ProviderApiKeyModal';
import ProviderStatusDisplay from './components/ProviderSettings/ProviderStatusDisplay';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { getLearningContent } from './services/jsonbinService';
import { lessonPlanStorage, createStoredLessonPlan, StoredLessonPlan } from './services/lessonPlanStorage';
import QuizPage from './components/QuizPage';
import StudentWritingPage from './components/StudentWritingPage';
import StudentResultsPage from './components/StudentResultsPage';
import LessonPlanManager from './components/LessonPlanManager';
import InteractiveLearningPage from './components/InteractiveLearning/InteractiveLearningPage';
import TeacherInteractivePrepPage from './components/TeacherInteractivePrep/TeacherInteractivePrepPage';
import StudentInteractivePage from './components/StudentInteractive/StudentInteractivePage';
import ConversationPrepPage from './components/EnglishConversation/ConversationPrepPage';
import ConversationPracticePage from './components/EnglishConversation/ConversationPracticePage';
import ProviderShareModal from './components/ProviderShare/ProviderShareModal';
import ProviderShareReceiver from './components/ProviderShare/ProviderShareReceiver';
import { ProviderSharingService } from './services/providerSharingService';
import ErrorBoundary from './components/ErrorBoundary';
import { VOCABULARY_LEVELS } from './consts'

const LOCALSTORAGE_KEY = 'gemini_api_key';

// Provider 系統初始化狀態
let providerSystemInitialized = false;

const SharePage: React.FC = () => {
  const [params] = useSearchParams();
  const binId = params.get('binId');
  const providerShareId = params.get('provider_share');
  const [content, setContent] = React.useState<ExtendedLearningContent | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState<boolean>(false);

  React.useEffect(() => {
    // 檢查是否為 Provider 分享
    if (providerShareId) {
      // Provider 分享不需要在這裡處理，由 ProviderShareReceiver 處理
      return;
    }

    if (!binId) {
      setError('缺少 binId');
      return;
    }
    setLoading(true);
    getLearningContent(binId)
      .then(data => {
        setContent(data);
        // 自動儲存分享的教案到本地 IndexedDB
        saveSharedContentToLocal(data, binId);
      })
      .catch(e => setError(e.message || '讀取失敗'))
      .finally(() => setLoading(false));
  }, [binId, providerShareId]);

  // 儲存分享的教案到本地存儲
  const saveSharedContentToLocal = async (content: ExtendedLearningContent, shareBinId: string) => {
    try {
      await lessonPlanStorage.init();

      // 檢查是否已經儲存過這個分享教案（避免重複儲存）
      const existingPlan = await lessonPlanStorage.getLessonPlan(`shared_${shareBinId}`);
      if (existingPlan) {
        // 如果已存在，只更新最後訪問時間
        await lessonPlanStorage.updateLastAccessed(`shared_${shareBinId}`);
        return;
      }

      // 建立儲存格式，使用特殊的 ID 格式來標記這是分享的教案
      const storedPlan: StoredLessonPlan = {
        id: `shared_${shareBinId}`, // 使用 shared_ 前綴來標記分享教案
        topic: content.topic || '分享的教案',
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        content: {
          learningObjectives: content.learningObjectives,
          contentBreakdown: content.contentBreakdown,
          confusingPoints: content.confusingPoints,
          classroomActivities: content.classroomActivities,
          quiz: content.onlineInteractiveQuiz,
          writingPractice: content.writingPractice
        },
        metadata: {
          totalSections: [
            content.learningObjectives,
            content.contentBreakdown,
            content.confusingPoints,
            content.classroomActivities,
            content.onlineInteractiveQuiz,
            content.writingPractice
          ].filter(Boolean).length,
          hasQuiz: !!content.onlineInteractiveQuiz,
          hasWriting: !!content.writingPractice,
          isShared: true, // 標記這是分享的教案
          sharedBinId: shareBinId // 保存原始的分享 ID
        }
      };

      await lessonPlanStorage.saveLessonPlan(storedPlan);
      console.log(`分享教案已儲存到本地: ${content.topic || '分享的教案'} (${shareBinId})`);
    } catch (error) {
      console.error('儲存分享教案到本地存儲失敗:', error);
      // 不影響用戶體驗，只記錄錯誤
    }
  };

  // 載入 API Key
  React.useEffect(() => {
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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center my-10"><LoadingSpinner /></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">{error}</div>
      </div>
    </div>
  );

  // 如果是 Provider 分享，顯示 ProviderShareReceiver
  if (providerShareId) {
    return (
      <ErrorBoundary>
        <ProviderShareReceiver
          binId={providerShareId}
          onProviderImported={(count) => {
            console.log(`已導入 ${count} 個 Provider 配置`);
          }}
        />
      </ErrorBoundary>
    );
  }

  if (!content) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <ProviderApiKeyModal isOpen={showApiKeyModal} onSave={handleSaveApiKey} />
      <div className="max-w-4xl mx-auto">
        {/* 導航區域 */}
        <div className="mb-6">
          <a
            href={`${import.meta.env.BASE_URL}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <HomeIcon className="w-4 h-4" />
            返回首頁
          </a>
        </div>
        {/* API Key 提示區域 */}
        {!apiKey && !showApiKeyModal && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 0c.652-.286 1.323-.443 2.25-.443 1.38 0 2.652.24 3.75.697v-6a6 6 0 0 0-6 2.243M12 15.75V21m0-5.25c1.38 0 2.652-.24 3.75-.697v6a6 6 0 0 1-3.75-2.243M12 15.75L9 12" />
                </svg>
                <div>
                  <p className="text-yellow-800 font-medium text-sm">需要設定 API Key 以使用分享功能</p>
                  <p className="text-yellow-700 text-xs mt-1">設定後可分享測驗和寫作練習給學生，包含 AI 功能</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                設定 API Key
              </button>
            </div>
          </div>
        )}

        <ErrorBoundary>
          <LearningContentDisplay
            content={content}
            topic={content.topic || ''}
            selectedLevel={content.selectedLevel || null}
            selectedVocabularyLevel={content.selectedVocabularyLevel}
            apiKey={apiKey || undefined}
            onContentUpdate={setContent}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<ExtendedLearningContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // 新的分享功能狀態
  const [showProviderShareModal, setShowProviderShareModal] = useState<boolean>(false);
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);

  // 新增：程度建議相關狀態
  const [learningLevels, setLearningLevels] = useState<LearningLevelSuggestions | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | null>(null);
  const [showingLevelSelection, setShowingLevelSelection] = useState<boolean>(false);

  // 新增：單字程度相關狀態 (僅適用於英語主題)
  const [selectedVocabularyLevel, setSelectedVocabularyLevel] = useState<VocabularyLevel>(VOCABULARY_LEVELS[0]);
  const [showingVocabularySelection, setShowingVocabularySelection] = useState<boolean>(false);
  const [isEnglishTopic, setIsEnglishTopic] = useState<boolean>(false);

  // 新增：Provider 分享狀態
  const [providerShareId, setProviderShareId] = useState<string | null>(null);

  React.useEffect(() => {
    const initializeApp = async () => {
      // 1. 先檢查 URL 參數
      const shareInfo = ProviderSharingService.parseShareUrl();

      // 處理舊版 API Key 分享
      if (shareInfo.type === 'legacy' && shareInfo.value) {
        localStorage.setItem(LOCALSTORAGE_KEY, shareInfo.value);
        setApiKey(shareInfo.value);
        setShowApiKeyModal(false);
        // 清除網址參數但不刷新頁面
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        return;
      }

      // 2. 初始化 Provider 系統（對所有情況都需要，包括 provider 分享）
      if (!providerSystemInitialized) {
        try {
          await initializeProviderSystem();
          providerSystemInitialized = true;
        } catch (error) {
          console.error('Provider 系統初始化失敗:', error);
        }
      }

      // 3. 如果是 provider 分享，設置狀態並初始化相關功能
      if (shareInfo.type === 'provider' && shareInfo.value) {
        setProviderShareId(shareInfo.value);
        // 載入可用的 Providers（provider 分享時也需要）
        try {
          const providers = await providerService.getProviders();
          setAvailableProviders(providers);
        } catch (error) {
          console.error('載入 Providers 失敗:', error);
        }
        return;
      }

      // 4. 一般應用初始化：檢查 localStorage
      const storedKey = localStorage.getItem(LOCALSTORAGE_KEY);
      if (storedKey) {
        setApiKey(storedKey);
      } else {
        // 檢查是否有配置的 Provider (新系統)
        const hasProviders = await hasConfiguredProviders().catch(() => false);

        if (!hasProviders) {
          setShowApiKeyModal(true);
        }
      }

      // 載入可用的 Providers
      try {
        const providers = await providerService.getProviders();
        setAvailableProviders(providers);
      } catch (error) {
        console.error('載入 Providers 失敗:', error);
      }
    };

    initializeApp();
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(LOCALSTORAGE_KEY, key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  // 保存教案到本地存儲
  const saveToLocalStorage = async (content: ExtendedLearningContent, currentTopic: string) => {
    try {
      await lessonPlanStorage.init();
      const storedPlan = createStoredLessonPlan(currentTopic, content);
      await lessonPlanStorage.saveLessonPlan(storedPlan);
    } catch (error) {
      console.error('保存教案到本地存儲失敗:', error);
      // 不影響用戶體驗，只記錄錯誤
    }
  };

  // 第一階段：產生程度建議
  const handleGenerateLevelSuggestions = useCallback(async () => {
    if (!topic.trim()) {
      setError('請輸入學習主題。');
      return;
    }

    // 檢查是否有配置的 Provider 或舊版 API Key
    const hasProviders = await providerService.hasConfiguredProviders();
    if (!hasProviders && !apiKey) {
      setError('請先配置 AI Provider 或設定 API 金鑰。');
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLearningLevels(null);
    setGeneratedContent(null);
    setSelectedLevel(null);
    setSelectedVocabularyLevel(VOCABULARY_LEVELS[0]);
    setShowingVocabularySelection(false);

    // 檢測是否為英語相關主題
    const englishTopic = isEnglishRelatedTopic(topic);
    setIsEnglishTopic(englishTopic);

    try {
      // 使用 provider system 或 fallback 到舊版 API key
      const effectiveApiKey = hasProviders ? 'provider-system-placeholder-key' : '';
      const levels = await generateLearningLevelSuggestions(topic, effectiveApiKey);
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
    // 檢查是否有配置的 Provider 或舊版 API Key
    const hasProviders = await providerService.hasConfiguredProviders();
    if (!hasProviders && !apiKey) {
      setError('請先配置 AI Provider 或設定 API 金鑰。');
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
      let content: ExtendedLearningContent;

      // 使用 provider system 或 fallback 到舊版 API key
      const effectiveApiKey = hasProviders ? 'provider-system-placeholder-key' : apiKey;
      if (effectiveApiKey === null) throw new Error('無API KEY 可用！')

      // 根據是否為英語主題選擇不同的生成方式
      if (isEnglishTopic && selectedVocabularyLevel) {
        content = await generateLearningPlanWithVocabularyLevel(topic, level, selectedVocabularyLevel, effectiveApiKey);
      } else {
        content = await generateLearningPlanWithLevel(topic, level, effectiveApiKey);
      }

      setGeneratedContent(content);
      setShowingLevelSelection(false);
      setShowingVocabularySelection(false);

      // 自動保存到本地存儲
      await saveToLocalStorage(content, topic);
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

    // 檢查是否有配置的 Provider 或舊版 API Key
    const hasProviders = await providerService.hasConfiguredProviders();
    if (!hasProviders && !apiKey) {
      setError('請先配置 AI Provider 或設定 API 金鑰。');
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
      // 使用 provider system 或 fallback 到舊版 API key
      const effectiveApiKey = hasProviders ? 'provider-system-placeholder-key' : '';
      const content = await generateLearningPlan(topic, effectiveApiKey);
      setGeneratedContent(content);

      // 自動保存到本地存儲
      await saveToLocalStorage(content, topic);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '產生內容時發生未知錯誤。');
      setGeneratedContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKey]);

  // 舊版 API Key 分享（向後兼容）
  const handleShareLink = async () => {
    if (!apiKey) {
      setCopySuccess('請先設定 API 金鑰');
      return;
    }
    const url = ProviderSharingService.createLegacyShare(apiKey);
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess('已複製分享連結！');
    } catch {
      setCopySuccess('複製失敗，請手動複製');
    }
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // 新版 Provider 配置分享
  const handleProviderShare = useCallback(() => {
    setShowProviderShareModal(true);
  }, []);

  const handleProviderShareCreated = useCallback((_shareUrl: string) => {
    setCopySuccess('Provider 配置分享已創建！');
    setShowProviderShareModal(false);
    setTimeout(() => setCopySuccess(null), 3000);
  }, []);

  // Provider 分享導入完成處理
  const handleProviderImported = useCallback((count: number) => {
    console.log(`已導入 ${count} 個 Provider 配置`);
    // 導入完成後跳轉回主頁
    window.location.href = `${window.location.origin}${import.meta.env.BASE_URL}`;
  }, []);

  // 如果是 Provider 分享模式，顯示 ProviderShareReceiver
  if (providerShareId) {
    return (
      <ErrorBoundary>
        <ProviderShareReceiver
          binId={providerShareId}
          onProviderImported={handleProviderImported}
          onClose={() => {
            // 關閉時跳轉回主頁
            window.location.href = `${window.location.origin}${import.meta.env.BASE_URL}`;
          }}
        />
      </ErrorBoundary>
    );
  }

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <Routes>
          <Route path="share" element={<ErrorBoundary><SharePage /></ErrorBoundary>} />
          <Route path="provider-share" element={<ErrorBoundary><SharePage /></ErrorBoundary>} />
          <Route path="quiz" element={<ErrorBoundary><QuizPage /></ErrorBoundary>} />
          <Route path="writing" element={<ErrorBoundary><StudentWritingPage /></ErrorBoundary>} />
          <Route path="student-results" element={<ErrorBoundary><StudentResultsPage /></ErrorBoundary>} />
          <Route path="lesson-plans" element={<ErrorBoundary><LessonPlanManager /></ErrorBoundary>} />
          <Route path="interactive-learning" element={<ErrorBoundary><InteractiveLearningPage /></ErrorBoundary>} />
          <Route path="teacher-interactive-prep" element={<ErrorBoundary><TeacherInteractivePrepPage /></ErrorBoundary>} />
          <Route path="student-interactive" element={<ErrorBoundary><StudentInteractivePage /></ErrorBoundary>} />
          <Route path="conversation-prep" element={<ErrorBoundary><ConversationPrepPage /></ErrorBoundary>} />
          <Route path="conversation-practice/:binId" element={<ErrorBoundary><ConversationPracticePage /></ErrorBoundary>} />
          <Route path="/" element={
            <ErrorBoundary>
              <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
                <ProviderApiKeyModal isOpen={showApiKeyModal} onSave={handleSaveApiKey} />
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

                {/* Provider Status */}
                <div className="max-w-6xl mx-auto mb-6">
                  <div className="flex justify-center">
                    <ProviderStatusDisplay compact={true} />
                  </div>
                </div>

                {/* Navigation Bar */}
                <div className="max-w-6xl mx-auto mb-8">
                  <div className="flex justify-center gap-3 flex-wrap">
                    <a
                      href={`${import.meta.env.BASE_URL}lesson-plans`}
                      className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                      <AcademicCapIcon className="w-5 h-5" />
                      我的教案庫
                    </a>
                    <a
                      href={`${import.meta.env.BASE_URL}conversation-prep`}
                      className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                      </svg>
                      英文對話練習
                    </a>
                    <button
                      onClick={handleProviderShare}
                      className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-11.314a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                      </svg>
                      分享 Provider 配置
                    </button>
                    <button
                      onClick={handleShareLink}
                      className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                      分享應用程式連結
                    </button>
                  </div>
                  {copySuccess && (
                    <div className="mt-3 text-center">
                      <p className={`text-sm ${copySuccess.includes('請先') ? 'text-red-600' : 'text-green-600'}`}>
                        {copySuccess}
                      </p>
                    </div>
                  )}
                </div>

                {/* Provider 分享Modal */}
                <ProviderShareModal
                  isOpen={showProviderShareModal}
                  onClose={() => setShowProviderShareModal(false)}
                  providers={availableProviders}
                  onShareCreated={handleProviderShareCreated}
                />

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
                    <ErrorBoundary>
                      <LearningContentDisplay
                        content={generatedContent}
                        topic={topic}
                        selectedLevel={selectedLevel}
                        selectedVocabularyLevel={selectedVocabularyLevel}
                        apiKey={apiKey || undefined}
                        onContentUpdate={setGeneratedContent}
                      />
                    </ErrorBoundary>
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
            </ErrorBoundary>
          } />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
