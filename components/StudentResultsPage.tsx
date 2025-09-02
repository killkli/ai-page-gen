import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStudentResults } from '../services/jsonbinService';
import { QuestionResponse } from '../types';
import LearningDiagnosticReport from './LearningDiagnosticReport';
import LoadingSpinner from './LoadingSpinner';
import { ChartBarIcon, AcademicCapIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface StudentResults {
  studentName?: string;
  topic: string;
  difficulty: string;
  responses: QuestionResponse[];
  overallScore: number;
  completedAt: string;
  quizBinId?: string;
  metadata?: any;
}

const StudentResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const binId = searchParams.get('binId');
  
  const [results, setResults] = useState<StudentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!binId) {
        setError('缺少學生作答結果ID參數');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentResults(binId);
        setResults(data);
      } catch (err) {
        console.error('載入學生作答結果失敗:', err);
        setError(err instanceof Error ? err.message : '載入學生作答結果失敗');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [binId]);

  useEffect(() => {
    // 檢查本地存儲中的 API Key（兼容多種 key 名稱）
    const savedApiKey = localStorage.getItem('geminiApiKey') || localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      console.log('已從 localStorage 讀取 API Key');
    } else {
      console.log('未找到已存儲的 API Key');
    }
  }, []);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      localStorage.setItem('geminiApiKey', trimmedKey);
      setApiKey(trimmedKey);
      setShowApiKeyModal(false);
    }
  };

  const handleStartDiagnostic = () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    setShowDiagnostic(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">載入學生作答結果中...</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  if (showDiagnostic && results) {
    return (
      <LearningDiagnosticReport
        topic={`${results.topic} (${results.difficulty}難度) - ${results.studentName}`}
        apiKey={apiKey}
        mode="teacher"
        initialResponses={results.responses}
        onClose={() => setShowDiagnostic(false)}
      />
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">找不到學生作答結果</h2>
          <p className="text-gray-600">請檢查連結是否正確</p>
        </div>
      </div>
    );
  }

  const correctAnswers = results.responses.filter(r => r.isCorrect).length;
  const totalAnswers = results.responses.length;
  const completedDate = new Date(results.completedAt).toLocaleString('zh-TW');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">學生作答結果檢視</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-lg font-medium">教師版分析工具</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 學生資訊卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                📝 {results.studentName || '匿名學生'} 的作答結果
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>主題：{results.topic}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>難度：{results.difficulty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>完成時間：{completedDate}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {results.overallScore}%
              </div>
              <div className="text-sm text-gray-600">
                {correctAnswers}/{totalAnswers} 答對
              </div>
            </div>
          </div>

          {/* 成績統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-700">{correctAnswers}</div>
                  <div className="text-sm text-green-600">答對題數</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <XCircleIcon className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-700">{totalAnswers - correctAnswers}</div>
                  <div className="text-sm text-red-600">答錯題數</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">{results.overallScore}%</div>
                  <div className="text-sm text-blue-600">總體正確率</div>
                </div>
              </div>
            </div>
          </div>

          {/* 行動按鈕 */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <button
                onClick={handleStartDiagnostic}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium"
              >
                <ChartBarIcon className="w-5 h-5" />
                生成 AI 學習診斷報告
              </button>
              
              {apiKey ? (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  ✅ API Key 已設定，可使用 AI 診斷功能
                </div>
              ) : (
                <div className="text-sm text-amber-600 flex items-center gap-1">
                  ⚠️ 需要設定 API Key 才能使用 AI 診斷功能
                </div>
              )}
            </div>
            
            {apiKey && (
              <div className="text-xs text-gray-500">
                💡 小提示：如需更更換 API Key，請點擊上方按鈕後在彈出視窗中重新設定
              </div>
            )}
          </div>
        </div>

        {/* 詳細作答記錄 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 詳細作答記錄</h3>
          <div className="space-y-4">
            {results.responses.map((response, index) => (
              <div 
                key={response.questionId || index}
                className={`p-4 rounded-lg border-2 ${
                  response.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {response.isCorrect ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium text-gray-700">
                      第 {index + 1} 題 ({response.questionType})
                    </span>
                    <span className="text-sm text-gray-500">
                      難度: {response.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {response.attempts && response.attempts > 1 && `嘗試 ${response.attempts} 次`}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">學生答案:</div>
                    <div className="font-medium text-gray-800">
                      {JSON.stringify(response.userAnswer)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">正確答案:</div>
                    <div className="font-medium text-green-700">
                      {JSON.stringify(response.correctAnswer)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Key 設定 Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">設定 API Key</h3>
            <p className="text-gray-600 mb-4">
              要使用 AI 學習診斷功能，請輸入您的 Google Gemini API Key。
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-blue-600 ml-1"
              >
                點此取得 API Key
              </a>
            </p>
            <form onSubmit={handleApiKeySubmit}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="請輸入您的 Gemini API Key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!apiKey.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  設定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResultsPage;