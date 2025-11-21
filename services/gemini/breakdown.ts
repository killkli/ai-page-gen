import { LearningObjectiveItem, VocabularyLevel } from '../../types';
import { callGemini } from './core';

// 2. 產生 contentBreakdown
export const generateContentBreakdown = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
    // Detect if this is English language learning
    const isEnglishLearning = /english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(topic);

    const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please break down the topic "${topic}" into at least 3 (but more is better if appropriate) micro-units. For each, provide a sub-topic, a brief explanation, and a concrete teaching example.
    
    ${isEnglishLearning ? `
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句 (array of 3-5 teaching example sentences)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)
    
    Output format for English learning topics:
    [
      {
        "topic": "子主題A", 
        "details": "子主題A的簡要說明...", 
        "teachingExample": "子主題A的教學示例...",
        "coreConcept": "此要點的核心概念...",
        "teachingSentences": ["例句1", "例句2", "例句3", "例句4", "例句5"],
        "teachingTips": "教學要點與提示說明..."
      }
    ]
    ` : `
    Standard output format:
    [
      { "topic": "子主題A", "details": "子主題A的簡要說明...", "teachingExample": "子主題A的教學示例..." }
    ]
    `}
    
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};

export const generateContentBreakdownForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
    // Detect if this is English language learning
    const isEnglishLearning = /english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(topic);

    const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please break down the topic "${topic}" into at least 3 (but more is better if appropriate) micro-units appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}). For each, provide a sub-topic, a brief explanation, and a concrete teaching example.
    The content depth and complexity should match the level description: "${selectedLevel.description}".
    
    ${isEnglishLearning ? `
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句 (array of 3-5 teaching example sentences)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)
    
    Output format for English learning topics:
    [
      {
        "topic": "適合${selectedLevel.name}的子主題A", 
        "details": "子主題A針對${selectedLevel.name}程度的簡要說明...", 
        "teachingExample": "子主題A適合此程度的教學示例...",
        "coreConcept": "此要點的核心概念...",
        "teachingSentences": ["例句1", "例句2", "例句3", "例句4", "例句5"],
        "teachingTips": "教學要點與提示說明..."
      }
    ]
    ` : `
    Standard output format:
    [
      { "topic": "適合${selectedLevel.name}的子主題A", "details": "子主題A針對${selectedLevel.name}程度的簡要說明...", "teachingExample": "子主題A適合此程度的教學示例..." }
    ]
    `}
    
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};

export const generateContentBreakdownForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
    // Detect if this is English language learning
    const isEnglishLearning = /english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(topic);

    const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please break down the topic "${topic}" into at least 3 (but more is better if appropriate) micro-units appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}).
    
    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Teaching examples should match ${vocabularyLevel.description}
    - Avoid complex words that exceed this vocabulary level
    - Sentence structures should be appropriate for ${vocabularyLevel.name} learners
    
    ${isEnglishLearning ? `
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句，使用${vocabularyLevel.wordCount}詞彙範圍 (array of 3-5 teaching sentences using vocabulary within ${vocabularyLevel.wordCount} words)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)
    
    Output format for English learning topics:
    [
      {
        "topic": "適合${vocabularyLevel.name}的子主題A", 
        "details": "子主題A針對${vocabularyLevel.wordCount}詞彙量的簡要說明...", 
        "teachingExample": "子主題A使用${vocabularyLevel.name}程度詞彙的教學示例...",
        "coreConcept": "此要點的核心概念...",
        "teachingSentences": ["Simple example 1", "Easy sentence 2", "Basic example 3"],
        "teachingTips": "教學要點與提示說明..."
      }
    ]
    ` : `
    Standard output format:
    [
      { "topic": "適合${vocabularyLevel.name}的子主題A", "details": "子主題A針對${vocabularyLevel.wordCount}詞彙量的簡要說明...", "teachingExample": "子主題A使用${vocabularyLevel.name}程度詞彙的教學示例..." }
    ]
    `}
    
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};
