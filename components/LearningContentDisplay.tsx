import React from 'react';
import { GeneratedLearningContent, ExtendedLearningContent, LearningLevel, VocabularyLevel, QuizCustomConfig, DEFAULT_QUIZ_CONFIG, QUIZ_TYPE_LIMITS } from '../types';
import SectionCard from './SectionCard';
import QuizView from './QuizView';
import ConversationPractice from './ConversationPractice';
import WritingPracticeView from './WritingPracticeView';
import { AcademicCapIcon, BookOpenIcon, LightbulbIcon, BeakerIcon, ClipboardIcon, ChatBubbleLeftRightIcon } from './icons';
import { exportLearningContentToHtml } from '../utils/exportHtmlUtil'; // Import the new utility
import Tabs from './Tabs';
import { saveLearningContent, saveQuizContent, saveWritingPracticeContent } from '../services/jsonbinService';
import { regenerateQuizWithConfig } from '../services/geminiService';
import QuizConfigPanel from './QuizConfigPanel';

interface LearningContentDisplayProps {
  content: ExtendedLearningContent;
  topic: string; // Added topic prop
  selectedLevel?: LearningLevel | null; // Added selected learning level
  selectedVocabularyLevel?: VocabularyLevel | null; // Added selected vocabulary level
  apiKey?: string; // Added API key for writing practice AI feedback
  onContentUpdate?: (newContent: ExtendedLearningContent) => void; // Callback for content updates
}

const tabDefs = [
  { key: 'objectives', label: '教學目標' },
  { key: 'breakdown', label: '分解內容' },
  { key: 'confusing', label: '易混淆點' },
  { key: 'activities', label: '課堂活動' },
  { key: 'conversation', label: '對話練習' },
  { key: 'writing', label: '寫作練習' },
  { key: 'quiz', label: '互動測驗' },
];

