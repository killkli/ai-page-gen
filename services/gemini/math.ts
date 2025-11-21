import { MathGenerationParams, LearningObjectiveItem, GeneratedLearningContent } from '../../types';
import { callGemini } from './core';

// Math Generation Functions
export const generateMathObjectives = async (params: MathGenerationParams, apiKey: string): Promise<{ topic: string, learningObjectives: LearningObjectiveItem[] }> => {
    if (!apiKey) {
        throw new Error("Gemini API 金鑰未正確設定或遺失。");
    }

    const { studentCount, classDuration, teachingContext, priorExperience, studentGrade, selectedMaterials, teachingMethod } = params;
    const topic = `Math Lesson: ${selectedMaterials.map(m => m.title).join(', ')}`;

    // Context description for the prompt
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
    Please generate at least 3 clear and distinct learning objectives for a math lesson based on:
    ${contextDesc}

    The objectives should be aligned with the selected teaching method (${teachingMethod}) and appropriate for the grade level.
    Output MUST be a valid JSON array of objects (same format as standard objectives):
    [
      { "objective": "...", "description": "...", "teachingExample": "..." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    const learningObjectives = await callGemini(objectivesPrompt, apiKey);

    return { topic, learningObjectives };
};

export const generateMathContent = async (params: MathGenerationParams, learningObjectives: LearningObjectiveItem[], apiKey: string): Promise<GeneratedLearningContent> => {
    if (!apiKey) {
        throw new Error("Gemini API 金鑰未正確設定或遺失。");
    }

    const { studentCount, classDuration, teachingContext, priorExperience, studentGrade, selectedMaterials, teachingMethod } = params;
    const topic = `Math Lesson: ${selectedMaterials.map(m => m.title).join(', ')}`;

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
    const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz] = await Promise.all([
        // Content Breakdown
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Break down the lesson into micro-units.
      Output JSON array: [{ "topic": "...", "details": "...", "teachingExample": "..." }]
    `, apiKey),

        // Confusing Points
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Identify common misconceptions.
      Output JSON array (standard format): [{ "point": "...", "clarification": "...", "teachingExample": "...", "errorType": "...", "commonErrors": [...], "correctVsWrong": [...], "preventionStrategy": "...", "correctionMethod": "...", "practiceActivities": [...] }]
    `, apiKey),

        // Classroom Activities
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Suggest interactive activities using the ${teachingMethod} method.
      Output JSON array (standard format): [{ "title": "...", "description": "...", "objective": "...", "timing": "...", "materials": "...", "environment": "...", "steps": [...], "assessmentPoints": [...] }]
    `, apiKey),

        // Quiz
        callGemini(`
      Based on these objectives: ${JSON.stringify(learningObjectives)}
      And context: ${contextDesc}
      Generate a quiz.
      Output JSON object (standard format): { "easy": {...}, "normal": {...}, "hard": {...} }
      IMPORTANT: Do NOT include "sentenceScramble" type questions as this is a math lesson.
      Include only: trueFalse, multipleChoice, fillInTheBlanks, memoryCardGame.
    `, apiKey)
    ]);

    return {
        topic,
        learningObjectives,
        contentBreakdown,
        confusingPoints,
        classroomActivities,
        onlineInteractiveQuiz
    };
};

// Deprecated: Wrapper for backward compatibility if needed, or just remove if unused
export const generateMathLearningPlan = async (params: MathGenerationParams, apiKey: string): Promise<GeneratedLearningContent> => {
    const { learningObjectives } = await generateMathObjectives(params, apiKey);
    return await generateMathContent(params, learningObjectives, apiKey);
};
