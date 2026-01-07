import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Subject,
  Stage,
  CurriculumStandard,
} from '../../src/core/types/curriculum';

import {
  getStandardsBySubjectAndGrade,
  getStandardsBySubjectAndStage,
  searchStandardsByKeyword,
  getGradeOptions,
  getSubjectOptions,
  getStageOptions,
} from '../../services/curriculum/curriculumService';

interface StandardsSelectorProps {
  onSelect: (standards: CurriculumStandard[]) => void;
  initialSubject?: Subject;
  initialGrade?: number;
  maxSelections?: number;
}

const StandardsSelector: React.FC<StandardsSelectorProps> = ({
  onSelect,
  initialSubject = 'math',
  initialGrade,
  maxSelections = 5,
}) => {
  const [subject, setSubject] = useState<Subject>(initialSubject);
  const [grade, setGrade] = useState<number | undefined>(initialGrade);
  const [stage, setStage] = useState<Stage | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'grade' | 'stage'>('grade');

  const standards = useMemo(() => {
    if (searchQuery.trim()) {
      return searchStandardsByKeyword(subject, searchQuery);
    }
    if (filterMode === 'grade' && grade) {
      return getStandardsBySubjectAndGrade(subject, grade);
    }
    if (filterMode === 'stage' && stage) {
      return getStandardsBySubjectAndStage(subject, stage);
    }
    return [];
  }, [subject, grade, stage, searchQuery, filterMode]);

  const handleToggle = useCallback(
    (standardId: string) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(standardId)) {
          newSet.delete(standardId);
        } else if (newSet.size < maxSelections) {
          newSet.add(standardId);
        }
        return newSet;
      });
    },
    [maxSelections]
  );

  useEffect(() => {
    const selectedStandards = standards.filter(std => selectedIds.has(std.id));
    onSelect(selectedStandards);
  }, [selectedIds, standards, onSelect]);

  const handleClearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const gradeOptions = useMemo(() => getGradeOptions(), []);
  const subjectOptions = useMemo(() => getSubjectOptions(), []);
  const stageOptions = useMemo(() => getStageOptions(), []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          選擇 108 課綱指標
        </h3>
        <p className="text-sm text-slate-600">
          選擇與教學主題相關的課綱指標，AI 將據此生成對應的學習目標
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label
            htmlFor="subject-select"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            學科領域
          </label>
          <select
            id="subject-select"
            value={subject}
            onChange={e => {
              setSubject(e.target.value as Subject);
              setSelectedIds(new Set());
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            {subjectOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            篩選方式
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('grade')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'grade'
                  ? 'bg-sky-100 text-sky-700 border-2 border-sky-500'
                  : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              按年級
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('stage')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'stage'
                  ? 'bg-sky-100 text-sky-700 border-2 border-sky-500'
                  : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              按學習階段
            </button>
          </div>
        </div>

        {filterMode === 'grade' && (
          <div>
            <label
              htmlFor="grade-select"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              年級
            </label>
            <select
              id="grade-select"
              value={grade || ''}
              onChange={e =>
                setGrade(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">請選擇年級</option>
              {gradeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {filterMode === 'stage' && (
          <div>
            <label
              htmlFor="stage-select"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              學習階段
            </label>
            <select
              id="stage-select"
              value={stage || ''}
              onChange={e => setStage((e.target.value as Stage) || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">請選擇學習階段</option>
              {stageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="search-input"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            關鍵字搜尋
          </label>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜尋指標..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-sky-50 rounded-lg border border-sky-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sky-800">
              已選擇 {selectedIds.size} / {maxSelections} 個指標
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-sky-600 hover:text-sky-800 underline"
            >
              清除全部
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedIds).map(id => (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs font-medium"
              >
                {id}
                <button
                  type="button"
                  onClick={() => handleToggle(id)}
                  className="hover:text-sky-900"
                  aria-label={`移除 ${id}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
        {standards.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {(filterMode === 'grade' && !grade) ||
            (filterMode === 'stage' && !stage)
              ? '請選擇年級或學習階段以顯示課綱指標'
              : searchQuery
                ? '找不到符合搜尋條件的指標'
                : '沒有符合條件的課綱指標'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {standards.map(std => (
              <li key={std.id}>
                <label
                  className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                    selectedIds.has(std.id) ? 'bg-sky-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(std.id)}
                    onChange={() => handleToggle(std.id)}
                    disabled={
                      !selectedIds.has(std.id) &&
                      selectedIds.size >= maxSelections
                    }
                    className="mt-1 h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {std.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {std.competency} / {std.indicator}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800">{std.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {std.keywords.slice(0, 5).map(kw => (
                        <span
                          key={kw}
                          className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StandardsSelector;
