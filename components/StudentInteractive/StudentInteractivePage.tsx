import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExtendedLearningContent, InteractiveLearningSession } from '../../types';
import { getLearningContent } from '../../services/jsonbinService';
import LoadingSpinner from '../LoadingSpinner';
import MarkdownRenderer from '../MarkdownRenderer';

// 定義學習步驟類型
type StudentLearningStep = {
  id: string;
  title: string;
  type: 'objective' | 'breakdown' | 'confusing' | 'summary';
  icon: string;
  description: string;
  content: any; // 已轉換的學生友好內容
  originalIndex?: number;
};

const StudentInteractivePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const binId = searchParams.get('binId');
  
  const [content, setContent] = useState<ExtendedLearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningSession, setLearningSession] = useState<InteractiveLearningSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [learningSteps, setLearningSteps] = useState<StudentLearningStep[]>([]);

  useEffect(() => {
    if (binId) {
      loadInteractiveContent();
    } else {
      setError('缺少必要參數：binId');
      setLoading(false);
    }
  }, [binId]);

  // 當學習步驟設置完成後初始化學習會話
  useEffect(() => {
    if (content && learningSteps.length > 0) {
      initializeLearningSession(content);
    }
  }, [content, learningSteps, binId]);

  const loadInteractiveContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedContent = await getLearningContent(binId!);
      
      // 檢查是否為互動內容
      if (!loadedContent.isInteractive) {
        throw new Error('此內容尚未準備為互動教材');
      }

      setContent(loadedContent);
      initializeLearningSteps(loadedContent);

    } catch (err: any) {
      console.error('載入互動內容失敗:', err);
      setError(err.message || '載入互動內容時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const initializeLearningSteps = (content: ExtendedLearningContent) => {
    const steps: StudentLearningStep[] = [];
    const transformedData = content.transformedData || {};
    
    console.log('Initial content:', content);
    console.log('Transformed data keys:', Object.keys(transformedData));
    console.log('Transformed data:', transformedData);
    
    // 檢查是否有 originalContent 來幫助映射
    if (content.originalContent) {
      console.log('Original content from JSON:', content.originalContent);
    }
    
    // 直接根據轉換數據的鍵來創建步驟
    const sortedStepIds = Object.keys(transformedData).sort((a, b) => {
      const aNum = parseInt(a.replace('step_', ''));
      const bNum = parseInt(b.replace('step_', ''));
      return aNum - bNum;
    });
    
    console.log('Sorted step IDs:', sortedStepIds);
    
    // 直接使用 includedSteps 來建立正確的映射關係
    const includedSteps = content.includedSteps || Object.keys(transformedData);
    console.log('Included steps:', includedSteps);
    
    // 建立原始內容的查找表
    const originalLookup: {[key: string]: {content: any, type: string, index: number}} = {};
    
    // 如果有 originalContent，使用它來建立映射
    if (content.originalContent) {
      console.log('Using originalContent from JSON for mapping');
      
      // originalContent 應該是一個物件，每個 stepId 對應一個原始內容
      Object.keys(content.originalContent).forEach((stepId) => {
        const originalItem = content.originalContent[stepId];
        if (originalItem && includedSteps.includes(stepId)) {
          originalLookup[stepId] = {
            content: originalItem.content,
            type: originalItem.type,
            index: originalItem.index || 0
          };
        }
      });
    } else {
      // 備用方案：重新建立所有原始內容的完整列表
      console.log('Using fallback method to build original content mapping');
      
      const allOriginalContent: {content: any, type: string, typeIndex: number}[] = [];
      
      // 學習目標
      if (content.learningObjectives) {
        content.learningObjectives.forEach((obj, index) => {
          allOriginalContent.push({ content: obj, type: 'objective', typeIndex: index });
        });
      }
      
      // 深度學習
      if (content.contentBreakdown) {
        content.contentBreakdown.forEach((item, index) => {
          allOriginalContent.push({ content: item, type: 'breakdown', typeIndex: index });
        });
      }
      
      // 易混淆點
      if (content.confusingPoints) {
        content.confusingPoints.forEach((item, index) => {
          allOriginalContent.push({ content: item, type: 'confusing', typeIndex: index });
        });
      }
      
      console.log('All original content (fallback):', allOriginalContent);
      
      // 根據 includedSteps 的順序建立查找表
      // 由於只收到了部分原始內容，我們按照 includedSteps 的順序來映射
      includedSteps.forEach((stepId, arrayIndex) => {
        if (arrayIndex < allOriginalContent.length) {
          const originalItem = allOriginalContent[arrayIndex];
          originalLookup[stepId] = {
            content: originalItem.content,
            type: originalItem.type,
            index: originalItem.typeIndex
          };
          console.log(`Mapping ${stepId} to original content at index ${arrayIndex}:`, originalItem);
        }
      });
    }
    
    console.log('Original lookup:', originalLookup);
    
    // 根據轉換數據創建步驟
    sortedStepIds.forEach((stepId) => {
      const transformedContent = transformedData[stepId];
      const original = originalLookup[stepId];
      
      if (transformedContent && original) {
        let title = '';
        let icon = '';
        let description = '';
        
        switch (original.type) {
          case 'objective':
            title = `📚 學習目標 ${original.index + 1}`;
            icon = '🎯';
            description = transformedContent.objective?.length > 50 
              ? `${transformedContent.objective.substring(0, 50)}...` 
              : transformedContent.objective || original.content.objective;
            break;
          case 'breakdown':
            title = `🔍 深度學習 ${original.index + 1}`;
            icon = '📖';
            description = transformedContent.title?.length > 50 
              ? `${transformedContent.title.substring(0, 50)}...` 
              : transformedContent.title || original.content.topic;
            break;
          case 'confusing':
            title = `⚡ 重要提醒 ${original.index + 1}`;
            icon = '💡';
            description = transformedContent.title?.length > 50 
              ? `${transformedContent.title.substring(0, 50)}...` 
              : transformedContent.title || original.content.point;
            break;
        }
        
        console.log(`Creating step: ${stepId}, type: ${original.type}, title: ${title}`);
        
        steps.push({
          id: stepId,
          title: title,
          type: original.type as 'objective' | 'breakdown' | 'confusing',
          icon: icon,
          description: description,
          content: transformedContent,
          originalIndex: original.index
        });
      }
    });
    
    // 學習總結步驟
    if (steps.length > 0) {
      steps.push({
        id: 'summary',
        title: '🎯 學習完成',
        type: 'summary',
        icon: '🏆',
        description: '恭喜完成學習，開始實踐應用！',
        content: null
      });
    }
    
    console.log('Final steps:', steps);
    setLearningSteps(steps);
  };

  const initializeLearningSession = (content: ExtendedLearningContent) => {
    const sessionKey = `student_interactive_${binId}`;
    
    try {
      const existingSession = localStorage.getItem(sessionKey);
      
      if (existingSession) {
        const session: InteractiveLearningSession = JSON.parse(existingSession);
        setLearningSession(session);
        // 恢復學習進度，確保索引有效
        const savedIndex = session.progress.currentObjectiveIndex || 0;
        const validIndex = Math.min(Math.max(0, savedIndex), learningSteps.length - 1);
        setCurrentStepIndex(validIndex);
      } else {
        const newSession: InteractiveLearningSession = {
          contentId: binId || 'unknown',
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
        localStorage.setItem(sessionKey, JSON.stringify(newSession));
      }
    } catch (err) {
      console.error('初始化學習會話失敗:', err);
    }
  };

  const updateLearningProgress = (updatedSession: InteractiveLearningSession) => {
    const sessionKey = `student_interactive_${binId}`;
    updatedSession.updatedAt = Date.now();
    updatedSession.progress.lastUpdateTime = Date.now();
    
    setLearningSession(updatedSession);
    localStorage.setItem(sessionKey, JSON.stringify(updatedSession));
  };

  // 標記步驟完成
  const markStepCompleted = (stepId: string) => {
    if (!learningSession) return;

    const updatedSession = { ...learningSession };
    if (!updatedSession.progress.completedObjectives.includes(stepId)) {
      updatedSession.progress.completedObjectives.push(stepId);
      updatedSession.progress.interactionCount += 1;
    }
    updateLearningProgress(updatedSession);
  };

  // 導航函數
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < learningSteps.length && learningSteps[stepIndex]) {
      setCurrentStepIndex(stepIndex);
      
      if (learningSession) {
        const updatedSession = { ...learningSession };
        updatedSession.progress.currentObjectiveIndex = stepIndex;
        updateLearningProgress(updatedSession);
      }
    }
  };

  const nextStep = () => {
    if (currentStepIndex < learningSteps.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  // 檢測和渲染 Markdown
  const containsMarkdown = (text: string): boolean => {
    if (!text) return false;
    
    const markdownPatterns = [
      /#+\s/, /\*\*.*\*\*/, /\*.*\*/, /`.*`/,
      /^\s*[-*+]\s/m, /^\s*\d+\.\s/m,
      /\[.*\]\(.*\)/, /^\s*>/m, /```[\s\S]*?```/, /\n\s*\n/,
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text));
  };

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
  
  // 如果沒有當前步驟，顯示錯誤
  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">沒有可用的學習步驟</h3>
            <p>此互動教材可能還沒有轉換任何內容，或者內容載入有問題。</p>
            <p className="mt-2 text-sm">請確認教師已經轉換並發布了學習內容。</p>
          </div>
        </div>
      </div>
    );
  }
  
  // 計算學習進度
  const completedSteps = learningSession.progress.completedObjectives.length;
  const totalLearningSteps = learningSteps.length - 1; // 排除總結步驟
  const progressPercentage = totalLearningSteps > 0 ? (completedSteps / totalLearningSteps) * 100 : 0;

  // 渲染步驟內容
  const renderStepContent = () => {
    const isCompleted = learningSession.progress.completedObjectives.includes(currentStep.id);

    switch (currentStep.type) {
      case 'objective':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 學習目標卡片 */}
            <div className="bg-gradient-to-br from-indigo-500 to-sky-500 rounded-3xl shadow-2xl p-12 text-white text-center">
              <div className="text-6xl mb-6">🎯</div>
              <div className="text-4xl font-bold mb-6 leading-tight">
                {renderText(currentStep.content.objective, "text-4xl font-bold leading-tight text-white")}
              </div>
              {currentStep.content.description && (
                <div className="text-xl text-indigo-100 leading-relaxed max-w-3xl mx-auto">
                  {renderText(currentStep.content.description, "text-xl text-indigo-100 leading-relaxed")}
                </div>
              )}
            </div>

            {/* 學習內容 */}
            <div className="space-y-6">
              {currentStep.content.personalRelevance && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🌟</span>
                    這對你很重要
                  </h3>
                  <div className="bg-purple-50 rounded-xl p-6 text-lg leading-relaxed text-purple-900">
                    {renderText(currentStep.content.personalRelevance, "text-lg leading-relaxed text-purple-900")}
                  </div>
                </div>
              )}

              {currentStep.content.teachingExample && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">📝</span>
                    實際應用
                  </h3>
                  <div className="bg-green-50 rounded-xl p-6 text-lg leading-relaxed text-green-900">
                    {renderText(currentStep.content.teachingExample, "text-lg leading-relaxed text-green-900")}
                  </div>
                </div>
              )}

              {currentStep.content.encouragement && (
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-sky-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">💪</span>
                    為你加油
                  </h3>
                  <div className="text-lg leading-relaxed text-sky-900 font-medium">
                    {renderText(currentStep.content.encouragement, "text-lg leading-relaxed text-sky-900 font-medium")}
                  </div>
                </div>
              )}
            </div>

            {/* 完成按鈕 */}
            <div className="text-center">
              {isCompleted ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="text-2xl font-bold text-green-700 mb-2">太棒了！</h4>
                  <p className="text-green-600">你已經掌握了這個學習目標！</p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8">
                  <h4 className="text-xl font-semibold text-slate-700 mb-4">
                    理解了嗎？
                  </h4>
                  <button
                    onClick={() => markStepCompleted(currentStep.id)}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl transition-colors flex items-center gap-3 mx-auto"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    我理解了！
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'breakdown':
        return (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* 主題卡片 */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-500 rounded-3xl shadow-2xl p-12 text-white text-center">
              <div className="text-6xl mb-6">📖</div>
              <div className="text-4xl font-bold mb-6 leading-tight">
                {renderText(currentStep.content.title || currentStep.content.topic, "text-4xl font-bold leading-tight text-white")}
              </div>
              {currentStep.content.introduction && (
                <div className="text-xl text-sky-100 leading-relaxed max-w-3xl mx-auto">
                  {renderText(currentStep.content.introduction, "text-xl text-sky-100 leading-relaxed")}
                </div>
              )}
            </div>

            {/* 學習內容 */}
            <div className="space-y-6">
              {currentStep.content.keyPoints && currentStep.content.keyPoints.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">💡</span>
                    重點概念
                  </h3>
                  <div className="bg-indigo-50 rounded-xl p-6">
                    <div className="space-y-4">
                      {currentStep.content.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                            {index + 1}
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

              {currentStep.content.realLifeExamples && currentStep.content.realLifeExamples.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🌟</span>
                    生活中的例子
                  </h3>
                  <div className="bg-green-50 rounded-xl p-6">
                    <div className="space-y-4">
                      {currentStep.content.realLifeExamples.map((example, index) => (
                        <div key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                            {index + 1}
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

              {currentStep.content.learningTips && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🎯</span>
                    學習小技巧
                  </h3>
                  <div className="bg-purple-50 rounded-xl p-6 text-lg leading-relaxed text-purple-900">
                    {renderText(currentStep.content.learningTips, "text-lg leading-relaxed text-purple-900")}
                  </div>
                </div>
              )}

              {currentStep.content.nextSteps && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-orange-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🚀</span>
                    下一步挑戰
                  </h3>
                  <div className="bg-orange-50 rounded-xl p-6 text-lg leading-relaxed text-orange-900">
                    {renderText(currentStep.content.nextSteps, "text-lg leading-relaxed text-orange-900")}
                  </div>
                </div>
              )}

              {currentStep.content.encouragement && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-pink-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">💪</span>
                    給你的鼓勵
                  </h3>
                  <div className="text-lg leading-relaxed text-pink-900 font-medium">
                    {renderText(currentStep.content.encouragement, "text-lg leading-relaxed text-pink-900 font-medium")}
                  </div>
                </div>
              )}
            </div>

            {/* 完成按鈕 */}
            <div className="text-center">
              {isCompleted ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="text-2xl font-bold text-green-700 mb-2">學會了！</h4>
                  <p className="text-green-600">你已經理解了這個概念！</p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8">
                  <h4 className="text-xl font-semibold text-slate-700 mb-4">
                    掌握了這些概念嗎？
                  </h4>
                  <button
                    onClick={() => markStepCompleted(currentStep.id)}
                    className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-colors flex items-center gap-3 mx-auto"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    我學會了！
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'confusing':
        return (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* 提醒卡片 */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl shadow-2xl p-12 text-white text-center">
              <div className="text-6xl mb-6">💡</div>
              <div className="text-4xl font-bold mb-6 leading-tight">
                {renderText(currentStep.content.title || currentStep.content.point, "text-4xl font-bold leading-tight text-white")}
              </div>
              {currentStep.content.normalizeConfusion && (
                <div className="text-xl text-amber-100 leading-relaxed max-w-3xl mx-auto">
                  {renderText(currentStep.content.normalizeConfusion, "text-xl text-amber-100 leading-relaxed")}
                </div>
              )}
            </div>

            {/* 學習內容 */}
            <div className="space-y-6">
              {currentStep.content.commonMistake && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">⚠️</span>
                    常見錯誤
                  </h3>
                  <div className="bg-red-50 rounded-xl p-6 text-lg leading-relaxed text-red-900">
                    {renderText(currentStep.content.commonMistake, "text-lg leading-relaxed text-red-900")}
                  </div>
                </div>
              )}

              {currentStep.content.whyItHappens && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-amber-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🤔</span>
                    為什麼會搞混？
                  </h3>
                  <div className="bg-amber-50 rounded-xl p-6 text-lg leading-relaxed text-amber-900">
                    {renderText(currentStep.content.whyItHappens, "text-lg leading-relaxed text-amber-900")}
                  </div>
                </div>
              )}

              {currentStep.content.clearExplanation && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">✨</span>
                    正確的理解
                  </h3>
                  <div className="bg-green-50 rounded-xl p-6 text-lg leading-relaxed text-green-900">
                    {renderText(currentStep.content.clearExplanation, "text-lg leading-relaxed text-green-900")}
                  </div>
                </div>
              )}

              {currentStep.content.practiceExamples && currentStep.content.practiceExamples.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">📝</span>
                    練習範例
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="space-y-6">
                      {currentStep.content.practiceExamples.map((example, index) => (
                        <div key={index} className="border-l-4 border-blue-400 pl-4">
                          <div className="flex items-start mb-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              {typeof example === 'string' ? (
                                <div className="text-lg text-blue-900 leading-relaxed">
                                  {renderText(example, "text-lg text-blue-900 leading-relaxed")}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {example.situation && (
                                    <div>
                                      <strong className="text-blue-800">情境：</strong>
                                      <span className="text-blue-900 ml-2">
                                        {renderText(example.situation, "text-blue-900")}
                                      </span>
                                    </div>
                                  )}
                                  {example.wrongThinking && (
                                    <div>
                                      <strong className="text-red-600">❌ 錯誤想法：</strong>
                                      <span className="text-red-700 ml-2">
                                        {renderText(example.wrongThinking, "text-red-700")}
                                      </span>
                                    </div>
                                  )}
                                  {example.rightThinking && (
                                    <div>
                                      <strong className="text-green-600">✅ 正確想法：</strong>
                                      <span className="text-green-700 ml-2">
                                        {renderText(example.rightThinking, "text-green-700")}
                                      </span>
                                    </div>
                                  )}
                                  {example.explanation && (
                                    <div>
                                      <strong className="text-purple-600">💡 解釋：</strong>
                                      <span className="text-purple-700 ml-2">
                                        {renderText(example.explanation, "text-purple-700")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.content.rememberingTricks && currentStep.content.rememberingTricks.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">🎯</span>
                    記憶小技巧
                  </h3>
                  <div className="bg-purple-50 rounded-xl p-6">
                    <div className="space-y-4">
                      {currentStep.content.rememberingTricks.map((trick, index) => (
                        <div key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                            {index + 1}
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

              {currentStep.content.confidenceBooster && (
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-sky-700 mb-6 flex items-center">
                    <span className="text-3xl mr-3">💪</span>
                    你可以的！
                  </h3>
                  <div className="text-lg leading-relaxed text-sky-900 font-medium">
                    {renderText(currentStep.content.confidenceBooster, "text-lg leading-relaxed text-sky-900 font-medium")}
                  </div>
                </div>
              )}
            </div>

            {/* 完成按鈕 */}
            <div className="text-center">
              {isCompleted ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="text-2xl font-bold text-green-700 mb-2">記住了！</h4>
                  <p className="text-green-600">你已經掌握了這個重點！</p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8">
                  <h4 className="text-xl font-semibold text-slate-700 mb-4">
                    記住這些重點了嗎？
                  </h4>
                  <button
                    onClick={() => markStepCompleted(currentStep.id)}
                    className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors flex items-center gap-3 mx-auto"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    我記住了！
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="text-center space-y-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-12">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-3xl font-bold text-green-700 mb-4">恭喜完成學習！</h3>
              <p className="text-lg text-slate-600 mb-8">
                你已經完成了「{content.topic}」的學習旅程
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-3xl text-indigo-600 mb-2">📚</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {completedSteps}
                  </div>
                  <div className="text-sm text-slate-600">學習步驟完成</div>
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
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-slate-600">學習完成度</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8">
              <h4 className="text-2xl font-semibold text-purple-700 mb-6">
                🚀 繼續挑戰自己
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {content.onlineInteractiveQuiz && (
                  <a
                    href={`${import.meta.env.BASE_URL}quiz?binId=${binId}`}
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
                    href={`${import.meta.env.BASE_URL}writing?binId=${binId}`}
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
      {/* 頂部進度條 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{content.topic}</h1>
              <p className="text-sm text-slate-600">
                第 {currentStepIndex + 1} 步，共 {learningSteps.length} 步
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {Math.round((Date.now() - learningSession.progress.startTime) / 60000)} 分鐘
            </div>
          </div>

          {/* 進度條 */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-sky-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStepIndex + 1) / learningSteps.length) * 100}%` }}
            />
          </div>
          
          {/* 學習進度指示 */}
          <div className="text-center">
            <span className="text-xs text-slate-500">
              已完成 {completedSteps} 個學習步驟 • 學習進度 {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
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

export default StudentInteractivePage;