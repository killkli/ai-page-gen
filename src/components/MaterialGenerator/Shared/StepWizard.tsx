import React from 'react';

interface StepWizardProps {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
    canNext: boolean;
    canFinish: boolean;
    isSubmitting: boolean;
    children: React.ReactNode;
    title: string;
}

const StepWizard: React.FC<StepWizardProps> = ({
    currentStep,
    totalSteps,
    onNext,
    onPrev,
    onSubmit,
    canNext,
    canFinish,
    isSubmitting,
    children,
    title
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto my-8 border border-slate-100">
            {/* Header with Progress */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    <span className="text-sm font-medium text-slate-500">
                        步驟 {currentStep} / {totalSteps}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px]">
                {children}
            </div>

            {/* Footer with Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                <button
                    onClick={onPrev}
                    disabled={currentStep === 1 || isSubmitting}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${currentStep === 1
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-slate-200 bg-white border border-slate-300 shadow-sm'
                        }`}
                >
                    上一步
                </button>

                {currentStep < totalSteps ? (
                    <button
                        onClick={onNext}
                        disabled={!canNext || isSubmitting}
                        className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-md transition-all ${!canNext || isSubmitting
                            ? 'bg-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                處理中...
                            </div>
                        ) : (
                            '下一步'
                        )}
                    </button>
                ) : (
                    <button
                        onClick={onSubmit}
                        disabled={!canFinish || isSubmitting}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white shadow-md transition-all ${!canFinish || isSubmitting
                            ? 'bg-emerald-300 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                生成中...
                            </>
                        ) : (
                            '開始生成教材'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default StepWizard;
