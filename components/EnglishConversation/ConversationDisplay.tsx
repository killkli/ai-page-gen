import React, { useState, useCallback } from 'react';
import { ConversationTurn } from '../../services/conversationService';
import { speechService, VoiceSettings } from '../../services/speechService';

interface ConversationDisplayProps {
  turn: ConversationTurn;
  isCurrentTurn: boolean;
  isStudentTurn: boolean; // 是否輪到學生說話
  studentRole: string; // 學生扮演的角色
  onPlayComplete?: () => void;
  showTranslation?: boolean;
  showHints?: boolean;
  voiceSettings?: Partial<VoiceSettings>;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  turn,
  isCurrentTurn,
  isStudentTurn,
  studentRole,
  onPlayComplete,
  showTranslation = false,
  showHints = false,
  voiceSettings = {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [translationVisible, setTranslationVisible] = useState(showTranslation);
  const [hintsVisible, setHintsVisible] = useState(showHints);

  // 播放對話語音
  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      speechService.stopSpeaking();
      return;
    }

    try {
      setIsPlaying(true);
      await speechService.speak(
        turn.text,
        { 
          lang: 'en-US',
          rate: 0.9, // 稍慢一點方便學習
          ...voiceSettings 
        },
        undefined, // onStart
        () => {
          setIsPlaying(false);
          onPlayComplete?.();
        },
        (error) => {
          console.error('Speech playback error:', error);
          setIsPlaying(false);
        }
      );
    } catch (error) {
      console.error('Failed to play speech:', error);
      setIsPlaying(false);
    }
  }, [turn.text, isPlaying, voiceSettings, onPlayComplete]);

  // 獲取難度顏色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'normal': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 高亮關鍵詞
  const highlightKeywords = (text: string, keywords: string[]) => {
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    return highlightedText;
  };

  return (
    <div className={`
      relative rounded-lg border-2 transition-all duration-300 mb-4
      ${isCurrentTurn 
        ? 'border-blue-400 shadow-lg bg-blue-50' 
        : 'border-gray-200 bg-white'
      }
      ${isStudentTurn && isCurrentTurn 
        ? 'border-green-400 bg-green-50' 
        : ''
      }
    `}>
      {/* 頭部信息 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {/* 角色圖標 */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
            ${isStudentTurn 
              ? 'bg-green-500' 
              : turn.speaker === 'Teacher' || turn.speaker === '老師'
                ? 'bg-blue-500'
                : 'bg-gray-500'
            }
          `}>
            {turn.speaker.charAt(0).toUpperCase()}
          </div>
          
          {/* 角色名稱和狀態 */}
          <div>
            <div className="font-medium text-gray-900">
              {turn.speaker}
              {isStudentTurn && (
                <span className="ml-2 text-sm text-green-600 font-normal">
                  (Your turn)
                </span>
              )}
            </div>
            {isCurrentTurn && (
              <div className="text-sm text-blue-600">
                Current conversation turn
              </div>
            )}
          </div>
        </div>

        {/* 控制按鈕 */}
        <div className="flex items-center space-x-2">
          {/* 難度標籤 */}
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full border
            ${getDifficultyColor(turn.difficulty)}
          `}>
            {turn.difficulty}
          </span>

          {/* 播放按鈕 */}
          <button
            onClick={handlePlay}
            disabled={isStudentTurn}
            className={`
              p-2 rounded-full transition-colors
              ${isStudentTurn 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isPlaying 
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
            title={isStudentTurn ? "It's your turn to speak" : isPlaying ? "Stop" : "Play audio"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* 詳細信息切換 */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Show/hide details"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 對話內容 */}
      <div className="p-4">
        {/* 主要對話文字 */}
        <div className="text-lg text-gray-900 leading-relaxed mb-3">
          {turn.keyWords.length > 0 ? (
            <div 
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(turn.text, turn.keyWords)
              }}
            />
          ) : (
            turn.text
          )}
        </div>

        {/* 翻譯 */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => setTranslationVisible(!translationVisible)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {translationVisible ? '隱藏翻譯' : '顯示翻譯'}
          </button>
        </div>
        
        {translationVisible && (
          <div className="text-gray-600 bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
            {turn.translation}
          </div>
        )}

        {/* 學生回應提示 (只在學生回合顯示) */}
        {isStudentTurn && turn.expectedResponseHints && turn.expectedResponseHints.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setHintsVisible(!hintsVisible)}
              className="text-sm text-green-600 hover:text-green-800 font-medium mb-2"
            >
              {hintsVisible ? '隱藏提示' : '需要提示？'}
            </button>
            
            {hintsVisible && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm font-medium text-green-800 mb-2">
                  💡 Response hints:
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  {turn.expectedResponseHints.map((hint, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 詳細信息 */}
        {showDetails && (
          <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
            {/* 練習重點 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                📚 Practice Point:
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                {turn.practicePoint}
              </div>
            </div>

            {/* 關鍵詞彙 */}
            {turn.keyWords.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  🔑 Key Words:
                </div>
                <div className="flex flex-wrap gap-2">
                  {turn.keyWords.map((word, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 音標 */}
            {turn.pronunciation && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  🔊 Pronunciation:
                </div>
                <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-200">
                  {turn.pronunciation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 當前回合指示器 */}
      {isCurrentTurn && (
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-8 bg-blue-400 rounded-r"></div>
        </div>
      )}

      {/* 學生回合特殊標記 */}
      {isStudentTurn && isCurrentTurn && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ConversationDisplay;