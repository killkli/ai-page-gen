import React, { useState, useEffect } from 'react';
import { FillBlankQuestion } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '../icons';

interface FillBlankQuizItemProps {
  question: FillBlankQuestion;
  itemNumber: number;
  onAnswer?: (userAnswer: any, isCorrect: boolean) => void;
}

const FillBlankQuizItem: React.FC<FillBlankQuizItemProps> = ({ question, itemNumber, onAnswer }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  useEffect(() => {
    setUserAnswer('');
    setFeedback(null);
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
        setFeedback({ isCorrect: false, message: '請輸入答案。' });
        return;
    }
    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    setFeedback({
      isCorrect,
      message: isCorrect ? '答對了！' : `答錯了。正確答案是： ${question.correctAnswer}`,
    });

    // 呼叫診斷回調函數
    if (onAnswer) {
      onAnswer(userAnswer.trim(), isCorrect);
    }
  };

  const parts = question.sentenceWithBlank?.split('____') || ['', ''];

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor={`fillblank-${itemNumber}-${question.sentenceWithBlank}`} className="font-medium text-slate-700 mb-1 block">
          {itemNumber}. {parts[0]}
          <input
            id={`fillblank-${itemNumber}-${question.sentenceWithBlank}`} // More unique id
            type="text"
            value={userAnswer}
            onChange={(e) => {
              if (feedback === null) { // Allow change only if not submitted
                setUserAnswer(e.target.value);
              }
            }}
            className="mx-1 p-1 border-b-2 border-slate-400 focus:border-sky-500 outline-none w-24 sm:w-32 bg-transparent"
            placeholder="答案"
            disabled={feedback !== null} // Disable after submission
          />
          {parts[1]}
        </label>
        <button 
            type="submit" 
            className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-400"
            disabled={feedback !== null || !userAnswer.trim()} // Disable after submission or if no input
        >
          檢查
        </button>
      </form>
      {feedback && (
         <div className={`mt-2 p-2 rounded-md text-sm flex items-center ${feedback.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {feedback.isCorrect ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default FillBlankQuizItem;