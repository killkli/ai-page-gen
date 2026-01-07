import { describe, it, expect, vi } from 'vitest';
import {
  ErrorCode,
  AppError,
  isAppError,
  toAppError,
  ErrorFactory,
} from '../../../src/core/errors';

describe('ErrorCode', () => {
  it('has unique values for all codes', () => {
    const values = Object.values(ErrorCode);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('follows naming convention for AI errors', () => {
    expect(ErrorCode.AI_GENERATION_FAILED).toMatch(/^AI_/);
    expect(ErrorCode.AI_VALIDATION_FAILED).toMatch(/^AI_/);
    expect(ErrorCode.AI_RATE_LIMITED).toMatch(/^AI_/);
  });

  it('follows naming convention for auth errors', () => {
    expect(ErrorCode.API_KEY_INVALID).toMatch(/^AUTH_/);
    expect(ErrorCode.API_KEY_MISSING).toMatch(/^AUTH_/);
  });
});

describe('AppError', () => {
  it('creates error with required properties', () => {
    const error = new AppError(
      ErrorCode.AI_GENERATION_FAILED,
      'Internal error message',
      '用戶可見的錯誤訊息'
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.code).toBe(ErrorCode.AI_GENERATION_FAILED);
    expect(error.message).toBe('Internal error message');
    expect(error.userMessage).toBe('用戶可見的錯誤訊息');
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('creates error with optional properties', () => {
    const cause = new Error('Original error');
    const retryAction = vi.fn();

    const error = new AppError(
      ErrorCode.NETWORK_OFFLINE,
      'Network unavailable',
      '網路連線中斷',
      {
        recoveryActions: [{ label: '重試', action: retryAction }],
        cause,
        context: { attempts: 3 },
      }
    );

    expect(error.recoveryActions).toHaveLength(1);
    expect(error.recoveryActions![0].label).toBe('重試');
    expect(error.cause).toBe(cause);
    expect(error.context).toEqual({ attempts: 3 });
  });

  it('serializes to JSON correctly', () => {
    const error = new AppError(
      ErrorCode.VALIDATION_FAILED,
      'Validation error',
      '驗證失敗',
      { context: { field: 'email' } }
    );

    const json = error.toJSON();

    expect(json.name).toBe('AppError');
    expect(json.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(json.message).toBe('Validation error');
    expect(json.userMessage).toBe('驗證失敗');
    expect(json.context).toEqual({ field: 'email' });
    expect(json.timestamp).toBeDefined();
  });

  describe('type checking methods', () => {
    it('isCode checks specific error code', () => {
      const error = new AppError(
        ErrorCode.AI_RATE_LIMITED,
        'Rate limited',
        '請求過多'
      );

      expect(error.isCode(ErrorCode.AI_RATE_LIMITED)).toBe(true);
      expect(error.isCode(ErrorCode.API_KEY_INVALID)).toBe(false);
    });

    it('isAIError identifies AI-related errors', () => {
      const aiError = new AppError(
        ErrorCode.AI_GENERATION_FAILED,
        'AI failed',
        'AI 錯誤'
      );
      const authError = new AppError(
        ErrorCode.API_KEY_INVALID,
        'Auth failed',
        '認證錯誤'
      );

      expect(aiError.isAIError()).toBe(true);
      expect(authError.isAIError()).toBe(false);
    });

    it('isNetworkError identifies network-related errors', () => {
      const networkError = new AppError(
        ErrorCode.NETWORK_OFFLINE,
        'Offline',
        '離線'
      );
      const storageError = new AppError(
        ErrorCode.STORAGE_QUOTA_EXCEEDED,
        'Full',
        '已滿'
      );

      expect(networkError.isNetworkError()).toBe(true);
      expect(storageError.isNetworkError()).toBe(false);
    });

    it('isAuthError identifies auth-related errors', () => {
      const authError = new AppError(
        ErrorCode.API_KEY_MISSING,
        'No key',
        '缺少金鑰'
      );
      const shareError = new AppError(
        ErrorCode.SHARE_FAILED,
        'Share failed',
        '分享失敗'
      );

      expect(authError.isAuthError()).toBe(true);
      expect(shareError.isAuthError()).toBe(false);
    });
  });
});

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    const error = new AppError(ErrorCode.UNKNOWN, 'Test', '測試');
    expect(isAppError(error)).toBe(true);
  });

  it('returns false for regular Error instances', () => {
    const error = new Error('Test');
    expect(isAppError(error)).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('error string')).toBe(false);
    expect(isAppError({ message: 'fake error' })).toBe(false);
  });
});

