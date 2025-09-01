import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { getQuizContent } from '../services/jsonbinService';
import { extractApiKeyFromParams } from '../utils/cryptoUtils';
import StudentQuizView from './StudentQuizView';
import LoadingSpinner from './LoadingSpinner';

const QuizPage: React.FC = () => {
  const [params] = useSearchParams();
  const binId = params.get('binId');
  const [quiz, setQuiz] = React.useState<any>(null);
  const [topic, setTopic] = React.useState<string>('');
  const [apiKey, setApiKey] = React.useState<string>('');
  const [supportsDiagnostic, setSupportsDiagnostic] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!binId) {
      setError('缺少測驗ID參數');
      return;
    }
    
    const loadQuizData = async () => {
      setLoading(true);
      try {
        // 載入測驗資料
        const data = await getQuizContent(binId);
        setQuiz(data.quiz);
        setTopic(data.topic);
        
        // 首先嘗試從 URL 參數獲取加密的 API Key
        let finalApiKey = data.apiKey || '';
        try {
          const urlApiKey = await extractApiKeyFromParams(params);
          if (urlApiKey) {
            finalApiKey = urlApiKey;
            console.log('使用 URL 中的 API Key 進行學習診斷');
          }
        } catch (error) {
          console.warn('解析 URL API Key 失敗:', error);
        }
        
        setApiKey(finalApiKey);
        setSupportsDiagnostic(!!finalApiKey);
      } catch (e: any) {
        setError(e.message || '載入測驗失敗');
      } finally {
        setLoading(false);
      }
    };
    
    loadQuizData();
  }, [binId, params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">載入測驗中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">測驗載入失敗</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">請確認連結是否正確，或聯繫您的老師</p>
        </div>
      </div>
    );
  }

  if (!quiz || !topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">找不到測驗內容</h2>
          <p className="text-gray-600">請檢查連結是否正確</p>
        </div>
      </div>
    );
  }

  return <StudentQuizView quiz={quiz} topic={topic} apiKey={apiKey} supportsDiagnostic={supportsDiagnostic} />;
};

export default QuizPage;