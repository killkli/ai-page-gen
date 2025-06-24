import React, { useState } from 'react';
import { OnlineInteractiveQuiz, QuizDifficulty, QuizDifficultyContent, QuizContentKey } from '../types';
import TrueFalseQuizItem from './quizTypes/TrueFalseQuizItem';
import MultipleChoiceQuizItem from './quizTypes/MultipleChoiceQuizItem';
import FillBlankQuizItem from './quizTypes/FillBlankQuizItem';
import SentenceScrambleQuizItem from './quizTypes/SentenceScrambleQuizItem';
// import SpellingQuizItem from './quizTypes/SpellingQuizItem'; // Removed import
import { PuzzlePieceIcon } from './icons';
import SectionCard from './SectionCard';

interface QuizViewProps {
  quizzes: OnlineInteractiveQuiz | undefined;
}

const QuizView: React.FC<QuizViewProps> = ({ quizzes }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>(QuizDifficulty.Easy);

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
    // spelling: "拼字測驗", // Removed label
  };

  return (
    <SectionCard title="線上互動測驗" icon={<PuzzlePieceIcon className="w-7 h-7"/>}>
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

      {!currentQuizSet ? (
        <p>此難度級別沒有找到測驗題目。</p>
      ) : (
        (Object.keys(quizTypeLabels) as QuizContentKey[]).map((quizType) => {
          // Explicitly check if currentQuizSet has the quizType property
          if (!currentQuizSet.hasOwnProperty(quizType)) {
            return null;
          }
          const questions = currentQuizSet[quizType];
          if (!questions || questions.length === 0) {
            // If there are no questions for this type and difficulty, don't render the heading
            return null; 
          }

          return (
            <div key={`${selectedDifficulty}-${quizType}`} className="mb-8">
              <h4 className="text-xl font-semibold text-slate-700 mb-3 border-b-2 border-sky-200 pb-1">
                {quizTypeLabels[quizType]}
              </h4>
              {quizType === 'trueFalse' && questions.map((q, i) => (
                <TrueFalseQuizItem key={`${selectedDifficulty}-tf-${i}`} question={q as any} itemNumber={i + 1} />
              ))}
              {quizType === 'multipleChoice' && questions.map((q, i) => (
                <MultipleChoiceQuizItem key={`${selectedDifficulty}-mc-${i}`} question={q as any} itemNumber={i + 1} />
              ))}
              {quizType === 'fillInTheBlanks' && questions.map((q, i) => (
                <FillBlankQuizItem key={`${selectedDifficulty}-fb-${i}`} question={q as any} itemNumber={i + 1} />
              ))}
              {quizType === 'sentenceScramble' && questions.map((q, i) => (
                <SentenceScrambleQuizItem key={`${selectedDifficulty}-ss-${i}`} question={q as any} itemNumber={i + 1} />
              ))}
              {/* Rendering for spelling removed */}
            </div>
          );
        })
      )}
    </SectionCard>
  );
};

export default QuizView;