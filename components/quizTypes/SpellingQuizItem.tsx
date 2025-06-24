
import React from 'react';
// Removed CheckCircleIcon and XCircleIcon as they are not used in the placeholder.
// import { SpellingQuestion } from '../../types'; // Removed import for SpellingQuestion

// This component is currently not used and its related type 'SpellingQuestion'
// has been removed from the application's types.
// This file is modified to resolve a TypeScript error; the component is non-functional.
// Consider removing this file entirely if SpellingQuiz functionality is confirmed as deprecated.

interface SpellingQuizItemProps {
  // question: SpellingQuestion; // Removed prop
  itemNumber: number; // Kept itemNumber for structural similarity if ever repurposed
}

const SpellingQuizItem: React.FC<SpellingQuizItemProps> = ({ itemNumber }) => {
  // All state and logic related to SpellingQuestion has been removed.
  // const [userAnswer, setUserAnswer] = useState('');
  // const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  // const [showHint, setShowHint] = useState(false);

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Logic removed
  // };

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-3">
      <p className="font-medium text-slate-700 mb-1">
        {itemNumber}. Spelling question functionality is currently unavailable.
      </p>
      {/* 
      Example of how it might have looked, now commented out:
      {question.hint && (
        <button 
          onClick={() => setShowHint(!showHint)} 
          className="text-xs text-sky-600 hover:text-sky-800 mb-2"
        >
          {showHint ? '隱藏提示' : '顯示提示'}
        </button>
      )}
      {showHint && question.hint && (
        <p className="text-sm text-slate-500 italic mb-2">提示： {question.hint}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => {
            setUserAnswer(e.target.value);
            if (feedback) setFeedback(null); 
          }}
          placeholder="在此輸入您的拼字"
          className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
        />
        <button type="submit" className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
          檢查
        </button>
      </form>
      {feedback && (
        <div className={`mt-2 p-2 rounded-md text-sm flex items-center ${feedback.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {feedback.isCorrect ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
          {feedback.message}
        </div>
      )}
      */}
    </div>
  );
};

export default SpellingQuizItem;
