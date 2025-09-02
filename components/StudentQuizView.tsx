import React, { useState, useCallback } from 'react';
import { OnlineInteractiveQuiz, QuizDifficulty, QuizDifficultyContent, QuizContentKey, QuestionResponse } from '../types';
import TrueFalseQuizItem from './quizTypes/TrueFalseQuizItem';
import MultipleChoiceQuizItem from './quizTypes/MultipleChoiceQuizItem';
import FillBlankQuizItem from './quizTypes/FillBlankQuizItem';
import SentenceScrambleQuizItem from './quizTypes/SentenceScrambleQuizItem';
import MemoryCardGameQuizItem from './quizTypes/MemoryCardGameQuizItem';
import LearningDiagnosticReport from './LearningDiagnosticReport';
import { PuzzlePieceIcon, AcademicCapIcon, ChartBarIcon } from './icons';

interface StudentQuizViewProps {
  quiz: OnlineInteractiveQuiz;
  topic: string;
  apiKey?: string;
  supportsDiagnostic?: boolean;
}

const StudentQuizView: React.FC<StudentQuizViewProps> = ({ quiz, topic, apiKey, supportsDiagnostic = false }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>(QuizDifficulty.Easy);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

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
      ? (userAnswer: any, isCorrect: boolean) => {
          const correctAnswer = getCorrectAnswer(type, questions[questionIndex]);
          handleQuestionResponse(type, questionIndex, userAnswer, correctAnswer, isCorrect);
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
            {supportsDiagnostic && getCurrentDifficultyResponses().length > 0 && (
              <button
                onClick={() => setShowDiagnostic(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ChartBarIcon className="w-5 h-5" />
                查看學習診斷 ({getCurrentDifficultyResponses().length})
              </button>
            )}
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