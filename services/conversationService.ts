// ConversationService now uses the provider-based system via geminiServiceAdapter

// 對話練習相關類型定義
export interface ConversationTurn {
  id: string;
  speaker: string;
  text: string;
  translation: string;
  pronunciation?: string; // IPA 音標
  keyWords: string[];
  difficulty: 'easy' | 'normal' | 'hard';
  practicePoint: string;
  expectedResponseHints?: string[]; // 期待學生回應的提示
}

export interface VocabularyItem {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface ConversationPractice {
  id: string;
  title: string;
  scenario: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard';
  duration: number; // 預估練習時間（分鐘）
  participants: string[]; // 角色列表
  dialogue: ConversationTurn[];
  vocabulary: VocabularyItem[];
  practiceGoals: string[];
  evaluationCriteria: {
    pronunciation: number; // 權重
    grammar: number;
    fluency: number;
    appropriateness: number; // 內容適切性
  };
  culturalNotes?: string[]; // 文化背景說明
  commonMistakes?: string[]; // 常見錯誤
}

export interface ConversationGenerationOptions {
  topic: string;
  scenario: string;
  difficulty: 'easy' | 'normal' | 'hard';
  participantCount: 2 | 3;
  duration: number; // 目標對話長度（分鐘）
  focusAreas?: string[]; // 重點練習領域
  culturalContext?: string; // 文化背景
}

class ConversationService {
  
  // 生成完整對話練習內容
  async generateConversationPractice(
    options: ConversationGenerationOptions
  ): Promise<ConversationPractice> {
    const { callGemini } = await import('./geminiServiceAdapter');
    const prompt = this.buildConversationPrompt(options);
    const response = await callGemini(prompt);
    
    // 生成唯一 ID
    const practiceId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: practiceId,
      ...response
    };
  }

  // 生成對話練習提示詞
  private buildConversationPrompt(options: ConversationGenerationOptions): string {
    return `
Generate an English conversation practice exercise with the following specifications:

Topic: "${options.topic}"
Scenario: "${options.scenario}"
Difficulty Level: ${options.difficulty}
Number of Participants: ${options.participantCount}
Target Duration: ${options.duration} minutes
${options.focusAreas ? `Focus Areas: ${options.focusAreas.join(', ')}` : ''}
${options.culturalContext ? `Cultural Context: ${options.culturalContext}` : ''}

Please generate a comprehensive conversation practice in the following JSON structure (output ONLY the JSON, no explanation):

{
  "title": "Conversation title in English",
  "scenario": "Detailed scenario description",
  "description": "What students will learn from this practice",
  "difficulty": "${options.difficulty}",
  "duration": ${options.duration},
  "participants": ["Role 1", "Role 2"${options.participantCount === 3 ? ', "Role 3"' : ''}],
  "dialogue": [
    {
      "id": "turn_001",
      "speaker": "Role name",
      "text": "English dialogue text",
      "translation": "Chinese translation",
      "pronunciation": "Phonetic transcription for difficult words",
      "keyWords": ["key", "vocabulary", "words"],
      "difficulty": "easy|normal|hard",
      "practicePoint": "What to focus on in this turn",
      "expectedResponseHints": ["Hint 1 for student response", "Hint 2"]
    }
    // Generate at least 8-12 dialogue turns for ${options.difficulty} level
    // Easy: 8-10 turns, Normal: 10-14 turns, Hard: 12-16 turns
  ],
  "vocabulary": [
    {
      "word": "vocabulary word",
      "pronunciation": "/fəˈnetɪk/",
      "meaning": "中文意思",
      "example": "Example sentence in English",
      "difficulty": "easy|normal|hard"
    }
    // Include at least 10-15 vocabulary items relevant to the conversation
  ],
  "practiceGoals": [
    "Learning objective 1",
    "Learning objective 2",
    "Learning objective 3"
    // At least 3-5 clear learning objectives
  ],
  "evaluationCriteria": {
    "pronunciation": 0.3,
    "grammar": 0.25,
    "fluency": 0.25,
    "appropriateness": 0.2
  },
  "culturalNotes": [
    "Cultural insight 1",
    "Cultural insight 2"
    // 2-4 cultural notes if relevant
  ],
  "commonMistakes": [
    "Common mistake 1 with correction",
    "Common mistake 2 with correction"
    // 3-5 common mistakes students might make
  ]
}

Requirements for dialogue generation:
1. Each dialogue turn should be natural and contextually appropriate
2. Include varied sentence structures appropriate for ${options.difficulty} level
3. Incorporate the vocabulary items naturally in the dialogue
4. Provide helpful hints for expected student responses
5. Progress the conversation logically toward a natural conclusion
6. Include appropriate greetings, transitions, and closings
7. For ${options.difficulty} level:
   - Easy: Simple present/past tense, basic vocabulary, short sentences
   - Normal: Mixed tenses, moderate vocabulary, compound sentences
   - Hard: Complex grammar, advanced vocabulary, sophisticated expressions

All text content should be natural English with accurate Chinese translations.
Focus on practical, real-world communication that students can apply.
`;
  }

