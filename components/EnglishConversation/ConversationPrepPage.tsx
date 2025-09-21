import React, { useState, useEffect } from 'react';
import { conversationService, ConversationGenerationOptions, ConversationPractice } from '../../services/conversationService';
import { HomeIcon } from '../icons';
import { saveConversationPracticeContent } from '../../services/jsonbinService';
import LoadingSpinner from '../LoadingSpinner';
import ConversationDisplay from './ConversationDisplay';

const ConversationPrepPage: React.FC = () => {
  // 生成設定狀態
  const [generationOptions, setGenerationOptions] = useState<ConversationGenerationOptions>({
    topic: '',
    scenario: '',
    difficulty: 'normal' as const,
    participantCount: 2 as const,
    duration: 10,
    focusAreas: [],
    culturalContext: ''
  });

  // UI 狀態
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedConversation, setGeneratedConversation] = useState<ConversationPractice | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [previewTurnIndex, setPreviewTurnIndex] = useState(0);

  // 預設模板和選項
  const conversationTemplates = conversationService.getConversationTemplates();
  const difficultyLevels = conversationService.getDifficultyLevels();

  useEffect(() => {
    // 從 localStorage 載入 API Key
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // 載入對話模板
  const loadTemplate = (template: any) => {
    setGenerationOptions({
      ...generationOptions,
      topic: template.title,
      scenario: template.scenario,
      difficulty: template.suggestedDifficulty as any,
      participantCount: template.participants.length as 2 | 3
    });
  };

  // 生成對話練習
  const generateConversation = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    if (!generationOptions.topic.trim() || !generationOptions.scenario.trim()) {
      setError('Please provide both topic and scenario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 保存 API Key
      localStorage.setItem('gemini_api_key', apiKey);

      const conversation = await conversationService.generateConversationPractice(
        generationOptions,
        apiKey
      );

      setGeneratedConversation(conversation);
      setPreviewTurnIndex(0);
    } catch (err) {
      console.error('Failed to generate conversation:', err);
      setError('Failed to generate conversation. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 分享對話練習
  const shareConversation = async () => {
    if (!generatedConversation) return;

    setSharing(true);
    setError(null);

    try {
      const shareData = {
        practice: generatedConversation,
        metadata: {
          createdBy: 'AI Page Gen',
          generatedAt: new Date().toISOString()
        }
      };

      const binId = await saveConversationPracticeContent(shareData);
      const url = `${window.location.origin}${import.meta.env.BASE_URL}conversation-practice/${binId}`;
      setShareUrl(url);
    } catch (err) {
      console.error('Failed to share conversation:', err);
      setError('Failed to create shareable link');
    } finally {
      setSharing(false);
    }
  };

  // 複製分享連結
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                英文對話練習生成器
              </h1>
              <p className="text-gray-600">
                Create interactive English conversation practices for your students
              </p>
            </div>
            <a 
              href={`${import.meta.env.BASE_URL}`}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <HomeIcon className="w-4 h-4" />
              返回首頁
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：生成設定 */}
          <div className="space-y-6">
            {/* API Key 輸入 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 快速模板 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h2>
              <div className="space-y-4">
                {conversationTemplates.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {category.scenarios.slice(0, 2).map((template, index) => (
                        <button
                          key={index}
                          onClick={() => loadTemplate(template)}
                          className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                          <div className="font-medium text-gray-900 text-sm">
                            {template.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {template.scenario.substring(0, 60)}...
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 對話設定 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation Settings</h2>
              <div className="space-y-4">
                {/* 主題 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={generationOptions.topic}
                    onChange={(e) => setGenerationOptions({...generationOptions, topic: e.target.value})}
                    placeholder="e.g., Ordering food at a restaurant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 情境描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario *
                  </label>
                  <textarea
                    value={generationOptions.scenario}
                    onChange={(e) => setGenerationOptions({...generationOptions, scenario: e.target.value})}
                    placeholder="Detailed description of the conversation context"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 難度選擇 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {difficultyLevels.map((level) => (
                      <button
                        key={level.level}
                        onClick={() => setGenerationOptions({...generationOptions, difficulty: level.level as any})}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          generationOptions.difficulty === level.level
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{level.level}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {level.description.split(' - ')[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 參與人數 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Participants
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setGenerationOptions({...generationOptions, participantCount: 2})}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        generationOptions.participantCount === 2
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      2 People
                    </button>
                    <button
                      onClick={() => setGenerationOptions({...generationOptions, participantCount: 3})}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        generationOptions.participantCount === 3
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      3 People
                    </button>
                  </div>
                </div>

                {/* 預估時間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={generationOptions.duration}
                    onChange={(e) => setGenerationOptions({...generationOptions, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 重點練習領域 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Areas (optional)
                  </label>
                  <input
                    type="text"
                    value={generationOptions.focusAreas?.join(', ') || ''}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions, 
                      focusAreas: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                    placeholder="e.g., pronunciation, grammar, vocabulary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 生成按鈕 */}
              <div className="mt-6">
                <button
                  onClick={generateConversation}
                  disabled={loading || !apiKey.trim()}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner/>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>Generate Conversation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-red-800">Error</div>
                    <div className="text-sm text-red-700 mt-1">{error}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右側：預覽和分享 */}
          <div className="space-y-6">
            {generatedConversation ? (
              <>
                {/* 對話資訊 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Generated Conversation
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800">Title</div>
                      <div className="text-blue-700">{generatedConversation.title}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-800">Difficulty</div>
                      <div className="text-green-700">{generatedConversation.difficulty}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="text-sm font-medium text-purple-800">Duration</div>
                      <div className="text-purple-700">{generatedConversation.duration} min</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <div className="text-sm font-medium text-orange-800">Turns</div>
                      <div className="text-orange-700">{generatedConversation.dialogue.length}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Participants</div>
                    <div className="flex flex-wrap gap-2">
                      {generatedConversation.participants.map((participant, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                    <div className="text-gray-600 text-sm">{generatedConversation.description}</div>
                  </div>
                </div>

                {/* 對話預覽 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewTurnIndex(Math.max(0, previewTurnIndex - 1))}
                        disabled={previewTurnIndex === 0}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                      </button>
                      <span className="text-sm text-gray-600">
                        {previewTurnIndex + 1} / {generatedConversation.dialogue.length}
                      </span>
                      <button
                        onClick={() => setPreviewTurnIndex(Math.min(generatedConversation.dialogue.length - 1, previewTurnIndex + 1))}
                        disabled={previewTurnIndex === generatedConversation.dialogue.length - 1}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <ConversationDisplay
                    turn={generatedConversation.dialogue[previewTurnIndex]}
                    isCurrentTurn={true}
                    isStudentTurn={false}
                    showTranslation={true}
                    showHints={true}
                  />
                </div>

                {/* 分享區域 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Share with Students</h3>
                  
                  {shareUrl ? (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Shareable Link</div>
                      <div className="flex">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                        />
                        <button
                          onClick={copyShareUrl}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-r-lg"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Students can use this link to practice the conversation
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={shareConversation}
                      disabled={sharing}
                      className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      {sharing ? (
                        <>
                          <LoadingSpinner/>
                          <span>Creating Share Link...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z"/>
                          </svg>
                          <span>Create Share Link</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <div className="text-gray-600">
                  Generate a conversation to see the preview
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPrepPage;
