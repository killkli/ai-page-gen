/**
 * 核心生成函數模組
 *
 * 包含學習程度建議和主要學習計劃生成函數
 */

import {
  GeneratedLearningContent,
  LearningObjectiveItem,
  VocabularyLevel,
  LearningLevelSuggestions
} from '../../types';

// Import modularized functions
import {
  generateLearningObjectives,
  generateContentBreakdown,
  generateConfusingPoints,
  generateClassroomActivities,
  generateOnlineInteractiveQuiz,
  generateEnglishConversation
} from './basicGenerators';

export {
  generateLearningObjectives,
  generateContentBreakdown,
  generateConfusingPoints,
  generateClassroomActivities,
  generateOnlineInteractiveQuiz,
  generateEnglishConversation
};

import {
  generateLearningObjectivesForLevel,
  generateContentBreakdownForLevel,
  generateConfusingPointsForLevel,
  generateClassroomActivitiesForLevel,
  generateOnlineInteractiveQuizForLevel,
  generateEnglishConversationForLevel
} from './levelSpecificGenerators';

import {
  generateLearningObjectivesForLevelAndVocabulary,
  generateContentBreakdownForLevelAndVocabulary,
  generateConfusingPointsForLevelAndVocabulary,
  generateClassroomActivitiesForLevelAndVocabulary,
  generateOnlineInteractiveQuizForLevelAndVocabulary,
  generateEnglishConversationForLevelAndVocabulary
} from './vocabularyLevelGenerators';

import {
  generateWritingPractice
} from './studentContentTransformers';

// 生成學習程度建議 (基本版本)
export const generateLearningLevels = async (topic: string, apiKey: string, learningObjectives: LearningObjectiveItem[], providerCall: (prompt: string, apiKey: string) => Promise<any>): Promise<LearningLevelSuggestions> => {
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
  return await providerCall(prompt, apiKey);
};

// 生成學習程度建議函數
export const generateLearningLevelSuggestions = async (topic: string, apiKey: string, providerCall: (prompt: string, apiKey: string) => Promise<any>): Promise<any> => {
  console.log(`生成學習程度建議 (Provider 系統): ${topic}`);
  // 先產生基本的學習目標來輔助程度建議
  const basicObjectives = await generateLearningObjectives(topic, apiKey);

  return await generateLearningLevels(topic, apiKey, basicObjectives, providerCall);
};

// 檢查是否為英語相關主題
export const isEnglishRelatedTopic = (topic: string): boolean => {
  // 簡單的英語主題檢測邏輯
  const englishKeywords = [
    'english', 'grammar', 'vocabulary', 'pronunciation', 'speaking', 'writing', 'reading', 'listening',
    'conversation', 'toefl', 'ielts', 'toeic', 'english literature', 'business english', 'academic english',
    'phrasal verbs', 'idioms', 'prepositions', 'tenses', 'articles', 'adjectives', 'adverbs', 'nouns', 'verbs',
    '英語', '英文', '文法', '單字', '發音', '口說', '寫作', '閱讀', '聽力',
    '對話', '會話', '托福', '雅思', '多益', '商業英文', '學術英文',
    '片語動詞', '慣用語', '介系詞', '時態', '冠詞', '形容詞', '副詞', '名詞', '動詞'
  ];
  const lowerTopic = topic.toLowerCase();
  return englishKeywords.some(keyword => lowerTopic.includes(keyword));
};

// 檢查是否為數學相關主題
export const isMathRelatedTopic = (topic: string): boolean => {
  const mathKeywords = [
    'math', 'algebra', 'geometry', 'calculus', 'statistics', 'probability', 'trigonometry', 'arithmetic',
    'fraction', 'decimal', 'percentage', 'equation', 'formula', 'graph', 'function', 'matrix', 'vector',
    '數學', '代數', '幾何', '微積分', '統計', '機率', '三角函數', '算術',
    '分數', '小數', '百分比', '方程式', '公式', '圖表', '函數', '矩陣', '向量',
    '加法', '減法', '乘法', '除法', '因數', '倍數', '質數', '合數', '最大公因數', '最小公倍數'
  ];
  const lowerTopic = topic.toLowerCase();
  return mathKeywords.some(keyword => lowerTopic.includes(keyword));
};

export interface GenerationOptions {
  includeEnglishConversation?: boolean;
  includeWritingPractice?: boolean;
  isMath?: boolean;
}

