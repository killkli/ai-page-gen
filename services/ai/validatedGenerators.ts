import { z } from 'zod';
import {
  generateLearningObjectives as _generateLearningObjectives,
  generateContentBreakdown as _generateContentBreakdown,
  generateConfusingPoints as _generateConfusingPoints,
  generateClassroomActivities as _generateClassroomActivities,
  generateOnlineInteractiveQuiz as _generateOnlineInteractiveQuiz,
  generateEnglishConversation as _generateEnglishConversation,
  generateLearningLevels as _generateLearningLevels,
} from './basicGenerators';
import {
  generateLearningObjectivesForLevel as _generateLearningObjectivesForLevel,
  generateContentBreakdownForLevel as _generateContentBreakdownForLevel,
  generateConfusingPointsForLevel as _generateConfusingPointsForLevel,
  generateClassroomActivitiesForLevel as _generateClassroomActivitiesForLevel,
  generateOnlineInteractiveQuizForLevel as _generateOnlineInteractiveQuizForLevel,
  generateEnglishConversationForLevel as _generateEnglishConversationForLevel,
} from './levelSpecificGenerators';
import {
  generateLearningObjectivesForLevelAndVocabulary as _generateLearningObjectivesForLevelAndVocabulary,
  generateContentBreakdownForLevelAndVocabulary as _generateContentBreakdownForLevelAndVocabulary,
  generateConfusingPointsForLevelAndVocabulary as _generateConfusingPointsForLevelAndVocabulary,
  generateClassroomActivitiesForLevelAndVocabulary as _generateClassroomActivitiesForLevelAndVocabulary,
  generateOnlineInteractiveQuizForLevelAndVocabulary as _generateOnlineInteractiveQuizForLevelAndVocabulary,
  generateEnglishConversationForLevelAndVocabulary as _generateEnglishConversationForLevelAndVocabulary,
} from './vocabularyLevelGenerators';
import {
  LearningObjectivesArraySchema,
  ContentBreakdownArraySchema,
  ConfusingPointsArraySchema,
  ClassroomActivitiesArraySchema,
  LearningLevelSuggestionsSchema,
  DialogueArraySchema,
  type LearningObjectiveItem,
  type ContentBreakdownItem,
  type ConfusingPointItem,
  type ClassroomActivity,
  type LearningLevelSuggestions,
  type DialogueLine,
} from './schemas';
import {
  OnlineInteractiveQuizSchema,
  type OnlineInteractiveQuiz,
} from './schemas/quiz';
import {
  parseAndValidate,
  logValidationSuccess,
  type ValidationResult,
} from './validation';
import type { VocabularyLevel } from '../../types';

type PromptType =
  | 'learningObjectives'
  | 'contentBreakdown'
  | 'confusingPoints'
  | 'classroomActivities'
  | 'onlineInteractiveQuiz'
  | 'learningLevels'
  | 'dialogue';

interface LearningLevelSelection {
  id: string;
  name: string;
  description: string;
}

const schemaMap = {
  learningObjectives: LearningObjectivesArraySchema,
  contentBreakdown: ContentBreakdownArraySchema,
  confusingPoints: ConfusingPointsArraySchema,
  classroomActivities: ClassroomActivitiesArraySchema,
  onlineInteractiveQuiz: OnlineInteractiveQuizSchema,
  learningLevels: LearningLevelSuggestionsSchema,
  dialogue: DialogueArraySchema,
} as const;

function validateAndReturn<T>(
  rawResult: unknown,
  promptType: PromptType,
  schema: z.ZodSchema<T>
): T {
  const result = parseAndValidate(schema, rawResult, promptType);

  if (!result.success) {
    throw result.error;
  }

  logValidationSuccess(promptType);
  return result.data!;
}

export async function generateLearningObjectives(
  topic: string,
  apiKey: string
): Promise<LearningObjectiveItem[]> {
  const raw = await _generateLearningObjectives(topic, apiKey);
  return validateAndReturn(
    raw,
    'learningObjectives',
    LearningObjectivesArraySchema
  );
}

