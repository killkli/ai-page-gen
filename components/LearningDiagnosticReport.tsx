import React, { useState, useCallback, useEffect } from 'react';
import {
  QuestionResponse,
  LearningDiagnosticResult,
  DiagnosticSession,
  // DiagnosticReportConfig,
  OnlineInteractiveQuiz
} from '../types';
import {
  generateLearningDiagnostic,
  createDiagnosticSession,
  completeDiagnosticSession
} from '../services/diagnosticService';
import { updateStudentResults } from '../services/jsonbinService';
import StudentLearningFeedback from './StudentLearningFeedback';
import TeacherDiagnosticReport from './TeacherDiagnosticReport';
import LoadingSpinner from './LoadingSpinner';

interface LearningDiagnosticReportProps {
  topic: string;
  quizData?: OnlineInteractiveQuiz;
  studentId?: string;
  apiKey?: string;
  mode?: 'student' | 'teacher' | 'both';
  onClose?: () => void;
  onRetakeQuiz?: () => void;
  onContinueLearning?: () => void;
  initialResponses?: QuestionResponse[];
  existingReport?: LearningDiagnosticResult; // 已存在的診斷報告
  resultsBinId?: string; // 學生作答結果的 binId
  onReportSaved?: (report: LearningDiagnosticResult) => void; // 報告儲存後的回調
}

const LearningDiagnosticReport: React.FC<LearningDiagnosticReportProps> = ({
  topic,
  studentId,
  apiKey,
  mode = 'both',
  onClose,
  onRetakeQuiz,
  onContinueLearning,
  initialResponses = [],
  existingReport,
  resultsBinId,
  onReportSaved
}) => {
  const [diagnosticResult, setDiagnosticResult] = useState<LearningDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'student' | 'teacher'>(mode === 'teacher' ? 'teacher' : 'student');
  const [session, setSession] = useState<DiagnosticSession | null>(null);

  const generateDiagnosticReport = useCallback(async (diagnosticSession: DiagnosticSession) => {
    if (!apiKey) {
      setError('需要 API Key 才能生成診斷報告');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // const config: DiagnosticReportConfig = {
      //   includeDetailedAnalysis: true,
      //   includeComparativeData: false,
      //   includeVisualCharts: false,
      //   language: 'zh-TW',
      //   reportFormat: 'standard'
      // };

      const result = await generateLearningDiagnostic(diagnosticSession);

      // 添加生成時間和結果 binId
      const enhancedResult = {
        ...result,
        generatedAt: new Date().toISOString(),
        resultsBinId: resultsBinId
      };

      setDiagnosticResult(enhancedResult);

      // 自動儲存報告到學生作答結果中
      if (resultsBinId) {
        try {
          await updateStudentResults(resultsBinId, enhancedResult);
          console.log('診斷報告已自動儲存到學生作答結果');
          onReportSaved?.(enhancedResult);
        } catch (saveError) {
          console.warn('儲存診斷報告失敗，但報告仍可正常顯示:', saveError);
        }
      }
    } catch (err) {
      console.error('生成診斷報告失敗:', err);
      setError(err instanceof Error ? err.message : '生成診斷報告時發生錯誤');
    } finally {
      setLoading(false);
    }
  }, [apiKey, resultsBinId, onReportSaved]);

  // 初始化或更新診斷會話
  useEffect(() => {
    if (existingReport) {
      // 載入已存在的報告
      setDiagnosticResult(existingReport);
      const existingSession = createDiagnosticSession(topic, studentId);
      existingSession.responses = initialResponses;
      setSession(completeDiagnosticSession(existingSession));
    } else if (topic && initialResponses.length > 0) {
      // 生成新報告
      const newSession = createDiagnosticSession(topic, studentId);
      newSession.responses = initialResponses;
      setSession(completeDiagnosticSession(newSession));
      generateDiagnosticReport(newSession);
    }
  }, [topic, studentId, initialResponses, existingReport, generateDiagnosticReport]);



  const handleExportReport = useCallback(() => {
    if (!diagnosticResult) return;

    const reportData = {
      studentFeedback: diagnosticResult.studentFeedback,
      teacherReport: diagnosticResult.teacherReport,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `learning_diagnostic_${topic}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [diagnosticResult, topic]);

  const handleSaveReport = useCallback(() => {
    if (!diagnosticResult) return;

    // TODO: 實現保存到本地儲存或伺服器的邏輯
    const savedReports = JSON.parse(localStorage.getItem('learningDiagnosticReports') || '[]');
    savedReports.push({
      id: `report_${Date.now()}`,
      topic,
      studentId,
      createdAt: new Date().toISOString(),
      result: diagnosticResult
    });
    localStorage.setItem('learningDiagnosticReports', JSON.stringify(savedReports));

    alert('診斷報告已儲存至本地');
  }, [diagnosticResult, topic, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <div className="mt-6 space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">正在生成學習診斷報告</h2>
            <p className="text-gray-600">AI 正在分析您的答題情況...</p>
            <div className="flex items-center justify-center space-x-1 mt-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">生成報告失敗</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => session && generateDiagnosticReport(session)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新生成
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                關閉
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!diagnosticResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">等待診斷數據</h2>
          <p className="text-gray-600 mb-6">請先完成測驗以生成學習診斷報告</p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              關閉
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800">學習診斷報告</h1>
              {mode === 'both' && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentView('student')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'student'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    學生版
                  </button>
                  <button
                    onClick={() => setCurrentView('teacher')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'teacher'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    教師版
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentView === 'teacher' && (
                <>
                  <button
                    onClick={handleSaveReport}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    儲存
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    匯出
                  </button>
                </>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  關閉
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="py-8">
        {(mode === 'student' || (mode === 'both' && currentView === 'student')) && (
          <StudentLearningFeedback
            feedback={diagnosticResult.studentFeedback}
            onContinueLearning={onContinueLearning}
            onRetakeQuiz={onRetakeQuiz}
            showActions={mode !== 'both'}
          />
        )}

        {(mode === 'teacher' || (mode === 'both' && currentView === 'teacher')) && (
          <TeacherDiagnosticReport
            report={diagnosticResult.teacherReport}
            onExportReport={handleExportReport}
            onSaveReport={handleSaveReport}
            showExportOptions={mode !== 'both'}
          />
        )}
      </div>

      {/* 底部行動區域（僅在 both 模式顯示） */}
      {mode === 'both' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={onRetakeQuiz}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                重新測驗
              </button>
              <button
                onClick={onContinueLearning}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M3 12h16.5" />
                </svg>
                繼續學習
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningDiagnosticReport;
