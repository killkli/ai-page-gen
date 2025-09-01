import React, { useState } from 'react';
import { TeacherDiagnosticReport as TeacherReportData, QuestionTypePerformance, LearningStrength, LearningWeakness, PersonalizedRecommendation } from '../types';

interface TeacherDiagnosticReportProps {
  report: TeacherReportData;
  onExportReport?: () => void;
  onSaveReport?: () => void;
  showExportOptions?: boolean;
}

const TeacherDiagnosticReport: React.FC<TeacherDiagnosticReportProps> = ({
  report,
  onExportReport,
  onSaveReport,
  showExportOptions = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'analysis' | 'recommendations' | 'teaching'>('overview');

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const getLevelColor = (level: 'good' | 'excellent' | 'outstanding') => {
    switch (level) {
      case 'outstanding': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-l-red-500';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-l-yellow-500';
      case 'low': return 'text-green-600 bg-green-50 border-l-green-500';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trueFalse: '是非題',
      multipleChoice: '選擇題',
      fillInTheBlanks: '填空題',
      sentenceScramble: '句子重組',
      memoryCardGame: '翻卡記憶'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { key: 'overview' as const, label: '總覽', icon: '📊' },
    { key: 'performance' as const, label: '表現詳情', icon: '📈' },
    { key: 'analysis' as const, label: '學習分析', icon: '🔍' },
    { key: 'recommendations' as const, label: '個人化建議', icon: '💡' },
    { key: 'teaching' as const, label: '教學指導', icon: '🎯' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* 報告標題 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">學習診斷報告</h1>
            <p className="text-gray-600">主題：<span className="font-semibold">{report.topic}</span></p>
            <p className="text-gray-600">評估日期：{formatDate(report.assessmentDate)}</p>
            {report.studentId && (
              <p className="text-gray-600">學生ID：<span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{report.studentId}</span></p>
            )}
          </div>
          
          {showExportOptions && (
            <div className="flex gap-3">
              <button
                onClick={onSaveReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                儲存報告
              </button>
              <button
                onClick={onExportReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                匯出報告
              </button>
            </div>
          )}
        </div>

        {/* 快速摘要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-700 mb-1">整體得分</h3>
            <p className="text-2xl font-bold text-blue-600">{report.overallPerformance.totalScore}分</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-sm font-semibold text-purple-700 mb-1">學習水準</h3>
            <p className="text-lg font-semibold text-purple-600 capitalize">{report.overallPerformance.level}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-semibold text-green-700 mb-1">強項數量</h3>
            <p className="text-2xl font-bold text-green-600">{report.learningAnalysis.strengths.length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h3 className="text-sm font-semibold text-orange-700 mb-1">改進領域</h3>
            <p className="text-2xl font-bold text-orange-600">{report.learningAnalysis.weaknesses.length}</p>
          </div>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="space-y-6">
        {/* 總覽標籤 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">整體表現</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">總分：</span>
                  <span className="font-semibold">{report.overallPerformance.totalScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">學習水準：</span>
                  <span className="font-semibold capitalize">{report.overallPerformance.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">完成時間：</span>
                  <span className="font-semibold">{report.overallPerformance.timeSpent} 分鐘</span>
                </div>
                {report.overallPerformance.percentile && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">百分位數：</span>
                    <span className="font-semibold">前 {100 - report.overallPerformance.percentile}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">認知分析</h3>
              <div className="space-y-3">
                {report.learningAnalysis.learningStyle && (
                  <div>
                    <span className="text-gray-600">學習風格：</span>
                    <span className="ml-2 font-semibold">{report.learningAnalysis.learningStyle}</span>
                  </div>
                )}
                {report.learningAnalysis.cognitivePattern && (
                  <div>
                    <span className="text-gray-600">認知模式：</span>
                    <span className="ml-2 font-semibold">{report.learningAnalysis.cognitivePattern}</span>
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-sm text-gray-500">
                    基於答題模式、反應時間和錯誤類型的綜合分析
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 表現詳情標籤 */}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">各題型表現分析</h3>
            <div className="space-y-6">
              {report.performanceByType.map((performance) => (
                <div key={performance.questionType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {getQuestionTypeLabel(performance.questionType)}
                    </h4>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceColor(performance.accuracy)}`}>
                      {performance.accuracy}% 正確率
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">總題數</p>
                      <p className="text-2xl font-bold text-gray-800">{performance.totalQuestions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">答對題數</p>
                      <p className="text-2xl font-bold text-green-600">{performance.correctCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">平均時間</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {performance.averageTime ? `${Math.round(performance.averageTime / 1000)}秒` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* 難度分解 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 font-medium">簡單</p>
                      <p className="text-lg font-bold text-green-600">
                        {performance.difficultyBreakdown.easy.accuracy}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {performance.difficultyBreakdown.easy.correct}/{performance.difficultyBreakdown.easy.total}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-700 font-medium">普通</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {performance.difficultyBreakdown.normal.accuracy}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {performance.difficultyBreakdown.normal.correct}/{performance.difficultyBreakdown.normal.total}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-700 font-medium">困難</p>
                      <p className="text-lg font-bold text-red-600">
                        {performance.difficultyBreakdown.hard.accuracy}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {performance.difficultyBreakdown.hard.correct}/{performance.difficultyBreakdown.hard.total}
                      </p>
                    </div>
                  </div>

                  {/* 常見錯誤 */}
                  {performance.commonErrors.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">常見錯誤模式：</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {performance.commonErrors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 學習分析標籤 */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 學習強項 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25s4.544.16 6.75.471v1.515M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228V2.721A48.133 48.133 0 0 0 12 2.25c-2.291 0-4.544.16-6.75.471v1.515M7.73 9.728l3.75.814.97 4.286c.078.348.14.699.185 1.053m8.272-6.842-3.75.814-.97 4.286a24.216 24.216 0 0 1-.185 1.053M12 19.5a2.25 2.25 0 0 1-2.25-2.25V14.25m4.5 5.25a2.25 2.25 0 0 1 2.25-2.25V14.25" />
                </svg>
                學習強項
              </h3>
              <div className="space-y-4">
                {report.learningAnalysis.strengths.map((strength, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getLevelColor(strength.level)}`}>
                    <h4 className="font-semibold mb-2">{strength.area}</h4>
                    <p className="text-sm mb-3">{strength.description}</p>
                    {strength.examples.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">表現實例：</p>
                        <ul className="text-xs space-y-1">
                          {strength.examples.map((example, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-green-500 mt-1">✓</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {strength.leverageOpportunities.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">運用機會：</p>
                        <ul className="text-xs space-y-1">
                          {strength.leverageOpportunities.map((opportunity, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-blue-500 mt-1">→</span>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 學習弱點 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                需要加強的領域
              </h3>
              <div className="space-y-4">
                {report.learningAnalysis.weaknesses.map((weakness, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(weakness.severity)}`}>
                    <h4 className="font-semibold mb-2">{weakness.area}</h4>
                    <p className="text-sm mb-3">{weakness.description}</p>
                    {weakness.affectedTopics.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">影響主題：</p>
                        <div className="flex flex-wrap gap-1">
                          {weakness.affectedTopics.map((topic, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {weakness.recommendedActions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">建議行動：</p>
                        <ul className="text-xs space-y-1">
                          {weakness.recommendedActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-orange-500 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 個人化建議標籤 */}
        {activeTab === 'recommendations' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-blue-700 mb-6">個人化學習建議</h3>
            <div className="space-y-6">
              {report.personalizedRecommendations.map((rec, index) => (
                <div key={index} className={`p-6 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">{rec.title}</h4>
                      <div className="flex gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full border ${
                          rec.category === 'immediate' ? 'text-red-600 bg-red-100 border-red-200' :
                          rec.category === 'short-term' ? 'text-yellow-600 bg-yellow-100 border-yellow-200' :
                          'text-blue-600 bg-blue-100 border-blue-200'
                        }`}>
                          {rec.category === 'immediate' ? '立即' : 
                           rec.category === 'short-term' ? '短期' : '長期'}
                        </span>
                        <span className={`px-2 py-1 rounded-full border ${
                          rec.priority === 'high' ? 'text-red-600 bg-red-100 border-red-200' :
                          rec.priority === 'medium' ? 'text-yellow-600 bg-yellow-100 border-yellow-200' :
                          'text-green-600 bg-green-100 border-green-200'
                        }`}>
                          {rec.priority === 'high' ? '高優先' : 
                           rec.priority === 'medium' ? '中優先' : '低優先'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {rec.estimatedTime}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">具體步驟：</p>
                      <ol className="text-sm space-y-1">
                        {rec.actionSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預期成果：</p>
                      <p className="text-sm text-gray-600 mb-3">{rec.expectedOutcome}</p>
                      
                      {rec.resources && rec.resources.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">推薦資源：</p>
                          <ul className="text-sm space-y-1">
                            {rec.resources.map((resource, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-green-500 mt-1">📚</span>
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 教學指導標籤 */}
        {activeTab === 'teaching' && (
          <div className="space-y-6">
            {/* 立即介入建議 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                立即介入建議
              </h3>
              <ul className="space-y-3">
                {report.teachingRecommendations.immediateInterventions.map((intervention, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      !
                    </span>
                    <span className="text-gray-700">{intervention}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 教學策略 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443a55.381 55.381 0 0 1 5.25 2.882V15" />
                </svg>
                建議教學策略
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.teachingRecommendations.instructionalStrategies.map((strategy, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{strategy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 差異化教學建議 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
                差異化教學建議
              </h3>
              <ul className="space-y-3">
                {report.teachingRecommendations.differentiation.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      ◆
                    </span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 家長指導建議 */}
            {report.teachingRecommendations.parentGuidance && report.teachingRecommendations.parentGuidance.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  家長指導建議
                </h3>
                <ul className="space-y-3">
                  {report.teachingRecommendations.parentGuidance.map((guidance, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        ♥
                      </span>
                      <span className="text-gray-700">{guidance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 進度追蹤建議 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
                進度追蹤與評估
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">關鍵指標</h4>
                  <ul className="text-sm space-y-1">
                    {report.progressTracking.keyMetrics.map((metric, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">檢查點</h4>
                  <ul className="text-sm space-y-1">
                    {report.progressTracking.checkpoints.map((checkpoint, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {checkpoint}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">重新評估</h4>
                  <p className="text-sm text-gray-600">{report.progressTracking.reassessmentSuggestion}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDiagnosticReport;