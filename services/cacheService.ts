/**
 * Cache Service
 * Handles caching of AI responses using localStorage to improve performance and reduce costs.
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresIn: number;
}

const CACHE_PREFIX = 'ai_cache_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generates a cache key from a string (e.g., prompt)
 */
export const generateCacheKey = (prompt: string): string => {
    let hash = 0;
    if (prompt.length === 0) return hash.toString();
    for (let i = 0; i < prompt.length; i++) {
        const char = prompt.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `${CACHE_PREFIX}${hash}`;
};

/**
 * Saves data to cache
 */
export const setCache = <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresIn: ttl,
        };
        localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
        console.warn('Failed to save to cache:', error);
        // Handle quota exceeded or other errors gracefully
    }
};

/**
 * Retrieves data from cache
 */
export const getCache = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const entry: CacheEntry<T> = JSON.parse(item);
        const now = Date.now();

        if (now - entry.timestamp > entry.expiresIn) {
            localStorage.removeItem(key);
            return null;
        }

        return entry.data;
    } catch (error) {
        console.warn('Failed to retrieve from cache:', error);
        return null;
    }
};

/**
 * Clears all AI cache entries
 */
export const clearAICache = (): void => {
    try {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Failed to clear cache:', error);
    }
};
