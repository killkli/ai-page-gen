import React from 'react';
import { ContentBreakdownItem } from '../../src/core/types';
import SectionCard from '../SectionCard';
import { BookOpenIcon } from '../icons';

interface ContentBreakdownSectionProps {
    breakdown?: ContentBreakdownItem[];
}

const ContentBreakdownSection: React.FC<ContentBreakdownSectionProps> = ({ breakdown }) => {
    return (
        <SectionCard title="分解學習內容" icon={<BookOpenIcon className="w-7 h-7" />}>
            {breakdown && breakdown.length > 0 ? (
                breakdown.map((item, index) => (
                    <div key={index} className="mb-6 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <h4 className="font-semibold text-lg text-sky-800 mb-1">{item.topic}</h4>
                        <p className="text-slate-700 mb-3">{item.details}</p>

                        {/* Enhanced English Learning Fields */}
                        {item.coreConcept && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-blue-700 mb-1">核心概念</span>
                                <span className="text-blue-900 text-sm">{item.coreConcept}</span>
                            </div>
                        )}

                        {item.teachingSentences && item.teachingSentences.length > 0 && (
                            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-indigo-700 mb-2">教學例句</span>
                                <div className="space-y-1">
                                    {item.teachingSentences.map((sentence, sentenceIndex) => (
                                        <div key={sentenceIndex} className="text-indigo-900 text-sm">
                                            <span className="font-mono text-indigo-600">{sentenceIndex + 1}.</span> {sentence}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.teachingTips && (
                            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-purple-700 mb-1">教學要點提示</span>
                                <span className="text-purple-900 text-sm">{item.teachingTips}</span>
                            </div>
                        )}

                        {item.teachingExample && (
                            <div className="bg-sky-50 border-l-4 border-sky-400 p-3 rounded-md">
                                <span className="block text-xs font-semibold text-sky-700 mb-1">教學示例</span>
                                <span className="text-sky-900 text-sm">{item.teachingExample}</span>
                            </div>
                        )}
                    </div>
                ))
            ) : <p>沒有提供內容分解。</p>}
        </SectionCard>
    );
};

export default ContentBreakdownSection;
