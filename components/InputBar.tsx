
import React from 'react';

interface InputBarProps {
  topic: string;
  setTopic: (topic: string) => void;
  onGenerate: () => void;
  onGenerateWithLevels?: () => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ topic, setTopic, onGenerate, onGenerateWithLevels, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && topic.trim()) {
      onGenerate();
    }
  };

  const handleGenerateWithLevels = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoading && topic.trim() && onGenerateWithLevels) {
      onGenerateWithLevels();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white shadow-lg rounded-xl">
      <label htmlFor="topic-input" className="block text-xl font-semibold text-slate-700 mb-3">
        輸入學習主題
      </label>
      <div className="flex flex-col space-y-3">
        <input
          id="topic-input"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：光合作用、JavaScript Promises、法國大革命"
          className="w-full p-3 border border-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition-shadow bg-slate-50 text-slate-800 placeholder-slate-500"
          disabled={isLoading}
          aria-label="學習主題輸入欄位"
        />
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {onGenerateWithLevels && (
            <button
              type="button"
              onClick={handleGenerateWithLevels}
              disabled={isLoading || !topic.trim()}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  產生中...
                </>
              ) : (
                '🎯 選擇程度後產生'
              )}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="flex-1 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                產生中...
              </>
            ) : (
              '⚡ 直接產生內容'
            )}
          </button>
        </div>
        
        {onGenerateWithLevels && (
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            <p><strong>🎯 選擇程度後產生：</strong> 先獲得學習程度建議，選擇合適程度後產生針對性內容</p>
            <p><strong>⚡ 直接產生內容：</strong> 立即產生包含所有程度的完整學習內容</p>
          </div>
        )}
      </div>
    </form>
  );
};

export default InputBar;