// 主要生成函數 - 完整版本
export const generateLearningPlan = async (
  topic: string,
  apiKey: string,
  providerCall: (prompt: string, apiKey: string) => Promise<any>,
  options: GenerationOptions = {}
): Promise<GeneratedLearningContent> => {
  console.log(`開始生成學習計劃 (Provider 系統): ${topic}`);

  // 1. 先生成學習目標
  const learningObjectives = await generateLearningObjectives(topic, apiKey);
  console.log('✓ 學習目標生成完成');

  return await generateLearningPlanFromObjectives(topic, learningObjectives, apiKey, providerCall, options);
};

// 從現有學習目標生成學習計劃
export const generateLearningPlanFromObjectives = async (
  topic: string,
  learningObjectives: LearningObjectiveItem[],
  apiKey: string,
  providerCall: (prompt: string, apiKey: string) => Promise<any>,
  options: GenerationOptions = {}
): Promise<GeneratedLearningContent> => {
  console.log(`開始從現有目標生成學習計劃 (Provider 系統): ${topic}`);

  // 自動檢測是否為數學主題 (如果 options 未指定)
  const isMath = options.isMath !== undefined ? options.isMath : isMathRelatedTopic(topic);

  // 2. 並行生成其他部分
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
    generateContentBreakdown(topic, apiKey, learningObjectives),
    generateConfusingPoints(topic, apiKey, learningObjectives),
    generateClassroomActivities(topic, apiKey, learningObjectives),
    generateOnlineInteractiveQuiz(topic, apiKey, learningObjectives, isMath),
    options.includeEnglishConversation !== false ? generateEnglishConversation(topic, apiKey, learningObjectives) : Promise.resolve([]),
    generateLearningLevels(topic, apiKey, learningObjectives, providerCall),
    options.includeWritingPractice !== false ? generateWritingPractice(topic, apiKey, learningObjectives) : Promise.resolve(undefined)
  ]);

  console.log('✓ 所有內容生成完成 (Provider 系統)');

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

// 帶程度的生成函數
export const generateLearningPlanWithLevel = async (topic: string, selectedLevel: any, apiKey: string, providerCall: (prompt: string, apiKey: string) => Promise<any>): Promise<GeneratedLearningContent> => {
  console.log(`開始生成學習計劃 (有程度設定, Provider 系統): ${topic}, 程度: ${selectedLevel?.name || '未指定'}`);

  const isMath = isMathRelatedTopic(topic);

  // 1. 根據選定程度重新產生更精確的學習目標
  const learningObjectives = await generateLearningObjectivesForLevel(topic, selectedLevel, apiKey);
  console.log('✓ 程度特定學習目標生成完成');

  // 2. 並行生成其他針對程度的內容
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
    generateContentBreakdownForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevel(topic, selectedLevel, apiKey, learningObjectives, isMath),
    generateEnglishConversationForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateLearningLevels(topic, apiKey, learningObjectives, providerCall), // 基本版本，不針對特定程度
    generateWritingPractice(topic, apiKey, learningObjectives, selectedLevel)
  ]);

  console.log('✓ 所有程度特定內容生成完成 (Provider 系統)');

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

// 帶程度和詞彙量的生成函數
export const generateLearningPlanWithVocabularyLevel = async (
  topic: string,
  selectedLevel: any,
  vocabularyLevel: VocabularyLevel,
  apiKey: string,
  providerCall: (prompt: string, apiKey: string) => Promise<any>
): Promise<GeneratedLearningContent> => {
  console.log(`開始生成學習計劃 (有程度和詞彙設定, Provider 系統): ${topic}, 程度: ${selectedLevel?.name || '未指定'}, 詞彙: ${vocabularyLevel?.name || '未指定'}`);

  const isMath = isMathRelatedTopic(topic);

  // 1. 根據選定程度和詞彙量重新產生更精確的學習目標
  const learningObjectives = await generateLearningObjectivesForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey);
  console.log('✓ 程度和詞彙特定學習目標生成完成');

  // 2. 並行生成其他針對程度和詞彙的內容
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, learningLevels, writingPractice] = await Promise.all([
    generateContentBreakdownForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives, isMath),
    generateEnglishConversationForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateLearningLevels(topic, apiKey, learningObjectives, providerCall), // 基本版本
    generateWritingPractice(topic, apiKey, learningObjectives, selectedLevel, vocabularyLevel)
  ]);

  console.log('✓ 所有程度和詞彙特定內容生成完成 (Provider 系統)');

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
