import React, { useState } from 'react';
import { LearningLevelSuggestions, LearningLevel } from '../types';
import SectionCard from './SectionCard';
import { AcademicCapIcon } from './icons';

interface LearningLevelSelectorProps {
  learningLevels: LearningLevelSuggestions;
  onLevelSelect?: (level: LearningLevel) => void;
  onGenerateWithLevel?: (level: LearningLevel) => void;
  selectedLevelId?: string;
  isLoading?: boolean;
}

const LearningLevelSelector: React.FC<LearningLevelSelectorProps> = ({ 
  learningLevels, 
  onLevelSelect,
  onGenerateWithLevel,
  selectedLevelId,
  isLoading = false
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>(
    selectedLevelId || learningLevels.defaultLevelId
  );

  const handleLevelSelect = (level: LearningLevel) => {
    setSelectedLevel(level.id);
    onLevelSelect?.(level);
  };

  // Sort levels by order
  const sortedLevels = [...learningLevels.suggestedLevels].sort((a, b) => a.order - b.order);

  return (
    <SectionCard title="學習程度建議" icon={<AcademicCapIcon className="w-7 h-7"/>}>
      <div className="space-y-3">
        <p className="text-sm text-slate-600 mb-4">
          根據學習主題自動生成的程度建議，選擇最適合的學習等級：
        </p>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedLevels.map((level) => (
            <div
              key={level.id}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${selectedLevel === level.id
                  ? 'border-sky-500 bg-sky-50 shadow-md'
                  : 'border-slate-300 bg-white hover:border-sky-300 hover:shadow-sm'
                }
              `}
              onClick={() => handleLevelSelect(level)}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${selectedLevel === level.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                  }
                `}>
                  {level.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`
                    text-lg font-semibold mb-2
                    ${selectedLevel === level.id ? 'text-sky-700' : 'text-slate-700'}
                  `}>
                    {level.name}
                  </h4>
                  <p className={`
                    text-sm leading-relaxed
                    ${selectedLevel === level.id ? 'text-sky-600' : 'text-slate-600'}
                  `}>
                    {level.description}
                  </p>
                </div>
              </div>
              
              {selectedLevel === level.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-sky-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                已選擇：<strong>{sortedLevels.find(l => l.id === selectedLevel)?.name}</strong>
              </span>
            </div>
          </div>
          
          {onGenerateWithLevel && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const level = sortedLevels.find(l => l.id === selectedLevel);
                  if (level) onGenerateWithLevel(level);
                }}
                disabled={isLoading}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    產生內容中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    開始產生學習內容
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default LearningLevelSelector;