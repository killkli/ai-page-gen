import React from 'react';
import { QuizCustomConfig, DEFAULT_QUIZ_CONFIG, QuizContentKey, QUIZ_TYPE_LIMITS } from '../types';

interface QuizConfigPanelProps {
  config: QuizCustomConfig;
  onConfigChange: (config: QuizCustomConfig) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

const QuizConfigPanel: React.FC<QuizConfigPanelProps> = ({
  config,
  onConfigChange,
  onRegenerate,
  isGenerating
}) => {
  const quizTypeLabels: Record<QuizContentKey, string> = {
    trueFalse: "是非題",
    multipleChoice: "選擇題",
    fillInTheBlanks: "填空題",
    sentenceScramble: "句子重組",
    memoryCardGame: "翻卡記憶",
  };

  const handleQuestionCountChange = (
    questionType: QuizContentKey,
    count: number
  ) => {
    const maxLimit = QUIZ_TYPE_LIMITS[questionType];
    const validCount = Math.max(0, Math.min(maxLimit, count));

    const newConfig = {
      easy: { ...config.easy, [questionType]: validCount },
      normal: { ...config.normal, [questionType]: validCount },
      hard: { ...config.hard, [questionType]: validCount }
    };
    onConfigChange(newConfig);
  };

  const resetToDefault = () => {
    onConfigChange(DEFAULT_QUIZ_CONFIG);
  };

  const getTotalQuestions = (): number => {
    const easyTotal = Object.values(config.easy).reduce((sum, count) => sum + count, 0);
    const normalTotal = Object.values(config.normal).reduce((sum, count) => sum + count, 0);
    const hardTotal = Object.values(config.hard).reduce((sum, count) => sum + count, 0);
    return easyTotal + normalTotal + hardTotal;
  };

  const getQuestionTypeTotal = (questionType: QuizContentKey): number => {
    return config.easy[questionType] + config.normal[questionType] + config.hard[questionType];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-indigo-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            測驗題數統一設定
          </h3>
          <p className="text-sm text-gray-600">
            一次設定所有難度的題目數量 • 總計: <span className="font-semibold text-indigo-600">{getTotalQuestions()}</span> 題
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefault}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            重設預設
          </button>
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md flex items-center gap-2 font-medium"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                重新生成中...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                更新設定並重新出題
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {(Object.keys(quizTypeLabels) as QuizContentKey[]).map((questionType) => {
          const maxLimit = QUIZ_TYPE_LIMITS[questionType];
          const currentValue = config.easy[questionType]; // 假設三個難度都相同
          const totalAcrossDifficulties = getQuestionTypeTotal(questionType);

          return (
            <div key={questionType} className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    {quizTypeLabels[questionType]}
                  </h4>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
                    限制: 0-{maxLimit} 題
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    各難度: <span className="font-mono font-medium">{currentValue}</span> 題
                  </div>
                  <div className="text-xs text-indigo-600">
                    總計: <span className="font-semibold">{totalAcrossDifficulties}</span> 題
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleQuestionCountChange(questionType, currentValue - 1)}
                  className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 font-bold text-lg transition-colors shadow-sm"
                  disabled={currentValue <= 0}
                >
                  -
                </button>

                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {currentValue}
                  </div>
                  <div className="text-xs text-gray-500">每個難度</div>
                </div>

                <button
                  onClick={() => handleQuestionCountChange(questionType, currentValue + 1)}
                  className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 font-bold text-lg transition-colors shadow-sm"
                  disabled={currentValue >= maxLimit}
                >
                  +
                </button>
              </div>

              {/* 三個難度的預覽 */}
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-semibold mb-1">
                    {config.easy[questionType]}
                  </div>
                  <div className="text-xs text-green-700">簡單</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 text-sm font-semibold mb-1">
                    {config.normal[questionType]}
                  </div>
                  <div className="text-xs text-yellow-700">普通</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700 text-sm font-semibold mb-1">
                    {config.hard[questionType]}
                  </div>
                  <div className="text-xs text-red-700">困難</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">📝 使用說明：</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-medium text-blue-900 mb-1">• 統一設定模式</p>
                <p>調整題數會同時套用到簡單、普通、困難三種難度</p>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">• 題數限制</p>
                <p>一般題型: 0-10題 | 翻卡記憶: 0-2題</p>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">• 跳過題型</p>
                <p>設定為 0 題可完全跳過該種題型</p>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">• 記憶卡遊戲</p>
                <p>每題包含多對卡片，建議 1-2 題即可</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizConfigPanel;
