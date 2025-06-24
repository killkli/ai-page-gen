import React, { useState, useEffect, useRef } from 'react';
import { DialogueLine } from '../types';
import SectionCard from './SectionCard';
import { PlayIcon, MicrophoneIcon, StopCircleIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface ConversationPracticeProps {
  dialogue: DialogueLine[];
}

const ConversationPractice: React.FC<ConversationPracticeProps> = ({ dialogue }) => {
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null); // For TTS
  const [practiceLineIndex, setPracticeLineIndex] = useState<number | null>(null); // For SR
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false); // Indicates if TTS is currently active
  const [speechApiSupport, setSpeechApiSupport] = useState({ tts: true, sr: true });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const ttsSupported = 'speechSynthesis' in window;
    const srSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setSpeechApiSupport({ tts: ttsSupported, sr: srSupported });

    if (srSupported) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        compareTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setFeedbackMessage({ type: 'error', message: `語音辨識錯誤: ${event.error === 'no-speech' ? '未偵測到語音' : event.error === 'audio-capture' ? '麥克風擷取失敗' : event.error === 'not-allowed' ? '麥克風權限未授予' : '發生錯誤'}` });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    // Cleanup speechSynthesis on unmount
    return () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    };

  }, []);

  const speakLine = (text: string, index: number) => {
    if (!speechApiSupport.tts || !text) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Stop any currently speaking utterance
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Ensure English voice
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google') && voice.localService) || 
                         voices.find(voice => voice.lang.startsWith('en') && voice.localService) ||
                         voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveLineIndex(index);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveLineIndex(null);
    };
    utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        setActiveLineIndex(null);
        setFeedbackMessage({ type: 'error', message: '語音播放失敗。' });
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = (index: number) => {
    if (!speechApiSupport.sr || !recognitionRef.current || isListening) return;
    setPracticeLineIndex(index);
    setUserTranscript('');
    setFeedbackMessage(null);
    setIsListening(true);
    try {
        recognitionRef.current.start();
    } catch (e) {
        console.error("Error starting recognition: ", e);
        setIsListening(false);
        setFeedbackMessage({type: 'error', message: '無法啟動語音辨識。'});
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false); // Should be handled by onend, but good for immediate UI update
    }
  };
  
  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[.,!?;:"']/g, '').trim();
  };

  const compareTranscript = (transcript: string) => {
    if (practiceLineIndex === null) return;
    const originalLine = dialogue[practiceLineIndex].line;
    if (normalizeText(transcript) === normalizeText(originalLine)) {
      setFeedbackMessage({ type: 'success', message: `太棒了！發音正確: "${transcript}"` });
    } else {
      setFeedbackMessage({ type: 'error', message: `再試一次。您說的是: "${transcript}"，參考句: "${originalLine}"` });
    }
  };

  if (!dialogue || dialogue.length === 0) {
    return (
      <SectionCard title="英文對話練習" icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />}>
        <p className="text-slate-600">目前沒有可用的對話內容。</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="英文對話練習" icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />}>
      {!speechApiSupport.tts && <p className="text-red-600 bg-red-100 p-2 rounded-md">您的瀏覽器不支援語音合成 (TTS)。</p>}
      {!speechApiSupport.sr && <p className="text-red-600 bg-red-100 p-2 rounded-md mt-2">您的瀏覽器不支援語音辨識 (SR)。建議使用最新版 Chrome 或 Edge。</p>}
      
      <div className="space-y-4">
        {dialogue.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${item.speaker === 'Speaker A' ? 'bg-sky-50' : 'bg-indigo-50'} border ${item.speaker === 'Speaker A' ? 'border-sky-200' : 'border-indigo-200'}`}>
            <p className="font-semibold text-sm mb-1 ${item.speaker === 'Speaker A' ? 'text-sky-700' : 'text-indigo-700'}">{item.speaker}:</p>
            <p className="text-slate-800 mb-2">{item.line}</p>
            <div className="flex items-center space-x-2">
              {speechApiSupport.tts && (
                <button
                  onClick={() => speakLine(item.line, index)}
                  disabled={isSpeaking && activeLineIndex !== index}
                  className={`p-1.5 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 ${isSpeaking && activeLineIndex === index ? 'text-sky-500 animate-pulse' : 'text-slate-600'}`}
                  aria-label={`播放 ${item.speaker} 的話`}
                >
                  <PlayIcon className="w-5 h-5" />
                </button>
              )}
              {speechApiSupport.sr && (
                isListening && practiceLineIndex === index ? (
                  <button
                    onClick={stopListening}
                    className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                    aria-label="停止錄音"
                  >
                    <StopCircleIcon className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => startListening(index)}
                    disabled={isListening || isSpeaking}
                    className="p-1.5 rounded-full text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    aria-label={`練習說出 ${item.speaker} 的話`}
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                  </button>
                )
              )}
            </div>
            {practiceLineIndex === index && userTranscript && (
              <p className="mt-2 text-sm text-slate-600 italic">您說的是: "{userTranscript}"</p>
            )}
            {practiceLineIndex === index && feedbackMessage && (
              <div className={`mt-2 p-2 rounded-md text-sm flex items-start ${
                feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : 
                feedbackMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {feedbackMessage.type === 'success' && <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />}
                {feedbackMessage.type === 'error' && <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />}
                <span>{feedbackMessage.message}</span>
              </div>
            )}
          </div>
        ))}
      </div>
       {isListening && <p className="mt-4 text-center text-sky-600 font-medium animate-pulse">正在聆聽...</p>}
    </SectionCard>
  );
};

export default ConversationPractice;