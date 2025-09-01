import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedLearningContent, LearningLevelSuggestions } from '../types';

// 單一欄位生成工具
const callGemini = async (prompt: string, apiKey: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    if (!response.text) throw new Error("AI 回傳內容為空，請重試或檢查 API 金鑰。");
    let jsonStr = response.text.trim();
    // 先移除 code block fence
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
    // 嘗試抓出第一個合法 JSON 區塊（{} 或 []）
    if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[") && (jsonStr.includes("{") || jsonStr.includes("["))) {
      const objStart = jsonStr.indexOf("{");
      const arrStart = jsonStr.indexOf("[");
      let jsonStart = -1;
      let jsonEnd = -1;
      if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
        // 以 { 開頭
        jsonStart = objStart;
        jsonEnd = jsonStr.lastIndexOf("}");
      } else if (arrStart !== -1) {
        // 以 [ 開頭
        jsonStart = arrStart;
        jsonEnd = jsonStr.lastIndexOf("]");
      }
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
      }
    }
    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      // log 原始內容方便 debug
      console.error("AI 回傳原始內容 (JSON parse 失敗):", response.text);
      throw new Error("AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。");
    }
  } catch (error) {
    let errorMessage = "無法產生內容。";
    if (error instanceof Error) errorMessage += ` 詳細資料： ${error.message}`;
    if (error && typeof error === 'object' && 'message' in error) {
      const typedError = error as { message: string, toString: () => string };
      if (typedError.message.includes("API key not valid") || typedError.message.includes("API_KEY_INVALID")) {
        errorMessage = "Gemini API 金鑰無效。請檢查您的設定。";
      } else if (typedError.message.includes("quota") || typedError.message.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "已超出 API 配額。請稍後再試。";
      } else if (typedError.message.toLowerCase().includes("json") || typedError.message.includes("Unexpected token")) {
        errorMessage = "AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。";
      }
    }
    throw new Error(errorMessage);
  }
};

