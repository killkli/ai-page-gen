import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateLearningObjectives } from '../../services/geminiService';

// Mock the GoogleGenAI class
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            models = {
                generateContent: mockGenerateContent,
            };
            constructor(public config: any) { }
        },
    };
});

describe('geminiService', () => {
    const apiKey = 'test-api-key';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generateLearningObjectives returns parsed JSON', async () => {
        const mockResponse = {
            text: JSON.stringify([
                { objective: 'Obj 1', description: 'Desc 1', teachingExample: 'Ex 1' }
            ]),
        };
        mockGenerateContent.mockResolvedValue(mockResponse);

        const result = await generateLearningObjectives('Test Topic', apiKey);

        expect(result).toEqual([
            { objective: 'Obj 1', description: 'Desc 1', teachingExample: 'Ex 1' }
        ]);
    });

    it('handles API errors gracefully', async () => {
        mockGenerateContent.mockRejectedValue(new Error('API Error'));

        await expect(generateLearningObjectives('Test Topic', apiKey)).rejects.toThrow('API Error');
    });
});
