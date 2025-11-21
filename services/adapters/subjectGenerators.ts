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
    generateLearningPlanFromObjectives
} from './coreGenerationFunctions';

import { buildMathRichTopic, buildEnglishRichTopic } from './promptBuilders';

// Helper to chunk array
const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunked: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
};

// 數學學習目標生成
export const generateMathObjectives = async (
    params: MathGenerationParams,
    apiKey: string
): Promise<{ topic: string, learningObjectives: any[] }> => {
    const fullRichTopic = buildMathRichTopic(params);

    // Check if we need to chunk (e.g., more than 5 materials)
    if (params.selectedMaterials.length > 5) {
        console.log(`Detected large number of materials (${params.selectedMaterials.length}), using chunked generation for objectives.`);
        const materialChunks = chunkArray(params.selectedMaterials, 5);

        const chunkedObjectivesPromises = materialChunks.map(async (chunk) => {
            const chunkParams = { ...params, selectedMaterials: chunk };
            const chunkTopic = buildMathRichTopic(chunkParams);
            return await generateLearningObjectives(chunkTopic, apiKey);
        });

        const results = await Promise.all(chunkedObjectivesPromises);
        const allObjectives = results.flat();

        return { topic: fullRichTopic, learningObjectives: allObjectives };
    }

    console.log(`開始生成數學學習目標 (Provider 系統): ${fullRichTopic}`);
    const learningObjectives = await generateLearningObjectives(fullRichTopic, apiKey);
    return { topic: fullRichTopic, learningObjectives };
};

// 數學學習內容生成
export const generateMathContent = async (
    richTopic: string,
    learningObjectives: any[],
    apiKey: string,
    providerCall: (prompt: string, apiKey: string) => Promise<any>
): Promise<GeneratedLearningContent> => {
    console.log(`開始生成數學學習內容 (Provider 系統): ${richTopic}`);

    // 使用 coreGenerationFunctions 中的 generateLearningPlan，但我們需要跳過 objectives 生成
    // 由於 coreGenerationFunctions.generateLearningPlan 內部會重新生成 objectives，
    // 我們需要一個新的函數來接受已有的 objectives，或者我們在這裡手動調用各個生成函數。
    // 為了保持一致性，我們應該在 coreGenerationFunctions 中添加一個支持傳入 objectives 的函數。
    // 但現在為了簡單起見，我們可以直接調用 generateLearningPlan 並傳入 objectives (如果它支持)。
    // 檢查 coreGenerationFunctions.ts 發現它不支持傳入 objectives。
    // 所以我們需要修改 coreGenerationFunctions.ts 或者在這裡重新實現並行調用。

    // 讓我們在這裡重新實現並行調用，使用 coreGenerationFunctions 導出的基礎函數。
    // 但是 coreGenerationFunctions 並沒有導出所有基礎函數 (如 generateContentBreakdown 等)。
    // 它們在 basicGenerators.ts 中。

    // 為了避免循環依賴和過度複雜，我們假設 basicGenerators 已經導出了我們需要的函數。
    // 我們需要從 basicGenerators 導入。

    // 暫時方案：我們修改 coreGenerationFunctions.ts 來支持傳入 objectives，
    // 或者我們在這裡導入 basicGenerators 的函數。
    // 讓我們看看 basicGenerators.ts 是否可用。
    // basicGenerators exports all base generation functions via geminiService.ts

    // 為了正確實現，我們應該在 coreGenerationFunctions 中添加 generateLearningPlanFromObjectives。
    // 但我無法輕易修改 coreGenerationFunctions (它可能很複雜)。
    // 讓我們嘗試直接導入 basicGenerators 的函數。

    return await generateLearningPlanFromObjectives(richTopic, learningObjectives, apiKey, providerCall, {
        includeEnglishConversation: false,
        includeWritingPractice: false,
        isMath: true
    });
};

// 英語學習目標生成
export const generateEnglishObjectives = async (
    params: EnglishGenerationParams,
    apiKey: string
): Promise<{ topic: string, learningObjectives: any[] }> => {
    const fullRichTopic = buildEnglishRichTopic(params);

    // Check if we need to chunk (e.g., more than 5 materials)
    if (params.selectedMaterials.length > 5) {
        console.log(`Detected large number of materials (${params.selectedMaterials.length}), using chunked generation for objectives.`);
        const materialChunks = chunkArray(params.selectedMaterials, 5);

        const chunkedObjectivesPromises = materialChunks.map(async (chunk) => {
            const chunkParams = { ...params, selectedMaterials: chunk };
            const chunkTopic = buildEnglishRichTopic(chunkParams);
            return await generateLearningObjectives(chunkTopic, apiKey);
        });

        const results = await Promise.all(chunkedObjectivesPromises);
        const allObjectives = results.flat();

        return { topic: fullRichTopic, learningObjectives: allObjectives };
    }

    console.log(`開始生成英語學習目標 (Provider 系統): ${fullRichTopic}`);
    const learningObjectives = await generateLearningObjectives(fullRichTopic, apiKey);
    return { topic: fullRichTopic, learningObjectives };
};

// 英語學習內容生成
export const generateEnglishContent = async (
    richTopic: string,
    learningObjectives: any[],
    apiKey: string,
    providerCall: (prompt: string, apiKey: string) => Promise<any>
): Promise<GeneratedLearningContent> => {
    console.log(`開始生成英語學習內容 (Provider 系統): ${richTopic}`);

    return await generateLearningPlanFromObjectives(richTopic, learningObjectives, apiKey, providerCall, {
        includeEnglishConversation: true,
        includeWritingPractice: true
    });
};

// 數學學習計畫生成 (Backward Compatibility)
export const generateMathLearningPlan = async (
    params: MathGenerationParams,
    apiKey: string,
    providerCall: (prompt: string, apiKey: string) => Promise<any>
): Promise<GeneratedLearningContent> => {
    const { topic, learningObjectives } = await generateMathObjectives(params, apiKey);
    return await generateMathContent(topic, learningObjectives, apiKey, providerCall);
};

// 英語學習計畫生成 (Backward Compatibility)
export const generateEnglishLearningPlan = async (
    params: EnglishGenerationParams,
    apiKey: string,
    providerCall: (prompt: string, apiKey: string) => Promise<any>
): Promise<GeneratedLearningContent> => {
    const { topic, learningObjectives } = await generateEnglishObjectives(params, apiKey);
    return await generateEnglishContent(topic, learningObjectives, apiKey, providerCall);
};

// ---------------------------------------------------------------------------
// 我們需要從 coreGenerationFunctions 導入 generateLearningPlanFromObjectives
// 如果它不存在，我們需要創建它。
// 讓我們假設我們將在 coreGenerationFunctions.ts 中添加它。
// ---------------------------------------------------------------------------
