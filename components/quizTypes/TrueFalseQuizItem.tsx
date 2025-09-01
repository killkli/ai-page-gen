import React, { useState, useEffect } from 'react';
import { TrueFalseQuestion } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '../icons';

interface TrueFalseQuizItemProps {
  question: TrueFalseQuestion;
  itemNumber: number;
  onAnswer?: (userAnswer: boolean, isCorrect: boolean) => void;
}

const TrueFalseQuizItem: React.FC<TrueFalseQuizItemProps> = ({ question, itemNumber, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; explanation?: string } | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
    setFeedback(null);
  }, [question]);

  const handleSelectAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    // Feedback is now set immediately upon selection.
    // If you want a separate "check answer" button, this logic would move there.
    const isCorrect = answer === question.isTrue;
    let feedbackMessage = isCorrect ? '答對了！' : '答錯了。';
    if (!isCorrect) {
        feedbackMessage += ` 正確答案是：${question.isTrue ? '是 (True)' : '非 (False)'}。`;
    }
    
    setFeedback({
      isCorrect,
      message: feedbackMessage,
      explanation: question.explanation
    });

    // 呼叫診斷回調函數
    if (onAnswer) {
      onAnswer(answer, isCorrect);
    }
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-3">
      <p className="font-medium text-slate-700 mb-2">
        {itemNumber}. {question.statement || '題目載入中...'}
      </p>
      <div className="flex space-x-3 mb-3">
        <button
          onClick={() => handleSelectAnswer(true)}
          className={`px-6 py-2 rounded-md font-medium transition-all
            ${selectedAnswer === true ? (feedback?.isCorrect ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-red-500 text-white ring-2 ring-red-300') : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}
          `}
          aria-pressed={selectedAnswer === true}
          disabled={feedback !== null} // Disable after an answer is processed
        >
          是 (True)
        </button>
        <button
          onClick={() => handleSelectAnswer(false)}
          className={`px-6 py-2 rounded-md font-medium transition-all
            ${selectedAnswer === false ? (feedback?.isCorrect ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-red-500 text-white ring-2 ring-red-300') : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}
          `}
          aria-pressed={selectedAnswer === false}
          disabled={feedback !== null} // Disable after an answer is processed
        >
          非 (False)
        </button>
      </div>
      {feedback && (
        <div className={`mt-2 p-2 rounded-md text-sm flex flex-col items-start ${feedback.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <div className="flex items-center">
                {feedback.isCorrect ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
                {feedback.message}
            </div>
            {feedback.explanation && (
                <p className="mt-1 pl-7 text-xs italic">{feedback.explanation}</p>
            )}
        </div>
      )}
    </div>
  );
};

export default TrueFalseQuizItem;