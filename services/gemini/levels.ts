import { LearningObjectiveItem, LearningLevelSuggestions } from '../../types';
import { callGemini } from './core';
import { generateLearningObjectives } from './objectives';

// 7. 產生 learningLevels (學習程度建議)
export const generateLearningLevels = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<LearningLevelSuggestions> => {
    const prompt = `
    Based on the topic "${topic}" and learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate 3-4 learning levels that are specific to this topic. Each level should have a unique name, description, and order.
    The levels should progress from basic understanding to advanced mastery, tailored specifically to the subject matter.
    
    Output MUST be a valid JSON object with this exact structure:
    {
      "suggestedLevels": [
        {
          "id": "beginner",
          "name": "初學者",
          "description": "適合首次接觸${topic}的學習者，著重基礎概念理解",
          "order": 1
        },
        {
          "id": "intermediate", 
          "name": "進階者",
          "description": "已具備基礎知識，能進行${topic}的實際應用",
          "order": 2
        },
        {
          "id": "advanced",
          "name": "專精者", 
          "description": "深度掌握${topic}，能分析複雜情況並提供解決方案",
          "order": 3
        }
      ],
      "defaultLevelId": "beginner"
    }
    
    Make sure to:
    1. Create level names and descriptions that are specific to the topic (not generic)
    2. Use appropriate terminology for the subject area
    3. Ensure descriptions explain what learners at each level can do
    4. Use the primary language of the topic for names and descriptions
    
    Do NOT include any explanation or extra text. Only output the JSON object.
  `;
    return await callGemini(prompt, apiKey);
};

// 第一階段：僅產生學習程度建議
export const generateLearningLevelSuggestions = async (topic: string, apiKey: string): Promise<LearningLevelSuggestions> => {
    if (!apiKey) {
        throw new Error("Gemini API 金鑰未正確設定或遺失。請檢查應用程式的環境設定。");
    }

    // 先產生基本的學習目標來輔助程度建議
    const basicObjectives = await generateLearningObjectives(topic, apiKey);
    return await generateLearningLevels(topic, apiKey, basicObjectives);
};
