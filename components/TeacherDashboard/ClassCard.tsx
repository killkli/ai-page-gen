import React from 'react';
import type { ClassRoom, ClassRoomStats } from '../../src/core/types/class';
import {
  SUBJECT_LABELS,
  STAGE_LABELS,
  getStageFromGrade,
} from '../../src/core/types/curriculum';

interface ClassCardProps {
  classroom: ClassRoom;
  isSelected: boolean;
  stats: ClassRoomStats;
  onClick: () => void;
  onDelete: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  classroom,
  isSelected,
  stats,
  onClick,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={`
        bg-white rounded-xl p-4 cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-md border border-slate-200'}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{classroom.name}</h3>
          <div className="text-sm text-slate-500 mt-1 space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
              {SUBJECT_LABELS[classroom.subject]}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              {STAGE_LABELS[getStageFromGrade(classroom.gradeLevel)]}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="刪除班級"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-50 rounded p-2">
          <div className="font-semibold text-slate-800">
            {stats.totalStudents}
          </div>
          <div className="text-slate-500">學生</div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="font-semibold text-slate-800">
            {stats.totalAssignments}
          </div>
          <div className="text-slate-500">作業</div>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <div className="font-semibold text-slate-800">
            {stats.averageScore.toFixed(0)}
          </div>
          <div className="text-slate-500">平均分</div>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
