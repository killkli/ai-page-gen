import { LearningObjectiveItem, VocabularyLevel } from '../../types';
import { callProviderSystem } from './basicGenerators';

// =============================================================================
// Level AND Vocabulary Functions - 針對特定程度和單字量的內容生成函數
// =============================================================================

// 針對特定程度和單字量的學習目標生成函數
export const generateLearningObjectivesForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string): Promise<LearningObjectiveItem[]> => {
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
  return await callProviderSystem(prompt, apiKey);
};

// 針對特定程度和單字量的內容細分生成函數
// 針對特定程度和單字量的內容細分生成函數 (Chunked Version)
const generateContentBreakdownForLevelAndVocabularyAndObjective = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, objective: LearningObjectiveItem, isEnglishLearning: boolean, index: number): Promise<any[]> => {
  const unitNumber = index + 1;
  const prompt = `
    Based on the topic "${topic}" and this specific learning objective (Objective ${unitNumber}):
    ${JSON.stringify(objective)}
    
    Please generate **at least 2 specific micro-units** (sub-topics) appropriate for "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}).

    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text must use vocabulary within the ${vocabularyLevel.wordCount} most common English words
    - Teaching examples should match ${vocabularyLevel.description}
    - Avoid complex words that exceed this vocabulary level
    - Sentence structures should be appropriate for ${vocabularyLevel.name} learners

    For each, provide a sub-topic, a brief explanation, and a concrete teaching example.
    - topic: MUST start with "Unit ${unitNumber}.[Sub-unit]" (e.g., "Unit ${unitNumber}.1: [Name]").

    ${isEnglishLearning ? `
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句，使用${vocabularyLevel.wordCount}詞彙範圍 (array of 3-5 teaching sentences using vocabulary within ${vocabularyLevel.wordCount} words)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)

    Output format for English learning topics:
    [
      {
        "topic": "Unit ${unitNumber}.1: 適合${vocabularyLevel.name}的子主題A",
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
      { "topic": "Unit ${unitNumber}.1: 適合${vocabularyLevel.name}的子主題A", "details": "子主題A針對${vocabularyLevel.wordCount}詞彙量的簡要說明...", "teachingExample": "子主題A使用${vocabularyLevel.name}程度詞彙的教學示例..." }
    ]
    `}

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;
  return await callProviderSystem(prompt, apiKey);
};

export const generateContentBreakdownForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  // Detect if this is English language learning
  const isEnglishLearning = /english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(topic);

  console.log(`Starting chunked content breakdown generation for topic: ${topic}, level: ${selectedLevel.name}, vocab: ${vocabularyLevel.name}`);

  try {
    // Process objectives in parallel
    const results = await Promise.all(
      learningObjectives.map((objective, index) =>
        generateContentBreakdownForLevelAndVocabularyAndObjective(topic, selectedLevel, vocabularyLevel, apiKey, objective, isEnglishLearning, index)
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

// 針對特定程度和單字量的易混淆點生成函數
// 針對特定程度和單字量的易混淆點生成函數 (Chunked Version)
const generateSingleConfusingPointForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[], index: number): Promise<any[]> => {
  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Generate **ONE** comprehensive analysis of a common misconception or difficulty that "${selectedLevel.name}" level learners (${selectedLevel.description}) with English vocabulary level "${vocabularyLevel.name}" (${vocabularyLevel.wordCount} words: ${vocabularyLevel.description}) may have with "${topic}".
    This is request #${index + 1}, so please try to find a unique point if possible.

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
  return await callProviderSystem(prompt, apiKey);
};

export const generateConfusingPointsForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
  console.log(`Starting chunked confusing points generation for topic: ${topic}, level: ${selectedLevel.name}, vocab: ${vocabularyLevel.name}`);

  try {
    const results = await Promise.all([
      generateSingleConfusingPointForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives, 0),
      generateSingleConfusingPointForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives, 1),
      generateSingleConfusingPointForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives, 2)
    ]);

    return results.flat();
  } catch (error) {
    console.error("Error generating chunked confusing points:", error);
    throw error;
  }
};

// 針對特定程度和單字量的課堂活動生成函數
export const generateClassroomActivitiesForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
  return await callProviderSystem(prompt, apiKey);
};

// 針對特定程度和單字量的線上互動測驗生成函數
export const generateOnlineInteractiveQuizForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[], isMath: boolean = false): Promise<any> => {
  const sentenceScrambleSection = isMath ? "" : `
        "sentenceScramble": [
          { "originalSentence": "簡單句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "簡單句子2...", "scrambledWords": ["...", "...", "..."] }
          // ... 至少 5 題，若有更多更好
        ],`;

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
        ],${sentenceScrambleSection}
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
    For each quiz type (trueFalse, multipleChoice, fillInTheBlanks${isMath ? '' : ', sentenceScramble'}), generate at least 5 questions per difficulty level (easy, normal, hard), but more is better if appropriate.
    For memoryCardGame, generate ONLY 1 question per difficulty, but the "pairs" array inside must contain at least 5 pairs (each pair is a related concept, word/definition, Q&A, or translation relevant to '${topic}'), and more is better if appropriate.
    Each memoryCardGame question should include clear "instructions" for the matching task.
    All text must be in the primary language of the topic. For English learning topics, limit English vocabulary to ${vocabularyLevel.wordCount} most common words. Only output the JSON object, no explanation or extra text.
  `;
  return await callProviderSystem(prompt, apiKey);
};

// 針對特定程度和單字量的英語對話生成函數
export const generateEnglishConversationForLevelAndVocabulary = async (topic: string, selectedLevel: any, vocabularyLevel: VocabularyLevel, apiKey: string, learningObjectives: LearningObjectiveItem[]): Promise<any[]> => {
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
  return await callProviderSystem(prompt, apiKey);
};