  // 生成對話評估回饋
  async generateConversationFeedback(
    originalText: string,
    studentResponse: string,
    context: {
      expectedHints: string[];
      practicePoint: string;
      difficulty: string;
    }
  ): Promise<{
    overallScore: number;
    pronunciationScore: number;
    grammarScore: number;
    fluencyScore: number;
    appropriatenessScore: number;
    feedback: string[];
    suggestions: string[];
    encouragement: string;
  }> {
    const { callGemini } = await import('./geminiServiceAdapter');
    const prompt = `
Evaluate this English conversation practice response:

Context: ${context.practicePoint}
Expected Response Hints: ${context.expectedHints.join(', ')}
Difficulty Level: ${context.difficulty}

Original Prompt/Situation: "${originalText}"
Student Response: "${studentResponse}"

Please provide detailed feedback in the following JSON format (output ONLY JSON):

{
  "overallScore": [0-100 integer],
  "pronunciationScore": [0-100 integer, based on word choice and structure],
  "grammarScore": [0-100 integer],
  "fluencyScore": [0-100 integer, based on coherence and naturalness],
  "appropriatenessScore": [0-100 integer, based on context appropriateness],
  "feedback": [
    "Positive feedback point 1",
    "Positive feedback point 2",
    "Area for improvement 1",
    "Area for improvement 2"
  ],
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Alternative expression suggestion"
  ],
  "encouragement": "Encouraging message for the student"
}

Evaluation criteria:
- Pronunciation: Judge based on likely pronunciation of written response
- Grammar: Check sentence structure, tenses, word order
- Fluency: Assess naturalness and coherence of response  
- Appropriateness: How well the response fits the conversational context
- Be constructive and encouraging while providing specific improvement suggestions
- Consider the difficulty level when scoring (more lenient for easy level)
`;

    return await callGemini(prompt);
  }

  // 預定義對話場景模板
  public getConversationTemplates(): {
    category: string;
    scenarios: {
      title: string;
      scenario: string;
      suggestedDifficulty: string;
      participants: string[];
    }[];
  }[] {
    return [
      {
        category: "日常生活 (Daily Life)",
        scenarios: [
          {
            title: "在咖啡廳點餐",
            scenario: "Student plays customer ordering coffee and snacks",
            suggestedDifficulty: "easy",
            participants: ["顧客", "服務員"]
          },
          {
            title: "問路和指路",
            scenario: "Tourist asking for directions to nearby attractions",
            suggestedDifficulty: "easy",
            participants: ["遊客", "當地人"]
          },
          {
            title: "在超市購物",
            scenario: "Shopping for groceries and asking about products",
            suggestedDifficulty: "normal",
            participants: ["顧客", "店員"]
          }
        ]
      },
      {
        category: "商務英文 (Business English)",
        scenarios: [
          {
            title: "工作面試",
            scenario: "Job interview for entry-level position",
            suggestedDifficulty: "hard",
            participants: ["求職者", "面試官"]
          },
          {
            title: "會議討論",
            scenario: "Team meeting discussing project progress",
            suggestedDifficulty: "hard",
            participants: ["經理", "員工A", "員工B"]
          },
          {
            title: "客戶服務",
            scenario: "Handling customer complaints and inquiries",
            suggestedDifficulty: "normal",
            participants: ["客服代表", "顧客"]
          }
        ]
      },
      {
        category: "旅遊英文 (Travel English)",
        scenarios: [
          {
            title: "機場報到",
            scenario: "Checking in at the airport and asking about flights",
            suggestedDifficulty: "normal",
            participants: ["旅客", "地勤人員"]
          },
          {
            title: "飯店住宿",
            scenario: "Checking into hotel and requesting services",
            suggestedDifficulty: "easy",
            participants: ["房客", "櫃台人員"]
          },
          {
            title: "觀光景點",
            scenario: "Visiting tourist attractions and asking about information",
            suggestedDifficulty: "normal",
            participants: ["遊客", "導遊"]
          }
        ]
      },
      {
        category: "學術英文 (Academic English)",
        scenarios: [
          {
            title: "課堂討論",
            scenario: "Participating in classroom discussion about a topic",
            suggestedDifficulty: "hard",
            participants: ["學生", "教授"]
          },
          {
            title: "圖書館詢問",
            scenario: "Asking librarian for help finding resources",
            suggestedDifficulty: "normal",
            participants: ["學生", "圖書館員"]
          }
        ]
      }
    ];
  }

  // 獲取難度級別說明
  public getDifficultyLevels(): {
    level: string;
    description: string;
    characteristics: string[];
  }[] {
    return [
      {
        level: "easy",
        description: "初級 - 適合英文基礎學習者",
        characteristics: [
          "使用基本詞彙和簡單句型",
          "現在式和過去式為主",
          "對話內容直接明確",
          "較短的對話輪次",
          "日常生活場景"
        ]
      },
      {
        level: "normal", 
        description: "中級 - 適合有一定英文基礎的學習者",
        characteristics: [
          "混合使用多種時態",
          "中等難度詞彙",
          "複合句和複雜句型",
          "需要推理和延伸回應",
          "工作和社交場景"
        ]
      },
      {
        level: "hard",
        description: "高級 - 適合英文程度較好的學習者", 
        characteristics: [
          "高級詞彙和慣用語",
          "複雜的語法結構",
          "需要批判性思考",
          "抽象概念討論",
          "專業和學術場景"
        ]
      }
    ];
  }
}

// 導出服務實例
export const conversationService = new ConversationService();
