import React from 'react';
import { ClassroomActivity } from '../../src/core/types';
import SectionCard from '../SectionCard';
import { BeakerIcon } from '../icons';

interface ClassroomActivitiesSectionProps {
    activities?: ClassroomActivity[];
}

const ClassroomActivitiesSection: React.FC<ClassroomActivitiesSectionProps> = ({ activities }) => {
    return (
        <SectionCard title="課堂活動與遊戲設計" icon={<BeakerIcon className="w-7 h-7" />}>
            {activities && activities.length > 0 ? (
                <div className="space-y-6">
                    {activities.map((activity, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            {/* Activity Header */}
                            <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-slate-200 rounded-t-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-sky-500 text-white rounded-full font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <h4 className="font-bold text-xl text-sky-800">{activity.title}</h4>
                                </div>
                                <p className="mt-3 text-slate-700 leading-relaxed">{activity.description}</p>
                            </div>

                            {/* Activity Details */}
                            <div className="p-6">
                                {/* Basic Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {activity.objective && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="font-semibold text-green-800 text-sm">學習目標</span>
                                            </div>
                                            <p className="text-green-900 text-sm leading-relaxed">{activity.objective}</p>
                                        </div>
                                    )}
                                    {activity.timing && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                <span className="font-semibold text-purple-800 text-sm">使用時機</span>
                                            </div>
                                            <p className="text-purple-900 text-sm leading-relaxed">{activity.timing}</p>
                                        </div>
                                    )}
                                    {activity.materials && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                <span className="font-semibold text-orange-800 text-sm">所需教具</span>
                                            </div>
                                            <p className="text-orange-900 text-sm leading-relaxed">{activity.materials}</p>
                                        </div>
                                    )}
                                    {activity.environment && (
                                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                                <span className="font-semibold text-teal-800 text-sm">環境要求</span>
                                            </div>
                                            <p className="text-teal-900 text-sm leading-relaxed">{activity.environment}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Activity Steps */}
                                {activity.steps && activity.steps.length > 0 && (
                                    <div className="mb-6">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                </svg>
                                                <span className="font-semibold text-blue-800">活動步驟</span>
                                            </div>
                                            <div className="space-y-3">
                                                {activity.steps.map((step, stepIndex) => (
                                                    <div key={stepIndex} className="flex gap-3">
                                                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full font-semibold text-xs flex-shrink-0 mt-0.5">
                                                            {stepIndex + 1}
                                                        </div>
                                                        <p className="text-blue-900 text-sm leading-relaxed flex-1">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Assessment Points */}
                                {activity.assessmentPoints && activity.assessmentPoints.length > 0 && (
                                    <div>
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                                </svg>
                                                <span className="font-semibold text-indigo-800">評估重點</span>
                                            </div>
                                            <div className="space-y-2">
                                                {activity.assessmentPoints.map((point, pointIndex) => (
                                                    <div key={pointIndex} className="flex items-start gap-3">
                                                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-indigo-900 text-sm leading-relaxed">{point}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p>沒有提供課堂活動。</p>}
        </SectionCard>
    );
};

export default ClassroomActivitiesSection;