describe('toAppError', () => {
  it('returns AppError as-is', () => {
    const original = new AppError(ErrorCode.AI_TIMEOUT, 'Timeout', '超時');
    const result = toAppError(original);

    expect(result).toBe(original);
  });

  it('wraps standard Error', () => {
    const original = new Error('Standard error');
    const result = toAppError(
      original,
      ErrorCode.NETWORK_SERVER_ERROR,
      '伺服器錯誤'
    );

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.NETWORK_SERVER_ERROR);
    expect(result.message).toBe('Standard error');
    expect(result.userMessage).toBe('伺服器錯誤');
    expect(result.cause).toBe(original);
  });

  it('wraps string error', () => {
    const result = toAppError('Something went wrong');

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN);
    expect(result.message).toBe('Something went wrong');
  });

  it('wraps unknown error types', () => {
    const result = toAppError({ unexpected: 'object' });

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN);
  });

  it('uses default user message when not provided', () => {
    const result = toAppError(new Error('Test'));
    expect(result.userMessage).toBe('發生未預期的錯誤，請稍後再試');
  });
});

describe('ErrorFactory', () => {
  describe('aiGenerationFailed', () => {
    it('creates AI generation error with retry action', () => {
      const onRetry = vi.fn();
      const error = ErrorFactory.aiGenerationFailed('Generation failed', {
        onRetry,
      });

      expect(error.code).toBe(ErrorCode.AI_GENERATION_FAILED);
      expect(error.recoveryActions).toHaveLength(1);
      expect(error.recoveryActions![0].label).toBe('重新嘗試');

      error.recoveryActions![0].action();
      expect(onRetry).toHaveBeenCalled();
    });

    it('creates error without recovery actions when no callback', () => {
      const error = ErrorFactory.aiGenerationFailed('Generation failed');
      expect(error.recoveryActions).toBeUndefined();
    });
  });

  describe('aiValidationFailed', () => {
    it('creates AI validation error', () => {
      const error = ErrorFactory.aiValidationFailed('Invalid JSON response');

      expect(error.code).toBe(ErrorCode.AI_VALIDATION_FAILED);
      expect(error.userMessage).toContain('AI 回應格式異常');
    });
  });

  describe('rateLimited', () => {
    it('creates rate limit error', () => {
      const error = ErrorFactory.rateLimited();

      expect(error.code).toBe(ErrorCode.AI_RATE_LIMITED);
      expect(error.userMessage).toContain('請求次數已達上限');
    });
  });

  describe('invalidApiKey', () => {
    it('creates invalid API key error with settings action', () => {
      const onOpenSettings = vi.fn();
      const error = ErrorFactory.invalidApiKey({ onOpenSettings });

      expect(error.code).toBe(ErrorCode.API_KEY_INVALID);
      expect(error.recoveryActions![0].label).toBe('前往設定');
    });
  });

  describe('missingApiKey', () => {
    it('creates missing API key error', () => {
      const error = ErrorFactory.missingApiKey();

      expect(error.code).toBe(ErrorCode.API_KEY_MISSING);
      expect(error.userMessage).toContain('尚未設定 API 金鑰');
    });
  });

  describe('networkOffline', () => {
    it('creates network offline error', () => {
      const error = ErrorFactory.networkOffline();

      expect(error.code).toBe(ErrorCode.NETWORK_OFFLINE);
      expect(error.userMessage).toContain('網路連線中斷');
    });
  });

  describe('shareFailed', () => {
    it('creates share failed error', () => {
      const error = ErrorFactory.shareFailed('Upload failed');

      expect(error.code).toBe(ErrorCode.SHARE_FAILED);
      expect(error.message).toBe('Upload failed');
    });
  });

  describe('shareNotFound', () => {
    it('creates share not found error', () => {
      const error = ErrorFactory.shareNotFound();

      expect(error.code).toBe(ErrorCode.SHARE_NOT_FOUND);
      expect(error.userMessage).toContain('找不到分享的內容');
    });
  });

  describe('storageQuotaExceeded', () => {
    it('creates storage quota error with clear action', () => {
      const onClearStorage = vi.fn();
      const error = ErrorFactory.storageQuotaExceeded({ onClearStorage });

      expect(error.code).toBe(ErrorCode.STORAGE_QUOTA_EXCEEDED);
      expect(error.recoveryActions![0].label).toBe('清理儲存空間');
    });
  });

  describe('validationFailed', () => {
    it('creates validation error with context', () => {
      const error = ErrorFactory.validationFailed('Invalid email', {
        context: { field: 'email', value: 'invalid' },
      });

      expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(error.context).toEqual({ field: 'email', value: 'invalid' });
    });
  });
});
