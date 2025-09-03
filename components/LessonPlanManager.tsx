import React, { useState, useEffect } from 'react';
import { lessonPlanStorage, StoredLessonPlan } from '../services/lessonPlanStorage';
import { saveLearningContent } from '../services/jsonbinService';
import { AcademicCapIcon, ClockIcon, ShareIcon, TrashIcon, EyeIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';
import LearningContentDisplay from './LearningContentDisplay';

const LessonPlanManager: React.FC = () => {
  const [lessonPlans, setLessonPlans] = useState<StoredLessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<StoredLessonPlan | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view'>('list');
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // 獲取 API Key
    const storedKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('geminiApiKey');
    setApiKey(storedKey);
    
    loadLessonPlans();
  }, []);

  const loadLessonPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      await lessonPlanStorage.init();
      const plans = await lessonPlanStorage.getAllLessonPlans();
      setLessonPlans(plans);
    } catch (err) {
      console.error('載入教案失敗:', err);
      setError('載入教案失敗，請重試。');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadLessonPlans();
      return;
    }
    
    try {
      setLoading(true);
      const results = await lessonPlanStorage.searchLessonPlans(searchQuery);
      setLessonPlans(results);
    } catch (err) {
      console.error('搜索失敗:', err);
      setError('搜索失敗，請重試。');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = async (plan: StoredLessonPlan) => {
    setSelectedPlan(plan);
    setViewMode('view');
    
    // 更新最後訪問時間
    try {
      await lessonPlanStorage.updateLastAccessed(plan.id);
    } catch (err) {
      console.error('更新訪問時間失敗:', err);
    }
  };

  const handleSharePlan = async (plan: StoredLessonPlan) => {
    if (!apiKey) {
      alert('請先設定 API Key 才能分享教案。');
      return;
    }

    setShareLoading(plan.id);
    
    try {
      // 準備分享數據
      const shareData = {
        ...plan.content,
        topic: plan.topic,
        selectedLevel: plan.content.selectedLevel || null,
        selectedVocabularyLevel: plan.content.selectedVocabularyLevel || null
      };

      const binId = await saveLearningContent(shareData, apiKey, true);
      const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}share?binId=${binId}`;
      
      // 複製到剪貼簿
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        alert('分享連結已複製到剪貼簿！');
      } else {
        // 創建臨時 textarea 來複製
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(`分享連結已複製！\\n${shareUrl}`);
      }
      
      // 更新最後訪問時間
      await lessonPlanStorage.updateLastAccessed(plan.id);
    } catch (err) {
      console.error('分享失敗:', err);
      alert('分享失敗，請稍後再試。');
    } finally {
      setShareLoading(null);
    }
  };

  const handleDeletePlan = async (plan: StoredLessonPlan) => {
    if (!confirm(`確定要刪除教案「${plan.topic}」嗎？此操作無法復原。`)) {
      return;
    }
    
    try {
      await lessonPlanStorage.deleteLessonPlan(plan.id);
      await loadLessonPlans();
    } catch (err) {
      console.error('刪除失敗:', err);
      alert('刪除失敗，請重試。');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPlans = searchQuery.trim() 
    ? lessonPlans.filter(plan => 
        plan.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : lessonPlans;

  if (viewMode === 'view' && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header with Back Button */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedPlan(null);
                }}
                className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                返回教案列表
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{selectedPlan.topic}</h1>
                <p className="text-sm text-gray-600">
                  創建於 {formatDate(selectedPlan.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleSharePlan(selectedPlan)}
                disabled={shareLoading === selectedPlan.id}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {shareLoading === selectedPlan.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShareIcon className="w-4 h-4" />
                )}
                分享教案
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <LearningContentDisplay 
            content={selectedPlan.content} 
            topic={selectedPlan.topic}
            selectedLevel={selectedPlan.content.selectedLevel || null}
            selectedVocabularyLevel={selectedPlan.content.selectedVocabularyLevel || null}
            apiKey={apiKey || undefined}
            onContentUpdate={async (updatedContent) => {
              // 更新選中的教案
              const updatedPlan = {
                ...selectedPlan,
                content: updatedContent,
                lastAccessedAt: new Date().toISOString()
              };
              setSelectedPlan(updatedPlan);
              
              // 更新到 IndexedDB
              try {
                await lessonPlanStorage.saveLessonPlan(updatedPlan);
                console.log('教案已更新到 IndexedDB');
              } catch (error) {
                console.error('更新教案到 IndexedDB 失敗:', error);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">我的教案庫</h1>
          </div>
          <p className="text-gray-600">管理您之前生成的所有教案，隨時查看和分享</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索教案主題..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              搜索
            </button>
            <button
              onClick={loadLessonPlans}
              className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              重置
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{lessonPlans.length}</p>
                <p className="text-gray-600">總教案數</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {lessonPlans.filter(p => p.metadata?.hasQuiz).length}
                </p>
                <p className="text-gray-600">包含測驗</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {lessonPlans.filter(p => p.metadata?.hasWriting).length}
                </p>
                <p className="text-gray-600">包含寫作</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Plans List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {searchQuery.trim() ? `搜索結果 (${filteredPlans.length})` : '所有教案'}
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">載入中...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadLessonPlans}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                重試
              </button>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="p-8 text-center">
              <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery.trim() ? '未找到匹配的教案' : '還沒有保存的教案'}
              </p>
              <p className="text-gray-500">
                {searchQuery.trim() ? '嘗試其他關鍵詞' : '生成第一個教案來開始使用！'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.topic}
                        </h3>
                        {plan.metadata?.isShared && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <ShareIcon className="w-3 h-3" />
                            分享的教案
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          創建：{formatDate(plan.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          訪問：{formatDate(plan.lastAccessedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                          {plan.metadata?.totalSections || 0} 個部分
                        </span>
                        {plan.metadata?.hasQuiz && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            包含測驗
                          </span>
                        )}
                        {plan.metadata?.hasWriting && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            包含寫作
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewPlan(plan)}
                        className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        查看
                      </button>
                      <a
                        href={`${import.meta.env.BASE_URL}teacher-interactive-prep?contentId=${plan.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        準備互動教材
                      </a>
                      <button
                        onClick={() => handleSharePlan(plan)}
                        disabled={shareLoading === plan.id}
                        className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {shareLoading === plan.id ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ShareIcon className="w-4 h-4" />
                        )}
                        分享
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanManager;