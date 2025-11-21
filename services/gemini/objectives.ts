import { LearningObjectiveItem, VocabularyLevel } from '../../types';
import { callGemini } from './core';

// 1. 產生 learningObjectives
export const generateLearningObjectives = async (topic: string, apiKey: string): Promise<LearningObjectiveItem[]> => {
    const prompt = `
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${topic}".
    The objectives should be based on scaffolding theory and gamification, and written in the primary language of the topic.
    For each objective, provide the objective statement, a detailed description, and a concrete teaching example (such as a sample sentence, scenario, or application).
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { 
        "objective": "能夠理解${topic}的基本概念", 
        "description": "此目標幫助學習者建立對${topic}的基礎理解和認知框架...", 
        "teachingExample": "透過具體例子展示${topic}的核心概念，例如..." 
      },
      { 
        "objective": "能夠應用${topic}於實際情境", 
        "description": "培養學習者將理論知識轉化為實際應用的能力...", 
        "teachingExample": "提供真實情境讓學習者練習應用${topic}，如..." 
      },
      { 
        "objective": "能夠辨識${topic}常見的誤區", 
        "description": "幫助學習者識別和避免${topic}學習中的常見錯誤...", 
        "teachingExample": "展示常見誤區的具體例子和正確理解方式..." 
      },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};

// 針對特定程度的內容生成函數
export const generateLearningObjectivesForLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<any[]> => {
    const prompt = `
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${topic}" appropriate for learning level "${selectedLevel.name}" (${selectedLevel.description}).
    The objectives should be based on scaffolding theory and gamification, written in the primary language of the topic, and tailored to the learner's level and capabilities described in: "${selectedLevel.description}".
    For each objective, provide the objective statement, a detailed description, and a concrete teaching example (such as a sample sentence, scenario, or application).
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { 
        "objective": "能夠理解${topic}在${selectedLevel.name}程度的核心概念", 
        "description": "此目標針對${selectedLevel.name}程度學習者的詳細描述...", 
        "teachingExample": "針對此目標的具體教學示例..." 
      },
      { 
        "objective": "能夠應用${topic}的${selectedLevel.name}級技能", 
        "description": "此目標的具體說明和期望成果...", 
        "teachingExample": "實際應用此技能的示例..." 
      },
      { 
        "objective": "能夠辨識${topic}在此程度的常見誤區", 
        "description": "幫助學習者識別和避免常見錯誤...", 
        "teachingExample": "常見誤區的具體例子和正確做法..." 
      },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};

export const generateLearningObjectivesForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string): Promise<LearningObjectiveItem[]> => {
    const prompt = `
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${topic}" appropriate for learning level "${selectedLevel.name}" (${selectedLevel.description}) and English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}).
    The objectives should be based on scaffolding theory and gamification, written in the primary language of the topic, and tailored to both the learner's level and vocabulary constraints.
    For each objective, provide the objective statement, a detailed description, and a concrete teaching example (such as a sample sentence, scenario, or application).
    
    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Adjust language complexity to match ${vocabularyLevel.description}
    - Avoid advanced vocabulary that exceeds this level
    
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { 
        "objective": "能夠理解${topic}在${selectedLevel.name}程度的核心概念（英文內容限制在${vocabularyLevel.wordCount}詞彙範圍）", 
        "description": "此目標針對${selectedLevel.name}程度和${vocabularyLevel.name}詞彙量學習者的詳細描述...", 
        "teachingExample": "使用${vocabularyLevel.wordCount}詞彙範圍內的英文例句和教學示例..." 
      },
      { 
        "objective": "能夠應用${topic}的${selectedLevel.name}級技能（適合${vocabularyLevel.name}程度學習者）", 
        "description": "培養在詞彙限制下的實際應用能力...", 
        "teachingExample": "提供符合${vocabularyLevel.wordCount}詞彙量的實際應用情境..." 
      },
      { 
        "objective": "能夠辨識${topic}在此程度和詞彙量的常見誤區", 
        "description": "幫助學習者識別和避免在此詞彙程度下的常見錯誤...", 
        "teachingExample": "使用簡單詞彙展示常見誤區和正確做法..." 
      },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};
