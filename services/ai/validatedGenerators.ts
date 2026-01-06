import { z } from 'zod';
import { callProviderSystem } from './basicGenerators';
import {
  LearningObjectivesArraySchema,
  ContentBreakdownArraySchema,
  ConfusingPointsArraySchema,
  ClassroomActivitiesArraySchema,
  LearningLevelSuggestionsSchema,
  DialogueArraySchema,
  type LearningObjectiveItem,
} from './schemas';
import {
  OnlineInteractiveQuizSchema,
  QuizDifficultyContentSchema,
  type OnlineInteractiveQuiz,
  type QuizDifficultyContent,
} from './schemas/quiz';
import { parseAndValidate } from './validation';

type PromptType =
  | 'learningObjectives'
  | 'contentBreakdown'
  | 'confusingPoints'
  | 'classroomActivities'
  | 'onlineInteractiveQuiz'
  | 'quizDifficulty'
  | 'learningLevels'
  | 'dialogue';

const schemaMap = {
  learningObjectives: LearningObjectivesArraySchema,
  contentBreakdown: ContentBreakdownArraySchema,
  confusingPoints: ConfusingPointsArraySchema,
  classroomActivities: ClassroomActivitiesArraySchema,
  onlineInteractiveQuiz: OnlineInteractiveQuizSchema,
  quizDifficulty: QuizDifficultyContentSchema,
  learningLevels: LearningLevelSuggestionsSchema,
  dialogue: DialogueArraySchema,
} as const;

async function callAndValidate<T>(
  prompt: string,
  apiKey: string,
  promptType: PromptType,
  schema: z.ZodSchema<T>
): Promise<T> {
  const rawContent = await callProviderSystem(prompt, apiKey);
  const result = parseAndValidate(schema, rawContent, promptType);

  if (!result.success) {
    throw result.error;
  }

  return result.data!;
}

export async function generateLearningObjectivesValidated(
  topic: string,
  apiKey: string
): Promise<LearningObjectiveItem[]> {
  const prompt = `
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${topic}".
    The objectives should be written in the primary language of the topic.
    
    CRITICAL INSTRUCTION: Focus on **LEARNING OUTCOMES** (what the student will be able to DO after the lesson), NOT just what will be taught.
    Use Bloom's Taxonomy verbs (e.g., Analyze, Create, Evaluate, Understand, Apply).
    Format: "Student will be able to [Action] [Content]..."
    
    Use any provided context (e.g., grade level, teaching method) to guide the difficulty and style, but do NOT explicitly mention the context settings (like 'Based on CPA method...') in the objective text.
    
    For each objective, provide:
    - objective: The competency statement (e.g., "Able to distinguish between...")
    - description: Why this competency is important and what it entails.
    - teachingExample: A concrete scenario where this competency is applied.
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
      }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;

  return callAndValidate(
    prompt,
    apiKey,
    'learningObjectives',
    LearningObjectivesArraySchema
  );
}

export async function generateQuizForDifficultyValidated(
  topic: string,
  difficulty: 'easy' | 'normal' | 'hard',
  apiKey: string,
  learningObjectives: LearningObjectiveItem[],
  isMath: boolean = false
): Promise<QuizDifficultyContent> {
  const sentenceScrambleSection = isMath
    ? ''
    : `
      "sentenceScramble": [
        { "originalSentence": "Sentence...", "scrambledWords": ["...", "..."] }
      ],`;

  const prompt = `
    Based on the following learning objectives: ${JSON.stringify(learningObjectives)}
    Please generate "${difficulty}" level quiz content for "${topic}".
    
    Output MUST be a valid JSON object with the following structure (no explanation, no extra text):
    {
      "trueFalse": [
        { "statement": "Statement...", "isTrue": true, "explanation": "Optional explanation" }
      ],
      "multipleChoice": [
        { "question": "Question...", "options": ["A", "B", "C"], "correctAnswerIndex": 0 }
      ],
      "fillInTheBlanks": [
        { "sentenceWithBlank": "Sentence...____...", "correctAnswer": "Answer" }
      ],${sentenceScrambleSection}
      "memoryCardGame": [
        {
          "pairs": [
            { "question": "Front", "answer": "Back" }
          ],
          "instructions": "Instructions..."
        }
      ]
    }

    Requirements:
    - Difficulty: ${difficulty}
    - trueFalse, multipleChoice, fillInTheBlanks${isMath ? '' : ', sentenceScramble'}: At least 5 questions each.
    - memoryCardGame: Exactly 1 question, but with at least 5 pairs inside.
    - All text must be in the primary language of the topic.
    - Only output the JSON object.
  `;

  return callAndValidate(
    prompt,
    apiKey,
    'quizDifficulty',
    QuizDifficultyContentSchema
  );
}

export async function generateOnlineInteractiveQuizValidated(
  topic: string,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[],
  isMath: boolean = false
): Promise<OnlineInteractiveQuiz> {
  console.log(`[Validated] Starting quiz generation for topic: ${topic}`);

  const [easy, normal, hard] = await Promise.all([
    generateQuizForDifficultyValidated(
      topic,
      'easy',
      apiKey,
      learningObjectives,
      isMath
    ),
    generateQuizForDifficultyValidated(
      topic,
      'normal',
      apiKey,
      learningObjectives,
      isMath
    ),
    generateQuizForDifficultyValidated(
      topic,
      'hard',
      apiKey,
      learningObjectives,
      isMath
    ),
  ]);

  return { easy, normal, hard };
}

export function wrapWithValidation<TArgs extends unknown[], TResult>(
  generatorFn: (...args: TArgs) => Promise<unknown>,
  schema: z.ZodSchema<TResult>,
  promptType: PromptType
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const rawResult = await generatorFn(...args);
    const validation = parseAndValidate(schema, rawResult, promptType);

    if (!validation.success) {
      throw validation.error;
    }

    return validation.data!;
  };
}

export { schemaMap, type PromptType };
