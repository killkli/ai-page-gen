import React, { useState, useEffect, useRef } from 'react';
import { speechService, SpeechRecognitionResult } from '../../services/speechService';

interface VoiceRecorderProps {
  targetText?: string; // 期望學生說出的文字
  onRecordingComplete: (result: {
    text: string;
    confidence: number;
    audioBlob?: Blob;
  }) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  disabled?: boolean;
  language?: string;
  placeholder?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  targetText,
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
  language = 'en-US',
  placeholder = "Click to start recording..."
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number>(0);
  
  // 保存最新的語音識別結果
  const latestResultRef = useRef<{ text: string; confidence: number }>({ text: '', confidence: 0 });

  useEffect(() => {
    // 檢查瀏覽器支援
    const support = speechService.getSupportStatus();
    setIsSupported(support.sttSupported);
    
    if (!support.sttSupported) {
      setError('Your browser does not support speech recognition');
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 開始錄音
  const startRecording = async () => {
    if (!isSupported || disabled) return;

    try {
      setError(null);
      setRecognizedText('');
      setConfidence(0);
      audioChunksRef.current = [];

      // 請求麥克風權限並開始錄音
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 設置媒體錄音器
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      // 開始語音識別
      await speechService.startRecording(
        { lang: language, continuous: false, interimResults: true },
        (result: SpeechRecognitionResult) => {
          setRecognizedText(result.text);
          setConfidence(result.confidence);
          
          // 同時保存到ref中
          latestResultRef.current = {
            text: result.text,
            confidence: result.confidence
          };
          
          console.log('VoiceRecorder: Speech recognition result:', result);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setError('Speech recognition failed. Please try again.');
          stopRecording();
        },
        () => {
          onRecordingStart?.();
          setIsRecording(true);
        },
        () => {
          setIsRecording(false);
          onRecordingStop?.();
          
          // 語音識別結束時立即觸發回調
          setTimeout(() => {
            // 使用ref中保存的最新結果，而不是state
            const finalText = latestResultRef.current.text;
            const finalConfidence = latestResultRef.current.confidence;
            
            console.log('🔴 VoiceRecorder: Preparing callback with:', { finalText, finalConfidence });
            console.log('🔴 VoiceRecorder: About to call onRecordingComplete');
            
            // 先立即觸發回調，不等待MediaRecorder
            console.log('🔴 VoiceRecorder: Triggering onRecordingComplete NOW');
            onRecordingComplete({
              text: finalText,
              confidence: finalConfidence,
              audioBlob: undefined // 先不包含音頻，確保回調正常工作
            });
            
            // 然後嘗試處理音頻（如果需要的話）
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
              
              // 如果音頻處理成功，可以再次觸發回調包含音頻
              mediaRecorderRef.current.onstop = () => {
                const audioBlob = audioChunksRef.current.length > 0 ? 
                  new Blob(audioChunksRef.current, { type: 'audio/wav' }) : undefined;
                
                if (audioBlob) {
                  console.log('VoiceRecorder: Updating with audio blob');
                  onRecordingComplete({
                    text: finalText,
                    confidence: finalConfidence,
                    audioBlob: audioBlob
                  });
                }
              };
            }
          }, 200);
        }
      );

      // 開始音頻可視化
      startAudioVisualization(stream);

    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  // 停止錄音 (主要由語音識別服務的onEnd回調處理)
  const stopRecording = () => {
    if (!isRecording) return;

    speechService.stopRecording();
    
    setAudioLevel(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // 音頻可視化
  const startAudioVisualization = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioLevel = () => {
      if (!isRecording) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
      setAudioLevel(average / 255);

      animationRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  };

  // 渲染錄音按鈕
  const renderRecordButton = () => {
    const baseClasses = "relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2";
    
    if (disabled) {
      return (
        <button
          className={`${baseClasses} bg-gray-300 cursor-not-allowed`}
          disabled
        >
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
        </button>
      );
    }

    if (isRecording) {
      return (
        <button
          onClick={stopRecording}
          className={`${baseClasses} bg-red-500 hover:bg-red-600 text-white focus:ring-red-300 animate-pulse`}
          style={{
            transform: `scale(${1 + audioLevel * 0.3})`,
          }}
        >
          <div className="w-4 h-4 bg-white rounded-sm"></div>
          
          {/* 音頻波形環 */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-red-300"
            style={{
              transform: `scale(${1.2 + audioLevel * 0.5})`,
              opacity: audioLevel * 0.7
            }}
          ></div>
        </button>
      );
    }

    return (
      <button
        onClick={startRecording}
        className={`${baseClasses} bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      </button>
    );
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center space-y-2 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 text-sm font-medium">
          Speech recognition not supported
        </div>
        <div className="text-red-500 text-xs text-center">
          Please use Chrome, Edge, or Safari for voice recording
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 錄音按鈕 */}
      <div className="flex flex-col items-center space-y-2">
        {renderRecordButton()}
        
        <div className="text-sm text-gray-600 text-center">
          {isRecording ? (
            <span className="text-red-600 font-medium">Recording...</span>
          ) : (
            placeholder
          )}
        </div>
      </div>

      {/* 識別結果顯示 */}
      {recognizedText && (
        <div className="w-full max-w-md">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="text-sm font-medium text-gray-700 mb-1">
              You said:
            </div>
            <div className="text-gray-900">
              "{recognizedText}"
            </div>
            {confidence > 0 && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs text-gray-500">Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      confidence > 0.8 ? 'bg-green-500' : 
                      confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* 目標文字比較 (如果提供) */}
      {targetText && recognizedText && (
        <div className="w-full max-w-md text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="font-medium mb-1">Expected:</div>
          <div className="text-blue-700">"{targetText}"</div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