// 1. 產生 learningObjectives
const generateLearningObjectives = async (topic: string, apiKey: string): Promise<string[]> => {
  const prompt = `
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${topic}".
    The objectives should be based on scaffolding theory and gamification, and written in the primary language of the topic.
    Output MUST be a valid JSON array of strings, e.g.:
    [
      "能夠理解${topic}的基本概念",
      "能夠應用${topic}於實際情境",
      "能夠辨識${topic}常見的誤區",
      "能夠分析${topic}的進階應用",
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

// 2. 產生 contentBreakdown
const generateContentBreakdown = async (topic: string, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please break down the topic "${topic}" into at least 3 (but more is better if appropriate) micro-units. For each, provide a sub-topic, a brief explanation, and a concrete teaching example (such as a sample sentence, scenario, or application).
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "topic": "子主題A", "details": "子主題A的簡要說明...", "teachingExample": "子主題A的教學示例..." },
      { "topic": "子主題B", "details": "子主題B的簡要說明...", "teachingExample": "子主題B的教學示例..." },
      { "topic": "子主題C", "details": "子主題C的簡要說明...", "teachingExample": "子主題C的教學示例..." },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

// 3. 產生 confusingPoints
const generateConfusingPoints = async (topic: string, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    List at least 3 (but more is better if appropriate) common misconceptions or difficulties students may have with "${topic}", and provide a clarification and a concrete teaching example for each (such as a sample sentence, scenario, or application).
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "point": "常見誤區X", "clarification": "詳細說明...", "teachingExample": "誤區X的教學示例..." },
      { "point": "潛在困難Y", "clarification": "如何克服...", "teachingExample": "困難Y的教學示例..." },
      { "point": "誤解Z", "clarification": "澄清說明...", "teachingExample": "誤解Z的教學示例..." },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

// 4. 產生 classroomActivities
const generateClassroomActivities = async (topic: string, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Suggest at least 3 (but more is better if appropriate) engaging, interactive classroom activities (preferably game-like) for the topic "${topic}".
    For each activity, provide the following fields:
      - title: The name of the activity
      - description: A brief description of how the activity works
      - objective: The main learning goal or purpose of the activity
      - materials: What materials or props are needed (if any)
      - environment: Any special environment or space requirements (e.g., classroom, outdoors, online, etc.)
    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "title": "遊戲化活動1",
        "description": "活動1的玩法簡述...",
        "objective": "活動1的學習目標...",
        "materials": "所需教材或道具...",
        "environment": "教室/戶外/線上等需求..."
      },
      // ... more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

// 5. 產生 onlineInteractiveQuiz
const generateOnlineInteractiveQuiz = async (topic: string, apiKey: string, learningObjectives: string[]): Promise<any> => {
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
  return await callGemini(prompt, apiKey);
};

// 6. 產生 englishConversation
const generateEnglishConversation = async (topic: string, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
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
  return await callGemini(prompt, apiKey);
};

// 針對特定程度的內容生成函數
const generateLearningObjectivesForLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<string[]> => {
  const prompt = `
    Based on the topic "${topic}" and the selected learning level "${selectedLevel.name}" (${selectedLevel.description}),
    please generate at least 3 specific learning objectives that are appropriate for this level.
    The objectives should be tailored to the learner's level and capabilities described in: "${selectedLevel.description}".
    
    Output MUST be a valid JSON array of strings, e.g.:
    [
      "能夠理解${topic}在${selectedLevel.name}程度的核心概念",
      "能夠應用${topic}的${selectedLevel.name}級技能",
      "能夠識別${topic}在此程度的重要特點"
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateContentBreakdownForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
  const prompt = `
    Based on the topic "${topic}", selected learning level "${selectedLevel.name}" (${selectedLevel.description}), 
    and learning objectives: ${JSON.stringify(learningObjectives)}
    
    Please break down the topic into at least 3 micro-units appropriate for "${selectedLevel.name}" level learners.
    The content depth and complexity should match the level description: "${selectedLevel.description}".
    
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "topic": "適合${selectedLevel.name}的子主題A", "details": "針對${selectedLevel.name}程度的詳細說明...", "teachingExample": "適合此程度的教學示例..." },
      { "topic": "適合${selectedLevel.name}的子主題B", "details": "針對${selectedLevel.name}程度的詳細說明...", "teachingExample": "適合此程度的教學示例..." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateConfusingPointsForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
  const prompt = `
    Based on the topic "${topic}", selected learning level "${selectedLevel.name}" (${selectedLevel.description}), 
    and learning objectives: ${JSON.stringify(learningObjectives)}
    
    Please identify at least 3 confusing points that learners at "${selectedLevel.name}" level typically encounter.
    Focus on confusion points that are relevant to their current learning stage: "${selectedLevel.description}".
    
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "point": "對${selectedLevel.name}學習者常見的困惑點A", "clarification": "針對此程度的澄清說明...", "teachingExample": "適合此程度的教學示例..." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateClassroomActivitiesForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
  const prompt = `
    Based on the topic "${topic}", selected learning level "${selectedLevel.name}" (${selectedLevel.description}), 
    and learning objectives: ${JSON.stringify(learningObjectives)}
    
    Please design at least 2 classroom activities suitable for "${selectedLevel.name}" level learners.
    Activities should match the complexity and capabilities described in: "${selectedLevel.description}".
    
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { 
        "title": "適合${selectedLevel.name}的活動標題", 
        "description": "針對此程度設計的活動描述...", 
        "objective": "符合${selectedLevel.name}能力的活動目標",
        "materials": "此程度所需的教材",
        "environment": "適合的環境需求"
      }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateOnlineInteractiveQuizForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: string[]): Promise<any> => {
  const prompt = `
    Based on the topic "${topic}", selected learning level "${selectedLevel.name}" (${selectedLevel.description}), 
    and learning objectives: ${JSON.stringify(learningObjectives)}
    
    Please generate interactive quiz questions appropriate for "${selectedLevel.name}" level learners.
    Question difficulty and complexity should match: "${selectedLevel.description}".
    
    Output MUST be a valid JSON object with this structure:
    {
      "easy": { /* questions for warm-up */ },
      "normal": { /* questions matching the selected level */ },
      "hard": { /* challenging questions for this level */ }
    }
    
    Each difficulty should contain: trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble arrays.
    Adjust complexity appropriately for "${selectedLevel.name}" learners.
    
    Do NOT include any explanation or extra text. Only output the JSON object.
  `;
  return await callGemini(prompt, apiKey);
};

const generateEnglishConversationForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: string[]): Promise<any[]> => {
  const prompt = `
    Based on the topic "${topic}", selected learning level "${selectedLevel.name}" (${selectedLevel.description}), 
    and learning objectives: ${JSON.stringify(learningObjectives)}
    
    Please generate an English conversation about "${topic}" appropriate for "${selectedLevel.name}" level learners.
    Language complexity and vocabulary should match: "${selectedLevel.description}".
    
    Output MUST be a valid JSON array, e.g.:
    [
      { "speaker": "Speaker A", "line": "English suitable for ${selectedLevel.name} level..." },
      { "speaker": "Speaker B", "line": "Response appropriate for this level..." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

// 7. 產生 learningLevels (學習程度建議)
const generateLearningLevels = async (topic: string, apiKey: string, learningObjectives: string[]): Promise<LearningLevelSuggestions> => {
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

// 第一階段：僅產生學習程度建議
export const generateLearningLevelSuggestions = async (topic: string, apiKey: string): Promise<LearningLevelSuggestions> => {
  if (!apiKey) {
    throw new Error("Gemini API 金鑰未正確設定或遺失。請檢查應用程式的環境設定。");
  }
  
  // 先產生基本的學習目標來輔助程度建議
  const basicObjectives = await generateLearningObjectives(topic, apiKey);
  return await generateLearningLevels(topic, apiKey, basicObjectives);
};

// 第二階段：根據選定的程度產生完整學習內容
export const generateLearningPlanWithLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<GeneratedLearningContent> => {
  if (!apiKey) {
    throw new Error("Gemini API 金鑰未正確設定或遺失。請檢查應用程式的環境設定。");
  }
  
  // 1. 根據選定程度重新產生更精確的學習目標
  const learningObjectives = await generateLearningObjectivesForLevel(topic, selectedLevel, apiKey);
  
  // 2. 其他部分並行產生，都會考慮選定的程度
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation] = await Promise.all([
    generateContentBreakdownForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateEnglishConversationForLevel(topic, selectedLevel, apiKey, learningObjectives)
  ]);
  
  return {
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz,
    englishConversation
  };
};

// 原本的主函式保持兼容性
export const generateLearningPlan = async (topic: string, apiKey: string): Promise<GeneratedLearningContent> => {
  if (!apiKey) {
    throw new Error("Gemini API 金鑰未正確設定或遺失。請檢查應用程式的環境設定。");
  }
  // 1. 先產生 learningObjectives
  const learningObjectives = await generateLearningObjectives(topic, apiKey);
  // 2. 其他部分並行產生
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives),
    generateEnglishConversation(topic, apiKey, learningObjectives),
    generateLearningLevels(topic, apiKey, learningObjectives)
  ]);
  return {
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz,
    englishConversation,
    learningLevels
  };
};
