/**
 * Gemini 服務適配器 - Provider 系統整合版
 *
 * 這個適配器將原始 geminiService.ts 的完整功能重新實現，
 * 但底層使用新的 Provider 系統來支援多 AI 提供商。
 *
 * 保持所有原始 prompt 的詳細度和結構，確保生成品質不降低。
 */

import { providerService } from './providerService';
import { AIRequest, ProviderSelectionStrategy } from '../src/core/types/providers';
import {
  GeneratedLearningContent,
  LearningObjectiveItem,
  VocabularyLevel,
  LearningLevelSuggestions,
  WritingPracticeContent,
  AIFeedback,
  SentencePracticePrompt,
  WritingPracticePrompt
} from '../types';

// Provider 系統的核心調用函數
const callProviderSystem = async (prompt: string, apiKey: string = 'provider-system-call'): Promise<any> => {
  try {
    // 檢查是否有配置的 Provider
    const hasProviders = await providerService.hasConfiguredProviders();

    if (!hasProviders && apiKey !== 'provider-system-call') {
      // 如果沒有配置的 Provider，嘗試遷移舊版 API Key
      await providerService.migrateLegacyApiKey();
    }

    // 準備請求
    const request: AIRequest = {
      prompt: prompt,
      options: {
        responseFormat: 'json',
        maxTokens: 8192,
        temperature: 0.7
      }
    };

    // 使用 Provider 系統生成內容
    console.log('Provider 系統: 生成內容中...');
    const response = await providerService.generateContent(request, ProviderSelectionStrategy.DEFAULT);
    console.log('Provider 系統回應:', { provider: response.metadata?.provider, model: response.metadata?.model });

    // 強化的 JSON 解析處理
    let content = response.content;

    // 特殊處理：如果回應是 OpenRouter 格式，提取 content
    if (content && typeof content === 'object' && content.choices) {
      try {
        content = content.choices[0].message.content;
        console.log('✓ 檢測到 OpenRouter 格式，提取內容');
      } catch (extractError) {
        console.warn('⚠ OpenRouter 格式提取失敗:', extractError);
      }
    }

    // 如果內容是字串且看起來像 JSON，嘗試解析
    if (typeof content === 'string') {
      try {
        // 先嘗試清理常見的 JSON 格式問題
        let cleanedContent = content
          .replace(/```json\n/g, '')       // 移除開頭的 ```json
          .replace(/\n```/g, '')           // 移除結尾的 ```
          .replace(/```\n/g, '')           // 移除其他 ```
          .replace(/```/g, '')             // 移除剩餘的 ```
          .trim();                         // 去除前後空白

        // 如果開頭不是 { 或 [，尋找第一個 JSON 物件
        if (!cleanedContent.startsWith('{') && !cleanedContent.startsWith('[')) {
          const jsonStart = Math.min(
            cleanedContent.indexOf('{') !== -1 ? cleanedContent.indexOf('{') : Infinity,
            cleanedContent.indexOf('[') !== -1 ? cleanedContent.indexOf('[') : Infinity
          );

          if (jsonStart !== Infinity) {
            const isObject = cleanedContent.charAt(jsonStart) === '{';
            const jsonEnd = isObject
              ? cleanedContent.lastIndexOf('}')
              : cleanedContent.lastIndexOf(']');

            if (jsonEnd > jsonStart) {
              cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
            }
          }
        }

        // 嘗試解析清理後的 JSON
        content = JSON.parse(cleanedContent);
        console.log('✓ JSON 解析成功 (Provider 系統)');
      } catch (parseError) {
        console.warn('⚠ JSON 解析失敗，返回原始內容:', parseError);
        // 如果解析失敗，返回原始內容
        content = response.content;
      }
    }

    return content;
  } catch (error) {
    console.error('Provider 系統錯誤:', error);

    // 只有當 API Key 是 Gemini 格式時才回退到原始實現
    if (apiKey && apiKey.startsWith('AIza')) {
      console.log('回退到原始 Gemini 服務');
      const { callGemini: originalCallGemini } = await import('./geminiService');
      return await originalCallGemini(prompt, apiKey);
    } else {
      throw error;
    }
  }
};

// 向後兼容的 callGemini 函數
export const callGemini = callProviderSystem;

// 1. 產生 learningObjectives (完整原始版本)
const generateLearningObjectives = async (topic: string, apiKey: string): Promise<LearningObjectiveItem[]> => {
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
  return await callProviderSystem(prompt, apiKey);
};

// 2. 產生 contentBreakdown (完整原始版本，包含英語特殊處理)
const generateContentBreakdown = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
      // ... 至少3個以上的項目
    ]
    ` : `
    Output format for general topics:
    [
      {
        "topic": "子主題A",
        "details": "子主題A的簡要說明...",
        "teachingExample": "子主題A的教學示例..."
      }
      // ... 至少3個以上的項目
    ]
    `}

    The content must be in the primary language of the topic. Only output the JSON array, no explanation or extra text.
  `;
  return await callProviderSystem(prompt, apiKey);
};

// 3. 產生 confusingPoints (完整原始版本)
const generateConfusingPoints = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Generate at least 3 (but more is better if appropriate) comprehensive analysis of common misconceptions or difficulties students may have with "${topic}".
    
    Output MUST be a valid JSON array with the following comprehensive structure:
    [
      {
        "point": "易混淆點標題",
        "clarification": "詳細澄清說明",
        "teachingExample": "具體教學示例",
        "errorType": "誤區類型 (概念性/程序性/語言性/理解性)",
        "commonErrors": ["學生典型錯誤示例1", "學生典型錯誤示例2", "學生典型錯誤示例3"],
        "correctVsWrong": [
          {
            "correct": "正確示例",
            "wrong": "錯誤示例", 
            "explanation": "對比說明"
          }
        ],
        "preventionStrategy": "預防策略 - 如何防止學生犯錯",
        "correctionMethod": "糾正方法 - 發現錯誤後的補救措施",
        "practiceActivities": ["針對性練習活動1", "針對性練習活動2", "針對性練習活動3"]
      }
    ]
    
    Requirements:
    - Each confusing point should include ALL fields above
    - commonErrors: Provide at least 3 typical student mistakes
    - correctVsWrong: Provide at least 1 comparison (more if helpful)  
    - practiceActivities: Provide at least 3 targeted practice activities
    - All text should be in the primary language of the topic
    - Focus on practical teaching guidance that educators can immediately apply
    
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callProviderSystem(prompt, apiKey);
};

// 4. 產生 classroomActivities (完整原始版本)
const generateClassroomActivities = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Suggest at least 3 (but more is better if appropriate) engaging, interactive classroom activities (preferably game-like) for the topic "${topic}".
    For each activity, provide the following comprehensive fields:
      - title: 活動名稱/主題 (The name of the activity)
      - description: 活動的標題或核心概念 (Brief description of the core concept)
      - objective: 學習目標 (Main learning goal or purpose)
      - timing: 使用時機 (When to use: lesson introduction, during unit, after unit, review, etc.)
      - materials: 所需教具 (Required tools, materials, or props)
      - environment: 環境要求 (Seating arrangement, space needs, equipment conditions)
      - steps: 活動步驟 (Step-by-step process of teacher-student interactions as array)
      - assessmentPoints: 評估重點 (Learning effectiveness observation and assessment criteria as array)
    
    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "title": "遊戲化活動1",
        "description": "活動1的核心概念與玩法簡述...",
        "objective": "活動1的學習目標...",
        "timing": "適用於單元導入/單元後/複習時等...",
        "materials": "所需教材、道具或工具...",
        "environment": "座位安排、空間需求、設備條件...",
        "steps": ["步驟1: 教師說明規則...", "步驟2: 學生分組...", "步驟3: 進行活動..."],
        "assessmentPoints": ["觀察學生參與度", "檢查概念理解程度", "評估協作能力"]
      },
      // ... more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callProviderSystem(prompt, apiKey);
};

