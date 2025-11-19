import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepWizard from './Shared/StepWizard';
import MethodCard from './Shared/MethodCard';
import MaterialSelector from './Shared/MaterialSelector';
import ObjectivesReview from './Shared/ObjectivesReview';
import {
    MathGenerationParams,
    TeachingContext,
    PriorExperience,
    MathTeachingMethod,
    StudentGrade,
    MaterialItem,
    LearningObjectiveItem,
    GeneratedLearningContent
} from '../../core/types';
import { generateMathObjectives, generateMathContent, hasConfiguredProviders } from '../../../services/geminiServiceAdapter';

interface MathGeneratorProps {
    onComplete: (content: GeneratedLearningContent, topicSummary: string) => Promise<void>;
    apiKey: string;
}

const TEACHING_METHODS: { id: MathTeachingMethod; title: string; description: string }[] = [
    {
        id: 'visual',
        title: '視覺化教學 (Visual)',
        description: '利用圖表、幾何圖形和視覺輔助工具來解釋數學概念，幫助學生建立直觀理解。'
    },
    {
        id: 'cpa',
        title: 'CPA 教學法',
        description: '具體 (Concrete) -> 圖像 (Pictorial) -> 抽象 (Abstract) 的三階段教學，循序漸進建立概念。'
    },
    {
        id: 'concept_oriented',
        title: '概念導向 (Concept-oriented)',
        description: '強調數學核心概念的理解與連結，而非僅僅記憶公式或解題步驟。'
    },
    {
        id: 'discovery',
        title: '發現式學習 (Discovery)',
        description: '引導學生透過觀察、實驗和推理，自己發現數學規律和定理。'
    },
    {
        id: 'gamification',
        title: '遊戲化教學 (Gamification)',
        description: '將數學練習融入遊戲機制中，提高學習動機和參與度。'
    },
    {
        id: 'contextual',
        title: '情境式教學 (Contextual)',
        description: '將數學問題置於真實生活情境中，讓學生理解數學的實際應用價值。'
    }
];

const STUDENT_GRADES: { id: StudentGrade; label: string }[] = [
    { id: 'preschool', label: '學齡前 (Preschool)' },
    { id: 'elementary_low', label: '國小低年級 (1-2年級)' },
    { id: 'elementary_mid', label: '國小中年級 (3-4年級)' },
    { id: 'elementary_high', label: '國小高年級 (5-6年級)' },
    { id: 'junior_7', label: '國中七年級' },
    { id: 'junior_8', label: '國中八年級' },
    { id: 'junior_9', label: '國中九年級' },
    { id: 'high_school_review', label: '高中複習' },
];

