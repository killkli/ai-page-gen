
import React, { useState, useEffect } from 'react';
import { SentenceScrambleQuestion } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '../icons';

interface SentenceScrambleQuizItemProps {
  question: SentenceScrambleQuestion;
  itemNumber: number;
  onAnswer?: (userAnswer: any, isCorrect: boolean, responseTime?: number) => void;
}

const SentenceScrambleQuizItem: React.FC<SentenceScrambleQuizItemProps> = ({ question, itemNumber, onAnswer }) => {
  const [constructedSentence, setConstructedSentence] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const words = question.scrambledWords || [];
    setAvailableWords([...words].sort(() => Math.random() - 0.5));
    setConstructedSentence([]);
    setFeedback(null);
    setStartTime(Date.now()); // 記錄開始時間
  }, [question]);

  const addWordToSentence = (word: string, index: number) => {
    setConstructedSentence([...constructedSentence, word]);
    const newAvailableWords = [...availableWords];
    newAvailableWords.splice(index, 1);
    setAvailableWords(newAvailableWords);
    if (feedback) setFeedback(null);
  };

  const removeWordFromSentence = (word: string, index: number) => {
    setAvailableWords([...availableWords, word]);
    const newConstructedSentence = [...constructedSentence];
    newConstructedSentence.splice(index, 1);
    setConstructedSentence(newConstructedSentence);
    if (feedback) setFeedback(null);
  };
  
  const clearSentence = () => {
    const words = question.scrambledWords || [];
    setAvailableWords([...words].sort(() => Math.random() - 0.5));
    setConstructedSentence([]);
    if (feedback) setFeedback(null);
  }

  const handleSubmit = () => {
    const userAnswer = constructedSentence.join(' ').trim();
    const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
    const isCorrect = normalize(userAnswer) === normalize(question.originalSentence);
    
    setFeedback({
      isCorrect,
      message: isCorrect ? '答對了！' : `答錯了。正確句子是： "${question.originalSentence}"`,
    });

    // 計算答題時間
    const responseTime = startTime > 0 ? Date.now() - startTime : undefined;

    // 呼叫診斷回調函數
    if (onAnswer) {
      onAnswer(userAnswer, isCorrect, responseTime);
    }
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-3">
      <p className="font-medium text-slate-700 mb-2">
        {itemNumber}. 請重組句子：
      </p>
      
      <div className="mb-3 p-3 border border-dashed border-slate-400 rounded-md min-h-[40px] bg-white flex flex-wrap gap-2">
        {constructedSentence.length > 0 ? constructedSentence.map((word, index) => (
          <button
            key={`${word}-${index}-constructed`}
            onClick={() => removeWordFromSentence(word, index)}
            className="px-2 py-1 bg-sky-200 text-sky-800 rounded-md hover:bg-sky-300 transition-colors"
          >
            {word}
          </button>
        )) : <span className="text-slate-400 italic">點擊下方詞彙來組成句子</span>}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {availableWords.map((word, index) => (
          <button
            key={`${word}-${index}-available`}
            onClick={() => addWordToSentence(word, index)}
            className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
          >
            {word}
          </button>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <button onClick={handleSubmit} className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
          檢查句子
        </button>
        <button onClick={clearSentence} className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition-colors">
          清除
        </button>
      </div>

      {feedback && (
         <div className={`mt-3 p-2 rounded-md text-sm flex items-center ${feedback.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {feedback.isCorrect ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default SentenceScrambleQuizItem;