// 5. 產生 OnlineInteractiveQuiz (完整原始版本，包含所有題型)
const generateOnlineInteractiveQuiz = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate quiz content for "${topic}" in the following JSON structure (no explanation, no extra text):
    {
      "easy": {
        "trueFalse": [
          { "statement": "簡單判斷題1...", "isTrue": true, "explanation": "可選說明1" },
          { "statement": "簡單判斷題2...", "isTrue": false, "explanation": "可選說明2" }
          // ... 至少 5 題，若有更多更好
        ],
        "multipleChoice": [
          { "question": "簡單選擇題1...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 0 },
          { "question": "簡單選擇題2...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 1 }
          // ... 至少 5 題，若有更多更好
        ],
        "fillInTheBlanks": [
          { "sentenceWithBlank": "簡單填空題1...____...", "correctAnswer": "正確答案1" },
          { "sentenceWithBlank": "簡單填空題2...____...", "correctAnswer": "正確答案2" }
          // ... 至少 5 題，若有更多更好
        ],
        "sentenceScramble": [
          { "originalSentence": "簡單句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "簡單句子2...", "scrambledWords": ["...", "...", "..."] }
          // ... 至少 5 題，若有更多更好
        ],
        "memoryCardGame": [
          {
            "pairs": [
              { "question": "卡片1正面", "answer": "卡片1背面" },
              { "question": "卡片2正面", "answer": "卡片2背面" },
              { "question": "卡片3正面", "answer": "卡片3背面" },
              { "question": "卡片4正面", "answer": "卡片4背面" },
              { "question": "卡片5正面", "answer": "卡片5背面" }
              // ... 至少 5 組配對，若有更多更好
            ],
            "instructions": "請將每個卡片正面與正確的背面配對。"
          }
        ]
      },
      "normal": { /* same structure as easy, memoryCardGame 只 1 題，pairs 至少 5 組 */ },
      "hard": { /* same structure as easy, memoryCardGame 只 1 題，pairs 至少 5 組 */ }
    }
    For each quiz type (trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble), generate at least 5 questions per difficulty level (easy, normal, hard), but more is better if appropriate.
    For memoryCardGame, generate ONLY 1 question per difficulty, but the "pairs" array inside must contain at least 5 pairs (each pair is a related concept, word/definition, Q&A, or translation relevant to '${topic}'), and more is better if appropriate.
    Each memoryCardGame question should include clear "instructions" for the matching task.
    All text must be in the primary language of the topic. Only output the JSON object, no explanation or extra text.
  `;
  return await callProviderSystem(prompt, apiKey);
};

// =============================================================================
// Missing Functions Migration - Provider System Implementation
// =============================================================================

// 生成自訂測驗 (替代 generateCustomQuiz)
export const generateCustomQuiz = async (
  topic: string,
  _apiKey: string,
  learningObjectives: any[],
  quizConfig: any,
  selectedLevel?: any,
  vocabularyLevel?: any
): Promise<any> => {
  // 驗證並修正配置 - 簡化版本
  const validateQuizConfig = (config: any) => {
    const validated = { ...config };
    for (const difficulty of ['easy', 'normal', 'hard']) {
      if (!validated[difficulty]) validated[difficulty] = {};
      const diffConfig = validated[difficulty];

      // 設定預設值和限制
      diffConfig.trueFalse = Math.min(Math.max(diffConfig.trueFalse || 0, 0), 10);
      diffConfig.multipleChoice = Math.min(Math.max(diffConfig.multipleChoice || 0, 0), 10);
      diffConfig.fillInTheBlanks = Math.min(Math.max(diffConfig.fillInTheBlanks || 0, 0), 10);
      diffConfig.sentenceScramble = Math.min(Math.max(diffConfig.sentenceScramble || 0, 0), 10);
      diffConfig.memoryCardGame = Math.min(Math.max(diffConfig.memoryCardGame || 0, 0), 2);
    }
    return validated;
  };

  const validatedConfig = validateQuizConfig(quizConfig);

  const generateQuizForDifficulty = async (difficulty: string) => {
    const config = validatedConfig[difficulty];

    // 構建基於自訂題數的 prompt
    let difficultyPrompt = '';
    if (selectedLevel) {
      difficultyPrompt = `適合「${selectedLevel.name}」程度學習者 (${selectedLevel.description}) 的`;
    }

    let vocabularyConstraints = '';
    if (vocabularyLevel) {
      vocabularyConstraints = `
      CRITICAL VOCABULARY CONSTRAINTS for English content:
      - All English text must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
      - Examples should be appropriate for ${vocabularyLevel.description}
      `;
    }

    const prompt = `
      Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
      Please generate ${difficultyPrompt}quiz content for "${topic}" with the following specific quantities:
      
      - True/False questions: ${config.trueFalse} questions
      - Multiple choice questions: ${config.multipleChoice} questions  
      - Fill in the blanks questions: ${config.fillInTheBlanks} questions
      - Sentence scramble questions: ${config.sentenceScramble} questions
      - Memory card game questions: ${config.memoryCardGame} questions
      
      ${vocabularyConstraints}
      
      Output MUST be a valid JSON object with this exact structure:
      {
        "trueFalse": [${config.trueFalse > 0 ? `
          { "statement": "是非題題目", "isTrue": true, "explanation": "可選說明" }
          // 總共 ${config.trueFalse} 題` : '// 空陣列，因為設定為 0 題'}],
        "multipleChoice": [${config.multipleChoice > 0 ? `
          { "question": "選擇題題目", "options": ["選項A", "選項B", "選項C", "選項D"], "correctAnswerIndex": 0 }
          // 總共 ${config.multipleChoice} 題` : '// 空陣列，因為設定為 0 題'}],
        "fillInTheBlanks": [${config.fillInTheBlanks > 0 ? `
          { "sentenceWithBlank": "填空題題目，空格用 ____ 表示", "correctAnswer": "正確答案" }
          // 總共 ${config.fillInTheBlanks} 題` : '// 空陣列，因為設定為 0 題'}],
        "sentenceScramble": [${config.sentenceScramble > 0 ? `
          { "originalSentence": "正確的完整句子", "scrambledWords": ["打散", "的", "單字", "陣列"] }
          // 總共 ${config.sentenceScramble} 題` : '// 空陣列，因為設定為 0 題'}],
        "memoryCardGame": [${config.memoryCardGame > 0 ? `
          { "pairs": [{"question": "卡片正面", "answer": "卡片背面"}, ...], "instructions": "遊戲說明" }
          // 總共 ${config.memoryCardGame} 題，每題至少包含 5 對卡片` : '// 空陣列，因為設定為 0 題'}]
      }
      
      IMPORTANT: 
      - Generate EXACTLY the number of questions specified for each type (supports up to 10 questions for most types, 2 for memory card games)
      - If a question type is set to 0, provide an empty array []
      - For memoryCardGame, each question should contain at least 5 pairs in the "pairs" array
      - Maximum limits: trueFalse/multipleChoice/fillInTheBlanks/sentenceScramble up to 10 questions, memoryCardGame up to 2 questions
      - All text must be in the primary language of the topic
      - Do NOT include any explanation or extra text, only output the JSON object
    `;

    return await callGemini(prompt);
  };

  // 並行生成三個難度的測驗
  const [easy, normal, hard] = await Promise.all([
    generateQuizForDifficulty('easy'),
    generateQuizForDifficulty('normal'),
    generateQuizForDifficulty('hard')
  ]);

  return { easy, normal, hard };
};

// 重新生成測驗配置 (替代 regenerateQuizWithConfig)
export const regenerateQuizWithConfig = async (
  topic: string,
  learningObjectives: any[],
  quizConfig: any,
  selectedLevel?: any,
  vocabularyLevel?: any
): Promise<any> => {
  return await generateCustomQuiz(topic, '', learningObjectives, quizConfig, selectedLevel, vocabularyLevel);
};

// AI 回饋生成 (替代 getAIFeedback)
export const getAIFeedback = async (
  studentWork: string,
  promptType: 'sentence' | 'writing',
  prompt: SentencePracticePrompt | WritingPracticePrompt,
  _apiKey: string,
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

  return await callGemini(feedbackPrompt);
};
// 學生內容轉換函數群組
export const transformLearningObjectiveForStudent = async (
  objective: any
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

  return await callGemini(prompt);
};

export const transformContentBreakdownForStudent = async (
  contentItem: any
): Promise<any> => {
  const prompt = `
    Transform the following teacher-oriented content breakdown into student-friendly, digestible learning content:
    
    Original Content Breakdown:
    ${JSON.stringify(contentItem)}
    
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

  return await callGemini(prompt);
};

export const transformConfusingPointForStudent = async (
  confusingPoint: any
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

  return await callGemini(prompt);
};

// 記憶卡遊戲驗證函數
const validateMemoryCardGame = (memoryCardGames: any[]): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  memoryCardGames.forEach((game, gameIndex) => {
    if (!game.pairs || !Array.isArray(game.pairs)) {
      issues.push(`遊戲 ${gameIndex + 1}: 缺少 pairs 陣列`);
      return;
    }

    const leftContents = new Set();
    const rightContents = new Set();

    game.pairs.forEach((pair: any, pairIndex: number) => {
      if (!pair.left || !pair.right) {
        issues.push(`遊戲 ${gameIndex + 1}, 配對 ${pairIndex + 1}: 缺少 left 或 right 內容`);
        return;
      }

      if (leftContents.has(pair.left)) {
        issues.push(`遊戲 ${gameIndex + 1}: 重複的左側內容 "${pair.left}"`);
      }
      if (rightContents.has(pair.right)) {
        issues.push(`遊戲 ${gameIndex + 1}: 重複的右側內容 "${pair.right}"`);
      }

      leftContents.add(pair.left);
      rightContents.add(pair.right);
    });

    if (game.pairs.length < 5) {
      issues.push(`遊戲 ${gameIndex + 1}: 配對數量不足，至少需要 5 對，目前只有 ${game.pairs.length} 對`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues
  };
};

// 生成步驟測驗
// 生成寫作練習內容 (完整原始版本)
// 6. 產生 englishConversation (完整原始版本)
const generateEnglishConversation = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate a short, natural English conversation (at least 3 lines, but more is better if appropriate, 2 speakers) about the topic "${topic}" (use English translation if topic is not English).
    Output MUST be a valid JSON array, e.g.:
    [
      { "speaker": "Speaker A", "line": "Hello! Let's talk about ${topic}." },
      { "speaker": "Speaker B", "line": "Great idea! What's the first thing we should discuss regarding ${topic}?" },
      { "speaker": "Speaker A", "line": "Perhaps we can start with..." },
      { "speaker": "Speaker B", "line": "I think examples would help." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callProviderSystem(prompt, apiKey);
};
export const generateWritingPractice = async (
  topic: string,
  _apiKey: string,
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
    callGemini(sentencePracticePrompt),
    callGemini(writingPracticePrompt)
  ]);

  return {
    sentencePractice,
    writingPractice,
    instructions: `這裡提供了造句和寫作練習，幫助學習者提升語言表達能力。造句練習著重於詞彙運用，寫作練習則訓練文章結構和論述能力。完成後可以使用AI批改功能獲得即時回饋。`
  };
};
export const generateStepQuiz = async (
  stepContent: any,
  stepType: 'objective' | 'breakdown' | 'confusing',
  quizConfig: {
    trueFalse: number;
    multipleChoice: number;
    memoryCardGame: number;
  }
): Promise<any> => {
  const prompt = `
    Based on the following transformed student-friendly content, generate quiz questions that help students practice and reinforce their understanding:
    
    Step Type: ${stepType}
    Content: ${JSON.stringify(stepContent)}
    
    Generate EXACTLY the requested number of questions for each type:
    - True/False: ${quizConfig.trueFalse} questions
    - Multiple Choice: ${quizConfig.multipleChoice} questions  
    - Memory Card Game: ${quizConfig.memoryCardGame} pair set(s)
    
    Quiz Design Principles:
    1. Questions should directly test understanding of the content provided
    2. Use student-friendly language that matches the transformed content tone
    3. Make questions engaging and practical
    4. Include clear explanations for correct answers
    5. For memory card games, create concept-definition or question-answer pairs
    6. Avoid trick questions; focus on genuine comprehension
    
    CRITICAL for Memory Card Games:
    - Each "left" and "right" content must be COMPLETELY UNIQUE across all pairs
    - NO duplicate content on either left or right side
    - Each pair should test a different concept or knowledge point
    - Students should never be confused about which card matches which
    - All content in left column must be distinct from each other
    - All content in right column must be distinct from each other
    - Create clear, unambiguous one-to-one relationships
    
    Output MUST be a valid JSON object with this exact structure:
    {
      "trueFalse": [
        { 
          "statement": "清楚的是非判斷陳述句...", 
          "isTrue": true, 
          "explanation": "解釋為什麼這個陳述是正確/錯誤的..."
        }
        // exactly ${quizConfig.trueFalse} items
      ],
      "multipleChoice": [
        { 
          "question": "測試理解的選擇題問題...", 
          "options": ["選項A", "選項B", "選項C", "選項D"], 
          "correctAnswerIndex": 0,
          "explanation": "解釋為什麼這個答案是正確的..."
        }
        // exactly ${quizConfig.multipleChoice} items
      ],
      "memoryCardGame": [
        {
          "title": "配對遊戲標題",
          "pairs": [
            { "left": "第一個概念", "right": "第一個概念的定義或對應" },
            { "left": "第二個概念", "right": "第二個概念的定義或對應" },
            { "left": "第三個概念", "right": "第三個概念的定義或對應" },
            { "left": "第四個概念", "right": "第四個概念的定義或對應" },
            { "left": "第五個概念", "right": "第五個概念的定義或對應" }
            // at least 5 pairs per game
          ]
        }
        // exactly ${quizConfig.memoryCardGame} games
      ]
    }
    
    All content should be in Traditional Chinese and directly related to the provided learning content.
    Make questions that genuinely help students practice and remember the key concepts.
    Do NOT include any explanation or extra text outside the JSON structure.
  `;

  // 生成測驗內容
  const quizData = await callGemini(prompt);

  // 驗證記憶卡遊戲內容
  if (quizData.memoryCardGame && Array.isArray(quizData.memoryCardGame)) {
    const validation = validateMemoryCardGame(quizData.memoryCardGame);

    if (!validation.isValid) {
      console.warn('記憶卡遊戲驗證失敗:', validation.issues);

      // 可選：如果驗證失敗，重新生成或給出警告
      // 這裡我們選擇記錄警告但仍返回結果，讓老師能在預覽中看到問題
      quizData._validationWarnings = validation.issues;
    }
  }

  return quizData;
};

const generateLearningLevels = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<LearningLevelSuggestions> => {
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

// 生成學習程度建議函數
export const generateLearningLevelSuggestions = async (topic: string, apiKey: string): Promise<any> => {
  console.log(`生成學習程度建議 (Provider 系統): ${topic}`);
  // 先產生基本的學習目標來輔助程度建議
  const basicObjectives = await generateLearningObjectives(topic, apiKey);

  return await generateLearningLevels(topic, apiKey, basicObjectives);
};

// 檢查是否為英語相關主題
export const isEnglishRelatedTopic = (topic: string): boolean => {
  // 簡單的英語主題檢測邏輯
  const englishKeywords = ['english', 'grammar', 'vocabulary', 'conversation', 'speaking', 'listening', 'reading', 'writing', 'toefl', 'ielts', 'business english', '英文', '英語'];
  const lowerTopic = topic.toLowerCase();
  return englishKeywords.some(keyword => lowerTopic.includes(keyword));
};

// 主要生成函數 - 完整版本
export const generateLearningPlan = async (topic: string, apiKey: string): Promise<GeneratedLearningContent> => {
  console.log(`開始生成學習計劃 (Provider 系統): ${topic}`);

  // 1. 先生成學習目標
  const learningObjectives = await generateLearningObjectives(topic, apiKey);
  console.log('✓ 學習目標生成完成');

  // 2. 並行生成其他部分
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives),
    generateEnglishConversation(topic, apiKey, learningObjectives),
    generateLearningLevels(topic, apiKey, learningObjectives),
    generateWritingPractice(topic, apiKey, learningObjectives)
  ]);

  console.log('✓ 所有內容生成完成 (Provider 系統)');

  return {
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz,
    englishConversation,
    learningLevels,
    writingPractice
  };
};

// 帶程度的生成函數
export const generateLearningPlanWithLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<GeneratedLearningContent> => {
  console.log(`開始生成學習計劃 (有程度設定, Provider 系統): ${topic}, 程度: ${selectedLevel?.name || '未指定'}`);

  // 1. 先生成學習目標
  const learningObjectives = await generateLearningObjectives(topic, apiKey);
  console.log('✓ 學習目標生成完成');

  // 2. 並行生成其他部分
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives),
    generateEnglishConversation(topic, apiKey, learningObjectives),
    generateLearningLevels(topic, apiKey, learningObjectives),
    generateWritingPractice(topic, apiKey, learningObjectives, selectedLevel)
  ]);

  console.log('✓ 所有內容生成完成 (有程度設定, Provider 系統)');

  return {
    topic,
    selectedLevel,
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz,
    englishConversation,
    learningLevels,
    writingPractice
  };
};

