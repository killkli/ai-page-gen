import React, { useState } from 'react';
import { LearningObjectiveItem } from '../../types';

interface LearningObjectiveCardProps {
  objective: LearningObjectiveItem;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onComplete: (objectiveId: string) => void;
}

const LearningObjectiveCard: React.FC<LearningObjectiveCardProps> = ({
  objective,
  index,
  isCompleted,
  isCurrent,
  onComplete
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleMarkAsComplete = () => {
    onComplete(`objective_${index}`);
  };

  return (
    <div 
      className={`
        relative w-full h-64 cursor-pointer group
        ${isCurrent ? 'ring-4 ring-indigo-300 ring-opacity-50' : ''}
        ${isCompleted ? 'opacity-75' : ''}
      `}
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
    >
      {/* 3D 翻卡容器 */}
      <div 
        className={`
          relative w-full h-full transition-transform duration-500 ease-in-out
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 正面 - 學習目標 */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-full bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
                  目標 {index + 1}
                </span>
                {isCompleted && (
                  <div className="bg-green-400 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold mb-3 leading-tight">
                {objective.objective.length > 60 
                  ? `${objective.objective.substring(0, 60)}...` 
                  : objective.objective
                }
              </h3>
              
              {objective.description && (
                <p className="text-indigo-100 text-sm leading-relaxed">
                  {objective.description.length > 80 
                    ? `${objective.description.substring(0, 80)}...` 
                    : objective.description
                  }
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-indigo-100">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                點擊翻卡學習
              </div>
              
              {isCurrent && !isCompleted && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* 背面 - 詳細內容和教學例子 */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="h-full bg-white rounded-xl shadow-lg border-2 border-indigo-200 flex flex-col">
            {/* 頂部固定區域 */}
            <div className="flex items-center justify-between p-4 pb-2 border-b border-indigo-100">
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                詳細說明
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="text-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 可滾動內容區域 */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <h3 className="text-base font-bold text-slate-800 mb-3 leading-tight">
                {objective.objective.length > 50 
                  ? `${objective.objective.substring(0, 50)}...` 
                  : objective.objective
                }
              </h3>

              {objective.description && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center">
                    💡 <span className="ml-1">核心概念</span>
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-2 max-h-16 overflow-y-auto">
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {objective.description.length > 120 
                        ? `${objective.description.substring(0, 120)}...` 
                        : objective.description
                      }
                    </p>
                  </div>
                </div>
              )}

              {objective.teachingExample && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center">
                    📝 <span className="ml-1">教學範例</span>
                  </h4>
                  <div className="bg-green-50 rounded-lg p-2 max-h-16 overflow-y-auto">
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {objective.teachingExample.length > 100 
                        ? `${objective.teachingExample.substring(0, 100)}...` 
                        : objective.teachingExample
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 底部固定按鈕區域 */}
            <div className="border-t border-indigo-100 p-3 space-y-2">
              {!isCompleted && hasInteracted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsComplete();
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  標記為已理解
                </button>
              )}
              
              {isCompleted && (
                <div className="text-center text-green-600 font-medium flex items-center justify-center gap-2 py-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">已完成學習</span>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="text-indigo-500 hover:text-indigo-700 text-xs font-medium transition-colors flex items-center justify-center gap-1 mx-auto py-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  翻回正面
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 懸停效果 */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-xl transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default LearningObjectiveCard;