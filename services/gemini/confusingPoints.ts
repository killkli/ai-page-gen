import { LearningObjectiveItem, VocabularyLevel } from '../../types';
import { callGemini } from './core';

// 3. 產生 confusingPoints (Chunked Version)
const generateSingleConfusingPoint = async (topic: string, apiKey: string, objective: LearningObjectiveItem): Promise<any[]> => {
    const prompt = `
    Based on the topic "${topic}" and this specific learning objective:
    ${JSON.stringify(objective)}

    Generate **ONE** comprehensive analysis of a common misconception or difficulty STRICTLY related to this specific objective.
    
    CRITICAL INSTRUCTION: 
    - Focus ONLY on the specific concept mentioned in the objective. 
    - Do NOT generate a generic confusing point for the overall topic "${topic}".
    - Ensure this point is unique and specific to this objective.

    Output MUST be a valid JSON array containing EXACTLY ONE object with the following structure:
    [
      {
        "point": "Specific Confusing Point Title",
        "clarification": "Detailed clarification",
        "teachingExample": "Concrete teaching example",
        "errorType": "Error Type (Conceptual/Procedural/Linguistic/Understanding)",
        "commonErrors": ["Typical mistake 1", "Typical mistake 2", "Typical mistake 3"],
        "correctVsWrong": [
          {
            "correct": "Correct example",
            "wrong": "Wrong example",
            "explanation": "Comparison explanation"
          }
        ],
        "preventionStrategy": "Prevention strategy",
        "correctionMethod": "Correction method",
        "practiceActivities": ["Activity 1", "Activity 2", "Activity 3"]
      }
    ]

    Requirements:
    - Include ALL fields above
    - commonErrors: Provide at least 3 typical student mistakes
    - correctVsWrong: Provide at least 1 comparison
    - practiceActivities: Provide at least 3 targeted practice activities
    - All text should be in the primary language of the topic
    - Focus on practical teaching guidance

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};

export const generateConfusingPoints = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
    console.log(`Starting chunked confusing points generation for topic: ${topic}. Objectives count: ${learningObjectives.length}`);

    try {
        const results = await Promise.all(
            learningObjectives.map((objective) =>
                generateSingleConfusingPoint(topic, apiKey, objective)
                    .catch(err => {
                        console.warn(`Failed to generate confusing point for objective: ${objective.objective}`, err);
                        return [];
                    })
            )
        );

        const flatResults = results.flat();
        console.log(`Generated ${flatResults.length} confusing points. Titles: ${flatResults.map(r => r.point).join(', ')}`);
        return flatResults;
    } catch (error) {
        console.error("Error generating chunked confusing points:", error);
        throw error;
    }
};

// 針對特定程度的易混淆點生成函數 (Chunked Version)
const generateSingleConfusingPointForLevel = async (topic: string, selectedLevel: any, apiKey: string, objective: LearningObjectiveItem): Promise<any[]> => {
    const prompt = `
    Based on the topic "${topic}" and this specific learning objective:
    ${JSON.stringify(objective)}

    Generate **ONE** comprehensive analysis of a common misconception or difficulty STRICTLY related to this specific objective that "${selectedLevel.name}" level learners (${selectedLevel.description}) may have.

    CRITICAL INSTRUCTION:
    - Focus ONLY on the specific concept mentioned in the objective.
    - Do NOT generate a generic confusing point for the overall topic "${topic}".
    - Ensure this point is unique and specific to this objective.

    Output MUST be a valid JSON array containing EXACTLY ONE object with the following structure:
    [
      {
        "point": "適合${selectedLevel.name}程度的易混淆點標題",
        "clarification": "針對${selectedLevel.description}的澄清說明",
        "teachingExample": "適合此程度學習者的具體教學示例",
        "errorType": "誤區類型 (概念性/程序性/語言性/理解性)",
        "commonErrors": ["此程度學生的典型錯誤示例1", "此程度學生的典型錯誤示例2", "此程度學生的典型錯誤示例3"],
        "correctVsWrong": [
          {
            "correct": "適合${selectedLevel.name}程度的正確示例",
            "wrong": "此程度學生常犯的錯誤示例",
            "explanation": "適合此程度的對比說明"
          }
        ],
        "preventionStrategy": "針對${selectedLevel.name}程度的預防策略",
        "correctionMethod": "適合此程度的糾正方法",
        "practiceActivities": ["適合此程度的練習活動1", "適合此程度的練習活動2", "適合此程度的練習活動3"]
      }
    ]

    Requirements:
    - All content should be appropriate for "${selectedLevel.description}"
    - Include ALL fields above
    - commonErrors: Provide at least 3 typical student mistakes at this level
    - correctVsWrong: Provide at least 1 comparison
    - practiceActivities: Provide at least 3 level-appropriate targeted practice activities
    - All text should be in the primary language of the topic
    - Focus on confusion points specific to "${selectedLevel.name}" level: "${selectedLevel.description}"

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};

