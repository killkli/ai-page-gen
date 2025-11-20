import { LearningObjectiveItem } from '../../types';
import { callProviderSystem } from './basicGenerators';

// =============================================================================
// Level-Specific Functions - 針對特定程度的內容生成函數
// =============================================================================

// 針對特定程度的學習目標生成函數
export const generateLearningObjectivesForLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<any[]> => {
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
  return await callProviderSystem(prompt, apiKey);
};

// 針對特定程度的內容細分生成函數
// 針對特定程度的內容細分生成函數 (Chunked Version)
const generateContentBreakdownForLevelAndObjective = async (topic: string, selectedLevel: any, apiKey: string, objective: LearningObjectiveItem, isEnglishLearning: boolean, index: number): Promise<any[]> => {
  const unitNumber = index + 1;
  const prompt = `
    Based on the topic "${topic}" and this specific learning objective (Objective ${unitNumber}):
    ${JSON.stringify(objective)}
    
    Please generate **at least 2 specific micro-units** (sub-topics) appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}).
    The content depth and complexity should match the level description: "${selectedLevel.description}".

    For each, provide a sub-topic, a brief explanation, and a concrete teaching example.
    - topic: MUST start with "Unit ${unitNumber}.[Sub-unit]" (e.g., "Unit ${unitNumber}.1: [Name]").

    ${isEnglishLearning ? `
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句 (array of 3-5 teaching example sentences)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)

    Output format for English learning topics:
    [
      {
        "topic": "Unit ${unitNumber}.1: 適合${selectedLevel.name}的子主題A",
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
      { "topic": "Unit ${unitNumber}.1: 適合${selectedLevel.name}的子主題A", "details": "子主題A針對${selectedLevel.name}程度的簡要說明...", "teachingExample": "子主題A適合此程度的教學示例..." }
    ]
    `}

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callProviderSystem(prompt, apiKey);
};

export const generateContentBreakdownForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  // Detect if this is English language learning
  const isEnglishLearning = /english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(topic);

  console.log(`Starting chunked content breakdown generation for topic: ${topic}, level: ${selectedLevel.name}`);

  try {
    // Process objectives in parallel
    const results = await Promise.all(
      learningObjectives.map((objective, index) =>
        generateContentBreakdownForLevelAndObjective(topic, selectedLevel, apiKey, objective, isEnglishLearning, index)
          .catch(err => {
            console.warn(`Failed to generate breakdown for objective: ${objective.objective}`, err);
            return [];
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

// 針對特定程度的易混淆點生成函數
// 針對特定程度的易混淆點生成函數 (Chunked Version)
const generateSingleConfusingPointForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[], index: number): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Generate **ONE** comprehensive analysis of a common misconception or difficulty that "${selectedLevel.name}" level learners (${selectedLevel.description}) may have with "${topic}".
    This is request #${index + 1}, so please try to find a unique point if possible.

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
  return await callProviderSystem(prompt, apiKey);
};

export const generateConfusingPointsForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  console.log(`Starting chunked confusing points generation for topic: ${topic}, level: ${selectedLevel.name}`);

  try {
    const results = await Promise.all([
      generateSingleConfusingPointForLevel(topic, selectedLevel, apiKey, learningObjectives, 0),
      generateSingleConfusingPointForLevel(topic, selectedLevel, apiKey, learningObjectives, 1),
      generateSingleConfusingPointForLevel(topic, selectedLevel, apiKey, learningObjectives, 2)
    ]);

    return results.flat();
  } catch (error) {
    console.error("Error generating chunked confusing points:", error);
    throw error;
  }
};

// 針對特定程度的課堂活動生成函數
export const generateClassroomActivitiesForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
  return await callProviderSystem(prompt, apiKey);
};

// 針對特定程度的線上互動測驗生成函數
export const generateOnlineInteractiveQuizForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any> => {
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
  return await callProviderSystem(prompt, apiKey);
};

// 針對特定程度的英語對話生成函數
export const generateEnglishConversationForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
  return await callProviderSystem(prompt, apiKey);
};
