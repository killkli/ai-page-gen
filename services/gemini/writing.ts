import { LearningObjectiveItem, VocabularyLevel, WritingPracticeContent, AIFeedback, SentencePracticePrompt, WritingPracticePrompt } from '../../types';
import { callGemini } from './core';

// 生成寫作練習內容
export const generateWritingPractice = async (
    topic: string,
    apiKey: string,
    learningObjectives: LearningObjectiveItem[],
    selectedLevel?: any,
    vocabularyLevel?: VocabularyLevel
): Promise<WritingPracticeContent> => {

    // 生成造句練習
    const sentencePracticePrompt = `
    Based on the topic "${topic}" and learning objectives: ${JSON.stringify(learningObjectives)}
    Generate 6 sentence-making practice prompts (2 easy, 2 normal, 2 hard difficulty).
    
    ${selectedLevel ? `The content should be suitable for "${selectedLevel.name}" level learners (${selectedLevel.description}).` : ''}
    ${vocabularyLevel ? `
    VOCABULARY CONSTRAINTS for English content:
    - All instructions and keywords must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Examples should be appropriate for ${vocabularyLevel.description}
    ` : ''}
    
    Output MUST be a valid JSON array:
    [
      {
        "id": "sentence_1",
        "instruction": "造句指示說明",
        "keywords": ["關鍵詞1", "關鍵詞2", "關鍵詞3"],
        "exampleSentence": "範例句子",
        "hints": ["提示1", "提示2"],
        "difficulty": "easy"
      }
    ]
    
    Requirements:
    - Each prompt should include 2-4 keywords that must be used
    - Provide clear instructions in the primary language of the topic
    - Include helpful hints for sentence construction
    - Example sentences should demonstrate proper usage
    - Progressive difficulty from easy to hard
    
    Do NOT include explanation, only output the JSON array.
  `;

    // 生成寫作練習
    const writingPracticePrompt = `
    Based on the topic "${topic}" and learning objectives: ${JSON.stringify(learningObjectives)}
    Generate 6 writing practice prompts (2 easy, 2 normal, 2 hard difficulty).
    
    ${selectedLevel ? `The content should be suitable for "${selectedLevel.name}" level learners (${selectedLevel.description}).` : ''}
    ${vocabularyLevel ? `
    VOCABULARY CONSTRAINTS for English content:
    - All instructions and suggested keywords must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Writing requirements should match ${vocabularyLevel.description}
    ` : ''}
    
    Output MUST be a valid JSON array:
    [
      {
        "id": "writing_1", 
        "title": "寫作題目標題",
        "instruction": "詳細的寫作指示",
        "structure": ["段落1：介紹", "段落2：主要內容", "段落3：結論"],
        "keywords": ["建議詞彙1", "建議詞彙2"],
        "minLength": 100,
        "maxLength": 300,
        "exampleOutline": "範例大綱結構",
        "difficulty": "easy"
      }
    ]
    
    Requirements:
    - Easy: 100-200 words, simple structure
    - Normal: 200-400 words, moderate complexity  
    - Hard: 300-600 words, complex structure
    - Provide clear writing guidelines and structure suggestions
    - Include relevant vocabulary recommendations
    - All text in the primary language of the topic
    
    Do NOT include explanation, only output the JSON array.
  `;

    const [sentencePractice, writingPractice] = await Promise.all([
        callGemini(sentencePracticePrompt, apiKey),
        callGemini(writingPracticePrompt, apiKey)
    ]);

    return {
        sentencePractice,
        writingPractice,
        instructions: `這裡提供了造句和寫作練習，幫助學習者提升語言表達能力。造句練習著重於詞彙運用，寫作練習則訓練文章結構和論述能力。完成後可以使用AI批改功能獲得即時回饋。`
    };
};

// AI批改功能
export const getAIFeedback = async (
    studentWork: string,
    promptType: 'sentence' | 'writing',
    prompt: SentencePracticePrompt | WritingPracticePrompt,
    apiKey: string,
    vocabularyLevel?: VocabularyLevel
): Promise<AIFeedback> => {
    const isEnglish = /[a-zA-Z]/.test(studentWork);
    const language = isEnglish ? 'English' : 'Chinese';

    const feedbackPrompt = `
    Please provide detailed feedback for this ${promptType} practice work:
    
    Original Prompt: ${JSON.stringify(prompt)}
    Student Work: "${studentWork}"
    
    ${vocabularyLevel && isEnglish ? `
    VOCABULARY LEVEL CONTEXT:
    - Target level: ${vocabularyLevel.name} (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description})
    - Evaluate if vocabulary usage matches this level
    ` : ''}
    
    Provide comprehensive feedback in JSON format:
    {
      "score": 85,
      "strengths": ["具體優點1", "具體優點2"],
      "improvements": ["改進建議1", "改進建議2"],
      "grammarCorrections": [
        {
          "original": "原文片段",
          "corrected": "修正後版本", 
          "explanation": "修正原因說明"
        }
      ],
      "vocabularyTips": ["詞彙使用建議1", "詞彙使用建議2"],
      "structureFeedback": "結構和組織回饋",
      "overallComment": "整體評語和鼓勵"
    }
    
    Evaluation Criteria:
    - Content relevance and completion of requirements
    - Grammar and language accuracy
    - Vocabulary usage and variety
    - Structure and organization (for writing)
    - Creativity and expression
    
    ${promptType === 'sentence' ? `
    For sentence practice:
    - Check if required keywords are used correctly
    - Evaluate sentence structure and grammar
    - Assess creativity in sentence construction
    ` : `
    For writing practice:
    - Evaluate if word count requirements are met
    - Assess paragraph structure and flow
    - Check adherence to suggested outline
    - Evaluate argument development and coherence
    `}
    
    Provide feedback in ${language === 'English' ? 'Traditional Chinese' : 'Traditional Chinese'} for better understanding.
    Be encouraging and constructive. Score range: 0-100.
    
    Do NOT include explanation, only output the JSON object.
  `;

    return await callGemini(feedbackPrompt, apiKey);
};
