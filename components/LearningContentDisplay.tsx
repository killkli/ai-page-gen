import React from 'react';
import { GeneratedLearningContent } from '../types';
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
}

const tabDefs = [
  { key: 'objectives', label: '教學目標' },
  { key: 'breakdown', label: '分解內容' },
  { key: 'confusing', label: '易混淆點' },
  { key: 'activities', label: '課堂活動' },
  { key: 'conversation', label: '對話練習' },
  { key: 'quiz', label: '互動測驗' },
];

const LearningContentDisplay: React.FC<LearningContentDisplayProps> = ({ content, topic }) => {
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
      <Tabs
        tabs={tabDefs}
        current={currentTab}
        onChange={setCurrentTab}
      >
        {/* 教學目標 */}
        <SectionCard title="教學目標設定" icon={<AcademicCapIcon className="w-7 h-7" />}>
          {content.learningObjectives && content.learningObjectives.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 pl-2">
              {content.learningObjectives.map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          ) : <p>沒有提供教學目標。</p>}
        </SectionCard>
        {/* 分解內容 */}
        <SectionCard title="分解學習內容" icon={<BookOpenIcon className="w-7 h-7" />}>
          {content.contentBreakdown && content.contentBreakdown.length > 0 ? (
            content.contentBreakdown.map((item, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg text-sky-800 mb-1">{item.topic}</h4>
                <p className="text-slate-700 mb-2">{item.details}</p>
                {item.teachingExample && (
                  <div className="bg-sky-50 border-l-4 border-sky-400 p-3 rounded-md mt-2">
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
                  <h4 className="font-bold text-lg text-sky-700 mb-1">{activity.title}</h4>
                  <p className="mb-1 text-slate-700">{activity.description}</p>
                  {activity.objective && <p className="text-sm text-sky-900 mb-1"><span className="font-semibold">活動目標：</span>{activity.objective}</p>}
                  {activity.materials && <p className="text-sm text-sky-900 mb-1"><span className="font-semibold">所需教材：</span>{activity.materials}</p>}
                  {activity.environment && <p className="text-sm text-sky-900"><span className="font-semibold">環境需求：</span>{activity.environment}</p>}
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
