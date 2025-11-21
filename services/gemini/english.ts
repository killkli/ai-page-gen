import { EnglishGenerationParams, LearningObjectiveItem, GeneratedLearningContent } from '../../types';
import { callGemini } from './core';

// English Generation Functions
export const generateEnglishObjectives = async (params: EnglishGenerationParams, apiKey: string): Promise<{ topic: string, learningObjectives: LearningObjectiveItem[] }> => {
    if (!apiKey) {
        throw new Error("Gemini API 金鑰未正確設定或遺失。");
    }

    const { studentCount, classDuration, teachingContext, priorExperience, studentGrade, selectedMaterials, teachingMethod } = params;
    const topic = `English Lesson: ${selectedMaterials.map(m => m.title).join(', ')}`;

    // Context description
    const contextDesc = `
    Target Audience: ${studentGrade} students
    Class Size: ${studentCount} students
    Duration: ${classDuration} minutes
    Setting: ${teachingContext === 'physical' ? 'Physical Classroom' : 'Online Class'}
    Prior Experience: ${priorExperience}
    Teaching Method: ${teachingMethod}
    Selected Materials: ${selectedMaterials.map(m => m.title).join(', ')}
  `;

    // 1. Generate Objectives
    const objectivesPrompt = `
    Please generate at least 3 clear and distinct learning objectives for an English lesson based on:
    ${contextDesc}

    The objectives should be aligned with the selected teaching method (${teachingMethod}).
    Output MUST be a valid JSON array of objects:
    [
      { "objective": "...", "description": "...", "teachingExample": "..." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    const learningObjectives = await callGemini(objectivesPrompt, apiKey);

    return { topic, learningObjectives };
};

export const generateEnglishContent = async (params: EnglishGenerationParams, learningObjectives: LearningObjectiveItem[], apiKey: string): Promise<GeneratedLearningContent> => {
    if (!apiKey) {
        throw new Error("Gemini API 金鑰未正確設定或遺失。");
    }

    const { studentCount, classDuration, teachingContext, priorExperience, studentGrade, selectedMaterials, teachingMethod } = params;
    const topic = `English Lesson: ${selectedMaterials.map(m => m.title).join(', ')}`;

    const contextDesc = `
    Target Audience: ${studentGrade} students
    Class Size: ${studentCount} students
    Duration: ${classDuration} minutes
    Setting: ${teachingContext === 'physical' ? 'Physical Classroom' : 'Online Class'}
    Prior Experience: ${priorExperience}
    Teaching Method: ${teachingMethod}
    Selected Materials: ${selectedMaterials.map(m => m.title).join(', ')}
  `;

    // 2. Generate other sections in parallel
    const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation] = await Promise.all([
        // Content Breakdown
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Break down the lesson.
      Output JSON array (English format with coreConcept, teachingSentences, teachingTips): 
      [{ "topic": "...", "details": "...", "teachingExample": "...", "coreConcept": "...", "teachingSentences": [...], "teachingTips": "..." }]
    `, apiKey),

        // Confusing Points
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Identify common misconceptions.
      Output JSON array (standard format).
    `, apiKey),

        // Classroom Activities
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Suggest interactive activities using the ${teachingMethod} method.
      Output JSON array (standard format).
    `, apiKey),

        // Quiz
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Generate a quiz.
      Output JSON object (standard format).
    `, apiKey),

        // Conversation
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Generate a natural conversation.
      Output JSON array: [{ "speaker": "...", "line": "..." }]
    `, apiKey)
    ]);

    return {
        topic,
        learningObjectives,
        contentBreakdown,
        confusingPoints,
        classroomActivities,
        onlineInteractiveQuiz,
        englishConversation
    };
};

// Deprecated: Wrapper for backward compatibility
export const generateEnglishLearningPlan = async (params: EnglishGenerationParams, apiKey: string): Promise<GeneratedLearningContent> => {
    const { learningObjectives } = await generateEnglishObjectives(params, apiKey);
    return await generateEnglishContent(params, learningObjectives, apiKey);
};
