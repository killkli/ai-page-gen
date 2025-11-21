import { GeneratedLearningContent, VocabularyLevel } from '../types';
import { isMathRelatedTopic } from './gemini/core';
import { generateLearningObjectives, generateLearningObjectivesForLevel, generateLearningObjectivesForLevelAndVocabulary } from './gemini/objectives';
import { generateContentBreakdown, generateContentBreakdownForLevel, generateContentBreakdownForLevelAndVocabulary } from './gemini/breakdown';
import { generateConfusingPoints, generateConfusingPointsForLevel, generateConfusingPointsForLevelAndVocabulary } from './gemini/confusingPoints';
import { generateClassroomActivities, generateClassroomActivitiesForLevel, generateClassroomActivitiesForLevelAndVocabulary } from './gemini/activities';
import { generateOnlineInteractiveQuiz, generateOnlineInteractiveQuizForLevel, generateOnlineInteractiveQuizForLevelAndVocabulary } from './gemini/quiz';
import { generateEnglishConversation, generateEnglishConversationForLevel, generateEnglishConversationForLevelAndVocabulary } from './gemini/conversation';
import { generateWritingPractice } from './gemini/writing';
import { generateLearningLevels } from './gemini/levels';

export * from './gemini/core';
export * from './gemini/objectives';
export * from './gemini/breakdown';
export * from './gemini/confusingPoints';
export * from './gemini/activities';
export * from './gemini/quiz';
export * from './gemini/conversation';
export * from './gemini/writing';
export * from './gemini/levels';
export * from './gemini/transform';
export * from './gemini/math';
export * from './gemini/english';

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

// 第二階段：根據選定的程度產生完整學習內容
export const generateLearningPlanWithLevel = async (topic: string, selectedLevel: any, apiKey: string): Promise<GeneratedLearningContent> => {
  if (!apiKey) {
    throw new Error("Gemini API 金鑰未正確設定或遺失。請檢查應用程式的環境設定。");
  }

  // 1. 根據選定程度重新產生更精確的學習目標
  const learningObjectives = await generateLearningObjectivesForLevel(topic, selectedLevel, apiKey);

  const isMath = isMathRelatedTopic(topic);

  // 2. 其他部分並行產生，都會考慮選定的程度
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, writingPractice] = await Promise.all([
    generateContentBreakdownForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevel(topic, selectedLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevel(topic, selectedLevel, apiKey, learningObjectives, isMath),
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

  const isMath = isMathRelatedTopic(topic);

  // 2. 其他部分並行產生，都會考慮選定的程度和單字量
  const [contentBreakdown, confusingPoints, classroomActivities, onlineInteractiveQuiz, englishConversation, writingPractice] = await Promise.all([
    generateContentBreakdownForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateConfusingPointsForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateClassroomActivitiesForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives),
    generateOnlineInteractiveQuizForLevelAndVocabulary(topic, selectedLevel, vocabularyLevel, apiKey, learningObjectives, isMath),
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
