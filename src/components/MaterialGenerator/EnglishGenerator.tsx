import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepWizard from './Shared/StepWizard';
import MethodCard from './Shared/MethodCard';
import MaterialSelector from './Shared/MaterialSelector';
import {
    EnglishGenerationParams,
    TeachingContext,
    PriorExperience,
    StudentGrade,
    EnglishTeachingMethod,
    MaterialItem
} from '../../core/types';

interface EnglishGeneratorProps {
    onGenerate: (params: EnglishGenerationParams) => Promise<void>;
    isSubmitting: boolean;
}

const TEACHING_METHODS: { id: EnglishTeachingMethod; title: string; description: string }[] = [
    {
        id: 'clt',
        title: '溝通式教學 (CLT)',
        description: '強調語言的功能性，透過真實情境的互動與溝通來學習英語。'
    },
    {
        id: 'tpr',
        title: '全身反應教學法 (TPR)',
        description: '結合肢體動作與語言指令，幫助學生建立聽力理解與動作的連結，降低學習焦慮。'
    },
    {
        id: 'phonics',
        title: '自然發音法 (Phonics)',
        description: '教授字母與發音的對應規則，幫助學生見字讀音、聽音拼字。'
    },
    {
        id: 'scaffolding',
        title: '鷹架理論 (Scaffolding)',
        description: '提供適當的輔助與引導，協助學生跨越學習難點，逐步達成學習目標。'
    },
    {
        id: 'gamification',
        title: '遊戲化教學 (Gamification)',
        description: '運用遊戲元素與機制，提升學生的學習動機與參與度。'
    },
    {
        id: 'ppp',
        title: 'PPP 教學法',
        description: '呈現 (Presentation) -> 練習 (Practice) -> 產出 (Production) 的經典教學流程。'
    },
    {
        id: 'tbl',
        title: '任務導向學習 (TBL)',
        description: '以完成特定任務為核心，讓學生在過程中運用英語解決問題。'
    },
    {
        id: 'cooperative',
        title: '合作學習 (Cooperative)',
        description: '透過小組合作完成學習任務，促進同儕互動與互助。'
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

const EnglishGenerator: React.FC<EnglishGeneratorProps> = ({ onGenerate, isSubmitting }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Form State
    const [studentCount, setStudentCount] = useState<number>(1);
    const [duration, setDuration] = useState<number>(45);
    const [teachingContext, setTeachingContext] = useState<TeachingContext>('physical');
    const [priorExperience, setPriorExperience] = useState<PriorExperience>('none');
    const [studentGrade, setStudentGrade] = useState<StudentGrade>('elementary_mid');
    const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>([]);
    const [teachingMethod, setTeachingMethod] = useState<EnglishTeachingMethod>('clt');

    const handleNext = () => {
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleGenerate = async () => {
        await onGenerate({
            studentCount,
            classDuration: duration,
            teachingContext,
            priorExperience,
            studentGrade,
            selectedMaterials,
            teachingMethod
        });
        navigate('/');
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

            {/* Student Grade */}
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
                    subject="english"
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

    return (
        <StepWizard
            currentStep={step}
            totalSteps={2}
            title="英語教材生成設定"
            onNext={handleNext}
            onPrev={handleBack}
            onSubmit={handleGenerate}
            canNext={step === 1}
            canFinish={selectedMaterials.length > 0}
            isSubmitting={isSubmitting}
        >
            {step === 1 ? renderStep1() : renderStep2()}
        </StepWizard>
    );
};

export default EnglishGenerator;