// 帶詞彙程度的生成函數
export const generateLearningPlanWithVocabularyLevel = async (
  topic: string,
  selectedLevel: any,
  vocabularyLevel: VocabularyLevel,
  apiKey: string
): Promise<GeneratedLearningContent> => {
  console.log(`開始生成學習計劃 (有詞彙程度設定, Provider 系統): ${topic}`);

  // 1. 先生成學習目標
  const learningObjectives = await generateLearningObjectives(topic, apiKey);
  console.log('✓ 學習目標生成完成');

  // 2. 並行生成其他部分
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives),
    generateEnglishConversation(topic, apiKey, learningObjectives),
    generateLearningLevels(topic, apiKey, learningObjectives),
    generateWritingPractice(topic, apiKey, learningObjectives, selectedLevel, vocabularyLevel)
  ]);

  console.log('✓ 所有內容生成完成 (有詞彙程度設定, Provider 系統)');

  return {
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz,
    englishConversation,
    learningLevels,
    writingPractice,
    selectedLevel,
    selectedVocabularyLevel: vocabularyLevel
  };
};

// Provider 管理函數
export const hasConfiguredProviders = async (): Promise<boolean> => {
  return await providerService.hasConfiguredProviders();
};

export const addProvider = async (config: any) => {
  return await providerService.addProvider(config);
};

