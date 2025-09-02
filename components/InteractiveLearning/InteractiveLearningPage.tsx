import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExtendedLearningContent, InteractiveLearningSession } from '../../types';
import { getLearningContent } from '../../services/jsonbinService';
import { lessonPlanStorage, StoredLessonPlan } from '../../services/lessonPlanStorage';
import LoadingSpinner from '../LoadingSpinner';
import ProgressTracker from './ProgressTracker';
import LearningObjectiveCard from './LearningObjectiveCard';

// 定義學習步驟類型
type LearningStep = {
  id: string;
  title: string;
  type: 'objective' | 'breakdown' | 'confusing' | 'summary';
  icon: string;
  description: string;
  data?: any; // 存儲該步驟的具體數據
  index?: number; // 在原始數組中的索引
};

const InteractiveLearningPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('contentId');
  const binId = searchParams.get('binId');
  
  const [content, setContent] = useState<ExtendedLearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningSession, setLearningSession] = useState<InteractiveLearningSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [learningSteps, setLearningSteps] = useState<LearningStep[]>([]);

  useEffect(() => {
    loadContent();
  }, [contentId, binId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      let loadedContent: ExtendedLearningContent;

      if (binId) {
        // 從分享連結載入
        loadedContent = await getLearningContent(binId);
      } else if (contentId) {
        // 從本地存儲載入
        await lessonPlanStorage.init();
        const lessonPlan = await lessonPlanStorage.getLessonPlan(contentId);
        if (!lessonPlan) {
          throw new Error('找不到指定的教案');
        }
        
        // 轉換為 ExtendedLearningContent 格式
        loadedContent = {
          topic: lessonPlan.topic,
          learningObjectives: lessonPlan.content.learningObjectives,
          contentBreakdown: lessonPlan.content.contentBreakdown,
          confusingPoints: lessonPlan.content.confusingPoints,
          classroomActivities: lessonPlan.content.classroomActivities,
          onlineInteractiveQuiz: lessonPlan.content.quiz,
          writingPractice: lessonPlan.content.writingPractice,
        };
      } else {
        throw new Error('缺少必要參數：contentId 或 binId');
      }

      setContent(loadedContent);
      
      // 初始化學習步驟
      initializeLearningSteps(loadedContent);
      
      // 初始化或載入學習會話
      await initializeLearningSession(loadedContent);

    } catch (err: any) {
      console.error('載入內容失敗:', err);
      setError(err.message || '載入內容時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const initializeLearningSteps = (content: ExtendedLearningContent) => {
    const steps: LearningStep[] = [];
    
    // 為每個學習目標創建獨立步驟
    if (content.learningObjectives && content.learningObjectives.length > 0) {
      content.learningObjectives.forEach((objective, index) => {
        steps.push({
          id: `objective_${index}`,
          title: `📚 學習目標 ${index + 1}`,
          type: 'objective',
          icon: '🎯',
          description: objective.objective.length > 50 
            ? `${objective.objective.substring(0, 50)}...` 
            : objective.objective,
          data: objective,
          index: index
        });
      });
    }
    
    // 為每個內容分解創建獨立步驟
    if (content.contentBreakdown && content.contentBreakdown.length > 0) {
      content.contentBreakdown.forEach((item, index) => {
        steps.push({
          id: `breakdown_${index}`,
          title: `🔍 深度學習 ${index + 1}`,
          type: 'breakdown',
          icon: '📖',
          description: item.topic.length > 50 
            ? `${item.topic.substring(0, 50)}...` 
            : item.topic,
          data: item,
          index: index
        });
      });
    }
    
    // 為每個易混淆點創建獨立步驟
    if (content.confusingPoints && content.confusingPoints.length > 0) {
      content.confusingPoints.forEach((item, index) => {
        steps.push({
          id: `confusing_${index}`,
          title: `⚡ 易混淆點 ${index + 1}`,
          type: 'confusing',
          icon: '💡',
          description: item.point.length > 50 
            ? `${item.point.substring(0, 50)}...` 
            : item.point,
          data: item,
          index: index
        });
      });
    }
    
    // 學習總結步驟
    steps.push({
      id: 'summary',
      title: '🎯 學習成果',
      type: 'summary',
      icon: '🏆',
      description: '完成學習並開始下一步挑戰'
    });
    
    setLearningSteps(steps);
  };

  const initializeLearningSession = async (content: ExtendedLearningContent) => {
    const sessionId = contentId || binId || 'unknown';
    const existingSessionKey = `interactive_learning_${sessionId}`;
    
    try {
      const existingSession = localStorage.getItem(existingSessionKey);
      
      if (existingSession) {
        // 載入現有會話
        const session: InteractiveLearningSession = JSON.parse(existingSession);
        setLearningSession(session);
      } else {
        // 創建新會話
        const newSession: InteractiveLearningSession = {
          contentId: sessionId,
          topic: content.topic || '互動學習',
          progress: {
            currentObjectiveIndex: 0,
            completedObjectives: [],
            timeSpent: 0,
            interactionCount: 0,
            startTime: Date.now(),
            lastUpdateTime: Date.now(),
            completedActivities: [],
          },
          interactions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        setLearningSession(newSession);
        localStorage.setItem(existingSessionKey, JSON.stringify(newSession));
      }
    } catch (err) {
      console.error('初始化學習會話失敗:', err);
      // 使用預設會話
      const defaultSession: InteractiveLearningSession = {
        contentId: sessionId,
        topic: content.topic || '互動學習',
        progress: {
          currentObjectiveIndex: 0,
          completedObjectives: [],
          timeSpent: 0,
          interactionCount: 0,
          startTime: Date.now(),
          lastUpdateTime: Date.now(),
          completedActivities: [],
        },
        interactions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setLearningSession(defaultSession);
    }
  };

  const updateLearningProgress = (updatedSession: InteractiveLearningSession) => {
    const sessionKey = `interactive_learning_${learningSession?.contentId}`;
    updatedSession.updatedAt = Date.now();
    updatedSession.progress.lastUpdateTime = Date.now();
    
    setLearningSession(updatedSession);
    localStorage.setItem(sessionKey, JSON.stringify(updatedSession));
  };

  // 步驟導航函數
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < learningSteps.length) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < learningSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">載入錯誤</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || !learningSession || learningSteps.length === 0) {
    return null;
  }

  const currentStep = learningSteps[currentStepIndex];

  // 渲染當前步驟內容
  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'objective':
        const objective = currentStep.data;
        const objectiveIndex = currentStep.index || 0;
        return (
          <div className="max-w-4xl mx-auto">
            {/* 大版面學習目標卡片 */}
            <div className="bg-gradient-to-br from-indigo-500 to-sky-500 rounded-3xl shadow-2xl p-12 text-white text-center mb-8">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-4xl font-bold mb-6 leading-tight">
                {objective.objective}
              </h3>
              {objective.description && (
                <p className="text-xl text-indigo-100 leading-relaxed max-w-3xl mx-auto">
                  {objective.description}
                </p>
              )}
            </div>

            {/* 詳細內容區域 */}
            {objective.teachingExample && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h4 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                  <span className="text-3xl mr-3">📝</span>
                  教學示例
                </h4>
                <div className="bg-green-50 rounded-xl p-6 text-lg leading-relaxed">
                  {objective.teachingExample}
                </div>
              </div>
            )}

            {/* 完成狀態和操作 */}
            <div className="text-center">
              {learningSession.progress.completedObjectives.includes(`objective_${objectiveIndex}`) ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="text-2xl font-bold text-green-700 mb-2">已完成理解</h4>
                  <p className="text-green-600">你已經掌握了這個學習目標！</p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8">
                  <h4 className="text-xl font-semibold text-slate-700 mb-4">
                    理解了這個學習目標嗎？
                  </h4>
                  <button
                    onClick={() => {
                      const objectiveId = `objective_${objectiveIndex}`;
                      const updatedSession = { ...learningSession };
                      if (!updatedSession.progress.completedObjectives.includes(objectiveId)) {
                        updatedSession.progress.completedObjectives.push(objectiveId);
                        updatedSession.progress.interactionCount += 1;
                        
                        // 更新當前學習目標索引
                        const nextIncompleteIndex = content.learningObjectives?.findIndex((_, idx) => 
                          !updatedSession.progress.completedObjectives.includes(`objective_${idx}`) && idx > objectiveIndex
                        );
                        
                        if (nextIncompleteIndex !== undefined && nextIncompleteIndex !== -1) {
                          updatedSession.progress.currentObjectiveIndex = nextIncompleteIndex;
                        }
                      }
                      updateLearningProgress(updatedSession);
                    }}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl transition-colors flex items-center gap-3 mx-auto"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    標記為已理解
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'breakdown':
        const breakdownItem = currentStep.data;
        return (
          <div className="max-w-5xl mx-auto">
            {/* 主題標題卡片 */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-500 rounded-3xl shadow-2xl p-12 text-white text-center mb-8">
              <div className="text-6xl mb-6">📖</div>
              <h3 className="text-4xl font-bold mb-6 leading-tight">
                {breakdownItem.topic}
              </h3>
            </div>

            {/* 詳細說明 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h4 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">📋</span>
                詳細說明
              </h4>
              <div className="text-lg leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-6">
                {breakdownItem.details}
              </div>
            </div>

            {/* 核心概念和教學示例 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {breakdownItem.coreConcept && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h4 className="text-2xl font-bold text-sky-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">💡</span>
                    核心概念
                  </h4>
                  <div className="bg-sky-50 rounded-xl p-6 text-lg leading-relaxed text-sky-900">
                    {breakdownItem.coreConcept}
                  </div>
                </div>
              )}
              
              {breakdownItem.teachingExample && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h4 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">📝</span>
                    教學示例
                  </h4>
                  <div className="bg-green-50 rounded-xl p-6 text-lg leading-relaxed text-green-900">
                    {breakdownItem.teachingExample}
                  </div>
                </div>
              )}
            </div>
            
            {/* 重點句型 */}
            {breakdownItem.teachingSentences && breakdownItem.teachingSentences.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h4 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🎯</span>
                  重點句型
                </h4>
                <div className="bg-indigo-50 rounded-xl p-6">
                  <div className="space-y-4">
                    {breakdownItem.teachingSentences.map((sentence, sentenceIndex) => (
                      <div key={sentenceIndex} className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                          {sentenceIndex + 1}
                        </span>
                        <p className="text-lg text-indigo-900 leading-relaxed">
                          {sentence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 教學提示 */}
            {breakdownItem.teachingTips && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 mt-8">
                <h4 className="text-xl font-bold text-amber-700 mb-4 flex items-center">
                  <span className="text-2xl mr-3">💡</span>
                  教學提示
                </h4>
                <p className="text-lg text-amber-800 leading-relaxed">
                  {breakdownItem.teachingTips}
                </p>
              </div>
            )}
          </div>
        );

      case 'confusing':
        const confusingItem = currentStep.data;
        return (
          <div className="max-w-5xl mx-auto">
            {/* 易混淆點標題卡片 */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl shadow-2xl p-12 text-white text-center mb-8">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-4xl font-bold mb-6 leading-tight">
                {confusingItem.point}
              </h3>
              <p className="text-xl text-amber-100 leading-relaxed max-w-3xl mx-auto">
                避免常見錯誤，掌握正確用法
              </p>
            </div>

            {/* 解釋說明 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h4 className="text-2xl font-bold text-amber-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">📝</span>
                詳細解釋
              </h4>
              <div className="text-lg leading-relaxed text-slate-700 bg-amber-50 rounded-xl p-6">
                {confusingItem.clarification}
              </div>
            </div>

            {/* 錯誤類型 */}
            {confusingItem.errorType && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h4 className="text-2xl font-bold text-orange-700 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🎯</span>
                  錯誤類型
                </h4>
                <div className="bg-orange-50 rounded-xl p-6 text-lg leading-relaxed text-orange-900">
                  {confusingItem.errorType}
                </div>
              </div>
            )}

            {/* 正確 vs 錯誤對比 */}
            {confusingItem.correctVsWrong && confusingItem.correctVsWrong.length > 0 && (
              <div className="space-y-8 mb-8">
                {confusingItem.correctVsWrong.map((comparison, compIndex) => (
                  <div key={compIndex} className="bg-white rounded-2xl shadow-xl p-8">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 text-center">
                      對比例子 {compIndex + 1}
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* 正確用法 */}
                      <div className="bg-green-50 border-3 border-green-300 rounded-2xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                            ✓
                          </div>
                          <h5 className="text-xl font-bold text-green-700">正確用法</h5>
                        </div>
                        <p className="text-xl font-semibold text-green-900 bg-white rounded-lg p-4">
                          {comparison.correct}
                        </p>
                      </div>

                      {/* 錯誤用法 */}
                      <div className="bg-red-50 border-3 border-red-300 rounded-2xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                            ✗
                          </div>
                          <h5 className="text-xl font-bold text-red-700">錯誤用法</h5>
                        </div>
                        <p className="text-xl font-semibold text-red-900 bg-white rounded-lg p-4">
                          {comparison.wrong}
                        </p>
                      </div>
                    </div>

                    {/* 說明 */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <h5 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                        <span className="text-xl mr-2">💡</span>
                        詳細說明
                      </h5>
                      <p className="text-lg text-blue-900 leading-relaxed">
                        {comparison.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 常見錯誤 */}
            {confusingItem.commonErrors && confusingItem.commonErrors.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h4 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
                  <span className="text-3xl mr-3">⚠️</span>
                  常見錯誤
                </h4>
                <div className="bg-red-50 rounded-xl p-6">
                  <div className="space-y-3">
                    {confusingItem.commonErrors.map((error, errorIndex) => (
                      <div key={errorIndex} className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                          {errorIndex + 1}
                        </span>
                        <p className="text-lg text-red-900 leading-relaxed">
                          {error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 預防策略和糾正方法 */}
            <div className="grid md:grid-cols-2 gap-8">
              {confusingItem.preventionStrategy && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h4 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🛡️</span>
                    預防策略
                  </h4>
                  <div className="bg-purple-50 rounded-xl p-6 text-lg leading-relaxed text-purple-900">
                    {confusingItem.preventionStrategy}
                  </div>
                </div>
              )}

              {confusingItem.correctionMethod && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h4 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🔧</span>
                    糾正方法
                  </h4>
                  <div className="bg-indigo-50 rounded-xl p-6 text-lg leading-relaxed text-indigo-900">
                    {confusingItem.correctionMethod}
                  </div>
                </div>
              )}
            </div>

            {/* 練習建議 */}
            {confusingItem.practiceActivities && confusingItem.practiceActivities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
                <h4 className="text-2xl font-bold text-cyan-700 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🏃‍♂️</span>
                  練習建議
                </h4>
                <div className="bg-cyan-50 rounded-xl p-6">
                  <div className="space-y-4">
                    {confusingItem.practiceActivities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                          {activityIndex + 1}
                        </span>
                        <p className="text-lg text-cyan-900 leading-relaxed">
                          {activity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'summary':
        return (
          <div className="text-center space-y-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-12">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-3xl font-bold text-green-700 mb-4">恭喜完成學習！</h3>
              <p className="text-lg text-slate-600 mb-8">
                你已經完成了「{content.topic}」的互動學習
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-3xl text-indigo-600 mb-2">📚</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {learningSession.progress.completedObjectives.length}
                  </div>
                  <div className="text-sm text-slate-600">學習目標完成</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-3xl text-sky-600 mb-2">⏱️</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {Math.round((Date.now() - learningSession.progress.startTime) / 60000)}
                  </div>
                  <div className="text-sm text-slate-600">分鐘學習時間</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-3xl text-green-600 mb-2">🎯</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {learningSession.progress.interactionCount}
                  </div>
                  <div className="text-sm text-slate-600">互動次數</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8">
              <h4 className="text-2xl font-semibold text-purple-700 mb-6">
                🚀 繼續你的學習旅程
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {content.onlineInteractiveQuiz && (
                  <a
                    href={binId 
                      ? `${import.meta.env.BASE_URL}quiz?binId=${binId}`
                      : `${import.meta.env.BASE_URL}quiz?contentId=${contentId}`
                    }
                    className="px-8 py-4 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-3 text-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    挑戰互動測驗
                  </a>
                )}
                
                {content.writingPractice && (
                  <a
                    href={binId 
                      ? `${import.meta.env.BASE_URL}writing?binId=${binId}`
                      : `${import.meta.env.BASE_URL}writing?contentId=${contentId}`
                    }
                    className="px-8 py-4 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-3 text-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    練習寫作技能
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>未知步驟類型</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100">
      {/* 固定頂部導航 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* 頭部資訊 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {content.topic}
              </h1>
              <p className="text-sm text-slate-600">
                互動學習 • 第 {currentStepIndex + 1} 步，共 {learningSteps.length} 步
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {Math.round((Date.now() - learningSession.progress.startTime) / 60000)} 分鐘
            </div>
          </div>

          {/* 步驟進度條 - 簡化版本適應更多步驟 */}
          <div className="space-y-3">
            {/* 進度條 */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-sky-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStepIndex + 1) / learningSteps.length) * 100}%` }}
              />
            </div>
            
            {/* 步驟類型快速導航 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {learningSteps.map((step, index) => {
                const isObjective = step.type === 'objective';
                const isBreakdown = step.type === 'breakdown';
                const isConfusing = step.type === 'confusing';
                const isSummary = step.type === 'summary';
                
                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold transition-all duration-200
                      ${index === currentStepIndex 
                        ? 'bg-indigo-500 text-white shadow-lg scale-110' 
                        : index < currentStepIndex 
                        ? 'bg-green-400 text-white hover:bg-green-500' 
                        : 'bg-slate-300 text-slate-600 hover:bg-slate-400'
                      }
                    `}
                    title={step.title}
                  >
                    {isObjective ? (step.index || 0) + 1 : 
                     isBreakdown ? '📖' : 
                     isConfusing ? '⚡' : 
                     isSummary ? '🏆' : 
                     index + 1}
                  </button>
                );
              })}
            </div>
            
            {/* 當前步驟資訊 */}
            <div className="text-center">
              <span className="text-xs text-slate-500">
                {currentStep.type === 'objective' && '📚 學習目標'}
                {currentStep.type === 'breakdown' && '🔍 深度學習'}
                {currentStep.type === 'confusing' && '⚡ 易混淆點'}
                {currentStep.type === 'summary' && '🎯 學習成果'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 當前步驟標題 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{currentStep.icon}</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{currentStep.title}</h2>
          <p className="text-lg text-slate-600">{currentStep.description}</p>
        </div>

        {/* 步驟內容 */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* 底部導航 */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-500 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            上一步
          </button>
          
          <div className="text-center">
            <p className="text-sm text-slate-600">
              {currentStepIndex + 1} / {learningSteps.length}
            </p>
          </div>

          <button
            onClick={nextStep}
            disabled={currentStepIndex === learningSteps.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLearningPage;