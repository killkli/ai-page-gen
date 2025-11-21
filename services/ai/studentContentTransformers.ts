import { LearningObjectiveItem, WritingPracticeContent, VocabularyLevel, SentencePracticePrompt, WritingPracticePrompt, AIFeedback } from '../../types';
import { callProviderSystem } from './basicGenerators';

// =============================================================================
// Student Content Transformation Functions - 學生內容轉換函數
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

    return await callProviderSystem(prompt, _apiKey);
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
  apiKey: string,
  vocabularyLevel?: VocabularyLevel
): Promise<AIFeedback> => {
  const isEnglish = /[a-zA-Z]/.test(studentWork);

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
    - Grammar accuracy and sentence structure
    - Vocabulary appropriateness and variety
    - Content relevance to the prompt
    - Clarity and coherence
    - Appropriate use of language for the target level
    ${vocabularyLevel ? `- Adherence to ${vocabularyLevel.name} vocabulary constraints` : ''}

    Provide constructive, encouraging feedback that helps the student improve.
    All feedback text should be in Traditional Chinese except for specific English examples in corrections.
    Do NOT include any explanation or extra text outside the JSON structure.
  `;

  return await callProviderSystem(feedbackPrompt, apiKey);
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
    callProviderSystem(sentencePracticePrompt, apiKey),
    callProviderSystem(writingPracticePrompt, apiKey)
  ]);

  return {
    sentencePractice,
    writingPractice,
    instructions: `這裡提供了造句和寫作練習，幫助學習者提升語言表達能力。造句練習著重於詞彙運用，寫作練習則訓練文章結構和論述能力。完成後可以使用AI批改功能獲得即時回饋。`
  };
};

// 記憶卡片遊戲驗證函數
const validateMemoryCardGame = (memoryCardGames: any[]): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  memoryCardGames.forEach((game, gameIndex) => {
    if (!game.pairs || !Array.isArray(game.pairs)) {
      issues.push(`遊戲 ${gameIndex + 1}: 缺少 pairs 陣列`);
      return;
    }

    const leftContent = new Set();
    const rightContent = new Set();

    game.pairs.forEach((pair: any, pairIndex: number) => {
      if (!pair.left || !pair.right) {
        issues.push(`遊戲 ${gameIndex + 1}, 配對 ${pairIndex + 1}: 缺少 left 或 right 內容`);
        return;
      }

      if (leftContent.has(pair.left)) {
        issues.push(`遊戲 ${gameIndex + 1}: 左側內容重複 - "${pair.left}"`);
      }
      if (rightContent.has(pair.right)) {
        issues.push(`遊戲 ${gameIndex + 1}: 右側內容重複 - "${pair.right}"`);
      }

      leftContent.add(pair.left);
      rightContent.add(pair.right);
    });
  });

  return {
    isValid: issues.length === 0,
    issues
  };
};

// 生成步驟測驗
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
  const quizData = await callProviderSystem(prompt, 'provider-system-call');

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
