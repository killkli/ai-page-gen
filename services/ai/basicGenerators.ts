/**
 * 基礎生成函數模組 - Provider 系統版本
 *
 * Provider系統版本的基礎內容生成函數
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

    throw error;
  }
};

// 1. 產生 learningObjectives (完整原始版本)
export const generateLearningObjectives = async (topic: string, apiKey: string): Promise<LearningObjectiveItem[]> => {
  const prompt = `
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${topic}".
    The objectives should be written in the primary language of the topic.
    
    CRITICAL INSTRUCTION: Focus on **LEARNING OUTCOMES** (what the student will be able to DO after the lesson), NOT just what will be taught.
    Use Bloom's Taxonomy verbs (e.g., Analyze, Create, Evaluate, Understand, Apply).
    Format: "Student will be able to [Action] [Content]..."
    
    Use any provided context (e.g., grade level, teaching method) to guide the difficulty and style, but do NOT explicitly mention the context settings (like 'Based on CPA method...') in the objective text.
    
    For each objective, provide:
    - objective: The competency statement (e.g., "Able to distinguish between...")
    - description: Why this competency is important and what it entails.
    - teachingExample: A concrete scenario where this competency is applied.
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
// 2. 產生 contentBreakdown (Chunked Version)
const generateContentBreakdownForObjective = async (topic: string, apiKey: string, objective: LearningObjectiveItem, isEnglishLearning: boolean, index: number): Promise<any[]> => {
  const unitNumber = index + 1;
  const prompt = `
    Based on the topic "${topic}" and this specific learning objective (Objective ${unitNumber}): 
    ${JSON.stringify(objective)}
    
    Please generate **at least 2 specific micro-units** (sub-topics) that are needed to teach this objective.
    
    CRITICAL INSTRUCTION: Focus on **CURRICULUM STRUCTURE**.
    
    For each item, provide:
    - topic: The specific sub-topic title. MUST start with "Unit ${unitNumber}.[Sub-unit]" (e.g., "Unit ${unitNumber}.1: [Name]", "Unit ${unitNumber}.2: [Name]").
    - details: Explanation of the concept to be taught.
    - teachingExample: A concrete example used to explain this concept.

    ${isEnglishLearning ? `
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句 (array of 3-5 teaching example sentences)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)

    Output format for English learning topics:
    [
      {
        "topic": "Unit ${unitNumber}.1: 子主題A",
        "details": "子主題A的簡要說明...",
        "teachingExample": "子主題A的教學示例...",
        "coreConcept": "此要點的核心概念...",
        "teachingSentences": ["例句1", "例句2", "例句3", "例句4", "例句5"],
        "teachingTips": "教學要點與提示說明..."
      }
      // ... at least 2 items
    ]
    ` : `
    Output format for general topics:
    [
      {
        "topic": "Unit ${unitNumber}.1: 子主題A",
        "details": "子主題A的簡要說明...",
        "teachingExample": "子主題A的教學示例..."
      }
      // ... at least 2 items
    ]
    `}

    The content must be in the primary language of the topic. Only output the JSON array, no explanation or extra text.
  `;
  return await callProviderSystem(prompt, apiKey);
};

export const generateContentBreakdown = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  // Detect if this is English language learning
  const isEnglishLearning = /english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(topic);

  console.log(`Starting chunked content breakdown generation for topic: ${topic}`);

  try {
    // Process objectives in parallel
    const results = await Promise.all(
      learningObjectives.map((objective, index) =>
        generateContentBreakdownForObjective(topic, apiKey, objective, isEnglishLearning, index)
          .catch(err => {
            console.warn(`Failed to generate breakdown for objective: ${objective.objective}`, err);
            return []; // Return empty array on failure to avoid failing the whole request
          })
      )
    );

    // Flatten the results
    return results.flat();
  } catch (error) {
    console.error("Error generating chunked content breakdown:", error);
    throw error;
  }
};

// 3. 產生 confusingPoints (完整原始版本)
// 3. 產生 confusingPoints (Chunked Version)
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
  return await callProviderSystem(prompt, apiKey);
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
// 5. 產生 OnlineInteractiveQuiz (Chunked Version)
const generateQuizForDifficulty = async (topic: string, difficulty: 'easy' | 'normal' | 'hard', apiKey: string, learningObjectives: LearningObjectiveItem[], isMath: boolean = false): Promise<any> => {
  const sentenceScrambleSection = isMath ? "" : `
      "sentenceScramble": [
        { "originalSentence": "Sentence...", "scrambledWords": ["...", "..."] }
        // ... at least 5 items
      ],`;

  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate "${difficulty}" level quiz content for "${topic}".
    
    Output MUST be a valid JSON object with the following structure (no explanation, no extra text):
    {
      "trueFalse": [
        { "statement": "Statement...", "isTrue": true, "explanation": "Optional explanation" }
        // ... at least 5 items
      ],
      "multipleChoice": [
        { "question": "Question...", "options": ["A", "B", "C"], "correctAnswerIndex": 0 }
        // ... at least 5 items
      ],
      "fillInTheBlanks": [
        { "sentenceWithBlank": "Sentence...____...", "correctAnswer": "Answer" }
        // ... at least 5 items
      ],${sentenceScrambleSection}
      "memoryCardGame": [
        {
          "pairs": [
            { "question": "Front", "answer": "Back" }
            // ... at least 5 pairs
          ],
          "instructions": "Instructions..."
        }
        // ... exactly 1 item
      ]
    }

    Requirements:
    - Difficulty: ${difficulty}
    - trueFalse, multipleChoice, fillInTheBlanks${isMath ? '' : ', sentenceScramble'}: At least 5 questions each.
    - memoryCardGame: Exactly 1 question, but with at least 5 pairs inside.
    - All text must be in the primary language of the topic.
    - Only output the JSON object.
  `;
  return await callProviderSystem(prompt, apiKey);
};

export const generateOnlineInteractiveQuiz = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[], isMath: boolean = false): Promise<any> => {
  console.log(`Starting chunked quiz generation for topic: ${topic}`);

  try {
    const [easy, normal, hard] = await Promise.all([
      generateQuizForDifficulty(topic, 'easy', apiKey, learningObjectives, isMath),
      generateQuizForDifficulty(topic, 'normal', apiKey, learningObjectives, isMath),
      generateQuizForDifficulty(topic, 'hard', apiKey, learningObjectives, isMath)
    ]);

    return {
      easy,
      normal,
      hard
    };
  } catch (error) {
    console.error("Error generating chunked quiz:", error);
    // Fallback or re-throw depending on desired behavior. 
    // For now, re-throw to let the caller handle it, or return a partial result if possible.
    throw error;
  }
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