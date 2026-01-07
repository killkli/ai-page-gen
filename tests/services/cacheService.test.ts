import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateCacheKey,
  setCache,
  getCache,
  clearAICache,
} from '../../services/cacheService';

describe('cacheService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateCacheKey', () => {
    it('generates consistent keys for same input', () => {
      const key1 = generateCacheKey('test prompt');
      const key2 = generateCacheKey('test prompt');
      expect(key1).toBe(key2);
    });

    it('generates different keys for different inputs', () => {
      const key1 = generateCacheKey('prompt one');
      const key2 = generateCacheKey('prompt two');
      expect(key1).not.toBe(key2);
    });

    it('handles empty string by returning hash without prefix', () => {
      const key = generateCacheKey('');
      expect(key).toBe('0');
    });

    it('generates keys with correct prefix', () => {
      const key = generateCacheKey('any prompt');
      expect(key).toMatch(/^ai_cache_-?\d+$/);
    });

    it('handles unicode characters', () => {
      const key = generateCacheKey('中文提示詞');
      expect(key).toMatch(/^ai_cache_-?\d+$/);
    });

    it('handles long strings', () => {
      const longPrompt = 'a'.repeat(10000);
      const key = generateCacheKey(longPrompt);
      expect(key).toMatch(/^ai_cache_-?\d+$/);
    });
  });

  describe('setCache', () => {
    it('stores data in localStorage', () => {
      setCache('test_key', { value: 'test' });

      const stored = localStorage.getItem('test_key');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual({ value: 'test' });
    });

    it('stores timestamp with entry', () => {
      vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

      setCache('timestamp_test', 'data');

      const stored = JSON.parse(localStorage.getItem('timestamp_test')!);
      expect(stored.timestamp).toBe(new Date('2024-01-15T10:00:00Z').getTime());
    });

    it('uses default TTL of 24 hours when not specified', () => {
      setCache('ttl_test', 'data');

      const stored = JSON.parse(localStorage.getItem('ttl_test')!);
      expect(stored.expiresIn).toBe(24 * 60 * 60 * 1000);
    });

    it('uses custom TTL when specified', () => {
      const customTTL = 60 * 1000; // 1 minute
      setCache('custom_ttl', 'data', customTTL);

      const stored = JSON.parse(localStorage.getItem('custom_ttl')!);
      expect(stored.expiresIn).toBe(customTTL);
    });

    it('handles complex data types', () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { a: { b: 'c' } },
        number: 42,
        boolean: true,
        nullValue: null,
      };

      setCache('complex_data', complexData);

      const stored = JSON.parse(localStorage.getItem('complex_data')!);
      expect(stored.data).toEqual(complexData);
    });

    it('handles localStorage errors gracefully', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      expect(() => setCache('error_test', 'data')).not.toThrow();

      mockSetItem.mockRestore();
    });
  });

  describe('getCache', () => {
    it('retrieves cached data', () => {
      setCache('get_test', { message: 'hello' });

      const result = getCache<{ message: string }>('get_test');
      expect(result).toEqual({ message: 'hello' });
    });

    it('returns null for non-existent key', () => {
      const result = getCache('non_existent');
      expect(result).toBeNull();
    });

    it('returns null for expired cache', () => {
      vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
      setCache('expiring', 'data', 1000); // 1 second TTL

      vi.setSystemTime(new Date('2024-01-15T10:00:02Z')); // 2 seconds later

      const result = getCache('expiring');
      expect(result).toBeNull();
    });

    it('removes expired entry from localStorage', () => {
      vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
      setCache('to_remove', 'data', 1000);

      vi.setSystemTime(new Date('2024-01-15T10:00:02Z'));
      getCache('to_remove');

      expect(localStorage.getItem('to_remove')).toBeNull();
    });

    it('returns data if not yet expired', () => {
      vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
      setCache('not_expired', 'fresh data', 10000);

      vi.setSystemTime(new Date('2024-01-15T10:00:05Z')); // 5 seconds later

      const result = getCache('not_expired');
      expect(result).toBe('fresh data');
    });

    it('handles malformed JSON gracefully', () => {
      localStorage.setItem('malformed', 'not valid json');

      const result = getCache('malformed');
      expect(result).toBeNull();
    });

    it('handles localStorage errors gracefully', () => {
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
      mockGetItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const result = getCache('error_key');
      expect(result).toBeNull();

      mockGetItem.mockRestore();
    });
  });

  describe('clearAICache', () => {
    it('removes all AI cache entries', () => {
      setCache('ai_cache_1', 'data1');
      setCache('ai_cache_2', 'data2');
      localStorage.setItem('other_key', 'should remain');

      clearAICache();

      expect(localStorage.getItem('ai_cache_1')).toBeNull();
      expect(localStorage.getItem('ai_cache_2')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('should remain');
    });

    it('handles empty localStorage', () => {
      expect(() => clearAICache()).not.toThrow();
    });

    it('only removes keys with ai_cache_ prefix', () => {
      localStorage.setItem('ai_cache_test', 'cached');
      localStorage.setItem('user_setting', 'setting');
      localStorage.setItem('api_key', 'key');

      clearAICache();

      expect(localStorage.getItem('ai_cache_test')).toBeNull();
      expect(localStorage.getItem('user_setting')).toBe('setting');
      expect(localStorage.getItem('api_key')).toBe('key');
    });

    it('handles localStorage errors gracefully', () => {
      const mockKeys = vi.spyOn(Object, 'keys');
      mockKeys.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(() => clearAICache()).not.toThrow();

      mockKeys.mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it('full cache lifecycle', () => {
      const prompt = 'Generate learning objectives for photosynthesis';
      const key = generateCacheKey(prompt);
      const responseData = {
        objectives: ['Understand light reactions', 'Explain carbon fixation'],
      };

      // Cache miss
      expect(getCache(key)).toBeNull();

      // Set cache
      setCache(key, responseData);

      // Cache hit
      const cached = getCache(key);
      expect(cached).toEqual(responseData);

      // Clear cache
      clearAICache();

      // Cache miss again
      expect(getCache(key)).toBeNull();
    });

    it('different prompts have isolated caches', () => {
      const key1 = generateCacheKey('prompt 1');
      const key2 = generateCacheKey('prompt 2');

      setCache(key1, { result: 'response 1' });
      setCache(key2, { result: 'response 2' });

      expect(getCache(key1)).toEqual({ result: 'response 1' });
      expect(getCache(key2)).toEqual({ result: 'response 2' });
    });
  });
});
