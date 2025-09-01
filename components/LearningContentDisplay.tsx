import React from 'react';
import { GeneratedLearningContent, LearningLevel, VocabularyLevel } from '../types';
import SectionCard from './SectionCard';
import QuizView from './QuizView';
import ConversationPractice from './ConversationPractice';
import { AcademicCapIcon, BookOpenIcon, LightbulbIcon, BeakerIcon, ClipboardIcon, ChatBubbleLeftRightIcon } from './icons';
import { exportLearningContentToHtml } from '../utils/exportHtmlUtil'; // Import the new utility
import Tabs from './Tabs';
import { saveLearningContent } from '../services/jsonbinService';

interface LearningContentDisplayProps {
  content: GeneratedLearningContent;
  topic: string; // Added topic prop
  selectedLevel?: LearningLevel | null; // Added selected learning level
  selectedVocabularyLevel?: VocabularyLevel | null; // Added selected vocabulary level
}

const tabDefs = [
  { key: 'objectives', label: '教學目標' },
  { key: 'breakdown', label: '分解內容' },
  { key: 'confusing', label: '易混淆點' },
  { key: 'activities', label: '課堂活動' },
  { key: 'conversation', label: '對話練習' },
  { key: 'quiz', label: '互動測驗' },
];

const LearningContentDisplay: React.FC<LearningContentDisplayProps> = ({ content, topic, selectedLevel, selectedVocabularyLevel }) => {
  const [copySuccess, setCopySuccess] = React.useState('');
  const [exportMessage, setExportMessage] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState(tabDefs[0].key);
  const [shareLoading, setShareLoading] = React.useState(false);
  const [shareError, setShareError] = React.useState('');
  const [shareUrl, setShareUrl] = React.useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2))
      .then(() => {
        setCopySuccess('JSON 已複製到剪貼簿！');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        setCopySuccess('複製失敗。');
        console.error('Failed to copy: ', err);
        setTimeout(() => setCopySuccess(''), 2000);
      });
  };

  const handleExportHtml = () => {
    try {
      exportLearningContentToHtml(content, topic);
      setExportMessage('HTML 檔案已開始下載！');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (error) {
      console.error('Failed to export HTML:', error);
      setExportMessage('匯出 HTML 失敗。');
      setTimeout(() => setExportMessage(''), 3000);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    setShareError('');
    setShareUrl('');
    try {
      const binId = await saveLearningContent(content);
      // 這裡請根據你的實際 domain 修改
      const url = `${window.location.origin}${import.meta.env.BASE_URL}share?binId=${binId}`;
      setShareUrl(url);
    } catch (e: any) {
      setShareError(e.message || '分享失敗');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-end items-center gap-2 mb-4">
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center text-sm"
          aria-label="複製產生的 JSON 內容"
        >
          <ClipboardIcon className="w-4 h-4 mr-2" /> 複製產生的 JSON
        </button>
        <button
          onClick={handleExportHtml}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center text-sm"
          aria-label="將學習內容匯出為 HTML 檔案"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          匯出為 HTML
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center text-sm disabled:opacity-60"
          aria-label="分享教學方案"
          disabled={shareLoading}
        >
          {shareLoading ? (
            <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> 分享中...</span>
          ) : (
            <span>分享</span>
          )}
        </button>
        {copySuccess && <span className="text-sm text-green-600">{copySuccess}</span>}
        {exportMessage && <span className="text-sm text-blue-600">{exportMessage}</span>}
        {shareError && <span className="text-sm text-red-600">{shareError}</span>}
        {shareUrl && (
          <span className="text-sm text-purple-700 flex items-center gap-2">
            分享連結：
            <button
              className="underline hover:text-purple-900"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
            >
              {shareUrl}
            </button>
            <span className="ml-1 text-xs text-gray-400">(點擊可複製)</span>
          </span>
        )}
      </div>
      
      {/* Topic and Level Display Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <LightbulbIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span className="text-sm font-medium text-indigo-600">學習主題</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-0 truncate">{topic}</h2>
          </div>
          
          {(selectedLevel || selectedVocabularyLevel) && (
            <div className="flex gap-3 ml-6 flex-shrink-0">
              {selectedLevel && (
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AcademicCapIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600">學習程度</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{selectedLevel.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-32" title={selectedLevel.description}>
                    {selectedLevel.description.length > 20 
                      ? selectedLevel.description.substring(0, 20) + '...' 
                      : selectedLevel.description}
                  </div>
                </div>
              )}
              
              {selectedVocabularyLevel && (
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpenIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-600">詞彙程度</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{selectedVocabularyLevel.name}</div>
                  <div className="text-xs text-gray-500">{selectedVocabularyLevel.wordCount} 詞彙</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs
        tabs={tabDefs}
        current={currentTab}
        onChange={setCurrentTab}
      >
        {/* 教學目標 */}
        <SectionCard title="教學目標設定" icon={<AcademicCapIcon className="w-7 h-7" />}>
          {content.learningObjectives && content.learningObjectives.length > 0 ? (
            content.learningObjectives.map((objective, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg text-green-800 mb-1">{objective.objective}</h4>
                <p className="text-slate-700 mb-2">{objective.description}</p>
                {objective.teachingExample && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-md mt-2">
                    <span className="block text-xs font-semibold text-green-700 mb-1">教學示例</span>
                    <span className="text-green-900 text-sm">{objective.teachingExample}</span>
                  </div>
                )}
              </div>
            ))
          ) : <p>沒有提供教學目標。</p>}
        </SectionCard>
        {/* 分解內容 */}
        <SectionCard title="分解學習內容" icon={<BookOpenIcon className="w-7 h-7" />}>
          {content.contentBreakdown && content.contentBreakdown.length > 0 ? (
            content.contentBreakdown.map((item, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg text-sky-800 mb-1">{item.topic}</h4>
                <p className="text-slate-700 mb-3">{item.details}</p>
                
                {/* Enhanced English Learning Fields */}
                {item.coreConcept && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-blue-700 mb-1">核心概念</span>
                    <span className="text-blue-900 text-sm">{item.coreConcept}</span>
                  </div>
                )}
                
                {item.teachingSentences && item.teachingSentences.length > 0 && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-indigo-700 mb-2">教學例句</span>
                    <div className="space-y-1">
                      {item.teachingSentences.map((sentence, sentenceIndex) => (
                        <div key={sentenceIndex} className="text-indigo-900 text-sm">
                          <span className="font-mono text-indigo-600">{sentenceIndex + 1}.</span> {sentence}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.teachingTips && (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-md mb-3">
                    <span className="block text-xs font-semibold text-purple-700 mb-1">教學要點提示</span>
                    <span className="text-purple-900 text-sm">{item.teachingTips}</span>
                  </div>
                )}
                
                {item.teachingExample && (
                  <div className="bg-sky-50 border-l-4 border-sky-400 p-3 rounded-md">
                    <span className="block text-xs font-semibold text-sky-700 mb-1">教學示例</span>
                    <span className="text-sky-900 text-sm">{item.teachingExample}</span>
                  </div>
                )}
              </div>
            ))
          ) : <p>沒有提供內容分解。</p>}
        </SectionCard>
        {/* 易混淆點 */}
        <SectionCard title="易混淆點識別" icon={<LightbulbIcon className="w-7 h-7" />}>
          {content.confusingPoints && content.confusingPoints.length > 0 ? (
            content.confusingPoints.map((item, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg text-red-700 mb-1">{item.point}</h4>
                <p className="text-slate-700 mb-2">{item.clarification}</p>
                {item.teachingExample && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md mt-2">
                    <span className="block text-xs font-semibold text-red-700 mb-1">教學示例</span>
                    <span className="text-red-900 text-sm">{item.teachingExample}</span>
                  </div>
                )}
              </div>
            ))
          ) : <p>沒有提供易混淆點。</p>}
        </SectionCard>
        {/* 課堂活動 */}
        <SectionCard title="課堂活動與遊戲設計" icon={<BeakerIcon className="w-7 h-7" />}>
          {content.classroomActivities && content.classroomActivities.length > 0 ? (
            <div className="space-y-4">
              {content.classroomActivities.map((activity, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-md bg-slate-50">
                  <h4 className="font-bold text-lg text-sky-700 mb-2">{activity.title}</h4>
                  <p className="mb-3 text-slate-700">{activity.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {activity.objective && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">學習目標：</span>
                        <p className="mt-1">{activity.objective}</p>
                      </div>
                    )}
                    {activity.timing && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">使用時機：</span>
                        <p className="mt-1">{activity.timing}</p>
                      </div>
                    )}
                    {activity.materials && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">所需教具：</span>
                        <p className="mt-1">{activity.materials}</p>
                      </div>
                    )}
                    {activity.environment && (
                      <div className="text-sm text-sky-900">
                        <span className="font-semibold">環境要求：</span>
                        <p className="mt-1">{activity.environment}</p>
                      </div>
                    )}
                  </div>
                  
                  {activity.steps && activity.steps.length > 0 && (
                    <div className="mb-3">
                      <span className="font-semibold text-sm text-sky-900">活動步驟：</span>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        {activity.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-slate-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {activity.assessmentPoints && activity.assessmentPoints.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm text-sky-900">評估重點：</span>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {activity.assessmentPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="text-sm text-slate-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : <p>沒有提供課堂活動。</p>}
        </SectionCard>
        {/* 對話練習 */}
        {content.englishConversation && content.englishConversation.length > 0 ? (
          <ConversationPractice dialogue={content.englishConversation} />
        ) : (
          <SectionCard title="對話練習" icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />}>
            <p>沒有提供對話練習。</p>
          </SectionCard>
        )}
        {/* 互動測驗 */}
        <QuizView quizzes={content.onlineInteractiveQuiz} />
      </Tabs>
    </div>
  );
};

export default LearningContentDisplay;
