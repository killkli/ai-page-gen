import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../Tabs';
import ClassManager from './ClassManager';
import AnalyticsView from './AnalyticsView';
import LessonPlanManager from '../LessonPlanManager';
import { classService } from '../../services/class/classService';
import type { TeacherIdentity } from '../../src/core/types/class';

const TABS = [
  { key: 'plans', label: '我的教案' },
  { key: 'classes', label: '班級管理' },
  { key: 'analytics', label: '學習分析' },
];

interface TeacherDashboardProps {
  onNavigateToGenerator: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigateToGenerator,
}) => {
  const [activeTab, setActiveTab] = useState('plans');
  const [teacherIdentity, setTeacherIdentity] =
    useState<TeacherIdentity | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    const identity = classService.getTeacherIdentity();
    if (identity) {
      setTeacherIdentity(identity);
    } else {
      setShowNameModal(true);
    }
  }, []);

  const handleSetTeacherName = useCallback(() => {
    if (teacherName.trim()) {
      const identity = classService.setTeacherIdentity(teacherName.trim());
      setTeacherIdentity(identity);
      setShowNameModal(false);
    }
  }, [teacherName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSetTeacherName();
      }
    },
    [handleSetTeacherName]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">教師儀表板</h1>
            {teacherIdentity && (
              <p className="text-sm text-slate-500">
                {teacherIdentity.name} 老師
              </p>
            )}
          </div>
          <button
            onClick={onNavigateToGenerator}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            建立新教案
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs tabs={TABS} current={activeTab} onChange={setActiveTab}>
          <LessonPlanManager />
          <ClassManager />
          <AnalyticsView />
        </Tabs>
      </main>

      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">歡迎使用教師儀表板</h2>
            <p className="text-slate-600 mb-4">請輸入您的名字以開始使用</p>
            <input
              type="text"
              value={teacherName}
              onChange={e => setTeacherName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="教師名字"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={handleSetTeacherName}
              disabled={!teacherName.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              開始使用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
