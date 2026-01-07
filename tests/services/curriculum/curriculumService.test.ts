import { describe, it, expect } from 'vitest';
import {
  loadCurriculumFramework,
  getStandardsBySubjectAndGrade,
  getStandardsBySubjectAndStage,
  searchStandardsByKeyword,
  getStandardById,
  getStandardsByIds,
  buildAlignedPrompt,
  suggestStandardsForTopic,
  validateAlignedObjectives,
  getGradeOptions,
  getSubjectOptions,
  getStageOptions,
} from '../../../services/curriculum/curriculumService';
import type { AlignedLearningObjective } from '../../../src/core/types/curriculum';

describe('curriculumService', () => {
  describe('loadCurriculumFramework', () => {
    it('loads math curriculum framework', () => {
      const framework = loadCurriculumFramework('math');
      expect(framework.framework).toBe('taiwan-108');
      expect(framework.subject).toBe('math');
      expect(framework.standards.length).toBeGreaterThan(0);
    });

    it('loads english curriculum framework', () => {
      const framework = loadCurriculumFramework('english');
      expect(framework.framework).toBe('taiwan-108');
      expect(framework.subject).toBe('english');
      expect(framework.standards.length).toBeGreaterThan(0);
    });
  });

  describe('getStandardsBySubjectAndGrade', () => {
    it('returns standards for grade 7 math', () => {
      const standards = getStandardsBySubjectAndGrade('math', 7);
      expect(standards.length).toBeGreaterThan(0);
      standards.forEach(std => {
        expect(std.gradeRange.min).toBeLessThanOrEqual(7);
        expect(std.gradeRange.max).toBeGreaterThanOrEqual(7);
      });
    });

    it('returns standards for grade 3 english', () => {
      const standards = getStandardsBySubjectAndGrade('english', 3);
      expect(standards.length).toBeGreaterThan(0);
      standards.forEach(std => {
        expect(std.gradeRange.min).toBeLessThanOrEqual(3);
        expect(std.gradeRange.max).toBeGreaterThanOrEqual(3);
      });
    });

    it('returns empty array for invalid grade', () => {
      const standards = getStandardsBySubjectAndGrade('math', 99);
      expect(standards).toHaveLength(0);
    });
  });

  describe('getStandardsBySubjectAndStage', () => {
    it('returns standards for junior high math (J)', () => {
      const standards = getStandardsBySubjectAndStage('math', 'J');
      expect(standards.length).toBeGreaterThan(0);
      standards.forEach(std => {
        expect(std.stage).toBe('J');
      });
    });

    it('returns standards for elementary mid-level english (E2)', () => {
      const standards = getStandardsBySubjectAndStage('english', 'E2');
      expect(standards.length).toBeGreaterThan(0);
      standards.forEach(std => {
        expect(std.stage).toBe('E2');
      });
    });
  });

  describe('searchStandardsByKeyword', () => {
    it('finds math standards by keyword', () => {
      const standards = searchStandardsByKeyword('math', '方程式');
      expect(standards.length).toBeGreaterThan(0);
      const hasKeyword = standards.some(
        std =>
          std.description.includes('方程式') || std.keywords.includes('方程式')
      );
      expect(hasKeyword).toBe(true);
    });

    it('finds english standards by keyword', () => {
      const standards = searchStandardsByKeyword('english', '聽力');
      expect(standards.length).toBeGreaterThan(0);
    });

    it('returns empty for non-matching keyword', () => {
      const standards = searchStandardsByKeyword('math', 'xyz123nonexistent');
      expect(standards).toHaveLength(0);
    });

    it('is case-insensitive', () => {
      const lower = searchStandardsByKeyword('english', 'speaking');
      const upper = searchStandardsByKeyword('english', 'SPEAKING');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('getStandardById', () => {
    it('finds standard by exact ID', () => {
      const std = getStandardById('TW108-M-J-n-01');
      expect(std).toBeDefined();
      expect(std?.id).toBe('TW108-M-J-n-01');
      expect(std?.subject).toBe('math');
    });

    it('returns undefined for non-existent ID', () => {
      const std = getStandardById('NONEXISTENT-ID');
      expect(std).toBeUndefined();
    });
  });

  describe('getStandardsByIds', () => {
    it('returns multiple standards by IDs', () => {
      const ids = ['TW108-M-J-n-01', 'TW108-M-J-n-02'];
      const standards = getStandardsByIds(ids);
      expect(standards).toHaveLength(2);
      expect(standards.map(s => s.id)).toEqual(ids);
    });

    it('filters out non-existent IDs', () => {
      const ids = ['TW108-M-J-n-01', 'NONEXISTENT'];
      const standards = getStandardsByIds(ids);
      expect(standards).toHaveLength(1);
    });
  });

  describe('buildAlignedPrompt', () => {
    it('builds prompt with standards', () => {
      const standards = getStandardsByIds(['TW108-M-J-n-01']);
      const prompt = buildAlignedPrompt('負數運算', standards);

      expect(prompt).toContain('TW108-M-J-n-01');
      expect(prompt).toContain('負數運算');
      expect(prompt).toContain('Taiwan 108 Curriculum Standards');
    });

    it('returns empty string when no standards provided', () => {
      const prompt = buildAlignedPrompt('test topic', []);
      expect(prompt).toBe('');
    });
  });

  describe('suggestStandardsForTopic', () => {
    it('suggests relevant standards for a math topic', () => {
      const suggestions = suggestStandardsForTopic('負數加法運算', 'math');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('suggests relevant standards for an english topic', () => {
      const suggestions = suggestStandardsForTopic('英語聽力練習', 'english');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('validateAlignedObjectives', () => {
    it('validates correctly aligned objectives', () => {
      const standards = getStandardsByIds(['TW108-M-J-n-01']);
      const objectives: AlignedLearningObjective[] = [
        {
          objective: '理解負數的意義',
          description: '學習負數的基本概念',
          alignedStandards: ['TW108-M-J-n-01'],
          bloomLevel: 'understand',
        },
      ];

      const result = validateAlignedObjectives(objectives, standards);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('detects unaligned objectives', () => {
      const standards = getStandardsByIds(['TW108-M-J-n-01']);
      const objectives: AlignedLearningObjective[] = [
        {
          objective: '理解方程式',
          description: '學習方程式',
          alignedStandards: ['TW108-M-J-a-01'],
          bloomLevel: 'understand',
        },
      ];

      const result = validateAlignedObjectives(objectives, standards);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('detects objectives without alignment', () => {
      const standards = getStandardsByIds(['TW108-M-J-n-01']);
      const objectives: AlignedLearningObjective[] = [
        {
          objective: '理解負數',
          description: '學習負數',
          alignedStandards: [],
          bloomLevel: 'understand',
        },
      ];

      const result = validateAlignedObjectives(objectives, standards);
      expect(result.valid).toBe(false);
    });
  });

  describe('option generators', () => {
    it('getGradeOptions returns 12 grades', () => {
      const options = getGradeOptions();
      expect(options).toHaveLength(12);
      expect(options[0]).toEqual({ value: 1, label: '1 年級' });
      expect(options[11]).toEqual({ value: 12, label: '12 年級' });
    });

    it('getSubjectOptions returns math and english', () => {
      const options = getSubjectOptions();
      expect(options).toHaveLength(2);
      expect(options.map(o => o.value)).toContain('math');
      expect(options.map(o => o.value)).toContain('english');
    });

    it('getStageOptions returns all 5 stages', () => {
      const options = getStageOptions();
      expect(options).toHaveLength(5);
      expect(options.map(o => o.value)).toEqual(['E1', 'E2', 'E3', 'J', 'S']);
    });
  });
});
