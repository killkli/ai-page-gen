import { describe, it, expect } from 'vitest';
import {
  analyzeQuizResults,
  calculateOverallScore,
  determineLearningLevel,
} from '../../services/diagnosticService';
import type { QuestionResponse } from '../../types';

const createMockResponse = (
  overrides: Partial<QuestionResponse> = {}
): QuestionResponse => ({
  questionId: 'q1',
  questionType: 'trueFalse',
  difficulty: 'easy',
  userAnswer: true,
  correctAnswer: true,
  isCorrect: true,
  responseTime: 5000,
  attempts: 1,
  ...overrides,
});

describe('diagnosticService', () => {
  describe('analyzeQuizResults', () => {
    it('should return empty array for no responses', () => {
      const result = analyzeQuizResults([]);
      expect(result).toEqual([]);
    });

    it('should calculate accuracy for single question type', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ isCorrect: true }),
        createMockResponse({ questionId: 'q2', isCorrect: true }),
        createMockResponse({ questionId: 'q3', isCorrect: false }),
      ];

      const result = analyzeQuizResults(responses);

      expect(result).toHaveLength(1);
      expect(result[0].questionType).toBe('trueFalse');
      expect(result[0].totalQuestions).toBe(3);
      expect(result[0].correctCount).toBe(2);
      expect(result[0].accuracy).toBe(67);
    });

    it('should handle multiple question types', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ questionType: 'trueFalse', isCorrect: true }),
        createMockResponse({
          questionType: 'multipleChoice',
          isCorrect: false,
        }),
        createMockResponse({
          questionType: 'fillInTheBlanks',
          isCorrect: true,
        }),
      ];

      const result = analyzeQuizResults(responses);

      expect(result).toHaveLength(3);
      const trueFalse = result.find(r => r.questionType === 'trueFalse');
      const multipleChoice = result.find(
        r => r.questionType === 'multipleChoice'
      );
      const fillInBlanks = result.find(
        r => r.questionType === 'fillInTheBlanks'
      );

      expect(trueFalse?.accuracy).toBe(100);
      expect(multipleChoice?.accuracy).toBe(0);
      expect(fillInBlanks?.accuracy).toBe(100);
    });

    it('should calculate difficulty breakdown', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ difficulty: 'easy', isCorrect: true }),
        createMockResponse({
          questionId: 'q2',
          difficulty: 'easy',
          isCorrect: true,
        }),
        createMockResponse({
          questionId: 'q3',
          difficulty: 'normal',
          isCorrect: false,
        }),
        createMockResponse({
          questionId: 'q4',
          difficulty: 'hard',
          isCorrect: false,
        }),
      ];

      const result = analyzeQuizResults(responses);

      expect(result[0].difficultyBreakdown.easy.total).toBe(2);
      expect(result[0].difficultyBreakdown.easy.correct).toBe(2);
      expect(result[0].difficultyBreakdown.easy.accuracy).toBe(100);
      expect(result[0].difficultyBreakdown.normal.accuracy).toBe(0);
      expect(result[0].difficultyBreakdown.hard.accuracy).toBe(0);
    });

    it('should calculate average response time', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ responseTime: 3000 }),
        createMockResponse({ questionId: 'q2', responseTime: 5000 }),
        createMockResponse({ questionId: 'q3', responseTime: 7000 }),
      ];

      const result = analyzeQuizResults(responses);

      expect(result[0].averageTime).toBe(5000);
    });

    it('should handle missing response times', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ responseTime: undefined }),
        createMockResponse({ questionId: 'q2', responseTime: 4000 }),
      ];

      const result = analyzeQuizResults(responses);

      expect(result[0].averageTime).toBe(4000);
    });
  });

  describe('calculateOverallScore', () => {
    it('should return 0 for empty responses', () => {
      expect(calculateOverallScore([])).toBe(0);
    });

    it('should return 100 for all correct answers', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ isCorrect: true }),
        createMockResponse({ questionId: 'q2', isCorrect: true }),
      ];
      expect(calculateOverallScore(responses)).toBe(100);
    });

    it('should return 0 for all incorrect answers', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ isCorrect: false }),
        createMockResponse({ questionId: 'q2', isCorrect: false }),
      ];
      expect(calculateOverallScore(responses)).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ isCorrect: true }),
        createMockResponse({ questionId: 'q2', isCorrect: true }),
        createMockResponse({ questionId: 'q3', isCorrect: false }),
        createMockResponse({ questionId: 'q4', isCorrect: false }),
      ];
      expect(calculateOverallScore(responses)).toBe(50);
    });

    it('should round to nearest integer', () => {
      const responses: QuestionResponse[] = [
        createMockResponse({ isCorrect: true }),
        createMockResponse({ questionId: 'q2', isCorrect: true }),
        createMockResponse({ questionId: 'q3', isCorrect: false }),
      ];
      expect(calculateOverallScore(responses)).toBe(67);
    });
  });

  describe('determineLearningLevel', () => {
    it('should return advanced for score >= 80', () => {
      expect(determineLearningLevel(80)).toBe('advanced');
      expect(determineLearningLevel(90)).toBe('advanced');
      expect(determineLearningLevel(100)).toBe('advanced');
    });

    it('should return intermediate for score >= 60 and < 80', () => {
      expect(determineLearningLevel(60)).toBe('intermediate');
      expect(determineLearningLevel(70)).toBe('intermediate');
      expect(determineLearningLevel(79)).toBe('intermediate');
    });

    it('should return beginner for score < 60', () => {
      expect(determineLearningLevel(0)).toBe('beginner');
      expect(determineLearningLevel(30)).toBe('beginner');
      expect(determineLearningLevel(59)).toBe('beginner');
    });
  });
});
