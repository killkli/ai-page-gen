import React from 'react';
import { ExtendedLearningContent } from './src/core/types';

import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import LearningContentDisplay from './components/LearningContentDisplay';
import LearningLevelSelector from './components/LearningLevelSelector';
import VocabularyLevelSelector from './components/VocabularyLevelSelector';
import { LightbulbIcon, AcademicCapIcon, HomeIcon } from './components/icons';
import ProviderApiKeyModal from './components/ProviderApiKeyModal';
import ProviderStatusDisplay from './components/ProviderSettings/ProviderStatusDisplay';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useSearchParams,
  Link,
} from 'react-router-dom';
import { getLearningContent } from './services/jsonbinService';
import {
  lessonPlanStorage,
  StoredLessonPlan,
} from './services/lessonPlanStorage';
import ProviderShareModal from './components/ProviderShare/ProviderShareModal';
import ProviderShareReceiver from './components/ProviderShare/ProviderShareReceiver';

import ErrorBoundary from './components/ErrorBoundary';
import { useAppLogic } from './hooks/useAppLogic';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeSelector from './components/ThemeSelector';

const QuizPage = React.lazy(() => import('./components/QuizPage'));
const StudentWritingPage = React.lazy(
  () => import('./components/StudentWritingPage')
);
const StudentResultsPage = React.lazy(
  () => import('./components/StudentResultsPage')
);
const LessonPlanManager = React.lazy(
  () => import('./components/LessonPlanManager')
);
const InteractiveLearningPage = React.lazy(
  () => import('./components/InteractiveLearning/InteractiveLearningPage')
);
const TeacherInteractivePrepPage = React.lazy(
  () => import('./components/TeacherInteractivePrep/TeacherInteractivePrepPage')
);
const StudentInteractivePage = React.lazy(
  () => import('./components/StudentInteractive/StudentInteractivePage')
);
const ConversationPrepPage = React.lazy(
  () => import('./components/EnglishConversation/ConversationPrepPage')
);
const ConversationPracticePage = React.lazy(
  () => import('./components/EnglishConversation/ConversationPracticePage')
);
const MathGenerator = React.lazy(
  () => import('./src/components/MaterialGenerator/MathGenerator')
);
const EnglishGenerator = React.lazy(
  () => import('./src/components/MaterialGenerator/EnglishGenerator')
);

const LOCALSTORAGE_KEY = 'gemini_api_key';

