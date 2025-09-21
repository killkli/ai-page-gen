import React, { useState, useCallback } from 'react';
import { WritingPracticeContent, SentencePracticePrompt, WritingPracticePrompt, AIFeedback, VocabularyLevel } from '../types';
import { getAIFeedback } from '../services/geminiServiceAdapter';

interface WritingPracticeViewProps {
  content: WritingPracticeContent;
  apiKey?: string;
  vocabularyLevel?: VocabularyLevel;
  isStudentMode?: boolean;
}

const WritingPracticeView: React.FC<WritingPracticeViewProps> = ({
  content,
  apiKey,
  vocabularyLevel,
  isStudentMode = false
}) => {
  const [selectedTab, setSelectedTab] = useState<'sentence' | 'writing'>('sentence');
  const [studentWork, setStudentWork] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, AIFeedback>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({});

  const handleStudentWorkChange = useCallback((promptId: string, work: string) => {
    setStudentWork(prev => ({ ...prev, [promptId]: work }));
  }, []);

  const handleSubmitForFeedback = useCallback(async (
    prompt: SentencePracticePrompt | WritingPracticePrompt,
    promptType: 'sentence' | 'writing'
  ) => {
    if (!apiKey) {
      alert('需要 API Key 才能獲得 AI 批改回饋');
      return;
    }

    const work = studentWork[prompt.id];
    if (!work?.trim()) {
      alert('請先完成您的作品再提交批改');
      return;
    }

    setLoadingFeedback(prev => ({ ...prev, [prompt.id]: true }));
    
    try {
      const aiFeedback = await getAIFeedback(work, promptType, prompt, vocabularyLevel);
      setFeedback(prev => ({ ...prev, [prompt.id]: aiFeedback }));
    } catch (error) {
      console.error('AI 批改失敗:', error);
      alert('AI 批改失敗，請檢查網路連線和 API Key 設定');
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [prompt.id]: false }));
    }
  }, [apiKey, studentWork, vocabularyLevel]);

  const renderSentencePractice = () => (
    <div className="space-y-6">
      {content.sentencePractice.map((prompt, index) => (
        <div key={prompt.id} className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                造句練習 {index + 1}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  prompt.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  prompt.difficulty === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {prompt.difficulty === 'easy' ? '簡單' : 
                   prompt.difficulty === 'normal' ? '普通' : '困難'}
                </span>
              </h4>
              <p className="text-gray-700 mb-3">{prompt.instruction}</p>
              
              {prompt.keywords.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">必須使用的關鍵詞：</p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.keywords.map((keyword, kidx) => (
                      <span key={kidx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {prompt.exampleSentence && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">範例句子：</p>
                  <p className="text-gray-700 italic">{prompt.exampleSentence}</p>
                </div>
              )}
              
              {prompt.hints && prompt.hints.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">提示：</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {prompt.hints.map((hint, hidx) => (
                      <li key={hidx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 學生輸入區域 */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的造句：
            </label>
            <textarea
              value={studentWork[prompt.id] || ''}
              onChange={(e) => handleStudentWorkChange(prompt.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="請在此輸入您的造句..."
            />
            
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                字數: {(studentWork[prompt.id] || '').length}
              </span>
              {apiKey && (
                <button
                  onClick={() => handleSubmitForFeedback(prompt, 'sentence')}
                  disabled={!studentWork[prompt.id]?.trim() || loadingFeedback[prompt.id]}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingFeedback[prompt.id] ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      AI 批改中...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      獲得 AI 批改
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* AI 批改結果 */}
          {feedback[prompt.id] && (
            <AIFeedbackDisplay feedback={feedback[prompt.id]} />
          )}
        </div>
      ))}
    </div>
  );

  const renderWritingPractice = () => (
    <div className="space-y-6">
      {content.writingPractice.map((prompt) => (
        <div key={prompt.id} className="bg-white rounded-lg shadow-md p-6 border border-purple-200">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {prompt.title}
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                prompt.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                prompt.difficulty === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {prompt.difficulty === 'easy' ? '簡單' : 
                 prompt.difficulty === 'normal' ? '普通' : '困難'}
              </span>
            </h4>
            <p className="text-gray-700 mb-3">{prompt.instruction}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">建議結構：</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {prompt.structure.map((item, sidx) => (
                    <li key={sidx} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  字數要求: {prompt.minLength} - {prompt.maxLength} 字
                </p>
                {prompt.keywords && prompt.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">建議使用詞彙：</p>
                    <div className="flex flex-wrap gap-1">
                      {prompt.keywords.map((keyword, kidx) => (
                        <span key={kidx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {prompt.exampleOutline && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">範例大綱：</p>
                <p className="text-gray-700 text-sm">{prompt.exampleOutline}</p>
              </div>
            )}
          </div>

          {/* 學生寫作區域 */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的寫作：
            </label>
            <textarea
              value={studentWork[prompt.id] || ''}
              onChange={(e) => handleStudentWorkChange(prompt.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={8}
              placeholder="請在此輸入您的文章..."
            />
            
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <span>字數: {(studentWork[prompt.id] || '').length}</span>
                <span className="ml-4">
                  {(studentWork[prompt.id] || '').length < prompt.minLength 
                    ? `還需 ${prompt.minLength - (studentWork[prompt.id] || '').length} 字` 
                    : (studentWork[prompt.id] || '').length > prompt.maxLength
                    ? `超出 ${(studentWork[prompt.id] || '').length - prompt.maxLength} 字`
                    : '符合字數要求'}
                </span>
              </div>
              {apiKey && (
                <button
                  onClick={() => handleSubmitForFeedback(prompt, 'writing')}
                  disabled={!studentWork[prompt.id]?.trim() || loadingFeedback[prompt.id]}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingFeedback[prompt.id] ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      AI 批改中...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      獲得 AI 批改
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* AI 批改結果 */}
          {feedback[prompt.id] && (
            <AIFeedbackDisplay feedback={feedback[prompt.id]} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">寫作練習與 AI 批改</h3>
            <p className="text-gray-600 text-sm">{content.instructions}</p>
          </div>
        </div>
        
        {!isStudentMode && (
          <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border">
            <div>造句練習: {content.sentencePractice.length} 題</div>
            <div>寫作練習: {content.writingPractice.length} 題</div>
          </div>
        )}
      </div>

      {/* 選項卡 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setSelectedTab('sentence')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'sentence'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          提示造句 ({content.sentencePractice.length})
        </button>
        <button
          onClick={() => setSelectedTab('writing')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'writing'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          提示寫作 ({content.writingPractice.length})
        </button>
      </div>

      {/* 內容區域 */}
      {selectedTab === 'sentence' ? renderSentencePractice() : renderWritingPractice()}
    </div>
  );
};

// AI 批改回饋顯示組件
interface AIFeedbackDisplayProps {
  feedback: AIFeedback;
}

const AIFeedbackDisplay: React.FC<AIFeedbackDisplayProps> = ({ feedback }) => {
  return (
    <div className="mt-4 border-t pt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
        </svg>
        AI 批改回饋
        <div className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
          feedback.score >= 85 ? 'bg-green-100 text-green-800' :
          feedback.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {feedback.score} 分
        </div>
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {feedback.strengths.length > 0 && (
          <div>
            <h6 className="font-medium text-green-700 mb-2">✅ 優點</h6>
            <ul className="space-y-1">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {feedback.improvements.length > 0 && (
          <div>
            <h6 className="font-medium text-orange-700 mb-2">💡 改進建議</h6>
            <ul className="space-y-1">
              {feedback.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {feedback.grammarCorrections && feedback.grammarCorrections.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <h6 className="font-medium text-yellow-800 mb-2">📝 語法修正</h6>
          {feedback.grammarCorrections.map((correction, idx) => (
            <div key={idx} className="mb-2 last:mb-0">
              <div className="text-sm">
                <span className="text-red-600 line-through">{correction.original}</span>
                <span className="mx-2">→</span>
                <span className="text-green-600 font-medium">{correction.corrected}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">{correction.explanation}</div>
            </div>
          ))}
        </div>
      )}
      
      {feedback.vocabularyTips && feedback.vocabularyTips.length > 0 && (
        <div className="mb-4">
          <h6 className="font-medium text-blue-700 mb-2">📚 詞彙建議</h6>
          <ul className="space-y-1">
            {feedback.vocabularyTips.map((tip, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {feedback.structureFeedback && (
        <div className="mb-4">
          <h6 className="font-medium text-purple-700 mb-2">🏗️ 結構回饋</h6>
          <p className="text-sm text-gray-700">{feedback.structureFeedback}</p>
        </div>
      )}
      
      <div className="border-t pt-3">
        <h6 className="font-medium text-gray-800 mb-2">📋 整體評語</h6>
        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">{feedback.overallComment}</p>
      </div>
    </div>
  );
};

export default WritingPracticeView;
