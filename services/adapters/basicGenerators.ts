/**
 * 基礎生成函數模組 - Provider 系統版本
 *
 * 包含基本的內容生成函數，對應原始 geminiService.ts 的基礎功能
 * 所有 prompt 完全保持原始不變
 */

import { providerService } from '../providerService';
import { AIRequest, ProviderSelectionStrategy } from '../../src/core/types/providers';
import type { LearningObjectiveItem, LearningLevelSuggestions } from '../../types';

// Provider 系統的核心調用函數
export const callProviderSystem = async (prompt: string, apiKey: string = 'provider-system-call'): Promise<any> => {
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
      const { callGemini: originalCallGemini } = await import('../geminiService');
      return await originalCallGemini(prompt, apiKey);
    } else {
      throw error;
    }
  }
};

// 1. 產生 learningObjectives (完整原始版本)
export const generateLearningObjectives = async (topic: string, apiKey: string): Promise<LearningObjectiveItem[]> => {
  const prompt = `
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${topic}".
    The objectives should be written in the primary language of the topic.
    Use any provided context (e.g., grade level, teaching method) to guide the difficulty and style, but do NOT explicitly mention the context settings (like 'Based on CPA method...') in the objective text.
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
export const generateConfusingPoints = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
export const generateClassroomActivities = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
export const generateOnlineInteractiveQuiz = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any> => {
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

// 6. 產生 englishConversation (完整原始版本)
export const generateEnglishConversation = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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

// 7. 產生 learningLevels (學習程度建議) (完整原始版本)
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
  return await callProviderSystem(prompt, apiKey);
};