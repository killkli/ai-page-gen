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
  LearningLevelSuggestions,
  VocabularyLevel,
  QuizCustomConfig,
  QuizTypeConfig,
  QUIZ_TYPE_LIMITS,
  WritingPracticeContent,
  SentencePracticePrompt,
  WritingPracticePrompt,
  AIFeedback
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
            "correct": "正確理解或做法",
            "wrong": "錯誤理解或做法",
            "explanation": "為什麼會有這種錯誤以及如何糾正"
          }
          // ... 2-3個對比例子
        ],
        "preventionStrategy": "預防此類錯誤的教學策略",
        "correctionMethod": "發現錯誤後的糾正方法",
        "practiceActivities": ["練習活動建議1", "練習活動建議2", "練習活動建議3"]
      }
      // ... 至少3個以上的項目
    ]

    The content must be in the primary language of the topic. Only output the JSON array, no explanation or extra text.
  `;
  return await callProviderSystem(prompt, apiKey);
};

// 4. 產生 classroomActivities (完整原始版本)
const generateClassroomActivities = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Create at least 3 (but more is better if appropriate) engaging classroom activities for teaching "${topic}".

    Each activity should be based on gamification principles and provide clear instructions for implementation.

    Output MUST be a valid JSON array with the following structure:
    [
      {
        "title": "活動標題",
        "description": "活動詳細描述與目標",
        "objective": "此活動的具體學習目標",
        "timing": "建議時間長度 (例如: 15分鐘, 30分鐘)",
        "materials": "所需材料與資源 (例如: 白板、卡片、投影機等)",
        "environment": "建議的學習環境 (例如: 教室、小組討論區、戶外等)",
        "steps": [
          "步驟1: 詳細說明第一個步驟",
          "步驟2: 詳細說明第二個步驟",
          "步驟3: 詳細說明第三個步驟",
          "步驟4: 詳細說明第四個步驟 (可選)",
          "步驟5: 詳細說明第五個步驟 (可選)"
        ],
        "assessmentPoints": [
          "評估要點1: 觀察學生是否能夠...",
          "評估要點2: 檢查學生是否理解...",
          "評估要點3: 確認學生能夠應用..."
        ]
      }
      // ... 至少3個以上的活動
    ]

    The content must be in the primary language of the topic. Focus on interactive, engaging activities that promote active learning. Only output the JSON array, no explanation or extra text.
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
          { "question": "簡單選擇題1...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 0 }
          // ... 至少 5 題，若有更多更好
        ],
        "fillInTheBlanks": [
          { "sentenceWithBlank": "這是一個__空格的句子。", "correctAnswer": "有" }
          // ... 至少 5 題，若有更多更好
        ],
        "sentenceScramble": [
          { "originalSentence": "完整的原始句子", "scrambledWords": ["打亂", "的", "詞序", "陣列"] }
          // ... 至少 5 題，若有更多更好
        ],
        "memoryCardGame": [
          {
            "pairs": [
              { "question": "問題1", "answer": "答案1" },
              { "question": "問題2", "answer": "答案2" },
              { "question": "問題3", "answer": "答案3" },
              { "question": "問題4", "answer": "答案4" },
              { "question": "問題5", "answer": "答案5" }
              // ... 至少 5 對，若有更多更好
            ],
            "instructions": "遊戲說明",
            "title": "記憶卡片遊戲標題"
          }
          // 記憶卡遊戲通常只需要1個
        ]
      },
      "normal": {
        // 相同結構，但難度適中
        "trueFalse": [],
        "multipleChoice": [],
        "fillInTheBlanks": [],
        "sentenceScramble": [],
        "memoryCardGame": []
      },
      "hard": {
        // 相同結構，但難度較高
        "trueFalse": [],
        "multipleChoice": [],
        "fillInTheBlanks": [],
        "sentenceScramble": [],
        "memoryCardGame": []
      }
    }

    For each quiz type (trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble), generate at least 5 questions per difficulty level.
    For memoryCardGame, generate ONLY 1 question per difficulty, but the "pairs" array inside must contain at least 5 pairs.
    All text must be in the primary language of the topic. Only output the JSON object, no explanation or extra text.
  `;
  return await callProviderSystem(prompt, apiKey);
};

// 生成學習程度建議函數
export const generateLearningLevelSuggestions = async (topic: string, apiKey: string): Promise<any> => {
  console.log(`生成學習程度建議 (Provider 系統): ${topic}`);

  const prompt = `
    Based on the learning topic "${topic}", please provide 3 different learning level suggestions.

    Output format should be JSON only:
    {
      "suggestions": [
        {
          "id": "beginner",
          "label": "初學者",
          "description": "適合初學者的學習內容",
          "targetAudience": "沒有相關背景知識的學習者",
          "estimatedHours": 2
        },
        {
          "id": "intermediate",
          "label": "中級",
          "description": "適合有基礎知識的學習者",
          "targetAudience": "有一定基礎的學習者",
          "estimatedHours": 4
        },
        {
          "id": "advanced",
          "label": "進階",
          "description": "適合進階學習者的深度內容",
          "targetAudience": "有豐富經驗想深入學習的學習者",
          "estimatedHours": 6
        }
      ]
    }

    Only output JSON, no explanation.
  `;

  return await callProviderSystem(prompt, apiKey);
};

// 檢查是否為英語相關主題
export const isEnglishRelatedTopic = async (topic: string): Promise<boolean> => {
  // 簡單的英語主題檢測邏輯
  const englishKeywords = ['english', 'grammar', 'vocabulary', 'conversation', 'speaking', 'listening', 'reading', 'writing', 'toefl', 'ielts', 'business english'];
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
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives)
  ]);

  console.log('✓ 所有內容生成完成 (Provider 系統)');

  return {
    topic,
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz
  };
};

// 帶程度的生成函數
export const generateLearningPlanWithLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<GeneratedLearningContent> => {
  console.log(`開始生成學習計劃 (有程度設定, Provider 系統): ${topic}, 程度: ${selectedLevel?.name || '未指定'}`);

  // 1. 先生成學習目標
  const learningObjectives = await generateLearningObjectives(topic, apiKey);
  console.log('✓ 學習目標生成完成');

  // 2. 並行生成其他部分
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives)
  ]);

  console.log('✓ 所有內容生成完成 (有程度設定, Provider 系統)');

  return {
    topic,
    selectedLevel,
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz
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
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives)
  ]);

  console.log('✓ 所有內容生成完成 (有詞彙程度設定, Provider 系統)');

  return {
    topic,
    selectedLevel,
    selectedVocabularyLevel: vocabularyLevel,
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz
  };
};

// 重新匯出其他可能需要的功能 (委託給原始服務)
export const generateEnglishConversationForLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<any[]> => {
  console.log('委託生成英語對話到原始服務');
  const { generateEnglishConversationForLevel: original } = await import('./geminiService');
  return await original(topic, selectedLevel, apiKey);
};

export const generateWritingPractice = async (topic: string, apiKey: string): Promise<WritingPracticeContent> => {
  console.log('委託生成寫作練習到原始服務');
  const { generateWritingPractice: original } = await import('./geminiService');
  return await original(topic, apiKey);
};

export const generateAIFeedback = async (practiceType: string, userWork: string, prompt: any, apiKey: string): Promise<AIFeedback> => {
  console.log('委託生成 AI 回饋到原始服務');
  const { generateAIFeedback: original } = await import('./geminiService');
  return await original(practiceType, userWork, prompt, apiKey);
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

export const getConfiguredProviders = () => {
  return providerService.getConfiguredProviders();
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