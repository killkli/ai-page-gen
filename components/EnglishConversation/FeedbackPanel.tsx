import React from 'react';

interface FeedbackData {
  overallScore: number;
  pronunciationScore: number;
  grammarScore: number;
  fluencyScore: number;
  appropriatenessScore: number;
  feedback: string[];
  suggestions: string[];
  encouragement: string;
}

interface FeedbackPanelProps {
  feedback: FeedbackData;
  targetText: string;
  studentResponse: string;
  onContinue?: () => void;
  onRetry?: () => void;
  showDetailedScores?: boolean;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedback,
  targetText,
  studentResponse,
  onContinue,
  onRetry,
  showDetailedScores = true
}) => {
  // 獲取評級文字
  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Practice';
  };

  // 渲染分數圓圈
  const ScoreCircle: React.FC<{ score: number; label: string; size?: 'sm' | 'lg' }> = ({ 
    score, 
    label, 
    size = 'sm' 
  }) => {
    const radius = size === 'lg' ? 45 : 35;
    const strokeWidth = size === 'lg' ? 6 : 4;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="relative">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            <circle
              stroke="#e5e7eb"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${size === 'lg' ? 'text-xl' : 'text-sm'} font-bold text-gray-800`}>
              {score}
            </span>
          </div>
        </div>
        <div className={`text-center ${size === 'lg' ? 'text-sm' : 'text-xs'} text-gray-600 font-medium`}>
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* 頭部 - 總體評分 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Practice Results</h3>
            <p className="text-blue-100">{getScoreGrade(feedback.overallScore)}</p>
          </div>
          <ScoreCircle 
            score={feedback.overallScore} 
            label="Overall" 
            size="lg"
          />
        </div>
      </div>

      {/* 對話比較 */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Expected:</div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
              "{targetText}"
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Your Response:</div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
              "{studentResponse}"
            </div>
          </div>
        </div>
      </div>

      {/* 詳細分數 */}
      {showDetailedScores && (
        <div className="p-4 border-b">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Detailed Scores</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCircle score={feedback.pronunciationScore} label="Pronunciation" />
            <ScoreCircle score={feedback.grammarScore} label="Grammar" />
            <ScoreCircle score={feedback.fluencyScore} label="Fluency" />
            <ScoreCircle score={feedback.appropriatenessScore} label="Appropriateness" />
          </div>
        </div>
      )}

      {/* 回饋內容 */}
      <div className="p-4">
        <div className="space-y-4">
          {/* 正面回饋 */}
          {feedback.feedback.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Feedback
              </h4>
              <div className="space-y-2">
                {feedback.feedback.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 改進建議 */}
          {feedback.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Suggestions for Improvement
              </h4>
              <div className="space-y-2">
                {feedback.suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-2 text-sm bg-yellow-50 p-2 rounded border border-yellow-200"
                  >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 鼓勵話語 */}
          {feedback.encouragement && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div>
                  <div className="text-sm font-medium text-green-800 mb-1">Encouragement</div>
                  <div className="text-sm text-green-700">{feedback.encouragement}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="p-4 bg-gray-50 border-t flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        {onRetry && feedback.overallScore < 70 && (
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span>Try Again</span>
          </button>
        )}
        
        {onContinue && (
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;