export async function generateContentBreakdown(
  topic: string,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ContentBreakdownItem[]> {
  const raw = await _generateContentBreakdown(
    topic,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'contentBreakdown',
    ContentBreakdownArraySchema
  );
}

export async function generateConfusingPoints(
  topic: string,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ConfusingPointItem[]> {
  const raw = await _generateConfusingPoints(topic, apiKey, learningObjectives);
  return validateAndReturn(raw, 'confusingPoints', ConfusingPointsArraySchema);
}

export async function generateClassroomActivities(
  topic: string,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ClassroomActivity[]> {
  const raw = await _generateClassroomActivities(
    topic,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'classroomActivities',
    ClassroomActivitiesArraySchema
  );
}

export async function generateOnlineInteractiveQuiz(
  topic: string,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<OnlineInteractiveQuiz> {
  const raw = await _generateOnlineInteractiveQuiz(
    topic,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'onlineInteractiveQuiz',
    OnlineInteractiveQuizSchema
  );
}

export async function generateEnglishConversation(
  topic: string,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<DialogueLine[]> {
  const raw = await _generateEnglishConversation(
    topic,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(raw, 'dialogue', DialogueArraySchema);
}

export async function generateLearningLevels(
  topic: string,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<LearningLevelSuggestions> {
  const raw = await _generateLearningLevels(topic, apiKey, learningObjectives);
  return validateAndReturn(
    raw,
    'learningLevels',
    LearningLevelSuggestionsSchema
  );
}

export async function generateLearningObjectivesForLevel(
  topic: string,
  selectedLevel: LearningLevelSelection,
  apiKey: string
): Promise<LearningObjectiveItem[]> {
  const raw = await _generateLearningObjectivesForLevel(
    topic,
    selectedLevel,
    apiKey
  );
  return validateAndReturn(
    raw,
    'learningObjectives',
    LearningObjectivesArraySchema
  );
}

export async function generateContentBreakdownForLevel(
  topic: string,
  selectedLevel: LearningLevelSelection,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ContentBreakdownItem[]> {
  const raw = await _generateContentBreakdownForLevel(
    topic,
    selectedLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'contentBreakdown',
    ContentBreakdownArraySchema
  );
}

export async function generateConfusingPointsForLevel(
  topic: string,
  selectedLevel: LearningLevelSelection,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ConfusingPointItem[]> {
  const raw = await _generateConfusingPointsForLevel(
    topic,
    selectedLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(raw, 'confusingPoints', ConfusingPointsArraySchema);
}

export async function generateClassroomActivitiesForLevel(
  topic: string,
  selectedLevel: LearningLevelSelection,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ClassroomActivity[]> {
  const raw = await _generateClassroomActivitiesForLevel(
    topic,
    selectedLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'classroomActivities',
    ClassroomActivitiesArraySchema
  );
}

export async function generateOnlineInteractiveQuizForLevel(
  topic: string,
  selectedLevel: LearningLevelSelection,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<OnlineInteractiveQuiz> {
  const raw = await _generateOnlineInteractiveQuizForLevel(
    topic,
    selectedLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'onlineInteractiveQuiz',
    OnlineInteractiveQuizSchema
  );
}

export async function generateEnglishConversationForLevel(
  topic: string,
  selectedLevel: LearningLevelSelection,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<DialogueLine[]> {
  const raw = await _generateEnglishConversationForLevel(
    topic,
    selectedLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(raw, 'dialogue', DialogueArraySchema);
}

export async function generateLearningObjectivesForLevelAndVocabulary(
  topic: string,
  selectedLevel: LearningLevelSelection,
  vocabularyLevel: VocabularyLevel,
  apiKey: string
): Promise<LearningObjectiveItem[]> {
  const raw = await _generateLearningObjectivesForLevelAndVocabulary(
    topic,
    selectedLevel,
    vocabularyLevel,
    apiKey
  );
  return validateAndReturn(
    raw,
    'learningObjectives',
    LearningObjectivesArraySchema
  );
}

export async function generateContentBreakdownForLevelAndVocabulary(
  topic: string,
  selectedLevel: LearningLevelSelection,
  vocabularyLevel: VocabularyLevel,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ContentBreakdownItem[]> {
  const raw = await _generateContentBreakdownForLevelAndVocabulary(
    topic,
    selectedLevel,
    vocabularyLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'contentBreakdown',
    ContentBreakdownArraySchema
  );
}

export async function generateConfusingPointsForLevelAndVocabulary(
  topic: string,
  selectedLevel: LearningLevelSelection,
  vocabularyLevel: VocabularyLevel,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ConfusingPointItem[]> {
  const raw = await _generateConfusingPointsForLevelAndVocabulary(
    topic,
    selectedLevel,
    vocabularyLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(raw, 'confusingPoints', ConfusingPointsArraySchema);
}

export async function generateClassroomActivitiesForLevelAndVocabulary(
  topic: string,
  selectedLevel: LearningLevelSelection,
  vocabularyLevel: VocabularyLevel,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<ClassroomActivity[]> {
  const raw = await _generateClassroomActivitiesForLevelAndVocabulary(
    topic,
    selectedLevel,
    vocabularyLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'classroomActivities',
    ClassroomActivitiesArraySchema
  );
}

export async function generateOnlineInteractiveQuizForLevelAndVocabulary(
  topic: string,
  selectedLevel: LearningLevelSelection,
  vocabularyLevel: VocabularyLevel,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<OnlineInteractiveQuiz> {
  const raw = await _generateOnlineInteractiveQuizForLevelAndVocabulary(
    topic,
    selectedLevel,
    vocabularyLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(
    raw,
    'onlineInteractiveQuiz',
    OnlineInteractiveQuizSchema
  );
}

export async function generateEnglishConversationForLevelAndVocabulary(
  topic: string,
  selectedLevel: LearningLevelSelection,
  vocabularyLevel: VocabularyLevel,
  apiKey: string,
  learningObjectives: LearningObjectiveItem[]
): Promise<DialogueLine[]> {
  const raw = await _generateEnglishConversationForLevelAndVocabulary(
    topic,
    selectedLevel,
    vocabularyLevel,
    apiKey,
    learningObjectives
  );
  return validateAndReturn(raw, 'dialogue', DialogueArraySchema);
}

export function wrapWithValidation<TArgs extends unknown[], TResult>(
  generatorFn: (...args: TArgs) => Promise<unknown>,
  schema: z.ZodSchema<TResult>,
  promptType: PromptType
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const rawResult = await generatorFn(...args);
    return validateAndReturn(rawResult, promptType, schema);
  };
}

export { schemaMap, type PromptType };

export type {
  LearningObjectiveItem,
  ContentBreakdownItem,
  ConfusingPointItem,
  ClassroomActivity,
  LearningLevelSuggestions,
  DialogueLine,
  OnlineInteractiveQuiz,
  ValidationResult,
  LearningLevelSelection,
};
