import React, { useRef, useEffect } from 'react';
import {
  ExtendedLearningContent,
  LearningLevel,
  VocabularyLevel,
} from '../types';
import {
  ClipboardIcon,
  LightbulbIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from './icons';
import { exportLearningContentToHtml } from '../utils/exportHtmlUtil';
import Tabs from './Tabs';
import { saveLearningContent } from '../services/jsonbinService';
import QRCodeDisplay from './QRCodeDisplay';

import LearningObjectivesSection from './learning-content/LearningObjectivesSection';
import ContentBreakdownSection from './learning-content/ContentBreakdownSection';
import ConfusingPointsSection from './learning-content/ConfusingPointsSection';
import ClassroomActivitiesSection from './learning-content/ClassroomActivitiesSection';
import ConversationPracticeSection from './learning-content/ConversationPracticeSection';
import WritingPracticeSection from './learning-content/WritingPracticeSection';
import QuizSection from './learning-content/QuizSection';

interface LearningContentDisplayProps {
  content: ExtendedLearningContent;
  topic: string;
  selectedLevel?: LearningLevel | null;
  selectedVocabularyLevel?: VocabularyLevel;
  apiKey?: string;
  onContentUpdate?: (newContent: ExtendedLearningContent) => void;
}

const tabDefs = [
  { key: 'objectives', label: '教學目標' },
  { key: 'breakdown', label: '分解內容' },
  { key: 'confusing', label: '易混淆點' },
  { key: 'activities', label: '課堂活動' },
  { key: 'conversation', label: '對話練習' },
  { key: 'writing', label: '寫作練習' },
  { key: 'quiz', label: '互動測驗' },
];

const LearningContentDisplay: React.FC<LearningContentDisplayProps> = ({
  content,
  topic,
  selectedLevel,
  selectedVocabularyLevel,
  apiKey,
  onContentUpdate,
}) => {
  const [copySuccess, setCopySuccess] = React.useState('');
  const [exportMessage, setExportMessage] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState(tabDefs[0].key);
  const [shareLoading, setShareLoading] = React.useState(false);
  const [shareError, setShareError] = React.useState('');
  const [shareUrl, setShareUrl] = React.useState('');

  const topicHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (content && topicHeadingRef.current) {
      topicHeadingRef.current.focus();
    }
  }, [content]);

  // Interactive learning sharing states
  const [interactiveLearningShareLoading, setInteractiveLearningShareLoading] =
    React.useState(false);
  const [interactiveLearningShareError, setInteractiveLearningShareError] =
    React.useState('');
  const [interactiveLearningShareUrl, setInteractiveLearningShareUrl] =
    React.useState('');
  const [showInteractiveLearningQRCode, setShowInteractiveLearningQRCode] =
    React.useState(false);

  const copyToClipboard = React.useCallback(() => {
    navigator.clipboard
      .writeText(JSON.stringify(content, null, 2))
      .then(() => {
        setCopySuccess('JSON 已複製到剪貼簿！');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        setCopySuccess('複製失敗。');
        console.error('Failed to copy: ', err);
        setTimeout(() => setCopySuccess(''), 2000);
      });
  }, [content]);

  const handleExportHtml = React.useCallback(() => {
    try {
      exportLearningContentToHtml(content, topic);
      setExportMessage('HTML 檔案已開始下載！');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (error) {
      console.error('Failed to export HTML:', error);
      setExportMessage('匯出 HTML 失敗。');
      setTimeout(() => setExportMessage(''), 3000);
    }
  }, [content, topic]);

  const handleShare = React.useCallback(async () => {
    setShareLoading(true);
    setShareError('');
    setShareUrl('');
    try {
      const shareData = {
        ...content,
        topic: topic,
        selectedLevel: selectedLevel,
        selectedVocabularyLevel: selectedVocabularyLevel,
        sharedAt: new Date().toISOString(),
      };
      const binId = await saveLearningContent(shareData);
      const url = `${window.location.origin}${import.meta.env.BASE_URL}share?binId=${binId}`;
      setShareUrl(url);
    } catch (e: any) {
      setShareError(e.message || '分享失敗');
    } finally {
      setShareLoading(false);
    }
  }, [content, topic, selectedLevel, selectedVocabularyLevel]);

  const handleInteractiveLearningShare = React.useCallback(async () => {
    setInteractiveLearningShareLoading(true);
    setInteractiveLearningShareError('');
    setInteractiveLearningShareUrl('');

    try {
      const shareData = {
        ...content,
        topic: topic,
        selectedLevel: selectedLevel,
        selectedVocabularyLevel: selectedVocabularyLevel,
        sharedAt: new Date().toISOString(),
      };
      const binId = await saveLearningContent(shareData);
      const url = `${window.location.origin}${import.meta.env.BASE_URL}teacher-interactive-prep?binId=${binId}`;
      setInteractiveLearningShareUrl(url);
    } catch (e: any) {
      setInteractiveLearningShareError(e.message || '分享教材準備失敗');
    } finally {
      setInteractiveLearningShareLoading(false);
    }
  }, [content, topic, selectedLevel, selectedVocabularyLevel]);

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
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
            <span className="flex items-center">
              <span className="animate-spin mr-2">⏳</span> 分享中...
            </span>
          ) : (
            <span>分享方案</span>
          )}
        </button>
        <button
          onClick={handleInteractiveLearningShare}
          className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors flex items-center text-sm disabled:opacity-60"
          aria-label="分享教材準備"
          disabled={interactiveLearningShareLoading}
        >
          {interactiveLearningShareLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⏳</span> 分享中...
            </span>
          ) : (
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                />
              </svg>
              教材準備
            </span>
          )}
        </button>
        {copySuccess && (
          <span className="text-sm text-green-600">{copySuccess}</span>
        )}
        {exportMessage && (
          <span className="text-sm text-blue-600">{exportMessage}</span>
        )}
        {shareError && (
          <span className="text-sm text-red-600">{shareError}</span>
        )}
        {interactiveLearningShareError && (
          <span className="text-sm text-red-600">
            {interactiveLearningShareError}
          </span>
        )}
      </div>

      {/* Unified Share URL Display - Learning Plan */}
      {shareUrl && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700 mb-2">方案分享連結已生成：</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded text-sm"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            />
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              複製
            </button>
          </div>
        </div>
      )}

      {/* Interactive Learning Share URL Display */}
      {interactiveLearningShareUrl && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-700 mb-2">教材準備連結已生成：</p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={interactiveLearningShareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded text-sm"
              onClick={() =>
                navigator.clipboard.writeText(interactiveLearningShareUrl)
              }
            />
            <button
              onClick={() =>
                navigator.clipboard.writeText(interactiveLearningShareUrl)
              }
              className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
            >
              複製
            </button>
            <button
              onClick={() =>
                setShowInteractiveLearningQRCode(!showInteractiveLearningQRCode)
              }
              className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                />
              </svg>
              QR
            </button>
          </div>

          {showInteractiveLearningQRCode && (
            <div className="mt-4 flex justify-center">
              <QRCodeDisplay
                url={interactiveLearningShareUrl}
                title="教材準備分享 QR Code"
                size={200}
                className="bg-white p-4 rounded-lg shadow-sm"
              />
            </div>
          )}

          <div className="text-xs text-emerald-600 bg-emerald-100 px-3 py-2 rounded-lg">
            💡 教師可以通過此連結準備互動教材，包含內容轉換、檢查和發布功能
          </div>
        </div>
      )}

      {/* Topic and Level Display Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <LightbulbIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span className="text-sm font-medium text-indigo-600">
                學習主題
              </span>
            </div>
            <h2
              ref={topicHeadingRef}
              tabIndex={-1}
              className="text-3xl font-bold text-gray-900 mb-0 truncate focus:outline-none"
            >
              {topic}
            </h2>
          </div>

          {(selectedLevel || selectedVocabularyLevel) && (
            <div className="flex gap-3 ml-6 flex-shrink-0">
              {selectedLevel && (
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AcademicCapIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600">
                      學習程度
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedLevel.name}
                  </div>
                  <div
                    className="text-xs text-gray-500 truncate max-w-32"
                    title={selectedLevel.description}
                  >
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
                    <span className="text-xs font-medium text-blue-600">
                      詞彙程度
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedVocabularyLevel.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedVocabularyLevel.wordCount} 詞彙
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs tabs={tabDefs} current={currentTab} onChange={setCurrentTab}>
        <LearningObjectivesSection objectives={content.learningObjectives} />
        <ContentBreakdownSection breakdown={content.contentBreakdown} />
        <ConfusingPointsSection points={content.confusingPoints} />
        <ClassroomActivitiesSection activities={content.classroomActivities} />
        <ConversationPracticeSection
          englishConversation={content.englishConversation}
          learningObjectives={content.learningObjectives}
          contentBreakdown={content.contentBreakdown}
          topic={topic}
          apiKey={apiKey}
          selectedLevel={selectedLevel}
          selectedVocabularyLevel={selectedVocabularyLevel}
        />
        <WritingPracticeSection
          writingPractice={content.writingPractice}
          topic={topic}
          apiKey={apiKey}
          selectedLevel={selectedLevel}
          selectedVocabularyLevel={selectedVocabularyLevel}
        />
        <QuizSection
          content={content}
          topic={topic}
          apiKey={apiKey}
          selectedLevel={selectedLevel}
          selectedVocabularyLevel={selectedVocabularyLevel}
          onContentUpdate={onContentUpdate}
        />
      </Tabs>
    </div>
  );
};

export default LearningContentDisplay;
