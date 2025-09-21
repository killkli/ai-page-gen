import React, { useEffect } from 'react';
import { ExtendedLearningContent, InteractiveLearningSession } from '../../types';

interface ProgressTrackerProps {
  learningSession: InteractiveLearningSession;
  content: ExtendedLearningContent;
  onProgressUpdate: (session: InteractiveLearningSession) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  learningSession,
  content,
  onProgressUpdate
}) => {
  // 計算總體進度
  const calculateOverallProgress = () => {
    // 計算所有可完成的項目
    let totalItems = 0;
    let completedItems = 0;

    // 學習目標
    if (content.learningObjectives && content.learningObjectives.length > 0) {
      totalItems += content.learningObjectives.length;
      completedItems += learningSession.progress.completedObjectives.length;
    }

    // 其他活動（如果有的話，可以擴展）
    // 目前主要以學習目標為基準

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // 計算學習目標進度
  const calculateObjectiveProgress = () => {
    const totalObjectives = content.learningObjectives?.length || 0;
    const completedObjectives = learningSession.progress.completedObjectives.length;

    return totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;
  };

  // 格式化學習時間
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes} 分 ${seconds} 秒`;
    }
    return `${seconds} 秒`;
  };

  // 計算當前學習時間
  const getCurrentLearningTime = () => {
    const currentTime = Date.now();
    const sessionTime = currentTime - learningSession.progress.startTime;
    return sessionTime + learningSession.progress.timeSpent;
  };

  const overallProgress = calculateOverallProgress();
  const objectiveProgress = calculateObjectiveProgress();
  const currentLearningTime = getCurrentLearningTime();

  useEffect(() => {
    onProgressUpdate(learningSession);
  }, [learningSession, onProgressUpdate]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-indigo-700">學習進度</h3>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(currentLearningTime)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75M4.929 4.929L6.52 6.52M12 6.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
            </svg>
            {learningSession.progress.interactionCount} 次互動
          </span>
        </div>
      </div>

      {/* 總體進度條 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">學習進度</span>
          <span className="text-sm font-bold text-indigo-600">
            {learningSession.progress.completedObjectives.length} / {content.learningObjectives?.length || 0} 完成
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-sky-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs text-slate-500">{overallProgress}% 完成</span>
        </div>
      </div>

      {/* 學習目標進度條 - 新增 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">學習目標進度</span>
          <span className="text-sm font-bold text-indigo-600">
            {learningSession.progress.completedObjectives.length} / {content.learningObjectives?.length || 0} 已達成
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${objectiveProgress}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs text-slate-500">{objectiveProgress}% 已達成</span>
        </div>
      </div>
      {/* 學習目標進度條 - 結束 */}

      {/* 學習路徑導航 */}
      {content.learningObjectives && content.learningObjectives.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">學習路徑</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {content.learningObjectives.map((_, index) => {
              const objectiveId = `objective_${index}`;
              const isCompleted = learningSession.progress.completedObjectives.includes(objectiveId);
              const isCurrent = learningSession.progress.currentObjectiveIndex === index;

              return (
                <React.Fragment key={index}>
                  <div
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      transition-all duration-300
                      ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-indigo-500 text-white ring-4 ring-indigo-200'
                          : 'bg-slate-300 text-slate-600'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {index < content.learningObjectives.length - 1 && (
                    <div className={`
                      flex-shrink-0 h-0.5 w-6 transition-all duration-300
                      ${isCompleted ? 'bg-green-400' : 'bg-slate-300'}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 完成提示 */}
      {overallProgress === 100 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 font-medium">恭喜！你已經完成了所有學習目標！</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