const LearningContentDisplay: React.FC<LearningContentDisplayProps> = ({ content, topic, selectedLevel, selectedVocabularyLevel, apiKey, onContentUpdate }) => {
  const [copySuccess, setCopySuccess] = React.useState('');
  const [exportMessage, setExportMessage] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState(tabDefs[0].key);
  const [shareLoading, setShareLoading] = React.useState(false);
  const [shareError, setShareError] = React.useState('');
  const [shareUrl, setShareUrl] = React.useState('');
  
  // Quiz sharing states
  const [quizShareLoading, setQuizShareLoading] = React.useState(false);
  const [quizShareError, setQuizShareError] = React.useState('');
  const [quizShareUrl, setQuizShareUrl] = React.useState('');
  
  // Writing practice sharing states
  const [writingShareLoading, setWritingShareLoading] = React.useState(false);
  const [writingShareError, setWritingShareError] = React.useState('');
  const [writingShareUrl, setWritingShareUrl] = React.useState('');
  
  // Quiz configuration states
  const [quizConfig, setQuizConfig] = React.useState<QuizCustomConfig>(DEFAULT_QUIZ_CONFIG);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = React.useState(false);
  const [showQuizConfig, setShowQuizConfig] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2))
      .then(() => {
        setCopySuccess('JSON 已複製到剪貼簿！');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        setCopySuccess('複製失敗。');
        console.error('Failed to copy: ', err);
        setTimeout(() => setCopySuccess(''), 2000);
      });
  };

  const handleExportHtml = () => {
    try {
      exportLearningContentToHtml(content, topic);
      setExportMessage('HTML 檔案已開始下載！');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (error) {
      console.error('Failed to export HTML:', error);
      setExportMessage('匯出 HTML 失敗。');
      setTimeout(() => setExportMessage(''), 3000);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    setShareError('');
    setShareUrl('');
    try {
      const binId = await saveLearningContent(content);
      // 這裡請根據你的實際 domain 修改
      const url = `${window.location.origin}${import.meta.env.BASE_URL}share?binId=${binId}`;
      setShareUrl(url);
    } catch (e: any) {
      setShareError(e.message || '分享失敗');
    } finally {
      setShareLoading(false);
    }
  };

  const handleQuizShare = async () => {
    setQuizShareLoading(true);
    setQuizShareError('');
    setQuizShareUrl('');
    
    if (!content.onlineInteractiveQuiz) {
      setQuizShareError('沒有可分享的測驗內容');
      setQuizShareLoading(false);
      return;
    }
    
    try {
      const binId = await saveQuizContent({
        quiz: content.onlineInteractiveQuiz,
        topic: topic,
        metadata: {
          selectedLevel: selectedLevel?.name,
          selectedVocabularyLevel: selectedVocabularyLevel?.name,
          createdAt: new Date().toISOString()
        }
      });
      
      const url = `${window.location.origin}${import.meta.env.BASE_URL}quiz?binId=${binId}`;
      setQuizShareUrl(url);
    } catch (e: any) {
      setQuizShareError(e.message || '分享測驗失敗');
    } finally {
      setQuizShareLoading(false);
    }
  };

  const handleWritingShare = async () => {
    setWritingShareLoading(true);
    setWritingShareError('');
    setWritingShareUrl('');
    
    if (!content.writingPractice) {
      setWritingShareError('沒有可分享的寫作練習內容');
      setWritingShareLoading(false);
      return;
    }
    
    try {
      const binId = await saveWritingPracticeContent({
        writingPractice: content.writingPractice,
        topic: topic,
        metadata: {
          selectedLevel: selectedLevel?.name,
          selectedVocabularyLevel: selectedVocabularyLevel?.name,
          createdAt: new Date().toISOString()
        }
      });
      
      const url = `${window.location.origin}${import.meta.env.BASE_URL}writing?binId=${binId}`;
      setWritingShareUrl(url);
    } catch (e: any) {
      setWritingShareError(e.message || '分享寫作練習失敗');
    } finally {
      setWritingShareLoading(false);
    }
  };

  const handleRegenerateQuiz = async () => {
    if (!content.learningObjectives) {
      alert('無法重新生成測驗：缺少學習目標');
      return;
    }

    // 從 localStorage 獲取 API key
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      alert('請先設定 Gemini API 金鑰');
      return;
    }

    setIsRegeneratingQuiz(true);
    try {
      const newQuiz = await regenerateQuizWithConfig(
        topic,
        apiKey,
        content.learningObjectives,
        quizConfig,
        selectedLevel,
        selectedVocabularyLevel
      );

      // 更新內容
      const updatedContent = {
        ...content,
        onlineInteractiveQuiz: newQuiz
      };

      // 如果有回調函數，使用它來更新父組件的狀態
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }

      // 關閉配置面板
      setShowQuizConfig(false);
      
      // 顯示成功訊息
      alert('測驗已成功重新生成！');
      
    } catch (error: any) {
      console.error('重新生成測驗時發生錯誤:', error);
      alert('重新生成測驗失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setIsRegeneratingQuiz(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-end items-center gap-2 mb-4">
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center text-sm"
          aria-label="複製產生的 JSON 內容"
        >
          <ClipboardIcon className="w-4 h-4 mr-2" /> 複製產生的 JSON
        </button>
        <button
          onClick={handleExportHtml}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center text-sm"
          aria-label="將學習內容匯出為 HTML 檔案"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          匯出為 HTML
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center text-sm disabled:opacity-60"
          aria-label="分享教學方案"
          disabled={shareLoading}
        >
          {shareLoading ? (
            <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> 分享中...</span>
          ) : (
            <span>分享方案</span>
          )}
        </button>
        <button
          onClick={handleQuizShare}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center text-sm disabled:opacity-60"
          aria-label="分享測驗給學生"
          disabled={quizShareLoading}
        >
          {quizShareLoading ? (
            <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> 分享中...</span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              分享測驗
            </span>
          )}
        </button>
        <button
          onClick={() => setShowQuizConfig(!showQuizConfig)}
          className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center text-sm"
          aria-label="測驗設定"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          測驗設定
        </button>
        {copySuccess && <span className="text-sm text-green-600">{copySuccess}</span>}
        {exportMessage && <span className="text-sm text-blue-600">{exportMessage}</span>}
        {shareError && <span className="text-sm text-red-600">{shareError}</span>}
        {quizShareError && <span className="text-sm text-red-600">{quizShareError}</span>}
        {shareUrl && (
          <span className="text-sm text-purple-700 flex items-center gap-2">
            方案分享連結：
            <button
              className="underline hover:text-purple-900"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
            >
              {shareUrl}
            </button>
            <span className="ml-1 text-xs text-gray-400">(點擊可複製)</span>
          </span>
        )}
        {quizShareUrl && (
          <span className="text-sm text-orange-700 flex items-center gap-2">
            測驗分享連結：
            <button
              className="underline hover:text-orange-900"
              onClick={() => {
                navigator.clipboard.writeText(quizShareUrl);
              }}
            >
              {quizShareUrl}
            </button>
            <span className="ml-1 text-xs text-gray-400">(點擊可複製)</span>
          </span>
        )}
      </div>
      
      {/* Topic and Level Display Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <LightbulbIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span className="text-sm font-medium text-indigo-600">學習主題</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-0 truncate">{topic}</h2>
          </div>
          
          {(selectedLevel || selectedVocabularyLevel) && (
            <div className="flex gap-3 ml-6 flex-shrink-0">
              {selectedLevel && (
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AcademicCapIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600">學習程度</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{selectedLevel.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-32" title={selectedLevel.description}>
                    {selectedLevel.description.length > 20 
                      ? selectedLevel.description.substring(0, 20) + '...' 
                      : selectedLevel.description}
                  </div>
                </div>
              )}
              
              {selectedVocabularyLevel && (
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpenIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-600">詞彙程度</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{selectedVocabularyLevel.name}</div>
                  <div className="text-xs text-gray-500">{selectedVocabularyLevel.wordCount} 詞彙</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs
        tabs={tabDefs}
        current={currentTab}
        onChange={setCurrentTab}
      >
        {/* 教學目標 */}
        <SectionCard title="教學目標設定" icon={<AcademicCapIcon className="w-7 h-7" />}>
          {content.learningObjectives && content.learningObjectives.length > 0 ? (
            content.learningObjectives.map((objective, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg text-green-800 mb-1">{objective.objective}</h4>
                <p className="text-slate-700 mb-2">{objective.description}</p>
                {objective.teachingExample && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-md mt-2">
                    <span className="block text-xs font-semibold text-green-700 mb-1">教學示例</span>
                    <span className="text-green-900 text-sm">{objective.teachingExample}</span>
                  </div>
                )}
              </div>
            ))
          ) : <p>沒有提供教學目標。</p>}
        </SectionCard>
        {/* 分解內容 */}
        <SectionCard title="分解學習內容" icon={<BookOpenIcon className="w-7 h-7" />}>
          {content.contentBreakdown && content.contentBreakdown.length > 0 ? (
            content.contentBreakdown.map((item, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg text-sky-800 mb-1">{item.topic}</h4>
                <p className="text-slate-700 mb-3">{item.details}</p>
                
                {/* Enhanced English Learning Fields */}
                {item.coreConcept && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-blue-700 mb-1">核心概念</span>
                    <span className="text-blue-900 text-sm">{item.coreConcept}</span>
                  </div>
                )}
                
                {item.teachingSentences && item.teachingSentences.length > 0 && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-indigo-700 mb-2">教學例句</span>
                    <div className="space-y-1">
                      {item.teachingSentences.map((sentence, sentenceIndex) => (
                        <div key={sentenceIndex} className="text-indigo-900 text-sm">
                          <span className="font-mono text-indigo-600">{sentenceIndex + 1}.</span> {sentence}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.teachingTips && (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-purple-700 mb-1">教學要點提示</span>
                    <span className="text-purple-900 text-sm">{item.teachingTips}</span>
                  </div>
                )}
                
                {item.teachingExample && (
                  <div className="bg-sky-50 border-l-4 border-sky-400 p-3 rounded-md">
                    <span className="block text-xs font-semibold text-sky-700 mb-1">教學示例</span>
                    <span className="text-sky-900 text-sm">{item.teachingExample}</span>
                  </div>
                )}
              </div>
            ))
          ) : <p>沒有提供內容分解。</p>}
        </SectionCard>
        {/* 易混淆點 */}
        <SectionCard title="易混淆點識別" icon={<LightbulbIcon className="w-7 h-7" />}>
          {content.confusingPoints && content.confusingPoints.length > 0 ? (
            content.confusingPoints.map((item, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg text-red-700 mb-2">{item.point}</h4>
                <p className="text-slate-700 mb-3">{item.clarification}</p>
                
                {/* Error Type */}
                {item.errorType && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-orange-700 mb-1">誤區類型</span>
                    <span className="text-orange-900 text-sm">{item.errorType}</span>
                  </div>
                )}
                
                {/* Common Errors */}
                {item.commonErrors && item.commonErrors.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-red-700 mb-2">常見錯誤示例</span>
                    <div className="space-y-1">
                      {item.commonErrors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-red-900 text-sm">
                          <span className="font-mono text-red-600">{errorIndex + 1}.</span> {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Correct vs Wrong Comparisons */}
                {item.correctVsWrong && item.correctVsWrong.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-yellow-700 mb-2">正確與錯誤對比</span>
                    <div className="space-y-3">
                      {item.correctVsWrong.map((comparison, compIndex) => (
                        <div key={compIndex} className="border border-yellow-200 rounded-md p-2 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <span className="block text-xs font-semibold text-green-700 mb-1">✓ 正確</span>
                              <span className="text-green-900 text-sm">{comparison.correct}</span>
                            </div>
                            <div className="bg-red-50 p-2 rounded border border-red-200">
                              <span className="block text-xs font-semibold text-red-700 mb-1">✗ 錯誤</span>
                              <span className="text-red-900 text-sm">{comparison.wrong}</span>
                            </div>
                          </div>
                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <span className="block text-xs font-semibold text-blue-700 mb-1">說明</span>
                            <span className="text-blue-900 text-sm">{comparison.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Prevention Strategy */}
                {item.preventionStrategy && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-blue-700 mb-1">預防策略</span>
                    <span className="text-blue-900 text-sm">{item.preventionStrategy}</span>
                  </div>
                )}
                
                {/* Correction Method */}
                {item.correctionMethod && (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-purple-700 mb-1">糾正方法</span>
                    <span className="text-purple-900 text-sm">{item.correctionMethod}</span>
                  </div>
                )}
                
                {/* Practice Activities */}
                {item.practiceActivities && item.practiceActivities.length > 0 && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-indigo-700 mb-2">練習建議</span>
                    <div className="space-y-1">
                      {item.practiceActivities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="text-indigo-900 text-sm">
                          <span className="font-mono text-indigo-600">{activityIndex + 1}.</span> {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Original Teaching Example */}
                {item.teachingExample && (
                  <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-md">
                    <span className="block text-xs font-semibold text-gray-700 mb-1">教學示例</span>
                    <span className="text-gray-900 text-sm">{item.teachingExample}</span>
                  </div>
                )}
              </div>
            ))
          ) : <p>沒有提供易混淆點。</p>}
        </SectionCard>
        {/* 課堂活動 */}
        <SectionCard title="課堂活動與遊戲設計" icon={<BeakerIcon className="w-7 h-7" />}>
          {content.classroomActivities && content.classroomActivities.length > 0 ? (
            <div className="space-y-4">
              {content.classroomActivities.map((activity, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-md bg-slate-50">
                  <h4 className="font-bold text-lg text-sky-700 mb-2">{activity.title}</h4>
                  <p className="mb-3 text-slate-700">{activity.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {activity.objective && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">學習目標：</span>
                        <p className="mt-1">{activity.objective}</p>
                      </div>
                    )}
                    {activity.timing && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">使用時機：</span>
                        <p className="mt-1">{activity.timing}</p>
                      </div>
                    )}
                    {activity.materials && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">所需教具：</span>
                        <p className="mt-1">{activity.materials}</p>
                      </div>
                    )}
                    {activity.environment && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">環境要求：</span>
                        <p className="mt-1">{activity.environment}</p>
                      </div>
                    )}
                  </div>
                  
                  {activity.steps && activity.steps.length > 0 && (
                    <div className="mb-3">
                      <span className="font-semibold text-sm text-sky-900">活動步驟：</span>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        {activity.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-slate-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {activity.assessmentPoints && activity.assessmentPoints.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm text-sky-900">評估重點：</span>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {activity.assessmentPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="text-sm text-slate-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : <p>沒有提供課堂活動。</p>}
        </SectionCard>
        {/* 對話練習 */}
        {content.englishConversation && content.englishConversation.length > 0 ? (
          <ConversationPractice dialogue={content.englishConversation} />
        ) : (
          <SectionCard title="對話練習" icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />}>
            <p>沒有提供對話練習。</p>
          </SectionCard>
        )}
        {/* 寫作練習 */}
        {content.writingPractice ? (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleWritingShare}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                disabled={writingShareLoading}
              >
                {writingShareLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    分享中...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                    </svg>
                    分享寫作練習
                  </>
                )}
              </button>
            </div>
            
            {writingShareError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{writingShareError}</div>}
            
            {writingShareUrl && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700 mb-2">寫作練習分享連結已生成：</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={writingShareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded text-sm"
                    onClick={() => navigator.clipboard.writeText(writingShareUrl)}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(writingShareUrl)}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  >
                    複製
                  </button>
                </div>
              </div>
            )}
            
            <WritingPracticeView
              content={content.writingPractice}
              apiKey={apiKey}
              vocabularyLevel={selectedVocabularyLevel || undefined}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">沒有提供寫作練習</h4>
            <p className="text-gray-500">此主題沒有生成寫作練習內容</p>
          </div>
        )}
        {/* 互動測驗 */}
        <div>
          {showQuizConfig && (
            <QuizConfigPanel
              config={quizConfig}
              onConfigChange={setQuizConfig}
              onRegenerate={handleRegenerateQuiz}
              isGenerating={isRegeneratingQuiz}
            />
          )}
          <QuizView quizzes={content.onlineInteractiveQuiz} />
        </div>
      </Tabs>
    </div>
  );
};

export default LearningContentDisplay;
