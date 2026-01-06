import { z } from 'zod';

export interface AIValidationError {
  type: 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  userMessage: string;
  context: {
    promptType?: string;
    provider?: string;
    model?: string;
    rawOutputPreview?: string;
  };
  zodError?: z.ZodError;
  originalError?: unknown;
}

export class AIResponseValidationError extends Error {
  public readonly validationError: AIValidationError;

  constructor(error: AIValidationError) {
    super(error.message);
    this.name = 'AIResponseValidationError';
    this.validationError = error;
  }

  getUserMessage(): string {
    return this.validationError.userMessage;
  }

  getDebugInfo(): string {
    const { type, context, zodError } = this.validationError;
    const parts = [`Error Type: ${type}`];

    if (context.promptType) parts.push(`Prompt: ${context.promptType}`);
    if (context.provider) parts.push(`Provider: ${context.provider}`);
    if (context.model) parts.push(`Model: ${context.model}`);
    if (context.rawOutputPreview)
      parts.push(`Output Preview: ${context.rawOutputPreview}`);
    if (zodError)
      parts.push(
        `Validation Issues: ${zodError.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('; ')}`
      );

    return parts.join('\n');
  }
}

export function createValidationError(
  type: AIValidationError['type'],
  message: string,
  options: {
    promptType?: string;
    provider?: string;
    model?: string;
    rawOutput?: unknown;
    zodError?: z.ZodError;
    originalError?: unknown;
  } = {}
): AIResponseValidationError {
  const rawOutputPreview = options.rawOutput
    ? String(options.rawOutput).substring(0, 200) +
      (String(options.rawOutput).length > 200 ? '...' : '')
    : undefined;

  const userMessages: Record<AIValidationError['type'], string> = {
    PARSE_ERROR: 'AI 回應格式異常，請重試。如問題持續，請稍後再試。',
    VALIDATION_ERROR: 'AI 產生的內容結構不完整，請重試。',
    UNKNOWN_ERROR: '發生未知錯誤，請重試。',
  };

  return new AIResponseValidationError({
    type,
    message,
    userMessage: userMessages[type],
    context: {
      promptType: options.promptType,
      provider: options.provider,
      model: options.model,
      rawOutputPreview,
    },
    zodError: options.zodError,
    originalError: options.originalError,
  });
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: AIResponseValidationError;
}

export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  promptType: string,
  metadata?: { provider?: string; model?: string }
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const error = createValidationError(
    'VALIDATION_ERROR',
    `Schema validation failed for ${promptType}`,
    {
      promptType,
      provider: metadata?.provider,
      model: metadata?.model,
      rawOutput: data,
      zodError: result.error,
    }
  );

  console.error(`[AI Validation] ${promptType} failed:`, error.getDebugInfo());

  return { success: false, error };
}

export function parseAndValidate<T>(
  schema: z.ZodSchema<T>,
  rawContent: unknown,
  promptType: string,
  metadata?: { provider?: string; model?: string }
): ValidationResult<T> {
  let parsedData: unknown = rawContent;

  if (typeof rawContent === 'string') {
    try {
      let cleanedContent = rawContent
        .replace(/```json\n/g, '')
        .replace(/\n```/g, '')
        .replace(/```\n/g, '')
        .replace(/```/g, '')
        .trim();

      if (!cleanedContent.startsWith('{') && !cleanedContent.startsWith('[')) {
        const jsonStart = Math.min(
          cleanedContent.indexOf('{') !== -1
            ? cleanedContent.indexOf('{')
            : Infinity,
          cleanedContent.indexOf('[') !== -1
            ? cleanedContent.indexOf('[')
            : Infinity
        );

        if (jsonStart !== Infinity) {
          const isObject = cleanedContent.charAt(jsonStart) === '{';
          const jsonEnd = isObject
            ? cleanedContent.lastIndexOf('}')
            : cleanedContent.lastIndexOf(']');

          if (jsonEnd > jsonStart) {
            cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
          }
        }
      }

      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      const error = createValidationError(
        'PARSE_ERROR',
        `JSON parsing failed for ${promptType}`,
        {
          promptType,
          provider: metadata?.provider,
          model: metadata?.model,
          rawOutput: rawContent,
          originalError: parseError,
        }
      );

      console.error(
        `[AI Validation] ${promptType} parse failed:`,
        error.getDebugInfo()
      );

      return { success: false, error };
    }
  }

  return validateWithSchema(schema, parsedData, promptType, metadata);
}

export function logValidationSuccess(
  promptType: string,
  metadata?: { provider?: string; model?: string }
): void {
  console.log(
    `[AI Validation] ${promptType} validated successfully`,
    metadata ? `(${metadata.provider}/${metadata.model})` : ''
  );
}
