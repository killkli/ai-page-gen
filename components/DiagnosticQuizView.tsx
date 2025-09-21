import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  OnlineInteractiveQuiz, 
  QuizDifficulty, 
  QuizDifficultyContent, 
  QuizContentKey, 
  QuestionResponse,
  DiagnosticSession
} from '../types';
import { createDiagnosticSession, completeDiagnosticSession } from '../services/diagnosticService';
import TrueFalseQuizItem from './quizTypes/TrueFalseQuizItem';
import MultipleChoiceQuizItem from './quizTypes/MultipleChoiceQuizItem';
import FillBlankQuizItem from './quizTypes/FillBlankQuizItem';
import SentenceScrambleQuizItem from './quizTypes/SentenceScrambleQuizItem';
import MemoryCardGameQuizItem from './quizTypes/MemoryCardGameQuizItem';
import LearningDiagnosticReport from './LearningDiagnosticReport';
import { PuzzlePieceIcon } from './icons';
import SectionCard from './SectionCard';

interface DiagnosticQuizViewProps {
  quizzes: OnlineInteractiveQuiz | undefined;
  topic: string;
  studentId?: string;
  apiKey: string;
  onDiagnosticComplete?: (result: any) => void;
  enableDiagnostic?: boolean;
}

const DiagnosticQuizView: React.FC<DiagnosticQuizViewProps> = ({ 
  quizzes, 
  topic,
  studentId,
  apiKey,
  onDiagnosticComplete,
  enableDiagnostic = true
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>(QuizDifficulty.Easy);
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const startTimeRef = useRef<number | null>(null);

  // 初始化診斷會話
  useEffect(() => {
    if (enableDiagnostic && topic && !session) {
      const newSession = createDiagnosticSession(topic, studentId);
      setSession(newSession);
      startTimeRef.current = Date.now();
    }
  }, [topic, studentId, enableDiagnostic, session]);

  // 計算當前難度的總題數
  const getCurrentDifficultyTotalQuestions = () => {
    if (!quizzes || !currentQuizSet) return 0;
    
    let total = 0;
    Object.values(currentQuizSet).forEach(questions => {
      if (Array.isArray(questions)) {
        total += questions.length;
      }
    });
    return total;
  };

  // 計算當前難度已回答的題數
  const getCurrentDifficultyAnsweredCount = () => {
    const currentDifficultyString = selectedDifficulty.toLowerCase() as 'easy' | 'normal' | 'hard';
    return responses.filter(r => r.difficulty === currentDifficultyString).length;
  };

  // 取得當前難度的回答記錄
  const getCurrentDifficultyResponses = () => {
    const currentDifficultyString = selectedDifficulty.toLowerCase() as 'easy' | 'normal' | 'hard';
    return responses.filter(r => r.difficulty === currentDifficultyString);
  };

  const handleQuestionResponse = useCallback((
    questionId: string,
    questionType: QuizContentKey,
    difficulty: QuizDifficulty,
    userAnswer: any,
    correctAnswer: any,
    isCorrect: boolean
  ) => {
    if (!enableDiagnostic || !session) return;

    const responseTime = startTimeRef.current ? Date.now() - startTimeRef.current : undefined;

    const response: QuestionResponse = {
      questionId,
      questionType,
      difficulty: difficulty as 'easy' | 'normal' | 'hard',
      userAnswer,
      correctAnswer,
      isCorrect,
      responseTime,
      attempts: 1
    };

    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        // 更新現有回答
        return prev.map(r => 
          r.questionId === questionId 
            ? { ...response, attempts: (r.attempts || 0) + 1 }
            : r
        );
      } else {
        // 新增回答
        return [...prev, response];
      }
    });

    setAnsweredQuestions(prev => new Set([...prev, questionId]));

    // 重置計時器
    startTimeRef.current = Date.now();
  }, [enableDiagnostic, session]);

  const handleCompleteQuiz = useCallback(() => {
    if (!session || !enableDiagnostic) return;

    const completedSession = completeDiagnosticSession(session);
    completedSession.responses = responses;
    setSession(completedSession);
    setShowDiagnostic(true);

    if (onDiagnosticComplete) {
      onDiagnosticComplete({ session: completedSession, responses });
    }
  }, [session, responses, enableDiagnostic, onDiagnosticComplete]);

  const handleRetakeQuiz = useCallback(() => {
    setShowDiagnostic(false);
    
    // 只清除當前難度的回答記錄
    const currentDifficultyString = selectedDifficulty.toLowerCase() as 'easy' | 'normal' | 'hard';
    setResponses(prev => prev.filter(r => r.difficulty !== currentDifficultyString));
    
    // 清除當前難度的已回答題目 ID
    setAnsweredQuestions(prev => {
      const newSet = new Set(prev);
      const difficultyPrefix = selectedDifficulty.toLowerCase();
      Array.from(prev).forEach(questionId => {
        if (questionId.startsWith(`${difficultyPrefix}-`)) {
          newSet.delete(questionId);
        }
      });
      return newSet;
    });
    
    if (enableDiagnostic) {
      const newSession = createDiagnosticSession(topic, studentId);
      setSession(newSession);
      startTimeRef.current = Date.now();
    }
  }, [enableDiagnostic, topic, studentId, selectedDifficulty]);

  const handleContinueLearning = useCallback(() => {
    setShowDiagnostic(false);
    // 這裡可以添加導航到下一個學習模組的邏輯
  }, []);

  if (showDiagnostic && enableDiagnostic) {
    const difficultyLabel = selectedDifficulty === QuizDifficulty.Easy ? '簡單' : 
                          selectedDifficulty === QuizDifficulty.Normal ? '普通' : '困難';
    return (
      <LearningDiagnosticReport
        topic={`${topic} (${difficultyLabel}難度)`}
        quizData={quizzes}
        studentId={studentId}
        apiKey={apiKey}
        mode="both"
        onRetakeQuiz={handleRetakeQuiz}
        onContinueLearning={handleContinueLearning}
        onClose={() => setShowDiagnostic(false)}
        initialResponses={getCurrentDifficultyResponses()}
      />
    );
  }

  if (!quizzes) {
    return <SectionCard title="線上互動測驗" icon={<PuzzlePieceIcon />}>沒有可用的測驗資料。</SectionCard>;
  }

  const currentQuizSet: QuizDifficultyContent | undefined = quizzes[selectedDifficulty];

  const difficultyLevels: { key: QuizDifficulty; label: string }[] = [
    { key: QuizDifficulty.Easy, label: '簡單' },
    { key: QuizDifficulty.Normal, label: '普通' },
    { key: QuizDifficulty.Hard, label: '困難' },
  ];

  const quizTypeLabels: Record<QuizContentKey, string> = {
    trueFalse: "是非題",
    multipleChoice: "選擇題",
    fillInTheBlanks: "填空題",
    sentenceScramble: "句子重組",
    memoryCardGame: "翻卡牌記憶遊戲",
  };

  const getProgressPercentage = () => {
    const currentTotal = getCurrentDifficultyTotalQuestions();
    const currentAnswered = getCurrentDifficultyAnsweredCount();
    return currentTotal > 0 ? (currentAnswered / currentTotal) * 100 : 0;
  };

  return (
    <SectionCard title="線上互動測驗" icon={<PuzzlePieceIcon className="w-7 h-7"/>}>
      {/* 進度條和控制區域 */}
      {enableDiagnostic && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-800">學習診斷模式</h4>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                進度: {getCurrentDifficultyAnsweredCount()} / {getCurrentDifficultyTotalQuestions()}
              </span>
              <button
                onClick={handleCompleteQuiz}
                disabled={getCurrentDifficultyAnsweredCount() === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
                生成學習診斷
              </button>
            </div>
          </div>
          
          {/* 進度條 */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 完成題目後點擊「生成學習診斷」獲得個人化學習建議
          </p>
        </div>
      )}

      {/* 難度選擇 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-300 pb-3 mb-4">
          {difficultyLevels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedDifficulty(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${selectedDifficulty === key 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 測驗內容 */}
      {!currentQuizSet ? (
        <p>此難度級別沒有找到測驗題目。</p>
      ) : (
        (Object.keys(quizTypeLabels) as QuizContentKey[]).map((quizType) => {
          if (!(quizType in currentQuizSet)) {
            return null;
          }
          const questions = currentQuizSet[quizType];
          if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return null;
          }

          return (
            <div key={`${selectedDifficulty}-${quizType}`} className="mb-8">
              <h4 className="text-xl font-semibold text-slate-700 mb-3 border-b-2 border-sky-200 pb-1 flex items-center justify-between">
                <span>{quizTypeLabels[quizType]}</span>
                {enableDiagnostic && (
                  <span className="text-sm text-gray-500 font-normal">
                    已答: {responses.filter(r => r.questionType === quizType && r.difficulty === selectedDifficulty).length} / {questions.length}
                  </span>
                )}
              </h4>
              
              {/* 題目渲染邏輯保持不變，但添加回調函數 */}
              {quizType === 'trueFalse' && Array.isArray(questions) && questions.map((q, i) => {
                const questionId = `${selectedDifficulty}-tf-${i}`;
                return (
                  <div key={questionId} className={answeredQuestions.has(questionId) ? 'opacity-75' : ''}>
                    <TrueFalseQuizItem 
                      question={q as any} 
                      itemNumber={i + 1}
                      onAnswer={enableDiagnostic ? (userAnswer, isCorrect) => {
                        handleQuestionResponse(
                          questionId,
                          'trueFalse',
                          selectedDifficulty,
                          userAnswer,
                          (q as any).isTrue,
                          isCorrect
                        );
                      } : undefined}
                    />
                  </div>
                );
              })}
              
              {quizType === 'multipleChoice' && Array.isArray(questions) && questions.map((q, i) => {
                const questionId = `${selectedDifficulty}-mc-${i}`;
                return (
                  <div key={questionId} className={answeredQuestions.has(questionId) ? 'opacity-75' : ''}>
                    <MultipleChoiceQuizItem 
                      question={q as any} 
                      itemNumber={i + 1}
                      onAnswer={enableDiagnostic ? (userAnswer, isCorrect) => {
                        handleQuestionResponse(
                          questionId,
                          'multipleChoice',
                          selectedDifficulty,
                          userAnswer,
                          (q as any).correctAnswerIndex,
                          isCorrect
                        );
                      } : undefined}
                    />
                  </div>
                );
              })}
              
              {quizType === 'fillInTheBlanks' && Array.isArray(questions) && questions.map((q, i) => {
                const questionId = `${selectedDifficulty}-fb-${i}`;
                return (
                  <div key={questionId} className={answeredQuestions.has(questionId) ? 'opacity-75' : ''}>
                    <FillBlankQuizItem 
                      question={q as any} 
                      itemNumber={i + 1}
                      onAnswer={enableDiagnostic ? (userAnswer, isCorrect) => {
                        handleQuestionResponse(
                          questionId,
                          'fillInTheBlanks',
                          selectedDifficulty,
                          userAnswer,
                          (q as any).correctAnswer,
                          isCorrect
                        );
                      } : undefined}
                    />
                  </div>
                );
              })}
              
              {quizType === 'sentenceScramble' && Array.isArray(questions) && questions.map((q, i) => {
                const questionId = `${selectedDifficulty}-ss-${i}`;
                return (
                  <div key={questionId} className={answeredQuestions.has(questionId) ? 'opacity-75' : ''}>
                    <SentenceScrambleQuizItem 
                      question={q as any} 
                      itemNumber={i + 1}
                      onAnswer={enableDiagnostic ? (userAnswer, isCorrect) => {
                        handleQuestionResponse(
                          questionId,
                          'sentenceScramble',
                          selectedDifficulty,
                          userAnswer,
                          (q as any).originalSentence,
                          isCorrect
                        );
                      } : undefined}
                    />
                  </div>
                );
              })}
              
              {quizType === 'memoryCardGame' && Array.isArray(questions) && questions.map((q, i) => {
                const questionId = `${selectedDifficulty}-mcg-${i}`;
                return (
                  <div key={questionId} className={answeredQuestions.has(questionId) ? 'opacity-75' : ''}>
                    <MemoryCardGameQuizItem 
                      question={q as any} 
                      itemNumber={i + 1}
                      onAnswer={enableDiagnostic ? (userAnswer, isCorrect) => {
                        handleQuestionResponse(
                          questionId,
                          'memoryCardGame',
                          selectedDifficulty,
                          userAnswer,
                          (q as any).pairs,
                          isCorrect
                        );
                      } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          );
        })
      )}

      {/* 提示訊息 */}
      {enableDiagnostic && getCurrentDifficultyAnsweredCount() > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium text-sm">學習診斷提示</p>
              <p className="text-yellow-700 text-sm mt-1">
                您已完成 {getCurrentDifficultyAnsweredCount()} 題測驗。點擊上方的「生成學習診斷」按鈕，AI 將為您分析學習狀況並提供個人化建議！
              </p>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default DiagnosticQuizView;