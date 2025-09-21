import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExtendedLearningContent, InteractiveLearningSession } from '../../types';
import { getLearningContent } from '../../services/jsonbinService';
import { lessonPlanStorage } from '../../services/lessonPlanStorage';
import { transformLearningObjectiveForStudent, transformContentBreakdownForStudent, transformConfusingPointForStudent } from '../../services/geminiServiceAdapter';
import LoadingSpinner from '../LoadingSpinner';
import MarkdownRenderer from '../MarkdownRenderer';

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
  const [transformedContent, setTransformedContent] = useState<{ [key: string]: any }>({});
  const [transforming, setTransforming] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
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
    loadContent();
  }, [contentId, binId]);

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

  // 獲取 API 金鑰
  const getApiKey = () => {
    return localStorage.getItem('gemini_api_key') || '';
  };

  // 轉換內容為學生友好格式
  const transformStepContent = async (step: LearningStep) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn('未設定 API 金鑰，無法進行內容轉換');
      return null;
    }

    const transformKey = `${step.type}_${step.index || 0}`;

    if (transformedContent[transformKey] || transforming[transformKey]) {
      return transformedContent[transformKey] || null;
    }

    try {
      setTransforming(prev => ({ ...prev, [transformKey]: true }));

      let transformedData = null;

      switch (step.type) {
        case 'objective':
          transformedData = await transformLearningObjectiveForStudent(step.data);
          break;
        case 'breakdown':
          transformedData = await transformContentBreakdownForStudent(step.data);
          break;
        case 'confusing':
          transformedData = await transformConfusingPointForStudent(step.data);
          break;
        default:
          return null;
      }

      setTransformedContent(prev => ({ ...prev, [transformKey]: transformedData }));
      return transformedData;

    } catch (error) {
      console.error('內容轉換失敗:', error);
      return null;
    } finally {
      setTransforming(prev => ({ ...prev, [transformKey]: false }));
    }
  };

  // 檢查步驟是否已轉換
  const isStepTransformed = (step: LearningStep) => {
    const transformKey = `${step.type}_${step.index || 0}`;
    return !!transformedContent[transformKey];
  };

  // 檢查步驟是否正在轉換
  const isStepTransforming = (step: LearningStep) => {
    const transformKey = `${step.type}_${step.index || 0}`;
    return !!transforming[transformKey];
  };

  // 獲取步驟的轉換內容
  const getTransformedStepContent = (step: LearningStep) => {
    const transformKey = `${step.type}_${step.index || 0}`;
    return transformedContent[transformKey] || null;
  };

  // 檢測文字是否包含 Markdown 格式
  const containsMarkdown = (text: string): boolean => {
    if (!text) return false;

    // 檢測常見的 Markdown 語法
    const markdownPatterns = [
      /#+\s/,           // 標題 (# ## ###)
      /\*\*.*\*\*/,     // 粗體 (**text**)
      /\*.*\*/,         // 斜體 (*text*)
      /`.*`/,           // 程式碼 (`code`)
      /^\s*[-*+]\s/m,   // 清單項目
      /^\s*\d+\.\s/m,   // 數字清單
      /\[.*\]\(.*\)/,   // 連結 [text](url)
      /^\s*>/m,         // 引用 (>)
      /```[\s\S]*?```/, // 程式碼區塊
      /\n\s*\n/,        // 多個換行（段落分隔）
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  };

  // 智能文字渲染器 - 自動判斷是否使用 Markdown
  const renderText = (text: string, className?: string) => {
    if (containsMarkdown(text)) {
      return <MarkdownRenderer content={text} className={className} />;
    }
    return <span className={className}>{text}</span>;
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
    const transformedData = getTransformedStepContent(currentStep);
    const isTransformed = isStepTransformed(currentStep);
    const isTransforming = isStepTransforming(currentStep);
    const hasApiKey = !!getApiKey();

    switch (currentStep.type) {
      case 'objective':
        {
          const objective = currentStep.data;
          const objectiveIndex = currentStep.index || 0;

          // 使用轉換後的內容（如果存在）
          const displayObjective = transformedData || objective;

          return (
            <div className="max-w-4xl mx-auto">
              {/* 內容轉換控制區 */}
              {hasApiKey && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🔄</div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {isTransformed ? '已轉換為學生友好內容' : '轉換為學生友好內容'}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {isTransformed
                            ? '內容已轉換為更適合學生學習的語言和格式'
                            : '將教師導向的教案內容轉換為學生容易理解的學習材料'
                          }
                        </p>
                      </div>
                    </div>

                    {!isTransformed && (
                      <button
                        onClick={() => transformStepContent(currentStep)}
                        disabled={isTransforming}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isTransforming ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            轉換中...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            開始轉換
                          </>
                        )}
                      </button>
                    )}

                    {isTransformed && (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        轉換完成
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 大版面學習目標卡片 */}
              <div className="bg-gradient-to-br from-indigo-500 to-sky-500 rounded-3xl shadow-2xl p-12 text-white text-center mb-8">
                <div className="text-6xl mb-6">🎯</div>
                <div className="text-4xl font-bold mb-6 leading-tight">
                  {renderText(displayObjective.objective, "text-4xl font-bold leading-tight")}
                </div>
                {displayObjective.description && (
                  <div className="text-xl text-indigo-100 leading-relaxed max-w-3xl mx-auto">
                    {renderText(displayObjective.description, "text-xl text-indigo-100 leading-relaxed")}
                  </div>
                )}
              </div>

              {/* 詳細內容區域 */}
              {isTransformed && transformedData ? (
                <div className="space-y-8 mb-8">
                  {/* 個人相關性 */}
                  {transformedData.personalRelevance && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">🌟</span>
                        對你的意義
                      </h4>
                      <div className="bg-purple-50 rounded-xl p-6 text-lg leading-relaxed text-purple-900">
                        {renderText(transformedData.personalRelevance, "text-lg leading-relaxed text-purple-900")}
                      </div>
                    </div>
                  )}

                  {/* 學習範例 */}
                  {transformedData.teachingExample && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">📝</span>
                        實際應用
                      </h4>
                      <div className="bg-green-50 rounded-xl p-6 text-lg leading-relaxed text-green-900">
                        {renderText(transformedData.teachingExample, "text-lg leading-relaxed text-green-900")}
                      </div>
                    </div>
                  )}

                  {/* 鼓勵話語 */}
                  {transformedData.encouragement && (
                    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-8">
                      <h4 className="text-2xl font-bold text-sky-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">💪</span>
                        給你的鼓勵
                      </h4>
                      <div className="text-lg leading-relaxed text-sky-900 font-medium">
                        {renderText(transformedData.encouragement, "text-lg leading-relaxed text-sky-900 font-medium")}
                      </div>
                    </div>
                  )}
                </div>
              ) : displayObjective.teachingExample && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">📝</span>
                    教學示例
                  </h4>
                  <div className="bg-green-50 rounded-xl p-6 text-lg leading-relaxed">
                    {renderText(displayObjective.teachingExample, "text-lg leading-relaxed")}
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
        }
      case 'breakdown':
        {
          const breakdownItem = currentStep.data;

          return (
            <div className="max-w-5xl mx-auto">
              {/* 內容轉換控制區 */}
              {hasApiKey && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🔄</div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {isTransformed ? '已轉換為學生友好內容' : '轉換為學生友好內容'}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {isTransformed
                            ? '內容已轉換為更適合學生學習的語言和格式'
                            : '將教師導向的教案內容轉換為學生容易理解的學習材料'
                          }
                        </p>
                      </div>
                    </div>

                    {!isTransformed && (
                      <button
                        onClick={() => transformStepContent(currentStep)}
                        disabled={isTransforming}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isTransforming ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            轉換中...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            開始轉換
                          </>
                        )}
                      </button>
                    )}

                    {isTransformed && (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        轉換完成
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 主題標題卡片 */}
              <div className="bg-gradient-to-br from-sky-500 to-blue-500 rounded-3xl shadow-2xl p-12 text-white text-center mb-8">
                <div className="text-6xl mb-6">📖</div>
                <div className="text-4xl font-bold mb-6 leading-tight">
                  {isTransformed && transformedData?.title
                    ? renderText(transformedData.title, "text-4xl font-bold leading-tight")
                    : renderText(breakdownItem.topic, "text-4xl font-bold leading-tight")
                  }
                </div>
                {isTransformed && transformedData?.introduction && (
                  <div className="text-xl text-sky-100 leading-relaxed max-w-3xl mx-auto">
                    {renderText(transformedData.introduction, "text-xl text-sky-100 leading-relaxed")}
                  </div>
                )}
              </div>

              {/* 學習內容 */}
              {isTransformed && transformedData ? (
                <div className="space-y-8 mb-8">
                  {/* 重點概念 */}
                  {transformedData.keyPoints && transformedData.keyPoints.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">💡</span>
                        重點概念
                      </h4>
                      <div className="bg-indigo-50 rounded-xl p-6">
                        <div className="space-y-4">
                          {transformedData.keyPoints.map((point: string, pointIndex: number) => (
                            <div key={pointIndex} className="flex items-start">
                              <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                                {pointIndex + 1}
                              </span>
                              <div className="text-lg text-indigo-900 leading-relaxed">
                                {renderText(point, "text-lg text-indigo-900 leading-relaxed")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 生活中的例子 */}
                  {transformedData.realLifeExamples && transformedData.realLifeExamples.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">🌟</span>
                        生活中的例子
                      </h4>
                      <div className="bg-green-50 rounded-xl p-6">
                        <div className="space-y-4">
                          {transformedData.realLifeExamples.map((example: string, exampleIndex: number) => (
                            <div key={exampleIndex} className="flex items-start">
                              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                                {exampleIndex + 1}
                              </span>
                              <div className="text-lg text-green-900 leading-relaxed">
                                {renderText(example, "text-lg text-green-900 leading-relaxed")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 學習技巧 */}
                  {transformedData.learningTips && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">🎯</span>
                        學習技巧
                      </h4>
                      <div className="bg-purple-50 rounded-xl p-6 text-lg leading-relaxed text-purple-900">
                        {renderText(transformedData.learningTips, "text-lg leading-relaxed text-purple-900")}
                      </div>
                    </div>
                  )}

                  {/* 下一步探索 */}
                  {transformedData.nextSteps && (
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8">
                      <h4 className="text-2xl font-bold text-cyan-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">🚀</span>
                        下一步探索
                      </h4>
                      <div className="text-lg leading-relaxed text-cyan-900">
                        {renderText(transformedData.nextSteps, "text-lg leading-relaxed text-cyan-900")}
                      </div>
                    </div>
                  )}

                  {/* 鼓勵話語 */}
                  {transformedData.encouragement && (
                    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-8">
                      <h4 className="text-2xl font-bold text-sky-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">💪</span>
                        給你的鼓勵
                      </h4>
                      <div className="text-lg leading-relaxed text-sky-900 font-medium">
                        {transformedData.encouragement}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                    <span className="text-3xl mr-3">📋</span>
                    詳細說明
                  </h4>
                  <div className="text-lg leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-6">
                    {renderText(breakdownItem.details, "text-lg leading-relaxed text-slate-700")}
                  </div>
                </div>
              )}

              {/* 原始內容（僅在未轉換時顯示）*/}
              {!isTransformed && (
                <>
                  {/* 核心概念和教學示例 */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {breakdownItem.coreConcept && (
                      <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h4 className="text-2xl font-bold text-sky-700 mb-6 flex items-center">
                          <span className="text-3xl mr-3">💡</span>
                          核心概念
                        </h4>
                        <div className="bg-sky-50 rounded-xl p-6 text-lg leading-relaxed text-sky-900">
                          {renderText(breakdownItem.coreConcept, "text-lg leading-relaxed text-sky-900")}
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
                          {renderText(breakdownItem.teachingExample, "text-lg leading-relaxed text-green-900")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 重點句型 */}
                  {breakdownItem.teachingSentences && breakdownItem.teachingSentences.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                      <h4 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">🎯</span>
                        重點句型
                      </h4>
                      <div className="bg-indigo-50 rounded-xl p-6">
                        <div className="space-y-4">
                          {breakdownItem.teachingSentences.map((sentence: string, sentenceIndex: number) => (
                            <div key={sentenceIndex} className="flex items-start">
                              <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                                {sentenceIndex + 1}
                              </span>
                              <div className="text-lg text-indigo-900 leading-relaxed">
                                {renderText(sentence, "text-lg text-indigo-900 leading-relaxed")}
                              </div>
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
                      <div className="text-lg text-amber-800 leading-relaxed">
                        {renderText(breakdownItem.teachingTips, "text-lg text-amber-800 leading-relaxed")}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        }
      case 'confusing':
        {
          const confusingItem = currentStep.data;

          return (
            <div className="max-w-5xl mx-auto">
              {/* 內容轉換控制區 */}
              {hasApiKey && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🔄</div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {isTransformed ? '已轉換為學生友好內容' : '轉換為學生友好內容'}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {isTransformed
                            ? '內容已轉換為更適合學生學習的語言和格式'
                            : '將教師導向的教案內容轉換為學生容易理解的學習材料'
                          }
                        </p>
                      </div>
                    </div>

                    {!isTransformed && (
                      <button
                        onClick={() => transformStepContent(currentStep)}
                        disabled={isTransforming}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isTransforming ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            轉換中...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            開始轉換
                          </>
                        )}
                      </button>
                    )}

                    {isTransformed && (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        轉換完成
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 易混淆點標題卡片 */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl shadow-2xl p-12 text-white text-center mb-8">
                <div className="text-6xl mb-6">⚡</div>
                <div className="text-4xl font-bold mb-6 leading-tight">
                  {isTransformed && transformedData?.title
                    ? renderText(transformedData.title, "text-4xl font-bold leading-tight")
                    : renderText(confusingItem.point, "text-4xl font-bold leading-tight")
                  }
                </div>
                <p className="text-xl text-amber-100 leading-relaxed max-w-3xl mx-auto">
                  {isTransformed && transformedData?.normalizeConfusion
                    ? transformedData.normalizeConfusion
                    : '避免常見錯誤，掌握正確用法'
                  }
                </p>
              </div>

              {/* 學習內容 */}
              {isTransformed && transformedData ? (
                <div className="space-y-8 mb-8">
                  {/* 為什麼會混淆 */}
                  {transformedData.whyItHappens && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-amber-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">🤔</span>
                        為什麼會有這種混淆？
                      </h4>
                      <div className="bg-amber-50 rounded-xl p-6 text-lg leading-relaxed text-amber-900">
                        {renderText(transformedData.whyItHappens, "text-lg leading-relaxed text-amber-900")}
                      </div>
                    </div>
                  )}

                  {/* 清楚解釋 */}
                  {transformedData.clearExplanation && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">✨</span>
                        正確理解
                      </h4>
                      <div className="bg-green-50 rounded-xl p-6 text-lg leading-relaxed text-green-900">
                        {renderText(transformedData.clearExplanation, "text-lg leading-relaxed text-green-900")}
                      </div>
                    </div>
                  )}

                  {/* 記憶技巧 */}
                  {transformedData.rememberingTricks && transformedData.rememberingTricks.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h4 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">💡</span>
                        記憶小技巧
                      </h4>
                      <div className="bg-purple-50 rounded-xl p-6">
                        <div className="space-y-4">
                          {transformedData.rememberingTricks.map((trick:string, trickIndex:number) => (
                            <div key={trickIndex} className="flex items-start">
                              <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                                {trickIndex + 1}
                              </span>
                              <div className="text-lg text-purple-900 leading-relaxed">
                                {renderText(trick, "text-lg text-purple-900 leading-relaxed")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 練習例子 */}
                  {transformedData.practiceExamples && transformedData.practiceExamples.length > 0 && (
                    <div className="space-y-6">
                      {transformedData.practiceExamples.map((example:Record<string,string>, exampleIndex:number) => (
                        <div key={exampleIndex} className="bg-white rounded-2xl shadow-xl p-8">
                          <h4 className="text-xl font-bold text-slate-800 mb-6 text-center">
                            練習情境 {exampleIndex + 1}
                          </h4>

                          <div className="bg-slate-50 rounded-xl p-6 mb-6">
                            <h5 className="text-lg font-bold text-slate-700 mb-3">情境：</h5>
                            <div className="text-lg text-slate-800">{renderText(example.situation, "text-lg text-slate-800")}</div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-red-50 border-3 border-red-300 rounded-2xl p-6">
                              <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                                  ✗
                                </div>
                                <h5 className="text-xl font-bold text-red-700">錯誤想法</h5>
                              </div>
                              <div className="text-lg text-red-900 bg-white rounded-lg p-4">
                                {renderText(example.wrongThinking, "text-lg text-red-900")}
                              </div>
                            </div>

                            <div className="bg-green-50 border-3 border-green-300 rounded-2xl p-6">
                              <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                                  ✓
                                </div>
                                <h5 className="text-xl font-bold text-green-700">正確想法</h5>
                              </div>
                              <div className="text-lg text-green-900 bg-white rounded-lg p-4">
                                {renderText(example.rightThinking, "text-lg text-green-900")}
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                            <h5 className="text-lg font-bold text-blue-700 mb-3">解釋：</h5>
                            <div className="text-lg text-blue-900 leading-relaxed">
                              {renderText(example.explanation, "text-lg text-blue-900 leading-relaxed")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 信心提升 */}
                  {transformedData.confidenceBooster && (
                    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-8">
                      <h4 className="text-2xl font-bold text-sky-700 mb-6 flex items-center">
                        <span className="text-3xl mr-3">💪</span>
                        給你的鼓勵
                      </h4>
                      <div className="text-lg leading-relaxed text-sky-900 font-medium">
                        {renderText(transformedData.confidenceBooster, "text-lg leading-relaxed text-sky-900 font-medium")}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold text-amber-800 mb-6 flex items-center">
                    <span className="text-3xl mr-3">📝</span>
                    詳細解釋
                  </h4>
                  <div className="text-lg leading-relaxed text-slate-700 bg-amber-50 rounded-xl p-6">
                    {renderText(confusingItem.clarification, "text-lg leading-relaxed text-slate-700")}
                  </div>
                </div>
              )}

              {/* 錯誤類型 */}
              {confusingItem.errorType && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold text-orange-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🎯</span>
                    錯誤類型
                  </h4>
                  <div className="bg-orange-50 rounded-xl p-6 text-lg leading-relaxed text-orange-900">
                    {renderText(confusingItem.errorType, "text-lg leading-relaxed text-orange-900")}
                  </div>
                </div>
              )}

              {/* 正確 vs 錯誤對比 */}
              {confusingItem.correctVsWrong && confusingItem.correctVsWrong.length > 0 && (
                <div className="space-y-8 mb-8">
                  {confusingItem.correctVsWrong.map((comparison:Record<string,string>, compIndex:number) => (
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
                          <div className="text-xl font-semibold text-green-900 bg-white rounded-lg p-4">
                            {renderText(comparison.correct, "text-xl font-semibold text-green-900")}
                          </div>
                        </div>

                        {/* 錯誤用法 */}
                        <div className="bg-red-50 border-3 border-red-300 rounded-2xl p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                              ✗
                            </div>
                            <h5 className="text-xl font-bold text-red-700">錯誤用法</h5>
                          </div>
                          <div className="text-xl font-semibold text-red-900 bg-white rounded-lg p-4">
                            {renderText(comparison.wrong, "text-xl font-semibold text-red-900")}
                          </div>
                        </div>
                      </div>

                      {/* 說明 */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                        <h5 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                          <span className="text-xl mr-2">💡</span>
                          詳細說明
                        </h5>
                        <div className="text-lg text-blue-900 leading-relaxed">
                          {renderText(comparison.explanation, "text-lg text-blue-900 leading-relaxed")}
                        </div>
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
                      {confusingItem.commonErrors.map((error:string, errorIndex:number) => (
                        <div key={errorIndex} className="flex items-start">
                          <span className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                            {errorIndex + 1}
                          </span>
                          <div className="text-lg text-red-900 leading-relaxed">
                            {renderText(error, "text-lg text-red-900 leading-relaxed")}
                          </div>
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
                      {renderText(confusingItem.preventionStrategy, "text-lg leading-relaxed text-purple-900")}
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
                      {renderText(confusingItem.correctionMethod, "text-lg leading-relaxed text-indigo-900")}
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
                      {confusingItem.practiceActivities.map((activity:string, activityIndex:number) => (
                        <div key={activityIndex} className="flex items-start">
                          <span className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                            {activityIndex + 1}
                          </span>
                          <div className="text-lg text-cyan-900 leading-relaxed">
                            {renderText(activity, "text-lg text-cyan-900 leading-relaxed")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
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
          <div className="text-lg text-slate-600">{renderText(currentStep.description, "text-lg text-slate-600")}</div>
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
