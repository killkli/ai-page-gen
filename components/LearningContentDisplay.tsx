import React from 'react';
import { GeneratedLearningContent } from '../types';
import SectionCard from './SectionCard';
import QuizView from './QuizView';
import ConversationPractice from './ConversationPractice';
import { AcademicCapIcon, BookOpenIcon, LightbulbIcon, BeakerIcon, ClipboardIcon, ChatBubbleLeftRightIcon } from './icons';
import { exportLearningContentToHtml } from '../utils/exportHtmlUtil'; // Import the new utility

interface LearningContentDisplayProps {
  content: GeneratedLearningContent;
  topic: string; // Added topic prop
}

const LearningContentDisplay: React.FC<LearningContentDisplayProps> = ({ content, topic }) => {
  const [copySuccess, setCopySuccess] = React.useState('');
  const [exportMessage, setExportMessage] = React.useState('');

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
  
  return (
    <div className="mt-8 space-y-6">
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
        {copySuccess && <span className="text-sm text-green-600">{copySuccess}</span>}
        {exportMessage && <span className="text-sm text-blue-600">{exportMessage}</span>}
      </div>

      <SectionCard title="教學目標設定" icon={<AcademicCapIcon className="w-7 h-7"/>}>
        {content.learningObjectives && content.learningObjectives.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 pl-2">
            {content.learningObjectives.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        ) : <p>沒有提供教學目標。</p>}
      </SectionCard>

      <SectionCard title="分解學習內容" icon={<BookOpenIcon className="w-7 h-7"/>}>
        {content.contentBreakdown && content.contentBreakdown.length > 0 ? (
          content.contentBreakdown.map((item, index) => (
            <div key={index} className="mb-3 pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
              <h4 className="font-semibold text-lg text-sky-800">{item.topic}</h4>
              <p className="text-sm_ text-slate-600">{item.details}</p>
            </div>
          ))
        ) : <p>沒有提供內容分解。</p>}
      </SectionCard>

      <SectionCard title="易混淆點識別" icon={<LightbulbIcon className="w-7 h-7"/>}>
         {content.confusingPoints && content.confusingPoints.length > 0 ? (
          content.confusingPoints.map((item, index) => (
            <div key={index} className="mb-3 pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
              <h4 className="font-semibold text-lg text-red-700">{item.point}</h4>
              <p className="text-sm_ text-slate-600">{item.clarification}</p>
            </div>
          ))
         ) : <p>沒有提供易混淆點。</p>}
      </SectionCard>

      <SectionCard title="課堂活動與遊戲設計" icon={<BeakerIcon className="w-7 h-7"/>}>
        {content.classroomActivities && content.classroomActivities.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 pl-2">
            {content.classroomActivities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        ) : <p>沒有提供課堂活動。</p>}
      </SectionCard>

      {content.englishConversation && content.englishConversation.length > 0 && (
        <ConversationPractice dialogue={content.englishConversation} />
      )}

      <QuizView quizzes={content.onlineInteractiveQuiz} />
    </div>
  );
};

export default LearningContentDisplay;
