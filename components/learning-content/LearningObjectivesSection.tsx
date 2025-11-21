import React from 'react';
import { LearningObjectiveItem } from '../../src/core/types';
import SectionCard from '../SectionCard';
import { AcademicCapIcon } from '../icons';

interface LearningObjectivesSectionProps {
    objectives?: LearningObjectiveItem[];
}

const LearningObjectivesSection: React.FC<LearningObjectivesSectionProps> = ({ objectives }) => {
    return (
        <SectionCard title="教學目標設定" icon={<AcademicCapIcon className="w-7 h-7" />}>
            {objectives && objectives.length > 0 ? (
                objectives.map((objective, index) => (
                    <div key={index} className="mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <h4 className="font-semibold text-lg text-green-800 mb-1">{objective.objective}</h4>
                        <p className="text-slate-700 mb-2">{objective.description}</p>
                        {objective.teachingExample && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-md mt-2">
                                <span className="block text-xs font-semibold text-green-700 mb-1">教學示例</span>
                                <span className="text-green-900 text-sm">{objective.teachingExample}</span>
                            </div>
                        )}
                    </div>
                ))
            ) : <p>沒有提供教學目標。</p>}
        </SectionCard>
    );
};

export default LearningObjectivesSection;
