import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedLearningContent, LearningLevelSuggestions, VocabularyLevel, LearningObjectiveItem } from '../types';

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
  return await callGemini(prompt, apiKey);
};

// 2. 產生 contentBreakdown
const generateContentBreakdown = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
const generateConfusingPoints = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
  return await callGemini(prompt, apiKey);
};

// 5. 產生 onlineInteractiveQuiz
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
  return await callGemini(prompt, apiKey);
};

// 6. 產生 englishConversation
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
  return await callGemini(prompt, apiKey);
};

// 針對特定程度的內容生成函數
const generateLearningObjectivesForLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<any[]> => {
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

const generateContentBreakdownForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please break down the topic "${topic}" into at least 3 (but more is better if appropriate) micro-units appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}). For each, provide a sub-topic, a brief explanation, and a concrete teaching example (such as a sample sentence, scenario, or application).
    The content depth and complexity should match the level description: "${selectedLevel.description}".
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "topic": "適合${selectedLevel.name}的子主題A", "details": "子主題A針對${selectedLevel.name}程度的簡要說明...", "teachingExample": "子主題A適合此程度的教學示例..." },
      { "topic": "適合${selectedLevel.name}的子主題B", "details": "子主題B針對${selectedLevel.name}程度的簡要說明...", "teachingExample": "子主題B適合此程度的教學示例..." },
      { "topic": "適合${selectedLevel.name}的子主題C", "details": "子主題C針對${selectedLevel.name}程度的簡要說明...", "teachingExample": "子主題C適合此程度的教學示例..." },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateConfusingPointsForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    List at least 3 (but more is better if appropriate) common misconceptions or difficulties that "${selectedLevel.name}" level learners (${selectedLevel.description}) may have with "${topic}", and provide a clarification and a concrete teaching example for each (such as a sample sentence, scenario, or application).
    Focus on confusion points that are relevant to their current learning stage: "${selectedLevel.description}".
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "point": "對${selectedLevel.name}學習者的常見誤區X", "clarification": "詳細說明...", "teachingExample": "誤區X針對此程度的教學示例..." },
      { "point": "${selectedLevel.name}程度的潛在困難Y", "clarification": "如何克服...", "teachingExample": "困難Y針對此程度的教學示例..." },
      { "point": "此程度學習者的誤解Z", "clarification": "澄清說明...", "teachingExample": "誤解Z針對此程度的教學示例..." },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateClassroomActivitiesForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Suggest at least 3 (but more is better if appropriate) engaging, interactive classroom activities (preferably game-like) for the topic "${topic}" suitable for "${selectedLevel.name}" level learners (${selectedLevel.description}).
    Activities should match the complexity and capabilities described in: "${selectedLevel.description}".
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
        "title": "適合${selectedLevel.name}的遊戲化活動1",
        "description": "活動1針對此程度的核心概念與玩法簡述...",
        "objective": "活動1符合${selectedLevel.name}程度的學習目標...",
        "timing": "適用於單元導入/單元後/複習時等...",
        "materials": "此程度所需教材、道具或工具...",
        "environment": "座位安排、空間需求、設備條件...",
        "steps": ["步驟1: 教師說明規則...", "步驟2: 學生分組...", "步驟3: 進行活動..."],
        "assessmentPoints": ["觀察學生參與度", "檢查概念理解程度", "評估協作能力"]
      },
      // ... more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateOnlineInteractiveQuizForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any> => {
  const prompt = `
    基於主題「${topic}」、選定的學習程度「${selectedLevel.name}」(${selectedLevel.description})，
    以及學習目標：${JSON.stringify(learningObjectives)}
    
    請產生適合「${selectedLevel.name}」程度學習者的互動測驗題目。
    題目難度和複雜度應符合：「${selectedLevel.description}」。
    
    輸出必須是有效的 JSON 物件，格式如下：
    {
      "easy": {
        "trueFalse": [
          { "statement": "暖身判斷題1...", "isTrue": true, "explanation": "可選說明1" },
          { "statement": "暖身判斷題2...", "isTrue": false, "explanation": "可選說明2" }
          // ... 至少 5 題，若有更多更好
        ],
        "multipleChoice": [
          { "question": "暖身選擇題1...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 0 },
          { "question": "暖身選擇題2...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 1 }
          // ... 至少 5 題，若有更多更好
        ],
        "fillInTheBlanks": [
          { "sentenceWithBlank": "暖身填空題1...____...", "correctAnswer": "正確答案1" },
          { "sentenceWithBlank": "暖身填空題2...____...", "correctAnswer": "正確答案2" }
          // ... 至少 5 題，若有更多更好
        ],
        "sentenceScramble": [
          { "originalSentence": "暖身句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "暖身句子2...", "scrambledWords": ["...", "...", "..."] }
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
      "normal": { /* 符合所選程度的題目，結構同 easy，memoryCardGame 只 1 題，pairs 至少 5 組 */ },
      "hard": { /* 此程度的挑戰題目，結構同 easy，memoryCardGame 只 1 題，pairs 至少 5 組 */ }
    }
    
    對於每種測驗類型 (trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble)，每個難度等級 (easy, normal, hard) 至少產生 5 題，若有更多更好。
    對於 memoryCardGame，每個難度只產生 1 題，但內部的 "pairs" 陣列必須包含至少 5 組配對（每組配對是與「${topic}」相關的概念、詞彙/定義、問答或翻譯），若有更多更好。
    每個 memoryCardGame 題目都應包含清楚的 "instructions" 說明配對任務。
    所有文字使用主題的主要語言。請勿包含任何說明或額外文字，僅輸出 JSON 物件。
  `;
  return await callGemini(prompt, apiKey);
};

const generateEnglishConversationForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate a short, natural English conversation (at least 3 lines, but more is better if appropriate, 2 speakers) about the topic "${topic}" (use English translation if topic is not English) appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}).
    Language complexity and vocabulary should match: "${selectedLevel.description}".
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

// 7. 產生 learningLevels (學習程度建議)
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

// 檢測主題是否為英語相關
export const isEnglishRelatedTopic = (topic: string): boolean => {
  const englishKeywords = [
    'english', 'grammar', 'vocabulary', 'pronunciation', 'speaking', 'writing', 'reading', 'listening',
    'conversation', 'toefl', 'ielts', 'toeic', 'english literature', 'business english', 'academic english',
    'phrasal verbs', 'idioms', 'prepositions', 'tenses', 'articles', 'adjectives', 'adverbs', 'nouns', 'verbs',
    '英語', '英文', '文法', '單字', '發音', '口說', '寫作', '閱讀', '聽力', 
    '對話', '會話', '托福', '雅思', '多益', '商業英文', '學術英文',
    '片語動詞', '慣用語', '介系詞', '時態', '冠詞', '形容詞', '副詞', '名詞', '動詞'
  ];
  
  const topicLower = topic.toLowerCase();
  return englishKeywords.some(keyword => topicLower.includes(keyword.toLowerCase()));
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

// 第三階段：根據選定的程度和單字量產生英語內容
export const generateLearningPlanWithVocabularyLevel = async (
  topic: string, 
  selectedLevel: any, 
  vocabularyLevel: VocabularyLevel, 
  apiKey: string
): Promise<GeneratedLearningContent> => {
  if (!apiKey) {
    throw new Error("Gemini API 金鑰未正確設定或遺失。請檢查應用程式的環境設定。");
  }
  
  // 1. 根據選定程度和單字量重新產生更精確的學習目標
  const learningObjectives = await generateLearningObjectivesForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey);
  
  // 2. 其他部分並行產生，都會考慮選定的程度和單字量
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation] = await Promise.all([
    generateContentBreakdownForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateEnglishConversationForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives)
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

// 針對單字量的內容生成函數
const generateLearningObjectivesForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string): Promise<LearningObjectiveItem[]> => {
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

const generateContentBreakdownForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please break down the topic "${topic}" into at least 3 (but more is better if appropriate) micro-units appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}). For each, provide a sub-topic, a brief explanation, and a concrete teaching example (such as a sample sentence, scenario, or application).
    
    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Teaching examples should match ${vocabularyLevel.description}
    - Avoid complex words that exceed this vocabulary level
    - Sentence structures should be appropriate for ${vocabularyLevel.name} learners
    
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "topic": "適合${vocabularyLevel.name}的子主題A", "details": "子主題A針對${vocabularyLevel.wordCount}詞彙量的簡要說明...", "teachingExample": "子主題A使用${vocabularyLevel.name}程度詞彙的教學示例..." },
      { "topic": "適合${vocabularyLevel.name}的子主題B", "details": "子主題B針對${vocabularyLevel.wordCount}詞彙量的簡要說明...", "teachingExample": "子主題B使用${vocabularyLevel.name}程度詞彙的教學示例..." },
      { "topic": "適合${vocabularyLevel.name}的子主題C", "details": "子主題C針對${vocabularyLevel.wordCount}詞彙量的簡要說明...", "teachingExample": "子主題C使用${vocabularyLevel.name}程度詞彙的教學示例..." },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateConfusingPointsForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    List at least 3 (but more is better if appropriate) common misconceptions or difficulties that "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}) may have with "${topic}", and provide a clarification and a concrete teaching example for each (such as a sample sentence, scenario, or application).
    
    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - Explanations must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Examples should be appropriate for ${vocabularyLevel.description}
    - Focus on confusion points that arise specifically at this vocabulary level
    
    Output MUST be a valid JSON array of objects, e.g.:
    [
      { "point": "對${vocabularyLevel.name}學習者的常見誤區X", "clarification": "詳細說明...", "teachingExample": "誤區X使用${vocabularyLevel.name}程度詞彙的教學示例..." },
      { "point": "${vocabularyLevel.name}程度的潛在困難Y", "clarification": "如何克服...", "teachingExample": "困難Y使用${vocabularyLevel.name}程度詞彙的教學示例..." },
      { "point": "此詞彙程度學習者的誤解Z", "clarification": "澄清說明...", "teachingExample": "誤解Z使用${vocabularyLevel.name}程度詞彙的教學示例..." },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateClassroomActivitiesForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Suggest at least 3 (but more is better if appropriate) engaging, interactive classroom activities (preferably game-like) for the topic "${topic}" suitable for "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}).
    
    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - Activity instructions must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Activity content should match ${vocabularyLevel.description}
    - Consider vocabulary limitations when designing complexity
    
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
        "title": "適合${vocabularyLevel.name}的遊戲化活動1",
        "description": "活動1針對${vocabularyLevel.wordCount}詞彙量的核心概念與玩法簡述...",
        "objective": "活動1符合${vocabularyLevel.name}程度的學習目標...",
        "timing": "適用於單元導入/單元後/複習時等...",
        "materials": "適合此詞彙程度的教材、道具或工具...",
        "environment": "座位安排、空間需求、設備條件...",
        "steps": ["步驟1: 教師說明規則...", "步驟2: 學生分組...", "步驟3: 進行活動..."],
        "assessmentPoints": ["觀察學生參與度", "檢查概念理解程度", "評估協作能力"]
      },
      // ... more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
};

const generateOnlineInteractiveQuizForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate quiz content for "${topic}" suitable for learning level "${selectedLevel.name}" (${selectedLevel.description}) and English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}).
    
    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text in quiz questions, options, and examples must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Sentence structures should be appropriate for ${vocabularyLevel.description}
    - Avoid advanced vocabulary that exceeds this level
    
    Output in the following JSON structure (no explanation, no extra text):
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
    All text must be in the primary language of the topic. For English learning topics, limit English vocabulary to ${vocabularyLevel.wordCount} most common words. Only output the JSON object, no explanation or extra text.
  `;
  return await callGemini(prompt, apiKey);
};

const generateEnglishConversationForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate a short, natural English conversation (at least 3 lines, but more is better if appropriate, 2 speakers) about the topic "${topic}" (use English translation if topic is not English) appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}).
    
    CRITICAL VOCABULARY CONSTRAINTS:
    - Use ONLY vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Sentence structures must be appropriate for ${vocabularyLevel.description}
    - Conversation complexity should match ${vocabularyLevel.name} level
    - Avoid advanced vocabulary that exceeds this level
    - Keep sentences simple and clear for ${vocabularyLevel.name} learners
    
    Output MUST be a valid JSON array, e.g.:
    [
      { "speaker": "Speaker A", "line": "Hello! Let's talk about ${topic} using simple words for ${vocabularyLevel.name} level." },
      { "speaker": "Speaker B", "line": "Great idea! What should we discuss first about ${topic}?" },
      { "speaker": "Speaker A", "line": "Perhaps we can start with..." },
      { "speaker": "Speaker B", "line": "I think examples would help." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callGemini(prompt, apiKey);
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
