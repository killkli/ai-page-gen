/**
 * Zod Schemas for Quiz Types
 *
 * Runtime validation schemas for AI-generated quiz content.
 * These schemas ensure AI outputs match expected structure before reaching UI.
 */

import { z } from 'zod';

// =============================================================================
// Individual Question Type Schemas
// =============================================================================

/**
 * True/False Question Schema
 */
export const TrueFalseQuestionSchema = z.object({
  statement: z.string().min(1, 'Statement is required'),
  isTrue: z.boolean(),
  explanation: z.string().optional(),
});

export type TrueFalseQuestion = z.infer<typeof TrueFalseQuestionSchema>;

/**
 * Multiple Choice Question Schema
 */
export const MultipleChoiceQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z.array(z.string()).min(2, 'At least 2 options required'),
  correctAnswerIndex: z.number().int().min(0),
});

export type MultipleChoiceQuestion = z.infer<
  typeof MultipleChoiceQuestionSchema
>;

/**
 * Fill in the Blanks Question Schema
 */
export const FillInTheBlanksQuestionSchema = z.object({
  sentenceWithBlank: z.string().min(1, 'Sentence is required'),
  correctAnswer: z.string().min(1, 'Answer is required'),
});

export type FillInTheBlanksQuestion = z.infer<
  typeof FillInTheBlanksQuestionSchema
>;

/**
 * Sentence Scramble Question Schema
 */
export const SentenceScrambleQuestionSchema = z.object({
  originalSentence: z.string().min(1, 'Original sentence is required'),
  scrambledWords: z.array(z.string()).min(2, 'At least 2 words required'),
});

export type SentenceScrambleQuestion = z.infer<
  typeof SentenceScrambleQuestionSchema
>;

/**
 * Memory Card Game Pair Schema
 */
export const MemoryCardPairSchema = z
  .object({
    question: z.string().optional(),
    answer: z.string().optional(),
    left: z.string().optional(),
    right: z.string().optional(),
  })
  .refine(
    data => {
      // At least one pair format must be present
      const hasQA = data.question !== undefined && data.answer !== undefined;
      const hasLR = data.left !== undefined && data.right !== undefined;
      return hasQA || hasLR;
    },
    { message: 'Either question/answer or left/right pair is required' }
  );

export type MemoryCardPair = z.infer<typeof MemoryCardPairSchema>;

/**
 * Memory Card Game Question Schema
 */
export const MemoryCardGameQuestionSchema = z.object({
  pairs: z.array(MemoryCardPairSchema).min(3, 'At least 3 pairs required'),
  instructions: z.string().optional(),
  title: z.string().optional(),
});

export type MemoryCardGameQuestion = z.infer<
  typeof MemoryCardGameQuestionSchema
>;

// =============================================================================
// Quiz Difficulty Content Schema (all question types for one difficulty)
// =============================================================================

/**
 * Quiz content for a single difficulty level
 */
export const QuizDifficultyContentSchema = z.object({
  trueFalse: z.array(TrueFalseQuestionSchema).default([]),
  multipleChoice: z.array(MultipleChoiceQuestionSchema).default([]),
  fillInTheBlanks: z.array(FillInTheBlanksQuestionSchema).default([]),
  sentenceScramble: z.array(SentenceScrambleQuestionSchema).default([]),
  memoryCardGame: z.array(MemoryCardGameQuestionSchema).optional().default([]),
});

export type QuizDifficultyContent = z.infer<typeof QuizDifficultyContentSchema>;

// =============================================================================
// Full Online Interactive Quiz Schema (all difficulty levels)
// =============================================================================

/**
 * Complete online interactive quiz with all difficulty levels
 */
export const OnlineInteractiveQuizSchema = z.object({
  easy: QuizDifficultyContentSchema,
  normal: QuizDifficultyContentSchema,
  hard: QuizDifficultyContentSchema,
});

export type OnlineInteractiveQuiz = z.infer<typeof OnlineInteractiveQuizSchema>;

// =============================================================================
// Validation Helper Functions
// =============================================================================

/**
 * Validate quiz difficulty content with detailed error reporting
 */
export function validateQuizDifficultyContent(
  data: unknown,
  difficulty: string
):
  | { success: true; data: QuizDifficultyContent }
  | { success: false; error: string; details: z.ZodError } {
  const result = QuizDifficultyContentSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: `Invalid quiz content for difficulty "${difficulty}"`,
    details: result.error,
  };
}

/**
 * Validate full online interactive quiz
 */
export function validateOnlineInteractiveQuiz(
  data: unknown
):
  | { success: true; data: OnlineInteractiveQuiz }
  | { success: false; error: string; details: z.ZodError } {
  const result = OnlineInteractiveQuizSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: 'Invalid online interactive quiz structure',
    details: result.error,
  };
}
