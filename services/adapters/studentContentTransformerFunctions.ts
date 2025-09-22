/**
 * 學生內容轉換函數模組
 *
 * 將學習目標、內容分解、困惑點轉換為學生友善的格式
 */

import { LearningObjectiveItem } from '../../types';

// Provider 系統的核心調用函數類型定義
type ProviderCall = (prompt: string, apiKey: string) => Promise<any>;

export const transformLearningObjectiveForStudent = async (
  objective: LearningObjectiveItem,
  apiKey: string,
  providerCall: ProviderCall
): Promise<any> => {
  const prompt = `
    Transform the following learning objective into student-friendly language and interactive format:

    Original Objective: ${JSON.stringify(objective)}

    Create a JSON response with:
    {
      "studentFriendlyTitle": "吸引學生的標題...",
      "whatYouWillLearn": "你將學會什麼的簡短說明...",
      "keyPoints": ["重點1", "重點2", "重點3"],
      "practicalExample": "生活中的實際例子...",
      "successCriteria": "完成這個目標後你會能夠...",
      "estimatedTime": "預估學習時間",
      "difficulty": "初級/中級/高級"
    }

    Make it engaging, clear, and motivating for students.
    Use Traditional Chinese for all text content.
    Do NOT include explanation, only return the JSON object.
  `;

  return await providerCall(prompt, apiKey);
};

export const transformContentBreakdownForStudent = async (
  breakdown: any[],
  apiKey: string,
  providerCall: ProviderCall
): Promise<any> => {
  const prompt = `
    Transform the following content breakdown into an engaging, step-by-step learning path for students:

    Original Breakdown: ${JSON.stringify(breakdown)}

    Create a JSON response with:
    {
      "learningPath": [
        {
          "stepNumber": 1,
          "title": "步驟標題...",
          "description": "這一步你會學到什麼...",
          "timeNeeded": "預估時間",
          "keySkills": ["技能1", "技能2"],
          "practiceTask": "實作任務說明...",
          "checkpointQuestion": "檢查理解的問題..."
        }
      ],
      "totalEstimatedTime": "總預估時間",
      "prerequisiteSkills": ["前置技能1", "前置技能2"],
      "learningTips": ["學習訣竅1", "學習訣竅2"]
    }

    Make each step clear, actionable, and connected to the next.
    Use encouraging language and provide practical guidance.
    Use Traditional Chinese for all content.
    Do NOT include explanation, only return the JSON object.
  `;

  return await providerCall(prompt, apiKey);
};

export const transformConfusingPointForStudent = async (
  confusingPoint: any,
  apiKey: string,
  providerCall: ProviderCall
): Promise<any> => {
  const prompt = `
    Transform the following confusing point into student-friendly guidance:

    Original Confusing Point: ${JSON.stringify(confusingPoint)}

    Create a JSON response with:
    {
      "commonMistakeTitle": "常見錯誤：...",
      "whyItHappens": "為什麼會發生這個錯誤...",
      "howToAvoid": "如何避免這個錯誤...",
      "easyRememberTip": "好記的小訣竅...",
      "practiceExercises": [
        {
          "exercise": "練習題目...",
          "solution": "解答說明...",
          "whyThisWorks": "為什麼這樣做是對的..."
        }
      ],
      "confidenceBooster": "增強信心的鼓勵話語..."
    }

    Focus on helping students understand and overcome the confusion.
    Use supportive, non-judgmental language.
    Provide practical, actionable advice.
    Use Traditional Chinese for all content.
    Do NOT include explanation, only return the JSON object.
  `;

  return await providerCall(prompt, apiKey);
};