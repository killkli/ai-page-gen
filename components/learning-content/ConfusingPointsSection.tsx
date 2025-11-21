import React from 'react';
import { ConfusingPointItem } from '../../src/core/types';
import SectionCard from '../SectionCard';
import { LightbulbIcon } from '../icons';

interface ConfusingPointsSectionProps {
    points?: ConfusingPointItem[];
}

const ConfusingPointsSection: React.FC<ConfusingPointsSectionProps> = ({ points }) => {
    return (
        <SectionCard title="易混淆點識別" icon={<LightbulbIcon className="w-7 h-7" />}>
            {points && points.length > 0 ? (
                points.map((item, index) => (
                    <div key={index} className="mb-6 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <h4 className="font-semibold text-lg text-red-700 mb-2">{item.point}</h4>
                        <p className="text-slate-700 mb-3">{item.clarification}</p>

                        {/* Error Type */}
                        {item.errorType && (
                            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-orange-700 mb-1">誤區類型</span>
                                <span className="text-orange-900 text-sm">{item.errorType}</span>
                            </div>
                        )}

                        {/* Common Errors */}
                        {item.commonErrors && item.commonErrors.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-red-700 mb-2">常見錯誤示例</span>
                                <div className="space-y-1">
                                    {item.commonErrors.map((error, errorIndex) => (
                                        <div key={errorIndex} className="text-red-900 text-sm">
                                            <span className="font-mono text-red-600">{errorIndex + 1}.</span> {error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Correct vs Wrong Comparisons */}
                        {item.correctVsWrong && item.correctVsWrong.length > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-yellow-700 mb-2">正確與錯誤對比</span>
                                <div className="space-y-3">
                                    {item.correctVsWrong.map((comparison, compIndex) => (
                                        <div key={compIndex} className="border border-yellow-200 rounded-md p-2 bg-white">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                                    <span className="block text-xs font-semibold text-green-700 mb-1">✓ 正確</span>
                                                    <span className="text-green-900 text-sm">{comparison.correct}</span>
                                                </div>
                                                <div className="bg-red-50 p-2 rounded border border-red-200">
                                                    <span className="block text-xs font-semibold text-red-700 mb-1">✗ 錯誤</span>
                                                    <span className="text-red-900 text-sm">{comparison.wrong}</span>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                                <span className="block text-xs font-semibold text-blue-700 mb-1">說明</span>
                                                <span className="text-blue-900 text-sm">{comparison.explanation}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prevention Strategy */}
                        {item.preventionStrategy && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-blue-700 mb-1">預防策略</span>
                                <span className="text-blue-900 text-sm">{item.preventionStrategy}</span>
                            </div>
                        )}

                        {/* Correction Method */}
                        {item.correctionMethod && (
                            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-purple-700 mb-1">糾正方法</span>
                                <span className="text-purple-900 text-sm">{item.correctionMethod}</span>
                            </div>
                        )}

                        {/* Practice Activities */}
                        {item.practiceActivities && item.practiceActivities.length > 0 && (
                            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-md mb-3">
                                <span className="block text-xs font-semibold text-indigo-700 mb-2">練習建議</span>
                                <div className="space-y-1">
                                    {item.practiceActivities.map((activity, activityIndex) => (
                                        <div key={activityIndex} className="text-indigo-900 text-sm">
                                            <span className="font-mono text-indigo-600">{activityIndex + 1}.</span> {activity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Original Teaching Example */}
                        {item.teachingExample && (
                            <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-md">
                                <span className="block text-xs font-semibold text-gray-700 mb-1">教學示例</span>
                                <span className="text-gray-900 text-sm">{item.teachingExample}</span>
                            </div>
                        )}
                    </div>
                ))
            ) : <p>沒有提供易混淆點。</p>}
        </SectionCard>
    );
};

export default ConfusingPointsSection;
