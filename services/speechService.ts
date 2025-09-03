// 語音服務 - 整合 Web Speech API (TTS & STT)

export interface VoiceSettings {
  lang: string;
  rate: number; // 語速 0.1-10
  pitch: number; // 音調 0-2
  volume: number; // 音量 0-1
}

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: any = null; // SpeechRecognition 類型在某些瀏覽器不一致
  private isRecording = false;

  constructor() {
    this.initializeSpeechSynthesis();
    this.initializeSpeechRecognition();
  }

  // ===== 文字轉語音 (TTS) =====

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public isTTSSupported(): boolean {
    return this.synthesis !== null;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
  }

  public speak(
    text: string,
    settings: Partial<VoiceSettings> = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: SpeechSynthesisErrorEvent) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Text-to-Speech not supported in this browser'));
        return;
      }

      // 停止當前播放
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // 設置語音參數
      const defaultSettings: VoiceSettings = {
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      };
      const finalSettings = { ...defaultSettings, ...settings };

      utterance.lang = finalSettings.lang;
      utterance.rate = finalSettings.rate;
      utterance.pitch = finalSettings.pitch;
      utterance.volume = finalSettings.volume;

      // 嘗試使用英文語音
      const voices = this.getAvailableVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang === finalSettings.lang && !voice.name.includes('Google')
      ) || voices.find(voice => voice.lang === finalSettings.lang) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // 事件處理
      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (error) => {
        onError?.(error);
        reject(error);
      };

      this.synthesis.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  public pauseSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  public resumeSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  // ===== 語音轉文字 (STT) =====

  private initializeSpeechRecognition(): void {
    // 檢查不同瀏覽器的 SpeechRecognition 實作
    const SpeechRecognition = window.SpeechRecognition || 
                              (window as any).webkitSpeechRecognition ||
                              (window as any).mozSpeechRecognition ||
                              (window as any).msSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
    }
  }

  public isSTTSupported(): boolean {
    return this.recognition !== null;
  }

  public startRecording(
    options: Partial<SpeechRecognitionOptions> = {},
    onResult?: (result: SpeechRecognitionResult) => void,
    onError?: (error: any) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      if (this.isRecording) {
        reject(new Error('Already recording'));
        return;
      }

      // 設置識別參數
      const defaultOptions: SpeechRecognitionOptions = {
        lang: 'en-US',
        continuous: false,
        interimResults: true,
        maxAlternatives: 3
      };
      const finalOptions = { ...defaultOptions, ...options };

      this.recognition.lang = finalOptions.lang;
      this.recognition.continuous = finalOptions.continuous;
      this.recognition.interimResults = finalOptions.interimResults;
      this.recognition.maxAlternatives = finalOptions.maxAlternatives;

      // 事件處理
      this.recognition.onstart = () => {
        this.isRecording = true;
        onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }

          onResult?.({
            text: transcript,
            confidence: confidence || 0.8,
            isFinal: event.results[i].isFinal
          });
        }
      };

      this.recognition.onerror = (error: any) => {
        this.isRecording = false;
        onError?.(error);
        reject(error);
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        onEnd?.();
        resolve();
      };

      // 開始識別
      try {
        this.recognition.start();
      } catch (error) {
        this.isRecording = false;
        reject(error);
      }
    });
  }

  public stopRecording(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // ===== 語音分析和評估輔助方法 =====

  public analyzePronunciation(
    targetText: string,
    recognizedText: string
  ): {
    accuracy: number;
    suggestions: string[];
    matchedWords: string[];
    missedWords: string[];
  } {
    const targetWords = targetText.toLowerCase().split(/\s+/);
    const recognizedWords = recognizedText.toLowerCase().split(/\s+/);
    
    const matchedWords: string[] = [];
    const missedWords: string[] = [];

    targetWords.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      if (recognizedWords.some(rWord => 
        rWord.replace(/[.,!?;:]/g, '').includes(cleanWord) ||
        cleanWord.includes(rWord.replace(/[.,!?;:]/g, ''))
      )) {
        matchedWords.push(word);
      } else {
        missedWords.push(word);
      }
    });

    const accuracy = targetWords.length > 0 ? 
      (matchedWords.length / targetWords.length) * 100 : 0;

    const suggestions: string[] = [];
    if (accuracy < 70) {
      suggestions.push('Try speaking more slowly and clearly');
    }
    if (missedWords.length > 0) {
      suggestions.push(`Practice these words: ${missedWords.slice(0, 3).join(', ')}`);
    }
    if (recognizedText.length < targetText.length * 0.5) {
      suggestions.push('Speak louder and closer to the microphone');
    }

    return {
      accuracy: Math.round(accuracy),
      suggestions,
      matchedWords,
      missedWords
    };
  }

  // 檢查瀏覽器支援狀況
  public getSupportStatus(): {
    ttsSupported: boolean;
    sttSupported: boolean;
    browserInfo: string;
  } {
    const userAgent = navigator.userAgent;
    let browserInfo = 'Unknown browser';

    if (userAgent.includes('Chrome')) browserInfo = 'Chrome';
    else if (userAgent.includes('Firefox')) browserInfo = 'Firefox';
    else if (userAgent.includes('Safari')) browserInfo = 'Safari';
    else if (userAgent.includes('Edge')) browserInfo = 'Edge';

    return {
      ttsSupported: this.isTTSSupported(),
      sttSupported: this.isSTTSupported(),
      browserInfo
    };
  }
}

// 全域語音服務實例
export const speechService = new SpeechService();

// 預設語音設定
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  lang: 'en-US',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'en-AU', name: 'English (Australia)' }
];