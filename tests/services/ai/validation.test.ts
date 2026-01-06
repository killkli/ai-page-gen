import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  AIResponseValidationError,
  createValidationError,
  validateWithSchema,
  parseAndValidate,
} from '../../../services/ai/validation';

const TestSchema = z.object({
  name: z.string(),
  value: z.number(),
});

describe('AIResponseValidationError', () => {
  it('should create error with user message', () => {
    const error = createValidationError('PARSE_ERROR', 'Test error');
    expect(error).toBeInstanceOf(AIResponseValidationError);
    expect(error.getUserMessage()).toContain('AI 回應格式異常');
  });

  it('should include context in debug info', () => {
    const error = createValidationError('VALIDATION_ERROR', 'Test error', {
      promptType: 'learningObjectives',
      provider: 'gemini',
      model: 'gemini-pro',
    });
    const debugInfo = error.getDebugInfo();
    expect(debugInfo).toContain('learningObjectives');
    expect(debugInfo).toContain('gemini');
    expect(debugInfo).toContain('gemini-pro');
  });

  it('should truncate long raw output', () => {
    const longOutput = 'x'.repeat(500);
    const error = createValidationError('PARSE_ERROR', 'Test error', {
      rawOutput: longOutput,
    });
    const debugInfo = error.getDebugInfo();
    expect(debugInfo.length).toBeLessThan(longOutput.length);
    expect(debugInfo).toContain('...');
  });
});

describe('createValidationError', () => {
  it('should create PARSE_ERROR with appropriate message', () => {
    const error = createValidationError('PARSE_ERROR', 'JSON parse failed');
    expect(error.validationError.type).toBe('PARSE_ERROR');
    expect(error.getUserMessage()).toContain('格式異常');
  });

  it('should create VALIDATION_ERROR with appropriate message', () => {
    const error = createValidationError('VALIDATION_ERROR', 'Schema failed');
    expect(error.validationError.type).toBe('VALIDATION_ERROR');
    expect(error.getUserMessage()).toContain('結構不完整');
  });

  it('should create UNKNOWN_ERROR with appropriate message', () => {
    const error = createValidationError(
      'UNKNOWN_ERROR',
      'Something went wrong'
    );
    expect(error.validationError.type).toBe('UNKNOWN_ERROR');
    expect(error.getUserMessage()).toContain('未知錯誤');
  });
});

describe('validateWithSchema', () => {
  it('should return success for valid data', () => {
    const data = { name: 'test', value: 42 };
    const result = validateWithSchema(TestSchema, data, 'testPrompt');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('should return error for invalid data', () => {
    const data = { name: 'test', value: 'not a number' };
    const result = validateWithSchema(TestSchema, data, 'testPrompt');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AIResponseValidationError);
    }
  });

  it('should include metadata in error context', () => {
    const data = { name: 123 };
    const result = validateWithSchema(TestSchema, data, 'testPrompt', {
      provider: 'openrouter',
      model: 'gpt-4',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.validationError.context.provider).toBe('openrouter');
      expect(result.error?.validationError.context.model).toBe('gpt-4');
    }
  });
});

describe('parseAndValidate', () => {
  it('should parse JSON string and validate', () => {
    const jsonString = '{"name": "test", "value": 42}';
    const result = parseAndValidate(TestSchema, jsonString, 'testPrompt');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'test', value: 42 });
    }
  });

  it('should handle markdown code blocks', () => {
    const jsonWithMarkdown = '```json\n{"name": "test", "value": 42}\n```';
    const result = parseAndValidate(TestSchema, jsonWithMarkdown, 'testPrompt');
    expect(result.success).toBe(true);
  });

  it('should extract JSON from text with preamble', () => {
    const jsonWithPreamble =
      'Here is the result:\n{"name": "test", "value": 42}\nEnd of response.';
    const result = parseAndValidate(TestSchema, jsonWithPreamble, 'testPrompt');
    expect(result.success).toBe(true);
  });

  it('should return parse error for invalid JSON', () => {
    const invalidJson = '{"name": "test", value: }';
    const result = parseAndValidate(TestSchema, invalidJson, 'testPrompt');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.validationError.type).toBe('PARSE_ERROR');
    }
  });

  it('should return validation error for valid JSON with wrong structure', () => {
    const wrongStructure = '{"wrong": "fields"}';
    const result = parseAndValidate(TestSchema, wrongStructure, 'testPrompt');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.validationError.type).toBe('VALIDATION_ERROR');
    }
  });

  it('should handle already parsed objects', () => {
    const data = { name: 'test', value: 42 };
    const result = parseAndValidate(TestSchema, data, 'testPrompt');
    expect(result.success).toBe(true);
  });

  it('should handle arrays in JSON', () => {
    const ArraySchema = z.array(z.object({ id: z.number() }));
    const jsonArray = '[{"id": 1}, {"id": 2}]';
    const result = parseAndValidate(ArraySchema, jsonArray, 'testPrompt');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });
});