const SharePage: React.FC = () => {
  const [params] = useSearchParams();
  const binId = params.get('binId');
  const providerShareId = params.get('provider_share');
  const [content, setContent] = React.useState<ExtendedLearningContent | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState<boolean>(false);
  const { currentTheme } = useTheme();

  React.useEffect(() => {
    if (providerShareId) {
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
        saveSharedContentToLocal(data, binId);
      })
      .catch(e => setError(e.message || '讀取失敗'))
      .finally(() => setLoading(false));
  }, [binId, providerShareId]);

  const saveSharedContentToLocal = async (
    content: ExtendedLearningContent,
    shareBinId: string
  ) => {
    try {
      await lessonPlanStorage.init();

      const existingPlan = await lessonPlanStorage.getLessonPlan(
        `shared_${shareBinId} `
      );
      if (existingPlan) {
        await lessonPlanStorage.updateLastAccessed(`shared_${shareBinId} `);
        return;
      }

      const storedPlan: StoredLessonPlan = {
        id: `shared_${shareBinId} `,
        topic: content.topic || '分享的教案',
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        content: {
          learningObjectives: content.learningObjectives,
          contentBreakdown: content.contentBreakdown,
          confusingPoints: content.confusingPoints,
          classroomActivities: content.classroomActivities,
          quiz: content.onlineInteractiveQuiz,
          writingPractice: content.writingPractice,
        },
        metadata: {
          totalSections: [
            content.learningObjectives,
            content.contentBreakdown,
            content.confusingPoints,
            content.classroomActivities,
            content.onlineInteractiveQuiz,
            content.writingPractice,
          ].filter(Boolean).length,
          hasQuiz: !!content.onlineInteractiveQuiz,
          hasWriting: !!content.writingPractice,
          isShared: true,
          sharedBinId: shareBinId,
        },
      };

      await lessonPlanStorage.saveLessonPlan(storedPlan);
      console.log(
        `分享教案已儲存到本地: ${content.topic || '分享的教案'} (${shareBinId})`
      );
    } catch (error) {
      console.error('儲存分享教案到本地存儲失敗:', error);
    }
  };

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

  if (loading)
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} py-8 px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex justify-center my-10">
          <LoadingSpinner />
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} py-8 px-4 sm:px-6 lg:px-8`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
            {error}
          </div>
        </div>
      </div>
    );

  if (providerShareId) {
    return (
      <ErrorBoundary>
        <ProviderShareReceiver
          binId={providerShareId}
          onProviderImported={count => {
            console.log(`已導入 ${count} 個 Provider 配置`);
          }}
        />
      </ErrorBoundary>
    );
  }

  if (!content) return null;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} py-8 px-4 sm:px-6 lg:px-8`}
    >
      <ProviderApiKeyModal isOpen={showApiKeyModal} onSave={handleSaveApiKey} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a
            href={`${import.meta.env.BASE_URL} `}
            className="inline-flex items-center gap-2 px-4 py-2 text-[var(--color-primary)] bg-surface border border-border rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <HomeIcon className="w-4 h-4" />
            返回首頁
          </a>
        </div>
        {!apiKey && !showApiKeyModal && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0 0c.652-.286 1.323-.443 2.25-.443 1.38 0 2.652.24 3.75.697v-6a6 6 0 0 0-6 2.243M12 15.75V21m0-5.25c1.38 0 2.652-.24 3.75-.697v6a6 6 0 0 1-3.75-2.243M12 15.75L9 12"
                  />
                </svg>
                <div>
                  <p className="text-yellow-800 font-medium text-sm">
                    需要設定 API Key 以使用分享功能
                  </p>
                  <p className="text-yellow-700 text-xs mt-1">
                    設定後可分享測驗和寫作練習給學生，包含 AI 功能
                  </p>
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

const AppContent: React.FC = () => {
  const { currentTheme } = useTheme();

  const {
    topic,
    setTopic,
    generatedContent,
    setGeneratedContent,
    isLoading,
    error,
    setError,
    apiKey,
    showApiKeyModal,
    copySuccess,
    showProviderShareModal,
    setShowProviderShareModal,
    availableProviders,
    learningLevels,
    setLearningLevels,
    selectedLevel,
    setSelectedLevel,
    showingLevelSelection,
    setShowingLevelSelection,
    selectedVocabularyLevel,
    setSelectedVocabularyLevel,
    showingVocabularySelection,
    setShowingVocabularySelection,
    isEnglishTopic,
    providerShareId,
    showGeneralGenerator,
    setShowGeneralGenerator,
    handleSaveApiKey,
    handleGenerateLevelSuggestions,
    handleGenerateContentWithLevel,
    handleGenerateContent,
    handleMathComplete,
    handleEnglishComplete,
    handleShareLink,
    handleProviderShare,
    handleProviderShareCreated,
    handleProviderImported,
  } = useAppLogic();

  if (providerShareId) {
    return (
      <ErrorBoundary>
        <ProviderShareReceiver
          binId={providerShareId}
          onProviderImported={handleProviderImported}
          onClose={() => {
            window.location.href = `${window.location.origin}${import.meta.env.BASE_URL} `;
          }}
        />
      </ErrorBoundary>
    );
  }

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <React.Suspense
          fallback={
            <div
              className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center`}
            >
              <LoadingSpinner />
            </div>
          }
        >
          <Routes>
            <Route
              path="share"
              element={
                <ErrorBoundary>
                  <SharePage />
                </ErrorBoundary>
              }
            />
            <Route
              path="provider-share"
              element={
                <ErrorBoundary>
                  <SharePage />
                </ErrorBoundary>
              }
            />
            <Route
              path="quiz"
              element={
                <ErrorBoundary>
                  <QuizPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="writing"
              element={
                <ErrorBoundary>
                  <StudentWritingPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="student-results"
              element={
                <ErrorBoundary>
                  <StudentResultsPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="lesson-plans"
              element={
                <ErrorBoundary>
                  <LessonPlanManager />
                </ErrorBoundary>
              }
            />
            <Route
              path="interactive-learning"
              element={
                <ErrorBoundary>
                  <InteractiveLearningPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="teacher-interactive-prep"
              element={
                <ErrorBoundary>
                  <TeacherInteractivePrepPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="student-interactive"
              element={
                <ErrorBoundary>
                  <StudentInteractivePage />
                </ErrorBoundary>
              }
            />
            <Route
              path="conversation-prep"
              element={
                <ErrorBoundary>
                  <ConversationPrepPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="conversation-practice/:binId"
              element={
                <ErrorBoundary>
                  <ConversationPracticePage />
                </ErrorBoundary>
              }
            />
            <Route
              path="math"
              element={
                <ErrorBoundary>
                  <MathGenerator
                    onComplete={handleMathComplete}
                    apiKey={apiKey || ''}
                  />
                </ErrorBoundary>
              }
            />
            <Route
              path="english"
              element={
                <ErrorBoundary>
                  <EnglishGenerator
                    onComplete={handleEnglishComplete}
                    apiKey={apiKey || ''}
                  />
                </ErrorBoundary>
              }
            />
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <div
                    className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} py-8 px-4 sm:px-6 lg:px-8 relative`}
                  >
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40">
                      <ThemeSelector />
                    </div>

                    <ProviderApiKeyModal
                      isOpen={showApiKeyModal}
                      onSave={handleSaveApiKey}
                    />
                    <header className="text-center mb-10 pt-4">
                      <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-secondary)] tracking-tight transition-colors">
                        AI 學習頁面{' '}
                        <span className="text-[var(--color-primary)]">
                          產生器
                        </span>
                      </h1>
                      <p className="mt-3 text-lg text-secondary max-w-2xl mx-auto">
                        輸入一個主題，讓 AI
                        為您打造包含互動測驗的結構化學習計劃！
                      </p>
                      <div className="mt-6 max-w-2xl mx-auto bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 text-left shadow-sm">
                        <div className="flex items-start mb-2">
                          <svg
                            className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                            />
                          </svg>
                          <span className="font-semibold text-yellow-800 text-base">
                            使用注意事項
                          </span>
                        </div>
                        <ul className="list-disc pl-8 text-yellow-900 text-sm space-y-1">
                          <li>
                            內容審查：請在分享AI生成內容給學生前仔細檢查，確保內容適合且無誤
                          </li>
                          <li>隱私保護：請勿輸入學生個人識別資訊</li>
                        </ul>
                      </div>
                    </header>

                    <div className="max-w-6xl mx-auto mb-6">
                      <div className="flex justify-center">
                        <ProviderStatusDisplay compact={true} />
                      </div>
                    </div>

                    <ProviderShareModal
                      isOpen={showProviderShareModal}
                      onClose={() => setShowProviderShareModal(false)}
                      providers={availableProviders}
                      onShareCreated={handleProviderShareCreated}
                    />

                    <main className="max-w-4xl mx-auto">
                      {!generatedContent &&
                        !showingLevelSelection &&
                        !showingVocabularySelection && (
                          <>
                            {!showGeneralGenerator ? (
                              <div className="mt-8 animate-fade-in">
                                <h3 className="text-xl font-semibold text-secondary mb-6 text-center">
                                  請選擇您要使用的學習工具
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <button
                                    onClick={() =>
                                      setShowGeneralGenerator(true)
                                    }
                                    className="flex items-center p-4 bg-surface border border-border rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group text-left w-full"
                                  >
                                    <div className="p-3 bg-indigo-50 text-[var(--color-primary)] rounded-lg group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                      <LightbulbIcon className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                      <h4 className="font-medium text-primary">
                                        通用主題教案
                                      </h4>
                                      <p className="text-sm text-secondary">
                                        輸入任意主題產生完整教案
                                      </p>
                                    </div>
                                  </button>

                                  <Link
                                    to="/math"
                                    className="flex items-center p-4 bg-surface border border-border rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group"
                                  >
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                        />
                                      </svg>
                                    </div>
                                    <div className="ml-4">
                                      <h4 className="font-medium text-primary">
                                        數學教材生成
                                      </h4>
                                      <p className="text-sm text-secondary">
                                        預選博幼教學目標產生教案教材
                                      </p>
                                    </div>
                                  </Link>

                                  <Link
                                    to="/english"
                                    className="flex items-center p-4 bg-surface border border-border rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group"
                                  >
                                    <div className="p-3 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                                        />
                                      </svg>
                                    </div>
                                    <div className="ml-4">
                                      <h4 className="font-medium text-primary">
                                        英語教材生成
                                      </h4>
                                      <p className="text-sm text-secondary">
                                        預選博幼教學目標產生教案教材
                                      </p>
                                    </div>
                                  </Link>

                                  <a
                                    href={`${import.meta.env.BASE_URL}conversation-prep`}
                                    className="flex items-center p-4 bg-surface border border-border rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group"
                                  >
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                                        />
                                      </svg>
                                    </div>
                                    <div className="ml-4">
                                      <h4 className="font-medium text-primary">
                                        英文對話練習
                                      </h4>
                                      <p className="text-sm text-secondary">
                                        情境模擬對話
                                      </p>
                                    </div>
                                  </a>

                                  <a
                                    href={`${import.meta.env.BASE_URL}lesson-plans`}
                                    className="flex items-center p-4 bg-surface border border-border rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group"
                                  >
                                    <div className="p-3 bg-indigo-50 text-[var(--color-primary)] rounded-lg group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                      <AcademicCapIcon className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                      <h4 className="font-medium text-primary">
                                        我的教案庫
                                      </h4>
                                      <p className="text-sm text-secondary">
                                        查看已儲存的教案
                                      </p>
                                    </div>
                                  </a>
                                </div>

                                <div className="mt-12 flex justify-center gap-4">
                                  <button
                                    onClick={handleProviderShare}
                                    className="text-sm text-secondary hover:text-[var(--color-primary)] flex items-center gap-1 transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-11.314a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z"
                                      />
                                    </svg>
                                    分享 Provider 配置
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    onClick={handleShareLink}
                                    className="text-sm text-secondary hover:text-[var(--color-primary)] flex items-center gap-1 transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                      />
                                    </svg>
                                    分享應用程式連結
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="animate-fade-in">
                                <button
                                  onClick={() => setShowGeneralGenerator(false)}
                                  className="mb-4 flex items-center text-secondary hover:text-[var(--color-primary)] transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 mr-1"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                    />
                                  </svg>
                                  返回功能選單
                                </button>

                                <div className="mb-6 text-center">
                                  <h2 className="text-2xl font-bold text-primary">
                                    通用主題教案生成
                                  </h2>
                                  <p className="text-secondary">
                                    輸入任何您想教學的主題，AI 為您規劃完整教案
                                  </p>
                                </div>

                                <InputBar
                                  topic={topic}
                                  setTopic={setTopic}
                                  onGenerate={handleGenerateContent}
                                  onGenerateWithLevels={
                                    handleGenerateLevelSuggestions
                                  }
                                  isLoading={isLoading}
                                />
                              </div>
                            )}
                          </>
                        )}

                      {error && !isLoading && (
                        <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                          <h3 className="font-bold text-lg mb-2 flex items-center">
                            <LightbulbIcon className="w-6 h-6 mr-2 text-red-600" />
                            產生內容時發生錯誤
                          </h3>
                          <p>{error}</p>
                          <p className="mt-2 text-sm">
                            請嘗試修改您的主題或重試。如果問題持續存在，AI
                            模型可能暫時不可用，或者 API 金鑰可能存在問題。
                          </p>
                          <button
                            onClick={() => {
                              setError(null);
                              setShowingLevelSelection(false);
                              setShowingVocabularySelection(false);
                            }}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            重試
                          </button>
                        </div>
                      )}

                      {isLoading && (
                        <div className="flex flex-col items-center justify-center my-20">
                          <LoadingSpinner />
                          <p className="mt-4 text-secondary animate-pulse">
                            正在為您精心製作教案...
                          </p>
                        </div>
                      )}

                      {showingLevelSelection &&
                        learningLevels &&
                        !isLoading &&
                        !error && (
                          <div className="animate-fade-in">
                            <div className="mb-6 flex justify-between items-center">
                              <h2 className="text-2xl font-bold text-primary">
                                選擇適合的程度
                              </h2>
                              <button
                                onClick={() => setShowingLevelSelection(false)}
                                className="text-secondary hover:text-primary px-3 py-1 rounded hover:bg-slate-100 transition-colors"
                              >
                                返回修改主題
                              </button>
                            </div>
                            <LearningLevelSelector
                              learningLevels={learningLevels}
                              onLevelSelect={setSelectedLevel}
                              onGenerateWithLevel={
                                handleGenerateContentWithLevel
                              }
                              selectedLevelId={selectedLevel?.id}
                              isLoading={isLoading}
                            />
                          </div>
                        )}

                      {showingVocabularySelection &&
                        isEnglishTopic &&
                        !isLoading &&
                        !error && (
                          <div className="animate-fade-in">
                            <div className="mb-6 flex justify-between items-center">
                              <h2 className="text-2xl font-bold text-primary">
                                選擇單字難易度
                              </h2>
                              <button
                                onClick={() => {
                                  setShowingVocabularySelection(false);
                                  setShowingLevelSelection(true);
                                }}
                                className="text-secondary hover:text-primary px-3 py-1 rounded hover:bg-slate-100 transition-colors"
                              >
                                返回上一步
                              </button>
                            </div>
                            <VocabularyLevelSelector
                              onVocabularyLevelSelect={
                                setSelectedVocabularyLevel
                              }
                              selectedLevel={selectedVocabularyLevel}
                              isVisible={true}
                            />
                            <div className="mt-8 flex justify-center">
                              <button
                                onClick={() =>
                                  handleGenerateContentWithLevel(selectedLevel!)
                                }
                                className="px-8 py-3 bg-[var(--color-primary)] text-white text-lg font-semibold rounded-full shadow-lg hover:bg-[var(--color-secondary)] hover:shadow-xl transition-all transform hover:-translate-y-1"
                              >
                                開始產生教案
                              </button>
                            </div>
                          </div>
                        )}

                      {generatedContent &&
                        !isLoading &&
                        !error &&
                        !showingLevelSelection &&
                        !showingVocabularySelection && (
                          <div className="animate-fade-in">
                            <div className="mb-8 flex justify-between items-center bg-surface p-4 rounded-xl shadow-sm border border-border">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-[var(--color-primary)] rounded-lg">
                                  <AcademicCapIcon className="w-6 h-6" />
                                </div>
                                <div>
                                  <h2 className="font-bold text-primary text-lg">
                                    {topic}
                                  </h2>
                                  <p className="text-sm text-secondary">
                                    {selectedLevel
                                      ? `${selectedLevel.description} · `
                                      : ''}
                                    {new Date().toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setGeneratedContent(null);
                                  setTopic('');
                                  setLearningLevels(null);
                                  setSelectedLevel(null);
                                  setShowGeneralGenerator(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                <HomeIcon className="w-4 h-4" />
                                回首頁重新產生
                              </button>
                            </div>

                            <ErrorBoundary>
                              <LearningContentDisplay
                                content={generatedContent}
                                topic={topic}
                                selectedLevel={selectedLevel}
                                selectedVocabularyLevel={
                                  selectedVocabularyLevel
                                }
                                apiKey={apiKey || undefined}
                                onContentUpdate={setGeneratedContent}
                              />
                            </ErrorBoundary>
                          </div>
                        )}
                    </main>

                    <footer className="text-center mt-12 py-6 border-t border-border">
                      <p className="text-sm text-secondary">
                        由 Gemini API 驅動。AI 設計，為學習而生。
                      </p>
                      <button
                        className="mt-4 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white rounded shadow transition"
                        onClick={handleShareLink}
                        disabled={!apiKey}
                      >
                        產生分享連結並複製
                      </button>
                      {copySuccess && (
                        <div className="mt-2 text-green-600 text-sm">
                          {copySuccess}
                        </div>
                      )}
                    </footer>
                  </div>
                </ErrorBoundary>
              }
            />
          </Routes>
        </React.Suspense>
      </ErrorBoundary>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
