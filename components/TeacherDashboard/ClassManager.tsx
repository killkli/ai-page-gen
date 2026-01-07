import React, { useState, useEffect, useCallback } from 'react';
import { classService } from '../../services/class/classService';
import type {
  ClassRoom,
  CreateClassRoomInput,
} from '../../src/core/types/class';
import type { Subject } from '../../src/core/types/curriculum';
import {
  SUBJECT_LABELS,
  STAGE_LABELS,
  getStageFromGrade,
} from '../../src/core/types/curriculum';
import ClassCard from './ClassCard';
import ClassDetail from './ClassDetail';

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      await classService.init();
      const result = await classService.getAllClassRooms();
      setClasses(result);
      if (selectedClass) {
        const updated = result.find(c => c.id === selectedClass.id);
        setSelectedClass(updated || null);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = useCallback(
    async (input: CreateClassRoomInput) => {
      await classService.createClassRoom(input);
      setShowCreateModal(false);
      loadClasses();
    },
    [loadClasses]
  );

  const handleDeleteClass = useCallback(
    async (id: string) => {
      if (window.confirm('確定要刪除這個班級嗎？此操作無法復原。')) {
        await classService.deleteClassRoom(id);
        if (selectedClass?.id === id) {
          setSelectedClass(null);
        }
        loadClasses();
      }
    },
    [selectedClass, loadClasses]
  );

  const handleSelectClass = useCallback((classroom: ClassRoom) => {
    setSelectedClass(classroom);
  }, []);

  if (loading && classes.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">我的班級</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            新增班級
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-slate-500">尚未建立任何班級</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              建立第一個班級
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map(c => (
              <ClassCard
                key={c.id}
                classroom={c}
                isSelected={selectedClass?.id === c.id}
                stats={classService.calculateClassRoomStats(c)}
                onClick={() => handleSelectClass(c)}
                onDelete={() => handleDeleteClass(c.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {selectedClass ? (
          <ClassDetail classroom={selectedClass} onRefresh={loadClasses} />
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">👈</div>
            <p className="text-slate-500">選擇一個班級查看詳情</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClass}
        />
      )}
    </div>
  );
};

interface CreateClassModalProps {
  onClose: () => void;
  onCreate: (input: CreateClassRoomInput) => void;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState<Subject>('math');
  const [gradeLevel, setGradeLevel] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate({ name: name.trim(), subject, gradeLevel });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">建立新班級</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              班級名稱
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：七年級 A 班"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              科目
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value as Subject)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              年級 ({STAGE_LABELS[getStageFromGrade(gradeLevel)]})
            </label>
            <input
              type="range"
              min={1}
              max={12}
              value={gradeLevel}
              onChange={e => setGradeLevel(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-slate-600">{gradeLevel} 年級</div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              建立
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassManager;
