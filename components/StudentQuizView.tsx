import React, { useState, useCallback } from 'react';
import { OnlineInteractiveQuiz, QuizDifficulty, QuizDifficultyContent, QuizContentKey, QuestionResponse } from '../types';
import TrueFalseQuizItem from './quizTypes/TrueFalseQuizItem';
import MultipleChoiceQuizItem from './quizTypes/MultipleChoiceQuizItem';
import FillBlankQuizItem from './quizTypes/FillBlankQuizItem';
import SentenceScrambleQuizItem from './quizTypes/SentenceScrambleQuizItem';
import MemoryCardGameQuizItem from './quizTypes/MemoryCardGameQuizItem';
import LearningDiagnosticReport from './LearningDiagnosticReport';
import { PuzzlePieceIcon, AcademicCapIcon, ChartBarIcon } from './icons';
import { saveStudentResults } from '../services/jsonbinService';
import { calculateOverallScore } from '../services/diagnosticService';
import QRCodeDisplay from './QRCodeDisplay';

interface StudentQuizViewProps {
  quiz: OnlineInteractiveQuiz;
  topic: string;
  apiKey?: string;
  supportsDiagnostic?: boolean;
  quizBinId?: string; // 原始測驗的 binId
}

const StudentQuizView: React.FC<StudentQuizViewProps> = ({ quiz, topic, apiKey, supportsDiagnostic = false, quizBinId }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>(QuizDifficulty.Easy);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleQuestionResponse = useCallback((
    questionType: QuizContentKey,
    questionIndex: number,
    userAnswer: any,
    correctAnswer: any,
    isCorrect: boolean,
    responseTime?: number
  ) => {
    if (!supportsDiagnostic) return;

    const questionId = `${selectedDifficulty}-${questionType}-${questionIndex}`;
    const response: QuestionResponse = {
      questionId,
      questionType,
      difficulty: selectedDifficulty.toLowerCase() as 'easy' | 'normal' | 'hard',
      userAnswer,
      correctAnswer,
      isCorrect,
      responseTime,
      attempts: 1
    };

    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          userAnswer,
          isCorrect,
          attempts: (updated[existingIndex].attempts || 1) + 1
        };
        return updated;
      }
      return [...prev, response];
    });
  }, [selectedDifficulty, supportsDiagnostic]);

  const getCorrectAnswer = (type: QuizContentKey, question: any) => {
    switch (type) {
      case 'trueFalse':
        return question.isTrue;
      case 'multipleChoice':
        return question.options[question.correctAnswerIndex];
      case 'fillInTheBlanks':
        return question.correctAnswers;
      case 'sentenceScramble':
        return question.originalSentence;
      case 'memoryCardGame':
        return question.pairs;
      default:
        return null;
    }
  };

  // 取得當前難度的回答記錄
  const getCurrentDifficultyResponses = () => {
    const currentDifficultyString = selectedDifficulty.toLowerCase() as 'easy' | 'normal' | 'hard';
    return responses.filter(response => response.difficulty === currentDifficultyString);
  };

  // 分享作答結果給老師
  const handleShareResults = useCallback(async () => {
    const currentResponses = getCurrentDifficultyResponses();
    if (currentResponses.length === 0) {
      alert('請先完成一些題目再分享結果！');
      return;
    }

    if (!studentName.trim()) {
      setShowNameInput(true);
      return;
    }

    setSharing(true);
    try {
      const overallScore = calculateOverallScore(currentResponses);
      const difficultyLabel = selectedDifficulty === QuizDifficulty.Easy ? '簡單' : 
                            selectedDifficulty === QuizDifficulty.Normal ? '普通' : '困難';
      
      // 獲取當前難度的完整測驗內容，供老師查看題目
      const currentQuizContent = quiz?.[selectedDifficulty] || {};
      
      const resultBinId = await saveStudentResults({
        studentName: studentName.trim(),
        topic,
        difficulty: difficultyLabel,
        responses: currentResponses,
        overallScore,
        completedAt: new Date().toISOString(),
        quizBinId,
        quizContent: currentQuizContent, // 包含完整的測驗題目內容
        metadata: {
          totalQuestions: currentResponses.length,
          correctAnswers: currentResponses.filter(r => r.isCorrect).length,
          selectedDifficulty // 保存難度選擇
        }
      });

      const baseUrl = import.meta.env.BASE_URL || '/';
      const teacherUrl = `${window.location.origin}${baseUrl}student-results?binId=${resultBinId}`;
      setShareUrl(teacherUrl);
      
      // 自動複製到剪貼簿
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(teacherUrl);
        alert(`作答結果已分享！連結已複製到剪貼簿，可以傳送給老師。`);
      } else {
        alert(`作答結果已分享！請複製下方連結傳送給老師。`);
      }
    } catch (error) {
      console.error('分享失敗:', error);
      alert('分享失敗，請稍後再試。');
    } finally {
      setSharing(false);
    }
  }, [getCurrentDifficultyResponses, studentName, topic, selectedDifficulty, quizBinId]);

  if (showDiagnostic && supportsDiagnostic && apiKey && getCurrentDifficultyResponses().length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">學習診斷報告</h1>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                {selectedDifficulty === QuizDifficulty.Easy ? '簡單' : 
                 selectedDifficulty === QuizDifficulty.Normal ? '普通' : '困難'} 難度
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <AcademicCapIcon className="w-5 h-5" />
              <span className="text-lg font-medium">{topic}</span>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LearningDiagnosticReport
            topic={`${topic} (${selectedDifficulty === QuizDifficulty.Easy ? '簡單' : 
                     selectedDifficulty === QuizDifficulty.Normal ? '普通' : '困難'}難度)`}
            apiKey={apiKey}
            mode="student"
            initialResponses={getCurrentDifficultyResponses()}
            onClose={() => setShowDiagnostic(false)}
            onRetakeQuiz={() => {
              // 只清除當前難度的回答
              const currentDifficultyString = selectedDifficulty.toLowerCase() as 'easy' | 'normal' | 'hard';
              setResponses(prev => prev.filter(r => r.difficulty !== currentDifficultyString));
              setShowDiagnostic(false);
            }}
            onContinueLearning={() => setShowDiagnostic(false)}
          />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <PuzzlePieceIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 text-lg">沒有可用的測驗資料</p>
      </div>
    );
  }

  const currentQuizSet: QuizDifficultyContent | undefined = quiz[selectedDifficulty];

  const difficultyLevels: { key: QuizDifficulty; label: string; color: string }[] = [
    { key: QuizDifficulty.Easy, label: '簡單', color: 'bg-green-500 hover:bg-green-600' },
    { key: QuizDifficulty.Normal, label: '普通', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { key: QuizDifficulty.Hard, label: '困難', color: 'bg-red-500 hover:bg-red-600' },
  ];

  const quizTypeLabels: Record<QuizContentKey, string> = {
    trueFalse: "是非題",
    multipleChoice: "選擇題",
    fillInTheBlanks: "填空題",
    sentenceScramble: "句子重組",
    memoryCardGame: "翻卡牌記憶遊戲",
  };

  const getQuizComponent = (type: QuizContentKey, questions: any[]) => {
    if (!questions || questions.length === 0) return null;

    const createAnswerCallback = (questionIndex: number) => supportsDiagnostic 
      ? (userAnswer: any, isCorrect: boolean, responseTime?: number) => {
          const correctAnswer = getCorrectAnswer(type, questions[questionIndex]);
          handleQuestionResponse(type, questionIndex, userAnswer, correctAnswer, isCorrect, responseTime);
        }
      : undefined;

    switch (type) {
      case 'trueFalse':
        return (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <TrueFalseQuizItem 
                key={`${selectedDifficulty}-tf-${i}`} 
                question={q} 
                itemNumber={i + 1}
                onAnswer={createAnswerCallback(i)}
              />
            ))}
          </div>
        );
      case 'multipleChoice':
        return (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <MultipleChoiceQuizItem 
                key={`${selectedDifficulty}-mc-${i}`} 
                question={q} 
                itemNumber={i + 1}
                onAnswer={createAnswerCallback(i)}
              />
            ))}
          </div>
        );
      case 'fillInTheBlanks':
        return (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <FillBlankQuizItem 
                key={`${selectedDifficulty}-fb-${i}`} 
                question={q} 
                itemNumber={i + 1}
                onAnswer={createAnswerCallback(i)}
              />
            ))}
          </div>
        );
      case 'sentenceScramble':
        return (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <SentenceScrambleQuizItem 
                key={`${selectedDifficulty}-ss-${i}`} 
                question={q} 
                itemNumber={i + 1}
                onAnswer={createAnswerCallback(i)}
              />
            ))}
          </div>
        );
      case 'memoryCardGame':
        return (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <MemoryCardGameQuizItem 
                key={`${selectedDifficulty}-mcg-${i}`} 
                question={q} 
                itemNumber={i + 1}
                onAnswer={createAnswerCallback(i)}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <PuzzlePieceIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">互動測驗</h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <AcademicCapIcon className="w-5 h-5" />
              <span className="text-lg font-medium">{topic}</span>
              {supportsDiagnostic && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  支援 AI 診斷
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {supportsDiagnostic && getCurrentDifficultyResponses().length > 0 && (
                <button
                  onClick={() => setShowDiagnostic(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  查看學習診斷 ({getCurrentDifficultyResponses().length})
                </button>
              )}
              
              {getCurrentDifficultyResponses().length > 0 && (
                <button
                  onClick={handleShareResults}
                  disabled={sharing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-11.314a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                  </svg>
                  {sharing ? '分享中...' : `分享結果給老師 (${getCurrentDifficultyResponses().length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Diagnostic Notice */}
        {supportsDiagnostic && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ChartBarIcon className="w-5 h-5 text-blue-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-medium">
                  此測驗支援 AI 學習診斷功能
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  完成題目後可查看個人化學習建議。您的答題資料僅用於生成學習診斷報告。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Difficulty Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">選擇難度等級</h2>
          <div className="flex flex-wrap gap-3">
            {difficultyLevels.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setSelectedDifficulty(key)}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all transform hover:scale-105 shadow-md
                  ${selectedDifficulty === key 
                    ? `${color} ring-4 ring-opacity-50` 
                    : 'bg-gray-400 hover:bg-gray-500'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Content */}
        {currentQuizSet && (
          <div className="space-y-8">
            {(Object.keys(quizTypeLabels) as QuizContentKey[]).map((type) => {
              const questions = currentQuizSet[type];
              const component = getQuizComponent(type, questions);
              
              if (!component) return null;

              return (
                <div key={type} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {quizTypeLabels[type]}
                    </h3>
                  </div>
                  {component}
                </div>
              );
            })}
          </div>
        )}

        {(!currentQuizSet || Object.values(currentQuizSet).every(arr => !arr || arr.length === 0)) && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <PuzzlePieceIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">此難度等級暫無測驗題目</p>
              <p className="text-slate-500 text-sm mt-2">請選擇其他難度等級</p>
            </div>
          </div>
        )}
      </div>

      {/* 姓名輸入 Modal */}
      {showNameInput && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNameInput(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">分享作答結果給老師</h3>
              <button
                onClick={() => setShowNameInput(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="關閉"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-4">請輸入您的姓名，讓老師知道這是誰的作答結果：</p>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="請輸入姓名"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleShareResults()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNameInput(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleShareResults}
                disabled={!studentName.trim() || sharing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sharing ? '分享中...' : '分享結果'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分享成功 Modal */}
      {shareUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShareUrl('');
              setShowQRCode(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">✅ 作答結果已分享成功！</h3>
              <button
                onClick={() => {
                  setShareUrl('');
                  setShowQRCode(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="關閉"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-4">請將下方連結傳送給您的老師，老師可以查看您的作答結果並提供學習建議：</p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                />
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={async () => {
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(shareUrl);
                        alert('連結已複製到剪貼簿！');
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    複製連結
                  </button>
                  <button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5H8.25v1.5H13.5V13.5ZM13.5 16.5H8.25V18H13.5v-1.5ZM16.5 16.5h1.5V18h-1.5v-1.5ZM16.5 13.5h1.5v1.5h-1.5v-1.5Z" />
                    </svg>
                    顯示 QR Code
                  </button>
                </div>
              </div>
            </div>
            
            {/* QR Code 顯示區域 */}
            {showQRCode && (
              <div className="mb-4 flex justify-center">
                <QRCodeDisplay
                  url={shareUrl}
                  title="作答結果分享 QR Code"
                  size={200}
                  className="bg-white"
                />
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                💡 <strong>給老師的說明：</strong><br/>
                老師打開連結後可以看到 {studentName} 在「{topic}」({selectedDifficulty === QuizDifficulty.Easy ? '簡單' : selectedDifficulty === QuizDifficulty.Normal ? '普通' : '困難'}難度) 的作答結果，並可使用 AI 進行詳細的學習分析。
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShareUrl('');
                  setShowQRCode(false);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            由 AI 學習頁面產生器創建 • 祝你學習愉快！
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentQuizView;