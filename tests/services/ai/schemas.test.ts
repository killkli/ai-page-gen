import { describe, it, expect } from 'vitest';
import {
  LearningObjectivesArraySchema,
  validateLearningObjectives,
  validateContentBreakdown,
  validateConfusingPoints,
  validateClassroomActivities,
} from '../../../services/ai/schemas/learningContent';
import {
  QuizDifficultyContentSchema,
  OnlineInteractiveQuizSchema,
  validateQuizDifficultyContent,
  validateOnlineInteractiveQuiz,
} from '../../../services/ai/schemas/quiz';
import learningObjectivesFixture from '../../fixtures/ai/learningObjectives.json';
import quizEasyFixture from '../../fixtures/ai/quizEasy.json';

describe('Learning Content Schemas', () => {
  describe('LearningObjectivesArraySchema', () => {
    it('should validate valid learning objectives', () => {
      const result = LearningObjectivesArraySchema.safeParse(
        learningObjectivesFixture
      );
      expect(result.success).toBe(true);
    });

    it('should reject empty array', () => {
      const result = LearningObjectivesArraySchema.safeParse([]);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalid = [{ objective: 'Test' }];
      const result = LearningObjectivesArraySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept optional teachingExample', () => {
      const valid = [
        { objective: 'Test objective', description: 'Test description' },
      ];
      const result = LearningObjectivesArraySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('validateLearningObjectives', () => {
    it('should return success with valid data', () => {
      const result = validateLearningObjectives(learningObjectivesFixture);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
      }
    });

    it('should return error with invalid data', () => {
      const result = validateLearningObjectives('not an array');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('validateContentBreakdown', () => {
    it('should validate valid content breakdown', () => {
      const validBreakdown = [
        {
          topic: 'Unit 1.1: Basic Concepts',
          details: 'Introduction to the topic',
        },
      ];
      const result = validateContentBreakdown(validBreakdown);
      expect(result.success).toBe(true);
    });

    it('should accept English learning extensions', () => {
      const englishBreakdown = [
        {
          topic: 'Unit 1.1: Grammar',
          details: 'Present tense usage',
          coreConcept: 'Subject-verb agreement',
          teachingSentences: ['I am', 'You are', 'He is'],
          teachingTips: 'Focus on common verbs',
        },
      ];
      const result = validateContentBreakdown(englishBreakdown);
      expect(result.success).toBe(true);
    });
  });

  describe('validateConfusingPoints', () => {
    it('should validate valid confusing points', () => {
      const valid = [
        { point: 'Common mistake', clarification: 'How to avoid it' },
      ];
      const result = validateConfusingPoints(valid);
      expect(result.success).toBe(true);
    });

    it('should accept extended fields', () => {
      const extended = [
        {
          point: 'Confusion between A and B',
          clarification: 'Key differences',
          errorType: 'Conceptual',
          commonErrors: ['Error 1', 'Error 2'],
          correctVsWrong: [
            { correct: 'Right way', wrong: 'Wrong way', explanation: 'Why' },
          ],
          preventionStrategy: 'Practice more',
          correctionMethod: 'Review basics',
          practiceActivities: ['Activity 1', 'Activity 2'],
        },
      ];
      const result = validateConfusingPoints(extended);
      expect(result.success).toBe(true);
    });
  });

  describe('validateClassroomActivities', () => {
    it('should validate valid classroom activities', () => {
      const valid = [
        {
          title: 'Group Discussion',
          description: 'Discuss the topic in groups',
        },
      ];
      const result = validateClassroomActivities(valid);
      expect(result.success).toBe(true);
    });

    it('should accept all optional fields', () => {
      const extended = [
        {
          title: 'Role Play',
          description: 'Act out scenarios',
          objective: 'Practice speaking',
          timing: 'After unit 2',
          materials: 'Cards, props',
          environment: 'Open space',
          steps: ['Step 1', 'Step 2'],
          assessmentPoints: ['Participation', 'Accuracy'],
        },
      ];
      const result = validateClassroomActivities(extended);
      expect(result.success).toBe(true);
    });
  });
});

describe('Quiz Schemas', () => {
  describe('QuizDifficultyContentSchema', () => {
    it('should validate valid quiz content', () => {
      const result = QuizDifficultyContentSchema.safeParse(quizEasyFixture);
      expect(result.success).toBe(true);
    });

    it('should provide defaults for missing arrays', () => {
      const partial = {
        trueFalse: [{ statement: 'Test', isTrue: true }],
        multipleChoice: [
          { question: 'Q?', options: ['A', 'B'], correctAnswerIndex: 0 },
        ],
        fillInTheBlanks: [
          { sentenceWithBlank: 'Test ____', correctAnswer: 'answer' },
        ],
      };
      const result = QuizDifficultyContentSchema.safeParse(partial);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sentenceScramble).toEqual([]);
        expect(result.data.memoryCardGame).toEqual([]);
      }
    });
  });

  describe('validateQuizDifficultyContent', () => {
    it('should return success with valid data', () => {
      const result = validateQuizDifficultyContent(quizEasyFixture, 'easy');
      expect(result.success).toBe(true);
    });

    it('should include difficulty in error message', () => {
      const result = validateQuizDifficultyContent('invalid', 'hard');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('hard');
      }
    });
  });

  describe('OnlineInteractiveQuizSchema', () => {
    it('should validate complete quiz structure', () => {
      const fullQuiz = {
        easy: quizEasyFixture,
        normal: quizEasyFixture,
        hard: quizEasyFixture,
      };
      const result = OnlineInteractiveQuizSchema.safeParse(fullQuiz);
      expect(result.success).toBe(true);
    });

    it('should reject missing difficulty levels', () => {
      const incomplete = { easy: quizEasyFixture };
      const result = OnlineInteractiveQuizSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });
  });

  describe('validateOnlineInteractiveQuiz', () => {
    it('should validate full quiz', () => {
      const fullQuiz = {
        easy: quizEasyFixture,
        normal: quizEasyFixture,
        hard: quizEasyFixture,
      };
      const result = validateOnlineInteractiveQuiz(fullQuiz);
      expect(result.success).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle null input', () => {
    const result = validateLearningObjectives(null);
    expect(result.success).toBe(false);
  });

  it('should handle undefined input', () => {
    const result = validateLearningObjectives(undefined);
    expect(result.success).toBe(false);
  });

  it('should handle non-object input', () => {
    const result = validateQuizDifficultyContent(123, 'easy');
    expect(result.success).toBe(false);
  });

  it('should handle deeply nested invalid data', () => {
    const invalidQuiz = {
      trueFalse: [{ statement: '', isTrue: 'not a boolean' }],
      multipleChoice: [],
      fillInTheBlanks: [],
    };
    const result = QuizDifficultyContentSchema.safeParse(invalidQuiz);
    expect(result.success).toBe(false);
  });
});
