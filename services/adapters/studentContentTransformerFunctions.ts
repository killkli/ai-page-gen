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
    Transform the following teacher-oriented learning objective into student-friendly, engaging content suitable for interactive learning:
    
    Original Learning Objective:
    ${JSON.stringify(objective)}
    
    Transform it into student-centered language that:
    1. Uses "你" (you) instead of "學生" (students)
    2. Makes it personally relevant and motivating
    3. Explains WHY this learning is important to the student
    4. Uses encouraging, accessible language
    5. Includes concrete examples that students can relate to
    6. Makes the learning goal feel achievable and exciting
    
    Output MUST be a valid JSON object with this structure:
    {
      "objective": "學習目標改寫為學生導向的語言",
      "description": "詳細說明為什麼你需要學會這個，以及學會後對你的好處",
      "teachingExample": "具體的、與學生生活相關的例子或應用情境",
      "personalRelevance": "這個學習與你的日常生活、未來發展的關係",
      "encouragement": "鼓勵學生的話語，讓學習感覺有趣且可達成"
    }
    
    Make the content engaging, personal, and motivational. Use Traditional Chinese.
    Do NOT include any explanation or extra text. Only output the JSON object.
  `;

  return await providerCall(prompt, apiKey);
};

export const transformContentBreakdownForStudent = async (
  breakdown: any[],
  apiKey: string,
  providerCall: ProviderCall
): Promise<any> => {
  const prompt = `
    Transform the following teacher-oriented content breakdown into student-friendly, digestible learning content:
    
    Original Content Breakdown:
    ${JSON.stringify(breakdown)}
    
    Transform it into student-centered content that:
    1. Uses conversational, friendly tone
    2. Explains concepts in simple, relatable terms
    3. Connects to real-world applications students care about
    4. Includes step-by-step learning guidance
    5. Makes complex topics feel approachable
    6. Uses analogies and examples from student life
    
    Output MUST be a valid JSON object with this structure:
    {
      "title": "子主題標題用學生容易理解的語言表達",
      "introduction": "用友善的語調介紹這個概念，說明為什麼要學習它",
      "keyPoints": ["要點1用簡單語言解釋", "要點2用實際例子說明", "要點3連結到生活應用"],
      "realLifeExamples": ["生活中的例子1", "生活中的例子2", "生活中的例子3"],
      "learningTips": "學習這個概念的小技巧和方法",
      "nextSteps": "學會這個概念後，你可以進一步探索什麼",
      "encouragement": "給學生的鼓勵話語"
    }
    
    Make the content feel like a friendly tutor explaining concepts personally to the student.
    Use Traditional Chinese. Do NOT include any explanation or extra text. Only output the JSON object.
  `;

  return await providerCall(prompt, apiKey);
};

export const transformConfusingPointForStudent = async (
  confusingPoint: any,
  apiKey: string,
  providerCall: ProviderCall
): Promise<any> => {
  const prompt = `
    Transform the following teacher-oriented confusing point analysis into student-friendly, helpful guidance:
    
    Original Confusing Point:
    ${JSON.stringify(confusingPoint)}
    
    Transform it into student-centered guidance that:
    1. Acknowledges that confusion is normal and okay
    2. Explains the common mistake without making students feel bad
    3. Provides clear, memorable strategies to avoid the mistake
    4. Uses positive, encouraging language
    5. Includes memorable tricks or mnemonics
    6. Shows both wrong and right examples in a supportive way
    
    Output MUST be a valid JSON object with this structure:
    {
      "title": "易混淆概念的標題用友善語言表達",
      "normalizeConfusion": "告訴學生這種混淆很正常，不用擔心",
      "commonMistake": "用溫和的語言說明常見的錯誤想法",
      "whyItHappens": "解釋為什麼會有這種混淆（讓學生理解而不是感到愚蠢）",
      "clearExplanation": "用簡單明瞭的方式解釋正確概念",
      "rememberingTricks": ["記憶技巧1", "記憶技巧2", "記憶技巧3"],
      "practiceExamples": [
        {
          "situation": "情境描述",
          "wrongThinking": "錯誤的想法",
          "rightThinking": "正確的想法",
          "explanation": "為什麼這樣想是對的"
        }
      ],
      "confidenceBooster": "提升學生信心的話語，讓他們知道掌握這個概念是可以做到的"
    }
    
    Make the content supportive and empowering, helping students learn from mistakes without judgment.
    Use Traditional Chinese. Do NOT include any explanation or extra text. Only output the JSON object.
  `;

  return await providerCall(prompt, apiKey);
};
