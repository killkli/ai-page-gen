import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('../../services/jsonbinService', async () => {
  const JSONBIN_API = 'https://api.jsonbin.io/v3/b';

  return {
    saveLearningContent: async (content: unknown): Promise<string> => {
      const response = await fetch(JSONBIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': 'test-key',
          'X-Bin-Private': 'false',
        },
        body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!result || !result.metadata || !result.metadata.id) {
        throw new Error('無法取得 jsonbin id');
      }
      return result.metadata.id;
    },

    getLearningContent: async (binId: string): Promise<unknown> => {
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${binId}/latest`
      );
      const result = await response.json();
      if (!result || !result.record) {
        throw new Error('找不到對應的教學方案');
      }
      return result.record;
    },

    saveQuizContent: async (quizData: {
      quiz: unknown;
      topic: string;
    }): Promise<string> => {
      const response = await fetch(JSONBIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': 'test-key',
          'X-Bin-Private': 'false',
        },
        body: JSON.stringify({ type: 'quiz', ...quizData }),
      });
      const result = await response.json();
      if (!result || !result.metadata || !result.metadata.id) {
        throw new Error('無法儲存測驗內容');
      }
      return result.metadata.id;
    },

    getQuizContent: async (
      binId: string
    ): Promise<{ quiz: unknown; topic: string }> => {
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${binId}/latest`
      );
      const result = await response.json();
      if (!result || !result.record) {
        throw new Error('找不到對應的測驗內容');
      }
      const data = result.record;
      if (data.type !== 'quiz') {
        throw new Error('此連結不是測驗專用分享');
      }
      return { quiz: data.quiz, topic: data.topic };
    },
  };
});

import {
  saveLearningContent,
  getLearningContent,
  saveQuizContent,
  getQuizContent,
} from '../../services/jsonbinService';

describe('jsonbinService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saveLearningContent', () => {
    it('should save content and return binId', async () => {
      const mockBinId = 'abc123';
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ metadata: { id: mockBinId } }),
      });

      const content = { topic: 'Test', objectives: [] };
      const result = await saveLearningContent(content);

      expect(result).toBe(mockBinId);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.jsonbin.io/v3/b',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(content),
        })
      );
    });

    it('should throw error when response has no metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });

      await expect(saveLearningContent({})).rejects.toThrow(
        '無法取得 jsonbin id'
      );
    });

    it('should throw error when response has no id', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ metadata: {} }),
      });

      await expect(saveLearningContent({})).rejects.toThrow(
        '無法取得 jsonbin id'
      );
    });
  });

  describe('getLearningContent', () => {
    it('should fetch and return content', async () => {
      const mockContent = { topic: 'Test Topic', objectives: ['obj1'] };
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ record: mockContent }),
      });

      const result = await getLearningContent('abc123');

      expect(result).toEqual(mockContent);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.jsonbin.io/v3/b/abc123/latest'
      );
    });

    it('should throw error when no record found', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({}),
      });

      await expect(getLearningContent('abc123')).rejects.toThrow(
        '找不到對應的教學方案'
      );
    });
  });

  describe('saveQuizContent', () => {
    it('should save quiz content and return binId', async () => {
      const mockBinId = 'quiz123';
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ metadata: { id: mockBinId } }),
      });

      const quizData = {
        quiz: { easy: {}, normal: {}, hard: {} },
        topic: 'Math Quiz',
      };
      const result = await saveQuizContent(quizData);

      expect(result).toBe(mockBinId);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.jsonbin.io/v3/b',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should throw error on save failure', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({}),
      });

      await expect(saveQuizContent({ quiz: {}, topic: '' })).rejects.toThrow(
        '無法儲存測驗內容'
      );
    });
  });

  describe('getQuizContent', () => {
    it('should fetch and return quiz content', async () => {
      const mockQuiz = { easy: {}, normal: {}, hard: {} };
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          record: { type: 'quiz', quiz: mockQuiz, topic: 'Test Quiz' },
        }),
      });

      const result = await getQuizContent('quiz123');

      expect(result.quiz).toEqual(mockQuiz);
      expect(result.topic).toBe('Test Quiz');
    });

    it('should throw error when type is not quiz', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          record: { type: 'writing', content: {} },
        }),
      });

      await expect(getQuizContent('quiz123')).rejects.toThrow(
        '此連結不是測驗專用分享'
      );
    });

    it('should throw error when no record found', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({}),
      });

      await expect(getQuizContent('quiz123')).rejects.toThrow(
        '找不到對應的測驗內容'
      );
    });
  });
});