const MathGenerator: React.FC<MathGeneratorProps> = ({ onComplete, apiKey }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [studentCount, setStudentCount] = useState<number>(1);
    const [duration, setDuration] = useState<number>(45);
    const [teachingContext, setTeachingContext] = useState<TeachingContext>('physical');
    const [priorExperience, setPriorExperience] = useState<PriorExperience>('none');
    const [studentGrade, setStudentGrade] = useState<StudentGrade>('elementary_mid');
    const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>([]);
    const [teachingMethod, setTeachingMethod] = useState<MathTeachingMethod>('concept_oriented');

    // Objectives State
    const [objectives, setObjectives] = useState<LearningObjectiveItem[]>([]);
    const [generatedTopic, setGeneratedTopic] = useState<string>('');

    const getEffectiveApiKey = async () => {
        const hasProviders = await hasConfiguredProviders();
        if (hasProviders) return 'provider-system-placeholder-key';
        return apiKey;
    };

    const handleNext = async () => {
        if (step === 2) {
            // Generate Objectives
            setIsGeneratingObjectives(true);
            setError(null);
            try {
                const effectiveKey = await getEffectiveApiKey();
                if (!effectiveKey) throw new Error("請先設定 API Key 或配置 AI Provider");

                const params: MathGenerationParams = {
                    studentCount,
                    classDuration: duration,
                    teachingContext,
                    priorExperience,
                    studentGrade,
                    selectedMaterials,
                    teachingMethod
                };
                const result = await generateMathObjectives(params, effectiveKey);
                setObjectives(result.learningObjectives);
                setGeneratedTopic(result.topic);
                setStep(3);
            } catch (err: any) {
                console.error("Error generating objectives:", err);
                setError(err.message || "生成學習目標時發生錯誤");
            } finally {
                setIsGeneratingObjectives(false);
            }
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleGenerateContent = async () => {
        setIsGeneratingContent(true);
        setError(null);
        try {
            const effectiveKey = await getEffectiveApiKey();
            if (!effectiveKey) throw new Error("請先設定 API Key 或配置 AI Provider");

            const content = await generateMathContent(generatedTopic, objectives, effectiveKey);

            const topicSummary = `Math: ${selectedMaterials.map(m => m.title).join(', ')}`;
            await onComplete(content, topicSummary);
            navigate('/');
        } catch (err: any) {
            console.error("Error generating content:", err);
            setError(err.message || "生成教材內容時發生錯誤");
        } finally {
            setIsGeneratingContent(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            {/* Student Count */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    學生人數: {studentCount} 人
                </label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={studentCount}
                    onChange={(e) => setStudentCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1人 (家教)</span>
                    <span>50人 (大班)</span>
                </div>
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    課程時間: {duration} 分鐘
                </label>
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={() => setDuration(Math.max(15, duration - 15))}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                        className="block w-24 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    <button
                        type="button"
                        onClick={() => setDuration(duration + 15)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                </div>
            </div>

            {/* Student Grade (Added for Material Filtering) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    學生年級
                </label>
                <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value as StudentGrade)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                >
                    {STUDENT_GRADES.map((grade) => (
                        <option key={grade.id} value={grade.id}>{grade.label}</option>
                    ))}
                </select>
            </div>

            {/* Teaching Context */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    教學場景
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div
                        className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center text-center transition-colors ${teachingContext === 'physical' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-gray-50 border-gray-200'
                            }`}
                        onClick={() => setTeachingContext('physical')}
                    >
                        <span className="text-lg mb-1">🏫</span>
                        <span className="font-medium">實體教室</span>
                    </div>
                    <div
                        className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center text-center transition-colors ${teachingContext === 'online' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-gray-50 border-gray-200'
                            }`}
                        onClick={() => setTeachingContext('online')}
                    >
                        <span className="text-lg mb-1">💻</span>
                        <span className="font-medium">線上教學</span>
                    </div>
                </div>
            </div>

            {/* Prior Experience */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    學生先備經驗 / 特殊需求
                </label>
                <div className="space-y-2">
                    {[
                        { id: 'none', label: '無特殊經驗 (一般學生)' },
                        { id: 'partial', label: '部分先備知識 (需複習)' },
                        { id: 'special_needs', label: '特殊學習需求 (需更多引導)' },
                    ].map((option) => (
                        <div key={option.id} className="flex items-center">
                            <input
                                id={`exp-${option.id}`}
                                name="priorExperience"
                                type="radio"
                                checked={priorExperience === option.id}
                                onChange={() => setPriorExperience(option.id as PriorExperience)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor={`exp-${option.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            {/* Material Selection */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">選擇博幼教材單元</h3>
                <MaterialSelector
                    subject="math"
                    studentGrade={studentGrade}
                    selectedMaterials={selectedMaterials}
                    onSelectionChange={setSelectedMaterials}
                />
                {selectedMaterials.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">* 請至少選擇一個教材單元</p>
                )}
            </div>

            {/* Teaching Method Selection */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">選擇教學法</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TEACHING_METHODS.map((method) => (
                        <MethodCard
                            key={method.id}
                            id={method.id}
                            title={method.title}
                            description={method.description}
                            selected={teachingMethod === method.id}
                            onSelect={() => setTeachingMethod(method.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <ObjectivesReview
            objectives={objectives}
            onObjectivesChange={setObjectives}
            isGenerating={isGeneratingObjectives}
        />
    );

    return (
        <div className="max-w-4xl mx-auto">
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            <StepWizard
                currentStep={step}
                totalSteps={3}
                title="數學教材生成設定"
                onNext={handleNext}
                onPrev={handleBack}
                onSubmit={handleGenerateContent}
                canNext={step === 1 || (step === 2 && selectedMaterials.length > 0)}
                canFinish={step === 3 && objectives.length > 0}
                isSubmitting={isGeneratingObjectives || isGeneratingContent}
            >
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </StepWizard>
        </div>
    );
};

export default MathGenerator;
