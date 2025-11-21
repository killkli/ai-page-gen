import { LearningObjectiveItem, VocabularyLevel, QuizCustomConfig, QuizTypeConfig, QUIZ_TYPE_LIMITS } from '../../types';
import { callGemini } from './core';

// 5. 產生 onlineInteractiveQuiz
export const generateOnlineInteractiveQuiz = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[], isMath: boolean = false): Promise<any> => {
    const sentenceScrambleSection = isMath ? "" : `
        "sentenceScramble": [
          { "originalSentence": "簡單句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "簡單句子2...", "scrambledWords": ["...", "...", "..."] }
          // ... 至少 5 題，若有更多更好
        ],`;

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
    All text must be in the primary language of the topic. Only output the JSON object, no explanation or extra text.
  `;
    return await callGemini(prompt, apiKey);
};

export const generateOnlineInteractiveQuizForLevel = async (topic: string, selectedLevel: any, apiKey: string, learningObjectives: LearningObjectiveItem[], isMath: boolean = false): Promise<any> => {
    const sentenceScrambleSection = isMath ? "" : `
        "sentenceScramble": [
          { "originalSentence": "暖身句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "暖身句子2...", "scrambledWords": ["...", "...", "..."] }
          // ... 至少 5 題，若有更多更好
        ],`;

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
      "normal": { /* 符合所選程度的題目，結構同 easy，memoryCardGame 只 1 題，pairs 至少 5 組 */ },
      "hard": { /* 此程度的挑戰題目，結構同 easy，memoryCardGame 只 1 題，pairs 至少 5 組 */ }
    }
    
    對於每種測驗類型 (trueFalse, multipleChoice, fillInTheBlanks${isMath ? '' : ', sentenceScramble'})，每個難度等級 (easy, normal, hard) 至少產生 5 題，若有更多更好。
    對於 memoryCardGame，每個難度只產生 1 題，但內部的 "pairs" 陣列必須包含至少 5 組配對（每組配對是與「${topic}」相關的概念、詞彙/定義、問答或翻譯），若有更多更好。
    每個 memoryCardGame 題目都應包含清楚的 "instructions" 說明配對任務。
    所有文字使用主題的主要語言。請勿包含任何說明或額外文字，僅輸出 JSON 物件。
  `;
    return await callGemini(prompt, apiKey);
};

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
          // ... 至少 5 題，若有更多更好
        ],
        ${sentenceScrambleSection}
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

// 檢查記憶卡遊戲是否有重複內容
const validateMemoryCardGame = (memoryCardData: any[]): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];

    for (const game of memoryCardData) {
        if (!game.pairs || !Array.isArray(game.pairs)) continue;

        const leftContents = game.pairs.map((pair: Record<string, string>) => pair.left?.toLowerCase().trim()).filter(Boolean);
        const rightContents = game.pairs.map((pair: Record<string, string>) => pair.right?.toLowerCase().trim()).filter(Boolean);

        // 檢查左側內容重複
        const leftDuplicates = leftContents.filter((item: string, index: number) => leftContents.indexOf(item) !== index);
        if (leftDuplicates.length > 0) {
            issues.push(`記憶卡左側有重複內容: ${leftDuplicates.join(', ')}`);
        }

        // 檢查右側內容重複
        const rightDuplicates = rightContents.filter((item: string, index: number) => rightContents.indexOf(item) !== index);
        if (rightDuplicates.length > 0) {
            issues.push(`記憶卡右側有重複內容: ${rightDuplicates.join(', ')}`);
        }

        // 檢查左右側交叉重複
        const crossDuplicates = leftContents.filter((left: string) => rightContents.includes(left));
        if (crossDuplicates.length > 0) {
            issues.push(`記憶卡左右側有交叉重複內容: ${crossDuplicates.join(', ')}`);
        }
    }

    return { isValid: issues.length === 0, issues };
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
    const quizData = await callGemini(prompt, apiKey);

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
