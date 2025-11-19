/**
 * 學科特定生成函數模組
 * 
 * 包含數學和英語的特定生成邏輯，將複雜的參數轉換為豐富的 Context 傳遞給基礎生成函數
 */

import {
    GeneratedLearningContent,
    MathGenerationParams,
    EnglishGenerationParams
} from '../../types';

import {
    generateLearningObjectives,
    generateContentBreakdown,
    generateConfusingPoints,
    generateClassroomActivities,
    generateOnlineInteractiveQuiz,
    generateEnglishConversation
} from './basicGenerators';

import {
    generateLearningLevels
} from './coreGenerationFunctions';

import {
    generateWritingPractice
} from './studentContentTransformers';

// 輔助函數：構建數學豐富主題字串
const buildMathRichTopic = (params: MathGenerationParams): string => {
    const materials = params.selectedMaterials.map(m => `${m.title}${m.content ? `: ${m.content}` : ''}`).join(', ');

    let contextStr = `Math Topic: ${materials}\n`;
    contextStr += `Target Audience: Grade ${params.studentGrade}, ${params.studentCount} students\n`;
    contextStr += `Class Duration: ${params.classDuration} minutes\n`;
    contextStr += `Teaching Context: ${params.teachingContext === 'physical' ? 'Physical Classroom' : 'Online Classroom'}\n`;
    contextStr += `Prior Experience: ${params.priorExperience}\n`;
    contextStr += `Teaching Method: ${params.teachingMethod.replace('_', ' ').toUpperCase()}\n`;

    return contextStr;
};

// 輔助函數：構建英語豐富主題字串
const buildEnglishRichTopic = (params: EnglishGenerationParams): string => {
    const materials = params.selectedMaterials.map(m => `${m.title}${m.content ? `: ${m.content}` : ''}`).join(', ');

    let contextStr = `English Topic: ${materials}\n`;
    contextStr += `Target Audience: Grade ${params.studentGrade}, ${params.studentCount} students\n`;
    contextStr += `Class Duration: ${params.classDuration} minutes\n`;
    contextStr += `Teaching Context: ${params.teachingContext === 'physical' ? 'Physical Classroom' : 'Online Classroom'}\n`;
    contextStr += `Prior Experience: ${params.priorExperience}\n`;
    contextStr += `Teaching Method: ${params.teachingMethod.replace('_', ' ').toUpperCase()}\n`;

    return contextStr;
};

// 數學學習計畫生成
export const generateMathLearningPlan = async (
    params: MathGenerationParams,
    apiKey: string,
    providerCall: (prompt: string, apiKey: string) => Promise<any>
): Promise<GeneratedLearningContent> => {
    const richTopic = buildMathRichTopic(params);
    console.log(`開始生成數學學習計劃 (Provider 系統): ${richTopic}`);

    // 1. 生成學習目標
    const learningObjectives = await generateLearningObjectives(richTopic, apiKey);
    console.log('✓ 數學學習目標生成完成');

    // 2. 並行生成其他部分
    // 數學通常不需要英語對話，但為了類型一致性，我們可以生成空的或通用的
    const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, learningLevels] = await Promise.all([
        generateContentBreakdown(richTopic, apiKey, learningObjectives),
        generateConfusingPoints(richTopic, apiKey, learningObjectives),
        generateClassroomActivities(richTopic, apiKey, learningObjectives),
        generateOnlineInteractiveQuiz(richTopic, apiKey, learningObjectives),
        generateLearningLevels(richTopic, apiKey, learningObjectives, providerCall)
    ]);

    console.log('✓ 所有數學內容生成完成');

    return {
        learningObjectives,
        contentBreakdown,
        confusingPoints,
        classroomActivities,
        onlineInteractiveQuiz,
        learningLevels,
        englishConversation: [] // 數學不強制需要英語對話
    };
};

// 英語學習計畫生成
export const generateEnglishLearningPlan = async (
    params: EnglishGenerationParams,
    apiKey: string,
    providerCall: (prompt: string, apiKey: string) => Promise<any>
): Promise<GeneratedLearningContent> => {
    const richTopic = buildEnglishRichTopic(params);
    console.log(`開始生成英語學習計劃 (Provider 系統): ${richTopic}`);

    // 1. 生成學習目標
    const learningObjectives = await generateLearningObjectives(richTopic, apiKey);
    console.log('✓ 英語學習目標生成完成');

    // 2. 並行生成其他部分
    const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
        generateContentBreakdown(richTopic, apiKey, learningObjectives),
        generateConfusingPoints(richTopic, apiKey, learningObjectives),
        generateClassroomActivities(richTopic, apiKey, learningObjectives),
        generateOnlineInteractiveQuiz(richTopic, apiKey, learningObjectives),
        generateEnglishConversation(richTopic, apiKey, learningObjectives),
        generateLearningLevels(richTopic, apiKey, learningObjectives, providerCall),
        generateWritingPractice(richTopic, apiKey, learningObjectives)
    ]);

    console.log('✓ 所有英語內容生成完成');

    return {
        learningObjectives,
        contentBreakdown,
        confusingPoints,
        classroomActivities,
        onlineInteractiveQuiz,
        englishConversation,
        learningLevels,
        writingPractice
    };
};
