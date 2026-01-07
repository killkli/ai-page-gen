import React, { useState, useCallback } from 'react';
import { classService } from '../../services/class/classService';
import type {
  ClassRoom,
  StudentEntry,
  AssignedContent,
} from '../../src/core/types/class';
import {
  SUBJECT_LABELS,
  STAGE_LABELS,
  getStageFromGrade,
} from '../../src/core/types/curriculum';

interface ClassDetailProps {
  classroom: ClassRoom;
  onRefresh: () => void;
}

const ClassDetail: React.FC<ClassDetailProps> = ({ classroom, onRefresh }) => {
  const [activeSection, setActiveSection] = useState<'students' | 'content'>(
    'students'
  );
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  const handleAddStudent = useCallback(async () => {
    if (studentName.trim()) {
      await classService.addStudent(classroom.id, { name: studentName.trim() });
      setStudentName('');
      setShowAddStudent(false);
      onRefresh();
    }
  }, [classroom.id, studentName, onRefresh]);

  const handleAddResultByUrl = useCallback(async () => {
    if (resultUrl.trim()) {
      await classService.addStudentResultByUrl(classroom.id, resultUrl.trim());
      setResultUrl('');
      onRefresh();
    }
  }, [classroom.id, resultUrl, onRefresh]);

  const handleRemoveStudent = useCallback(
    async (studentId: string) => {
      if (window.confirm('確定要移除這位學生嗎？')) {
        await classService.removeStudent(classroom.id, studentId);
        onRefresh();
      }
    },
    [classroom.id, onRefresh]
  );

  const stats = classService.calculateClassRoomStats(classroom);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {classroom.name}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-sm rounded">
                {SUBJECT_LABELS[classroom.subject]}
              </span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-sm rounded">
                {STAGE_LABELS[getStageFromGrade(classroom.gradeLevel)]}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>
              建立時間:{' '}
              {new Date(classroom.createdAt).toLocaleDateString('zh-TW')}
            </div>
            <div>
              最後更新:{' '}
              {new Date(classroom.updatedAt).toLocaleDateString('zh-TW')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatBox label="學生人數" value={stats.totalStudents} />
          <StatBox label="活躍學生" value={stats.activeStudentsCount} />
          <StatBox label="作業數量" value={stats.totalAssignments} />
          <StatBox label="完成率" value={`${stats.completionRatePercent}%`} />
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSection('students')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeSection === 'students'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          學生名單 ({classroom.students.length})
        </button>
        <button
          onClick={() => setActiveSection('content')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeSection === 'content'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          指派內容 ({classroom.assignedContent.length})
        </button>
      </div>

      <div className="p-6">
        {activeSection === 'students' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {showAddStudent ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="學生姓名"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAddStudent()}
                  />
                  <button
                    onClick={handleAddStudent}
                    disabled={!studentName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    新增
                  </button>
                  <button
                    onClick={() => setShowAddStudent(false)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  新增學生
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                從分享連結新增學生結果
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resultUrl}
                  onChange={e => setResultUrl(e.target.value)}
                  placeholder="貼上學生結果分享連結"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  onClick={handleAddResultByUrl}
                  disabled={!resultUrl.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  匯入
                </button>
              </div>
            </div>

            {classroom.students.length === 0 ? (
              <div className="text-center py-8 text-slate-500">尚無學生</div>
            ) : (
              <div className="space-y-2">
                {classroom.students.map(student => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    onRemove={() => handleRemoveStudent(student.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'content' && (
          <div>
            {classroom.assignedContent.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                尚無指派內容
              </div>
            ) : (
              <div className="space-y-2">
                {classroom.assignedContent.map((content, idx) => (
                  <ContentRow
                    key={idx}
                    content={content}
                    totalStudents={classroom.students.length}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="bg-slate-50 rounded-lg p-3 text-center">
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-xs text-slate-500 mt-1">{label}</div>
  </div>
);

interface StudentRowProps {
  student: StudentEntry;
  onRemove: () => void;
}

const StudentRow: React.FC<StudentRowProps> = ({ student, onRemove }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
        {student.name.charAt(0)}
      </div>
      <div>
        <div className="font-medium text-slate-800">{student.name}</div>
        <div className="text-xs text-slate-500">
          測驗: {student.totalQuizzes} | 平均: {student.averageScore.toFixed(1)}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">
        {new Date(student.lastActivity).toLocaleDateString('zh-TW')}
      </span>
      <button
        onClick={onRemove}
        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
        aria-label="移除學生"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
);

interface ContentRowProps {
  content: AssignedContent;
  totalStudents: number;
}

const ContentRow: React.FC<ContentRowProps> = ({ content, totalStudents }) => {
  const completionPercent =
    totalStudents > 0
      ? Math.round((content.completedByStudentIds.length / totalStudents) * 100)
      : 0;

  const typeLabels = {
    quiz: '測驗',
    writing: '寫作',
    interactive: '互動',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
          {typeLabels[content.contentType]}
        </span>
        <div>
          <div className="font-medium text-slate-800">{content.title}</div>
          <div className="text-xs text-slate-500">
            指派日期: {new Date(content.assignedAt).toLocaleDateString('zh-TW')}
            {content.dueDate &&
              ` | 截止: ${new Date(content.dueDate).toLocaleDateString('zh-TW')}`}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-slate-800">
          {content.completedByStudentIds.length}/{totalStudents}
        </div>
        <div className="text-xs text-slate-500">{completionPercent}% 完成</div>
      </div>
    </div>
  );
};

export default ClassDetail;
