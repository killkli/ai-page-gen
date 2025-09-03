import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConversationPractice } from '../../services/conversationService';
import { conversationService } from '../../services/conversationService';
import { speechService } from '../../services/speechService';
import { getSharedContent } from '../../services/jsonbinService';
import ConversationDisplay from './ConversationDisplay';
import VoiceRecorder from './VoiceRecorder';
import FeedbackPanel from './FeedbackPanel';
import LoadingSpinner from '../LoadingSpinner';

interface StudentResponse {
  turnId: string;
  text: string;
  confidence: number;
  audioBlob?: Blob;
  timestamp: number;
  feedback?: any;
}

interface PracticeSession {
  practiceId: string;
  startTime: number;
  currentTurnIndex: number;
  studentRole: string;
  responses: StudentResponse[];
  completed: boolean;
}

const ConversationPracticePage: React.FC = () => {
  const { binId } = useParams<{ binId: string }>();
  const navigate = useNavigate();
  
  // 核心狀態
  const [conversation, setConversation] = useState<ConversationPractice | null>(null);
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI 狀態
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [selectedStudentRole, setSelectedStudentRole] = useState<string>('');
  
  // 新增的狀態
  const [selectedResponse, setSelectedResponse] = useState<string>('');
  const [lastRecordingResult, setLastRecordingResult] = useState<{
    text: string;
    audioBlob?: Blob;
    similarity?: number;
  } | null>(null);
  
  // 句子分段相關狀態
  const [currentSegments, setCurrentSegments] = useState<string[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);


  // 計算文字相似度 (更寬鬆的版本)
  const calculateSimilarity = (target: string, spoken: string): number => {
    const normalizeText = (text: string) => 
      text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    const targetWords = normalizeText(target).split(/\s+/);
    const spokenWords = normalizeText(spoken).split(/\s+/);
    
    if (targetWords.length === 0 || spokenWords.length === 0) return 0;
    
    // 計算相同詞彙的數量
    let matches = 0;
    const targetWordSet = new Set(targetWords);
    
    spokenWords.forEach(spokenWord => {
      if (targetWordSet.has(spokenWord)) {
        matches++;
      } else {
        // 檢查部分匹配（至少3個字符）
        targetWords.forEach(targetWord => {
          if (targetWord.length >= 3 && spokenWord.length >= 3) {
            if (targetWord.includes(spokenWord) || spokenWord.includes(targetWord)) {
              matches += 0.5;
            }
          }
        });
      }
    });
    
    // 以較長的句子為基準計算相似度
    const maxLength = Math.max(targetWords.length, spokenWords.length);
    const similarity = Math.min(matches / maxLength, 1.0);
    
    
    return similarity;
  };

  // 播放示範發音
  const playDemonstration = async (text: string) => {
    try {
      await speechService.speak(text, {
        lang: 'en-US',
        rate: 0.8,
        pitch: 1.0,
        volume: 1.0
      });
    } catch (error) {
      console.error('Failed to play demonstration:', error);
    }
  };

  // 播放學生的錄音
  const playLastRecording = () => {
    if (lastRecordingResult?.audioBlob) {
      const audio = new Audio(URL.createObjectURL(lastRecordingResult.audioBlob));
      audio.play().catch(error => {
        console.error('Failed to play recording:', error);
      });
    }
  };

  // 根據相似度獲取顏色
  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.8) return 'text-green-600';
    if (similarity >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 將長句子分段
  const segmentSentence = (text: string): string[] => {
    
    // 先按標點符號分割
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // 如果分割後還有很長的句子，按逗號再分割
    const segments: string[] = [];
    for (let sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 50) { // 降低分割門檻到50字符
        const parts = trimmed.split(',').filter(s => s.trim().length > 0);
        if (parts.length > 1) {
          segments.push(...parts.map(p => p.trim()));
        } else {
          segments.push(trimmed);
        }
      } else if (trimmed.length > 0) {
        segments.push(trimmed);
      }
    }
    
    // 如果沒有成功分段，直接返回原句子
    const finalSegments = segments.length > 0 ? segments : [text.trim()];
    
    return finalSegments;
  };

  // 設置當前輪次的分段
  const setupCurrentTurnSegments = (turnIndex: number) => {
    
    if (!conversation || !practiceSession) {
      return;
    }
    
    const turn = conversation.dialogue[turnIndex];
    if (!turn || turn.speaker !== practiceSession.studentRole) {
      return;
    }
    
    const segments = segmentSentence(turn.text);
    
    // 只有在真正開始新回合時才重置 segment index
    // 檢查是否是新回合：segments 不同 或者 currentSegments 為空
    const isNewTurn = currentSegments.length === 0 || 
                     JSON.stringify(segments) !== JSON.stringify(currentSegments);
    
    
    setCurrentSegments(segments);
    
    if (isNewTurn) {
      setCurrentSegmentIndex(0);
      
      // 自動選擇第一個分段
      if (segments.length > 0) {
        setSelectedResponse(segments[0]);
      }
    }
  };

  // 載入對話練習內容
  const loadConversationPractice = useCallback(async () => {
    if (!binId) {
      setError('No practice ID provided');
      setLoading(false);
      return;
    }

    try {
      const sharedContent = await getSharedContent(binId);
      
      if (sharedContent.type !== 'conversation-practice') {
        setError('This is not a conversation practice link');
        setLoading(false);
        return;
      }

      setConversation(sharedContent.practice);
      
      // 自動選擇第一個學生角色
      if (sharedContent.practice.participants.length > 0) {
        setSelectedStudentRole(sharedContent.practice.participants[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load conversation practice:', err);
      setError('Failed to load conversation practice');
      setLoading(false);
    }
  }, [binId]);

  useEffect(() => {
    loadConversationPractice();
  }, [loadConversationPractice]);

  // 當練習會話開始且為學生回合時，設置分段
  useEffect(() => {
    if (practiceSession && conversation && conversation.dialogue.length > 0) {
      const currentTurn = conversation.dialogue[currentTurnIndex];
      
      if (currentTurn && currentTurn.speaker === practiceSession.studentRole) {
        setupCurrentTurnSegments(currentTurnIndex);
      } else {
        // 非學生回合，清除分段狀態
        setCurrentSegments([]);
        setCurrentSegmentIndex(0);
        setSelectedResponse('');
      }
    }
  }, [practiceSession, conversation, currentTurnIndex]);

  // 監控selectedResponse變化
  useEffect(() => {
  }, [selectedResponse, currentSegmentIndex, currentSegments]);

  // 開始練習會話
  const startPracticeSession = () => {
    if (!conversation || !selectedStudentRole) return;

    const session: PracticeSession = {
      practiceId: conversation.id,
      startTime: Date.now(),
      currentTurnIndex: 0,
      studentRole: selectedStudentRole,
      responses: [],
      completed: false
    };

    setPracticeSession(session);
    setCurrentTurnIndex(0);
    setShowFeedback(false);
    
  };

  // 檢查是否為學生回合
  const isStudentTurn = (turnIndex: number): boolean => {
    if (!conversation || !practiceSession) return false;
    const turn = conversation.dialogue[turnIndex];
    return turn?.speaker === practiceSession.studentRole;
  };

  // 處理學生語音回應
  const handleStudentResponse = async (result: { text: string; confidence: number; audioBlob?: Blob }) => {
    
    // 獲取當前應該使用的目標句子
    const currentTargetText = currentSegments.length > 0 ? currentSegments[currentSegmentIndex] : selectedResponse;
    
    
    if (!conversation || !practiceSession || !currentTargetText) {
      return;
    }

    setIsProcessingResponse(true);

    try {
      // 計算相似度 - 使用當前正確的目標文本
      const similarity = calculateSimilarity(currentTargetText, result.text);
      
      
      // 儲存錄音結果供回放使用
      const recordingResult = {
        text: result.text,
        audioBlob: result.audioBlob,
        similarity: similarity
      };
      
      setLastRecordingResult(recordingResult);

      const currentTurn = conversation.dialogue[currentTurnIndex];
      
      // 記錄學生回應
      const response: StudentResponse = {
        turnId: currentTurn.id,
        text: result.text,
        confidence: result.confidence,
        audioBlob: result.audioBlob,
        timestamp: Date.now()
      };

      // 更新練習會話
      const updatedSession = {
        ...practiceSession,
        responses: [...practiceSession.responses, response]
      };
      setPracticeSession(updatedSession);

    } catch (error) {
      console.error('Failed to process student response:', error);
    } finally {
      setIsProcessingResponse(false);
    }
  };

  // 移動到下一個分段或回合
  const moveToNextSegmentOrTurn = () => {

    if (!conversation || !practiceSession) return;

    setShowFeedback(false);
    setCurrentFeedback(null);

    // 檢查是否還有下一個分段
    if (currentSegmentIndex < currentSegments.length - 1) {
      const nextSegmentIndex = currentSegmentIndex + 1;
      const nextSegment = currentSegments[nextSegmentIndex];
      
      // 切換到下一段時清除之前的錄音結果
      setLastRecordingResult(null);
      setCurrentSegmentIndex(nextSegmentIndex);
      setSelectedResponse(nextSegment);
      
      return;
    }

    // 沒有更多分段，移動到下一個回合
    if (currentTurnIndex < conversation.dialogue.length - 1) {
      const nextTurnIndex = currentTurnIndex + 1;
      
      // 清除當前練習的狀態
      setLastRecordingResult(null);
      setCurrentSegments([]);
      setCurrentSegmentIndex(0);
      setSelectedResponse('');
      
      setCurrentTurnIndex(nextTurnIndex);
      
      // useEffect會自動處理下一個回合的設置
    } else {
      // 練習完成
      completePracticeSession();
    }
  };

  // 完成練習會話
  const completePracticeSession = () => {
    if (!practiceSession) return;

    const completedSession = {
      ...practiceSession,
      completed: true
    };

    setPracticeSession(completedSession);
    
    // 可以在這裡保存會話結果或顯示總結
  };

  // 重試當前回合
  const retryCurrentTurn = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <div className="mt-4 text-gray-600">Loading conversation practice...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">No conversation found</div>
        </div>
      </div>
    );
  }

  // 練習前的角色選擇和介紹
  if (!practiceSession) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* 標題區 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {conversation.title}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                難度：{conversation.difficulty === 'easy' ? '簡單' : conversation.difficulty === 'normal' ? '普通' : '困難'}
              </span>
              <span>{conversation.duration} 分鐘</span>
              <span>{conversation.dialogue.length} 個對話輪次</span>
            </div>
          </div>

          {/* 場景介紹 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">📖 情境說明</h2>
            <p className="text-gray-700 mb-4">{conversation.scenario}</p>
            <p className="text-gray-600">{conversation.description}</p>
          </div>

          {/* 角色選擇 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">🎭 選擇您的角色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversation.participants.map((participant) => (
                <button
                  key={participant}
                  onClick={() => setSelectedStudentRole(participant)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedStudentRole === participant
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{participant}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    您將扮演 {participant} 的角色
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 學習目標 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">🎯 學習目標</h2>
            <ul className="space-y-2">
              {conversation.practiceGoals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 開始按鈕 */}
          <div className="text-center">
            <button
              onClick={startPracticeSession}
              disabled={!selectedStudentRole}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                selectedStudentRole
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              開始練習
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 練習完成頁面
  if (practiceSession.completed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-green-600 text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              恭喜完成！
            </h1>
            <p className="text-gray-600 mb-6">
              您已經完成了英文對話練習，表現很棒！
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {practiceSession.responses.length}
                  </div>
                  <div className="text-sm text-gray-600">回答次數</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((Date.now() - practiceSession.startTime) / 1000 / 60)}
                  </div>
                  <div className="text-sm text-gray-600">練習分鐘</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {conversation.difficulty === 'easy' ? '簡單' : conversation.difficulty === 'normal' ? '普通' : '困難'}
                  </div>
                  <div className="text-sm text-gray-600">難度等級</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {practiceSession.studentRole}
                  </div>
                  <div className="text-sm text-gray-600">扮演角色</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => {
                  setPracticeSession(null);
                  setCurrentTurnIndex(0);
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                再練習一次
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
              >
                返回首頁
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 主要練習介面
  const currentTurn = conversation.dialogue[currentTurnIndex];
  const isCurrentStudentTurn = isStudentTurn(currentTurnIndex);
  

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4">
        {/* 進度條 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-semibold text-gray-900">{conversation.title}</h1>
            <span className="text-sm text-gray-600">
              {currentTurnIndex + 1} / {conversation.dialogue.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTurnIndex + 1) / conversation.dialogue.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 對話顯示 */}
        <ConversationDisplay
          turn={currentTurn}
          isCurrentTurn={true}
          isStudentTurn={isCurrentStudentTurn}
          studentRole={practiceSession.studentRole}
          showTranslation={false}
          showHints={isCurrentStudentTurn}
        />

        {/* 學生互動區域 */}
        {isCurrentStudentTurn ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎤 輪到您開口說話了
              </h3>
              {currentSegments.length > 1 && (
                <p className="text-blue-600 text-sm mb-2">
                  第 {currentSegmentIndex + 1} 段 / 共 {currentSegments.length} 段
                </p>
              )}
              <p className="text-gray-600">
                點擊下方句子練習發音，然後錄音
              </p>
            </div>

            {/* 要念的句子 - 使用分段後的句子 */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">📝 請練習這個句子：</h4>
              
              {/* 顯示完整句子供參考 */}
              {currentSegments.length > 1 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700 mb-1">完整句子：</div>
                  <div className="text-blue-900">{currentTurn.text}</div>
                </div>
              )}
              
              {/* 當前要練習的分段 */}
              {selectedResponse ? (
                <div 
                  className="p-4 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => setSelectedResponse(selectedResponse)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 text-lg font-medium">{selectedResponse}</span>
                    <div className="flex gap-2">
                      {/* 播放示範按鈕 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playDemonstration(selectedResponse);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                        title="播放示範發音"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-gray-300 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-center">
                    正在載入句子...
                  </div>
                </div>
              )}
              
              {/* 顯示中文翻譯 */}
              {currentTurn.translation && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-700 mb-1">💡 中文意思：</div>
                  <div className="text-yellow-900">{currentTurn.translation}</div>
                </div>
              )}
            </div>

            {/* 錄音控制區域 */}
            {selectedResponse && (
              <div className="text-center">
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">🎙️ 開始錄音練習</h5>
                  <VoiceRecorder
                    targetText={currentSegments.length > 0 ? currentSegments[currentSegmentIndex] : selectedResponse}
                    onRecordingComplete={handleStudentResponse}
                    onRecordingStart={() => {}}
                    onRecordingStop={() => {}}
                    disabled={isProcessingResponse}
                    language="en-US"
                    placeholder="點擊錄音按鈕開始練習"
                  />
                </div>

                {/* 錄音結果和回放 */}
                {lastRecordingResult && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">📝 您說的內容：</span>
                      {lastRecordingResult.audioBlob && (
                        <button
                          onClick={playLastRecording}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          播放錄音
                        </button>
                      )}
                    </div>
                    <div className="text-gray-800 mb-3 p-2 bg-white rounded border">"{lastRecordingResult.text}"</div>
                    <div className="text-sm">
                      <span className="text-gray-600 mr-2">發音準確度：</span>
                      <span className={`font-medium ${getSimilarityColor(lastRecordingResult.similarity || 0)}`}>
                        {Math.round((lastRecordingResult.similarity || 0) * 100)}%
                      </span>
                      {(lastRecordingResult.similarity || 0) >= 0.8 && <span className="ml-2">🎉 很棒！</span>}
                      {(lastRecordingResult.similarity || 0) >= 0.6 && (lastRecordingResult.similarity || 0) < 0.8 && <span className="ml-2">👍 不錯！</span>}
                      {(lastRecordingResult.similarity || 0) < 0.6 && <span className="ml-2">💪 再加油！</span>}
                    </div>
                    {!lastRecordingResult.audioBlob && (
                      <div className="text-xs text-red-500 mt-2">
                        錄音音頻不可用
                      </div>
                    )}
                  </div>
                )}

                {/* 繼續按鈕 */}
                {lastRecordingResult && (lastRecordingResult.similarity || 0) >= 0.6 && (
                  <div className="mt-4">
                    <button
                      onClick={moveToNextSegmentOrTurn}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                      <span>✅ 很好！</span>
                      <span>
                        {(() => {
                          const isLastSegment = currentSegmentIndex >= currentSegments.length - 1;
                          const isLastTurn = currentTurnIndex >= (conversation?.dialogue.length || 0) - 1;
                          
                          if (!isLastSegment) {
                            return `練習下一段 (${currentSegmentIndex + 2}/${currentSegments.length})`;
                          } else if (!isLastTurn) {
                            return `完成這輪，繼續下一輪對話`;
                          } else {
                            return `完成所有練習`;
                          }
                        })()}
                      </span>
                    </button>
                  </div>
                )}

                {/* 重試提示 */}
                {lastRecordingResult && (lastRecordingResult.similarity || 0) < 0.6 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800 mb-3">
                      🎯 建議：請再次聽取示範發音，並嘗試更清楚地說出句子
                    </div>
                    <button
                      onClick={() => setLastRecordingResult(null)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded transition-colors"
                    >
                      🔄 重新錄音
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // 系統回合 - 聆聽其他角色說話
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎧 聆聽 {currentTurn.speaker} 說話
            </h3>
            <p className="text-gray-600 mb-4">
              請仔細聽對方的發音和語調，為下次練習做準備
            </p>
            
            <button
              onClick={moveToNextSegmentOrTurn}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
            >
              <span>👂 我聽清楚了</span>
              <span>→</span>
              <span>繼續</span>
            </button>
          </div>
        )}

            {/* 處理中狀態 */}
            {isProcessingResponse && (
              <div className="text-center mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <LoadingSpinner />
                <div className="text-sm text-blue-600 mt-2">
                  🔄 正在分析您的發音...
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default ConversationPracticePage;