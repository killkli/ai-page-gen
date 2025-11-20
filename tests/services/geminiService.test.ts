import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateLearningObjectives, generateOnlineInteractiveQuizForLevel } from '../../services/geminiService';

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

    it('generateOnlineInteractiveQuizForLevel returns parsed JSON', async () => {
        const mockQuizData = {
            easy: { trueFalse: [{ statement: 'Q1', isTrue: true }] },
            normal: {},
            hard: {}
        };
        const mockResponse = {
            text: JSON.stringify(mockQuizData),
        };
        mockGenerateContent.mockResolvedValue(mockResponse);

        const mockLevel = { name: 'Level 1', description: 'Desc' };
        const mockObjectives = [{ objective: 'Obj 1', description: 'Desc 1', teachingExample: 'Ex 1' }];

        const result = await generateOnlineInteractiveQuizForLevel('Test Topic', mockLevel, apiKey, mockObjectives);
        expect(result).toEqual(mockQuizData);
    });

    it('handles malformed JSON gracefully', async () => {
        const mockResponse = {
            text: 'Invalid JSON',
        };
        mockGenerateContent.mockResolvedValue(mockResponse);

        await expect(generateLearningObjectives('Test Topic', apiKey)).rejects.toThrow();
    });
});
