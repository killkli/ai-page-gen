import React, { useState } from 'react';
import { LearningObjectiveItem } from '../../../core/types';

interface ObjectivesReviewProps {
    objectives: LearningObjectiveItem[];
    onObjectivesChange: (objectives: LearningObjectiveItem[]) => void;
    isGenerating: boolean;
}

const ObjectivesReview: React.FC<ObjectivesReviewProps> = ({
    objectives,
    onObjectivesChange,
    isGenerating
}) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<LearningObjectiveItem>({
        objective: '',
        description: '',
        teachingExample: ''
    });

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditForm(objectives[index]);
    };

    const handleSave = (index: number) => {
        const newObjectives = [...objectives];
        newObjectives[index] = editForm;
        onObjectivesChange(newObjectives);
        setEditingIndex(null);
    };

    const handleCancel = () => {
        setEditingIndex(null);
    };

    const handleDelete = (index: number) => {
        if (window.confirm('確定要刪除這個學習目標嗎？')) {
            const newObjectives = objectives.filter((_, i) => i !== index);
            onObjectivesChange(newObjectives);
        }
    };

    const handleAdd = () => {
        const newObjective: LearningObjectiveItem = {
            objective: '新的學習目標',
            description: '請輸入目標描述',
            teachingExample: '請輸入教學範例'
        };
        const newObjectives = [...objectives, newObjective];
        onObjectivesChange(newObjectives);
        // Automatically enter edit mode for the new item
        setEditingIndex(newObjectives.length - 1);
        setEditForm(newObjective);
    };

    const handleChange = (field: keyof LearningObjectiveItem, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-lg text-slate-600 font-medium">正在生成學習目標...</p>
                <p className="text-sm text-slate-500">AI 正在分析您的需求並規劃課程架構</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            這是 AI 為您生成的學習目標。您可以檢視、修改或刪除這些目標，確認無誤後再繼續生成完整的教材內容。
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {objectives.map((obj, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        {editingIndex === index ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">目標標題</label>
                                    <input
                                        type="text"
                                        value={editForm.objective}
                                        onChange={(e) => handleChange('objective', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">詳細描述</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">教學範例</label>
                                    <textarea
                                        value={editForm.teachingExample || ''}
                                        onChange={(e) => handleChange('teachingExample', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={() => handleSave(index)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                    >
                                        儲存修改
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-slate-800">{obj.objective}</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                                            title="編輯"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                            title="刪除"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-slate-600 mb-3">{obj.description}</p>
                                {obj.teachingExample && (
                                    <div className="bg-slate-50 rounded p-3 text-sm text-slate-500 border border-slate-100">
                                        <span className="font-medium text-slate-700">範例：</span>
                                        {obj.teachingExample}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                <button
                    onClick={handleAdd}
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center font-medium"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    新增學習目標
                </button>
            </div>
        </div>
    );
};

export default ObjectivesReview;
