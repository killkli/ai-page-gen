import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedLearningContent, LearningLevelSuggestions, VocabularyLevel, LearningObjectiveItem, QuizCustomConfig, QuizTypeConfig, QUIZ_TYPE_LIMITS, WritingPracticeContent, SentencePracticePrompt, WritingPracticePrompt, AIFeedback } from '../types';

// 單一欄位生成工具
export const callGemini = async (prompt: string, apiKey: string): Promise<any> => {
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

// 3. 產生 confusingPoints
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

const generateConfusingPointsForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Generate at least 3 (but more is better if appropriate) comprehensive analysis of common misconceptions or difficulties that "${selectedLevel.name}" level learners (${selectedLevel.description}) may have with "${topic}".
    
    Output MUST be a valid JSON array with the following comprehensive structure:
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
    - Each confusing point should include ALL fields above
    - commonErrors: Provide at least 3 typical student mistakes at this level
    - correctVsWrong: Provide at least 1 comparison (more if helpful)  
    - practiceActivities: Provide at least 3 level-appropriate targeted practice activities
    - All text should be in the primary language of the topic
    - Focus on confusion points specific to "${selectedLevel.name}" level: "${selectedLevel.description}"
    
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
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, writingPractice] = await Promise.all([
    generateContentBreakdownForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateEnglishConversationForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateWritingPractice(topic, apiKey, learningObjectives, selectedLevel)
  ]);
  
  return {
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz,
    englishConversation,
    writingPractice
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
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, writingPractice] = await Promise.all([
    generateContentBreakdownForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateEnglishConversationForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateWritingPractice(topic, apiKey, learningObjectives, selectedLevel, vocabularyLevel)
  ]);
  
  return {
    learningObjectives,
    contentBreakdown,
    confusingPoints,
    classroomActivities,
    onlineInteractiveQuiz,
    englishConversation,
    writingPractice
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

const generateConfusingPointsForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Generate at least 3 (but more is better if appropriate) comprehensive analysis of common misconceptions or difficulties that "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}) may have with "${topic}".
    
    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All explanations must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Examples should be appropriate for ${vocabularyLevel.description}
    - Focus on confusion points that arise specifically at this vocabulary level
    
    Output MUST be a valid JSON array with the following comprehensive structure:
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
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives),
    generateEnglishConversation(topic, apiKey, learningObjectives),
    generateLearningLevels(topic, apiKey, learningObjectives),
    generateWritingPractice(topic, apiKey, learningObjectives)
  ]);
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

// 驗證並修正測驗配置的輔助函數
const validateQuizConfig = (config: QuizCustomConfig): QuizCustomConfig => {
  const validateTypeConfig = (typeConfig: QuizTypeConfig): QuizTypeConfig => {
    const validated: QuizTypeConfig = {
      trueFalse: Math.max(0, Math.min(typeConfig.trueFalse, QUIZ_TYPE_LIMITS.trueFalse)),
      multipleChoice: Math.max(0, Math.min(typeConfig.multipleChoice, QUIZ_TYPE_LIMITS.multipleChoice)),
      fillInTheBlanks: Math.max(0, Math.min(typeConfig.fillInTheBlanks, QUIZ_TYPE_LIMITS.fillInTheBlanks)),
      sentenceScramble: Math.max(0, Math.min(typeConfig.sentenceScramble, QUIZ_TYPE_LIMITS.sentenceScramble)),
      memoryCardGame: Math.max(0, Math.min(typeConfig.memoryCardGame, QUIZ_TYPE_LIMITS.memoryCardGame))
    };
    return validated;
  };

  return {
    easy: validateTypeConfig(config.easy),
    normal: validateTypeConfig(config.normal),
    hard: validateTypeConfig(config.hard)
  };
};

// 支援自訂題數的測驗生成函數
export const generateCustomQuiz = async (
  topic: string, 
  apiKey: string, 
  learningObjectives: LearningObjectiveItem[],
  quizConfig: QuizCustomConfig,
  selectedLevel?: any,
  vocabularyLevel?: VocabularyLevel
): Promise<any> => {
  // 驗證並修正配置
  const validatedConfig = validateQuizConfig(quizConfig);
  const generateQuizForDifficulty = async (difficulty: keyof QuizCustomConfig) => {
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
    
    return await callGemini(prompt, apiKey);
  };

  // 並行生成三個難度的測驗
  const [easy, normal, hard] = await Promise.all([
    generateQuizForDifficulty('easy'),
    generateQuizForDifficulty('normal'),
    generateQuizForDifficulty('hard')
  ]);

  return { easy, normal, hard };
};

// 重新生成測驗的便利函數
export const regenerateQuizWithConfig = async (
  topic: string,
  apiKey: string, 
  learningObjectives: LearningObjectiveItem[],
  quizConfig: QuizCustomConfig,
  selectedLevel?: any,
  vocabularyLevel?: VocabularyLevel
): Promise<any> => {
  return await generateCustomQuiz(topic, apiKey, learningObjectives, quizConfig, selectedLevel, vocabularyLevel);
};

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

// 互動學習內容轉換函數
// 將教案內容轉換為適合學生學習的互動內容

// 轉換學習目標為學生友好的內容
export const transformLearningObjectiveForStudent = async (
  objective: any,
  apiKey: string
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
  
  return await callGemini(prompt, apiKey);
};

// 轉換內容分解為學生友好的內容
export const transformContentBreakdownForStudent = async (
  breakdownItem: any,
  apiKey: string
): Promise<any> => {
  const prompt = `
    Transform the following teacher-oriented content breakdown into student-friendly, digestible learning content:
    
    Original Content Breakdown:
    ${JSON.stringify(breakdownItem)}
    
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
  
  return await callGemini(prompt, apiKey);
};

// 轉換易混淆點為學生友好的內容
export const transformConfusingPointForStudent = async (
  confusingPoint: any,
  apiKey: string
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
  
  return await callGemini(prompt, apiKey);
};

// 為特定學習步驟生成測驗
export const generateStepQuiz = async (
  stepContent: any,
  stepType: 'objective' | 'breakdown' | 'confusing',
  apiKey: string,
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
            { "left": "概念或問題", "right": "定義或答案" },
            { "left": "概念或問題", "right": "定義或答案" },
            { "left": "概念或問題", "right": "定義或答案" },
            { "left": "概念或問題", "right": "定義或答案" },
            { "left": "概念或問題", "right": "定義或答案" }
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
  
  return await callGemini(prompt, apiKey);
};