export const generateConfusingPointsForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
    console.log(`Starting chunked confusing points generation for topic: ${topic}, level: ${selectedLevel.name}. Objectives count: ${learningObjectives.length}`);

    try {
        const results = await Promise.all(
            learningObjectives.map((objective) =>
                generateSingleConfusingPointForLevel(topic, selectedLevel, apiKey, objective)
                    .catch(err => {
                        console.warn(`Failed to generate confusing point for objective: ${objective.objective}`, err);
                        return [];
                    })
            )
        );

        const flatResults = results.flat();
        console.log(`Generated ${flatResults.length} confusing points for level ${selectedLevel.name}. Titles: ${flatResults.map(r => r.point).join(', ')}`);
        return flatResults;
    } catch (error) {
        console.error("Error generating chunked confusing points:", error);
        throw error;
    }
};

// 針對特定程度和單字量的易混淆點生成函數 (Chunked Version)
const generateSingleConfusingPointForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, objective: LearningObjectiveItem): Promise<any[]> => {
    const prompt = `
    Based on the topic "${topic}" and this specific learning objective:
    ${JSON.stringify(objective)}

    Generate **ONE** comprehensive analysis of a common misconception or difficulty STRICTLY related to this specific objective that "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}) may have.
    
    CRITICAL INSTRUCTION:
    - Focus ONLY on the specific concept mentioned in the objective.
    - Do NOT generate a generic confusing point for the overall topic "${topic}".
    - Ensure this point is unique and specific to this objective.

    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All explanations must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Examples should be appropriate for ${vocabularyLevel.description}
    - Focus on confusion points that arise specifically at this vocabulary level

    Output MUST be a valid JSON array containing EXACTLY ONE object with the following structure:
    [
      {
        "point": "適合${vocabularyLevel.name}詞彙程度的易混淆點標題",
        "clarification": "使用${vocabularyLevel.wordCount}詞彙範圍的澄清說明",
        "teachingExample": "適合${vocabularyLevel.name}程度的教學示例",
        "errorType": "誤區類型 (概念性/程序性/語言性/理解性)",
        "commonErrors": ["此詞彙程度學生的典型錯誤示例1", "此詞彙程度學生的典型錯誤示例2", "此詞彙程度學生的典型錯誤示例3"],
        "correctVsWrong": [
          {
            "correct": "使用${vocabularyLevel.wordCount}詞彙範圍的正確示例",
            "wrong": "此詞彙程度學生常犯的錯誤示例",
            "explanation": "適合此詞彙程度的對比說明"
          }
        ],
        "preventionStrategy": "針對${vocabularyLevel.name}詞彙程度的預防策略",
        "correctionMethod": "適合此詞彙程度的糾正方法",
        "practiceActivities": ["適合此詞彙程度的練習活動1", "適合此詞彙程度的練習活動2", "適合此詞彙程度的練習活動3"]
      }
    ]

    All English content must stay within the ${vocabularyLevel.wordCount} word vocabulary limit and match ${selectedLevel.description}.
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
    return await callGemini(prompt, apiKey);
};

export const generateConfusingPointsForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
    console.log(`Starting chunked confusing points generation for topic: ${topic}, level: ${selectedLevel.name}, vocab: ${vocabularyLevel.name}. Objectives count: ${learningObjectives.length}`);

    try {
        const results = await Promise.all(
            learningObjectives.map((objective) =>
                generateSingleConfusingPointForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, objective)
                    .catch(err => {
                        console.warn(`Failed to generate confusing point for objective: ${objective.objective}`, err);
                        return [];
                    })
            )
        );

        const flatResults = results.flat();
        console.log(`Generated ${flatResults.length} confusing points for vocab level ${vocabularyLevel.name}. Titles: ${flatResults.map(r => r.point).join(', ')}`);
        return flatResults;
    } catch (error) {
        console.error("Error generating chunked confusing points:", error);
        throw error;
    }
};
