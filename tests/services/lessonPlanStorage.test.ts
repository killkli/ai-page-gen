import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import 'fake-indexeddb/auto';
import {
  generateLessonPlanId,
  createStoredLessonPlan,
} from '../../services/lessonPlanStorage';

describe('generateLessonPlanId', () => {
  it('generates unique IDs', () => {
    const id1 = generateLessonPlanId();
    const id2 = generateLessonPlanId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^lesson_\d+_[a-z0-9]+$/);
    expect(id2).toMatch(/^lesson_\d+_[a-z0-9]+$/);
  });

  it('includes timestamp in the ID', () => {
    const before = Date.now();
    const id = generateLessonPlanId();
    const after = Date.now();

    const timestamp = parseInt(id.split('_')[1], 10);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});

describe('createStoredLessonPlan', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T10:30:00.000Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('creates a complete StoredLessonPlan from topic and content', () => {
    const content = {
      learningObjectives: [{ objective: 'Test objective' }],
      contentBreakdown: [{ topic: 'Test breakdown' }],
      quiz: { easy: [], normal: [], hard: [] },
    };

    const plan = createStoredLessonPlan('Test Topic', content);

    expect(plan.topic).toBe('Test Topic');
    expect(plan.createdAt).toBe('2024-03-15T10:30:00.000Z');
    expect(plan.lastAccessedAt).toBe('2024-03-15T10:30:00.000Z');
    expect(plan.content).toEqual(content);
    expect(plan.metadata?.totalSections).toBe(3);
    expect(plan.metadata?.hasQuiz).toBe(true);
    expect(plan.metadata?.hasWriting).toBe(false);
    expect(plan.id).toMatch(/^lesson_\d+_[a-z0-9]+$/);
  });

  it('counts sections correctly including writing practice', () => {
    const content = {
      learningObjectives: [],
      writingPractice: { prompt: 'Write something' },
    };

    const plan = createStoredLessonPlan('Writing Test', content);

    expect(plan.metadata?.totalSections).toBe(2);
    expect(plan.metadata?.hasWriting).toBe(true);
    expect(plan.metadata?.hasQuiz).toBe(false);
  });

  it('handles empty content correctly', () => {
    const content = {};

    const plan = createStoredLessonPlan('Empty Content', content);

    expect(plan.metadata?.totalSections).toBe(0);
    expect(plan.metadata?.hasWriting).toBe(false);
    expect(plan.metadata?.hasQuiz).toBe(false);
  });

  it('counts all section types', () => {
    const content = {
      learningObjectives: [{ objective: 'Test' }],
      contentBreakdown: [{ topic: 'Breakdown' }],
      confusingPoints: [{ point: 'Confusion' }],
      classroomActivities: [{ title: 'Activity' }],
      quiz: { easy: [] },
      writingPractice: { prompt: 'Write' },
    };

    const plan = createStoredLessonPlan('Full Content', content);

    expect(plan.metadata?.totalSections).toBe(6);
    expect(plan.metadata?.hasWriting).toBe(true);
    expect(plan.metadata?.hasQuiz).toBe(true);
  });

  it('includes selectedLevel and selectedVocabularyLevel in content', () => {
    const content = {
      learningObjectives: [],
      selectedLevel: { id: 'beginner', name: 'Beginner' },
      selectedVocabularyLevel: { id: 'basic', name: 'Basic' },
    };

    const plan = createStoredLessonPlan('Level Test', content);

    expect(plan.content.selectedLevel).toEqual({
      id: 'beginner',
      name: 'Beginner',
    });
    expect(plan.content.selectedVocabularyLevel).toEqual({
      id: 'basic',
      name: 'Basic',
    });
  });
});

describe('StoredLessonPlan interface', () => {
  it('has required fields', () => {
    const plan = createStoredLessonPlan('Interface Test', {});

    expect(plan).toHaveProperty('id');
    expect(plan).toHaveProperty('topic');
    expect(plan).toHaveProperty('createdAt');
    expect(plan).toHaveProperty('lastAccessedAt');
    expect(plan).toHaveProperty('content');
    expect(plan).toHaveProperty('metadata');
  });

  it('metadata has expected shape', () => {
    const plan = createStoredLessonPlan('Metadata Test', { quiz: {} });

    expect(plan.metadata).toHaveProperty('totalSections');
    expect(plan.metadata).toHaveProperty('hasQuiz');
    expect(plan.metadata).toHaveProperty('hasWriting');
    expect(typeof plan.metadata?.totalSections).toBe('number');
    expect(typeof plan.metadata?.hasQuiz).toBe('boolean');
    expect(typeof plan.metadata?.hasWriting).toBe('boolean');
  });
});
