
import React from 'react';
import { GeneratedLearningContent } from '../types';
import SectionCard from './SectionCard';
import QuizView from './QuizView';
import { AcademicCapIcon, BookOpenIcon, LightbulbIcon, BeakerIcon, ClipboardIcon } from './icons';

interface LearningContentDisplayProps {
  content: GeneratedLearningContent;
}

const LearningContentDisplay: React.FC<LearningContentDisplayProps> = ({ content }) => {
  const [copySuccess, setCopySuccess] = React.useState('');

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
  
  return (
    <div className="mt-8 space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center text-sm"
        >
          <ClipboardIcon className="w-4 h-4 mr-2" /> 複製產生的 JSON
        </button>
        {copySuccess && <span className="ml-2 text-sm text-green-600 self-center">{copySuccess}</span>}
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

      <QuizView quizzes={content.onlineInteractiveQuiz} />
    </div>
  );
};

export default LearningContentDisplay;
