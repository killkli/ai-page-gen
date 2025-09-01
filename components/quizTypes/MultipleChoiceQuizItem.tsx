import React, { useState, useEffect } from 'react';
import { MultipleChoiceQuestion } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '../icons';

interface MultipleChoiceQuizItemProps {
  question: MultipleChoiceQuestion;
  itemNumber: number;
}

const MultipleChoiceQuizItem: React.FC<MultipleChoiceQuizItemProps> = ({ question, itemNumber }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
  }, [question]);

  const handleSubmit = () => {
    if (selectedOption === null) {
      setFeedback({ isCorrect: false, message: '請選擇一個選項。' });
      return;
    }
    const isCorrect = selectedOption === question.correctAnswerIndex;
    setFeedback({
      isCorrect,
      message: isCorrect ? '答對了！' : `答錯了。正確答案是： ${(question.options || [])[question.correctAnswerIndex] || '未知'}`,
    });
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-3">
      <p className="font-medium text-slate-700 mb-2">
        {itemNumber}. {question.question}
      </p>
      <div className="space-y-2 mb-3">
        {(question.options || []).map((option, index) => (
          <label key={index} className={`flex items-center p-2 border rounded-md cursor-pointer hover:bg-sky-50 transition-colors ${selectedOption === index ? 'bg-sky-100 border-sky-500' : 'border-slate-300'} ${feedback !== null ? 'cursor-not-allowed opacity-70' : ''}`}>
            <input
              type="radio"
              name={`mcq-${itemNumber}-${question.question}`} // More unique name
              value={index}
              checked={selectedOption === index}
              onChange={() => {
                if (feedback === null) { // Allow change only if not submitted
                    setSelectedOption(index);
                }
              }}
              className="mr-2 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-400"
              disabled={feedback !== null} // Disable after submission
            />
            {option}
          </label>
        ))}
      </div>
      <button 
        onClick={handleSubmit} 
        className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-400"
        disabled={feedback !== null || selectedOption === null} // Disable after submission or if no option selected
      >
        檢查答案
      </button>
      {feedback && (
         <div className={`mt-2 p-2 rounded-md text-sm flex items-center ${feedback.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {feedback.isCorrect ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceQuizItem;