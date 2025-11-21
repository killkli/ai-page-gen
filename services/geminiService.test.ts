import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callProviderSystem } from './geminiService';
import * as basicGenerators from './ai/basicGenerators';
import { clearAICache, generateCacheKey } from './cacheService';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock _callProviderSystem
vi.mock('./ai/basicGenerators', () => ({
    callProviderSystem: vi.fn()
}));

describe('geminiService Caching', () => {
    const mockPrompt = 'test prompt';
    const mockApiKey = 'test-api-key';
    const mockResponse = 'test response';

    beforeEach(() => {
        vi.clearAllMocks();
        clearAICache();
        localStorageMock.clear();
    });

    it('should call provider if cache is empty', async () => {
        vi.mocked(basicGenerators.callProviderSystem).mockResolvedValue(mockResponse);

        const result = await callProviderSystem(mockPrompt, mockApiKey);

        expect(result).toBe(mockResponse);
        expect(basicGenerators.callProviderSystem).toHaveBeenCalledWith(mockPrompt, mockApiKey);
        expect(basicGenerators.callProviderSystem).toHaveBeenCalledTimes(1);
    });

    it('should return cached response if cache exists and is valid', async () => {
        vi.mocked(basicGenerators.callProviderSystem).mockResolvedValue(mockResponse);

        // First call to populate cache
        await callProviderSystem(mockPrompt, mockApiKey);

        // Second call should use cache
        const result = await callProviderSystem(mockPrompt, mockApiKey);

        expect(result).toBe(mockResponse);
        expect(basicGenerators.callProviderSystem).toHaveBeenCalledTimes(1); // Still 1 call
    });

    it('should call provider if cache is expired', async () => {
        vi.mocked(basicGenerators.callProviderSystem).mockResolvedValue(mockResponse);

        // Manually set an expired cache entry
        const cacheKey = generateCacheKey(mockPrompt);
        const expiredData = {
            data: 'old response', // Note: cacheService uses 'data', not 'response'
            timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago (TTL is 24h)
            expiresIn: 24 * 60 * 60 * 1000
        };
        localStorageMock.setItem(cacheKey, JSON.stringify(expiredData));

        const result = await callProviderSystem(mockPrompt, mockApiKey);

        expect(result).toBe(mockResponse);
        expect(basicGenerators.callProviderSystem).toHaveBeenCalledWith(mockPrompt, mockApiKey);
        expect(basicGenerators.callProviderSystem).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors and not cache them', async () => {
        const error = new Error('API Error');
        vi.mocked(basicGenerators.callProviderSystem).mockRejectedValue(error);

        await expect(callProviderSystem(mockPrompt, mockApiKey)).rejects.toThrow('API Error');

        // Verify nothing was cached
        const cacheKey = generateCacheKey(mockPrompt);
        expect(localStorageMock.getItem(cacheKey)).toBeNull();
    });
});
