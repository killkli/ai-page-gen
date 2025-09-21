import React, { useState } from 'react';
import { VocabularyLevel } from '../types';
import { VOCABULARY_LEVELS } from '../consts'
import SectionCard from './SectionCard';
import { BookOpenIcon } from './icons';

interface VocabularyLevelSelectorProps {
  onVocabularyLevelSelect: (level: VocabularyLevel) => void;
  selectedLevel?: VocabularyLevel | null;
  isVisible?: boolean;
}


const VocabularyLevelSelector: React.FC<VocabularyLevelSelectorProps> = ({
  onVocabularyLevelSelect,
  selectedLevel,
  isVisible = true
}) => {
  const [currentSelection, setCurrentSelection] = useState<string>(
    selectedLevel?.id || 'intermediate'
  );

  const handleLevelSelect = (level: VocabularyLevel) => {
    setCurrentSelection(level.id);
    onVocabularyLevelSelect(level);
  };

  if (!isVisible) return null;

  return (
    <SectionCard title="選擇英語單字程度" icon={<BookOpenIcon className="w-7 h-7" />}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          請選擇您的英語單字量範圍，系統會根據此程度調整教學內容的複雜度：
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VOCABULARY_LEVELS.map((level) => (
            <div
              key={level.id}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${currentSelection === level.id
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-slate-300 bg-white hover:border-green-300 hover:shadow-sm'
                }
              `}
              onClick={() => handleLevelSelect(level)}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${currentSelection === level.id
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                    }
                  `}>
                    {level.wordCount >= 1000 ? `${level.wordCount / 1000}k` : level.wordCount}
                  </div>
                  <h4 className={`
                    text-sm font-semibold
                    ${currentSelection === level.id ? 'text-green-700' : 'text-slate-700'}
                  `}>
                    {level.name}
                  </h4>
                </div>
                <p className={`
                  text-xs leading-relaxed
                  ${currentSelection === level.id ? 'text-green-600' : 'text-slate-600'}
                `}>
                  {level.description}
                </p>
              </div>

              {currentSelection === level.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <BookOpenIcon className="w-4 h-4" />
            <span>
              已選擇：<strong>{VOCABULARY_LEVELS.find(l => l.id === currentSelection)?.name}</strong>
              （{VOCABULARY_LEVELS.find(l => l.id === currentSelection)?.wordCount} 詞彙）
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default VocabularyLevelSelector;