export const updateProvider = async (config: any) => {
  return await providerService.updateProvider(config);
};

export const removeProvider = async (providerId: string) => {
  return await providerService.removeProvider(providerId);
};

export const testProvider = async (providerId: string) => {
  return await providerService.testProvider(providerId);
};

export const testAllProviders = async () => {
  return await providerService.testAllProviders();
};

export const setDefaultProvider = async (providerId: string) => {
  return await providerService.setDefaultProvider(providerId);
};

export const getUsageStats = async () => {
  return await providerService.getUsageStats();
};

export const getProviderManager = () => providerService;

export const clearAllProviderData = async () => {
  return await providerService.clearAllData();
};

export const initializeProviderSystem = async () => {
  try {
    // 檢查是否需要遷移
    const hasProviders = await providerService.hasConfiguredProviders();

    if (!hasProviders) {
      // 嘗試遷移舊版配置
      await providerService.migrateLegacyApiKey();

      const hasProvidersAfterMigration = await providerService.hasConfiguredProviders();

      if (!hasProvidersAfterMigration) {
        console.warn('尚未配置任何 Provider，請在設定中添加 Provider');
        return false;
      }
    }

    console.log('Provider 系統已成功初始化');
    return true;
  } catch (error) {
    console.error('初始化 Provider 系統失敗:', error);
    return false;
  }
};

// 重新匯出類型和常數
export * from '../types';
