/**
 * Standardized Error Handling System
 * Per STRATEGIC_IMPROVEMENT_PLAN.md Phase 1.3
 */

/**
 * Application-wide error codes for consistent error identification
 */
export enum ErrorCode {
  // AI-related errors (AI_xxx)
  AI_GENERATION_FAILED = 'AI_001',
  AI_VALIDATION_FAILED = 'AI_002',
  AI_RATE_LIMITED = 'AI_003',
  AI_TIMEOUT = 'AI_004',
  AI_INVALID_RESPONSE = 'AI_005',

  // Storage-related errors (STORAGE_xxx)
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_001',
  STORAGE_READ_FAILED = 'STORAGE_002',
  STORAGE_WRITE_FAILED = 'STORAGE_003',
  STORAGE_NOT_FOUND = 'STORAGE_004',

  // Network-related errors (NETWORK_xxx)
  NETWORK_OFFLINE = 'NETWORK_001',
  NETWORK_TIMEOUT = 'NETWORK_002',
  NETWORK_SERVER_ERROR = 'NETWORK_003',

  // Authentication-related errors (AUTH_xxx)
  API_KEY_INVALID = 'AUTH_001',
  API_KEY_MISSING = 'AUTH_002',
  API_KEY_EXPIRED = 'AUTH_003',

  // Share-related errors (SHARE_xxx)
  SHARE_FAILED = 'SHARE_001',
  SHARE_NOT_FOUND = 'SHARE_002',
  SHARE_EXPIRED = 'SHARE_003',

  // Validation errors (VALIDATION_xxx)
  VALIDATION_FAILED = 'VALIDATION_001',
  VALIDATION_SCHEMA_ERROR = 'VALIDATION_002',

  // Unknown/generic errors
  UNKNOWN = 'UNKNOWN_001',
}

/**
 * Recovery action that can be presented to the user
 */
export interface RecoveryAction {
  /** Button label for the action */
  label: string;
  /** Function to execute when action is triggered */
  action: () => void;
  /** Optional: variant for styling (primary actions stand out) */
  variant?: 'primary' | 'secondary';
}

/**
 * Application-wide error class with user-friendly messaging and recovery options
 */
export class AppError extends Error {
  /** Standardized error code for identification */
  public readonly code: ErrorCode;
  /** User-friendly message suitable for display */
  public readonly userMessage: string;
  /** Optional recovery actions the user can take */
  public readonly recoveryActions?: RecoveryAction[];
  /** Original error that caused this error (for debugging) */
  public readonly cause?: Error;
  /** Timestamp when the error occurred */
  public readonly timestamp: Date;
  /** Additional context for debugging */
  public readonly context?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    options?: {
      recoveryActions?: RecoveryAction[];
      cause?: Error;
      context?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.recoveryActions = options?.recoveryActions;
    this.cause = options?.cause;
    this.context = options?.context;
    this.timestamp = new Date();

    // Maintain proper stack trace in V8 environments (Node/Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Create a serializable representation for logging/reporting
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }

  /**
   * Check if this is a specific error type
   */
  isCode(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if this is an AI-related error
   */
  isAIError(): boolean {
    return this.code.startsWith('AI_');
  }

  /**
   * Check if this is a network-related error
   */
  isNetworkError(): boolean {
    return this.code.startsWith('NETWORK_');
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.code.startsWith('AUTH_');
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert an unknown error to an AppError
 * Useful for catch blocks where error type is unknown
 */
export function toAppError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.UNKNOWN,
  defaultUserMessage: string = '發生未預期的錯誤，請稍後再試'
): AppError {
  // Already an AppError, return as-is
  if (isAppError(error)) {
    return error;
  }

  // Standard Error object
  if (error instanceof Error) {
    return new AppError(defaultCode, error.message, defaultUserMessage, {
      cause: error,
    });
  }

  // String error
  if (typeof error === 'string') {
    return new AppError(defaultCode, error, defaultUserMessage);
  }

  // Unknown error type
  return new AppError(defaultCode, String(error), defaultUserMessage);
}

/**
 * Factory functions for common error types
 */
export const ErrorFactory = {
  /**
   * Create an AI generation error
   */
  aiGenerationFailed(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
      onRetry?: () => void;
    }
  ): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onRetry) {
      recoveryActions.push({
        label: '重新嘗試',
        action: options.onRetry,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.AI_GENERATION_FAILED,
      message,
      'AI 內容生成失敗，請檢查您的網路連線或稍後再試',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
        cause: options?.cause,
        context: options?.context,
      }
    );
  },

  /**
   * Create an AI validation error
   */
  aiValidationFailed(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
      onRetry?: () => void;
    }
  ): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onRetry) {
      recoveryActions.push({
        label: '重新生成',
        action: options.onRetry,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.AI_VALIDATION_FAILED,
      message,
      'AI 回應格式異常，正在嘗試重新生成內容',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
        cause: options?.cause,
        context: options?.context,
      }
    );
  },

  /**
   * Create a rate limit error
   */
  rateLimited(options?: { onRetry?: () => void }): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onRetry) {
      recoveryActions.push({
        label: '稍後重試',
        action: options.onRetry,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.AI_RATE_LIMITED,
      'API rate limit exceeded',
      'API 請求次數已達上限，請稍後再試（約 1 分鐘後）',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
      }
    );
  },

  /**
   * Create an invalid API key error
   */
  invalidApiKey(options?: { onOpenSettings?: () => void }): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onOpenSettings) {
      recoveryActions.push({
        label: '前往設定',
        action: options.onOpenSettings,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.API_KEY_INVALID,
      'Invalid API key',
      'API 金鑰無效或已過期，請重新設定您的 Gemini API 金鑰',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
      }
    );
  },

  /**
   * Create a missing API key error
   */
  missingApiKey(options?: { onOpenSettings?: () => void }): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onOpenSettings) {
      recoveryActions.push({
        label: '設定 API 金鑰',
        action: options.onOpenSettings,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.API_KEY_MISSING,
      'API key not configured',
      '尚未設定 API 金鑰，請先設定您的 Gemini API 金鑰',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
      }
    );
  },

  /**
   * Create a network offline error
   */
  networkOffline(options?: { onRetry?: () => void }): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onRetry) {
      recoveryActions.push({
        label: '重新連線',
        action: options.onRetry,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.NETWORK_OFFLINE,
      'Network connection unavailable',
      '網路連線中斷，請檢查您的網路設定',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
      }
    );
  },

  /**
   * Create a share failed error
   */
  shareFailed(
    message: string,
    options?: {
      cause?: Error;
      onRetry?: () => void;
    }
  ): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onRetry) {
      recoveryActions.push({
        label: '重新分享',
        action: options.onRetry,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.SHARE_FAILED,
      message,
      '內容分享失敗，請稍後再試',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
        cause: options?.cause,
      }
    );
  },

  /**
   * Create a share not found error
   */
  shareNotFound(): AppError {
    return new AppError(
      ErrorCode.SHARE_NOT_FOUND,
      'Shared content not found',
      '找不到分享的內容，連結可能已過期或不存在'
    );
  },

  /**
   * Create a storage quota exceeded error
   */
  storageQuotaExceeded(options?: { onClearStorage?: () => void }): AppError {
    const recoveryActions: RecoveryAction[] = [];
    if (options?.onClearStorage) {
      recoveryActions.push({
        label: '清理儲存空間',
        action: options.onClearStorage,
        variant: 'primary',
      });
    }
    return new AppError(
      ErrorCode.STORAGE_QUOTA_EXCEEDED,
      'Storage quota exceeded',
      '本地儲存空間已滿，請清理部分教案後再試',
      {
        recoveryActions:
          recoveryActions.length > 0 ? recoveryActions : undefined,
      }
    );
  },

  /**
   * Create a validation error
   */
  validationFailed(
    message: string,
    options?: {
      context?: Record<string, unknown>;
    }
  ): AppError {
    return new AppError(
      ErrorCode.VALIDATION_FAILED,
      message,
      '資料驗證失敗，請檢查輸入內容',
      {
        context: options?.context,
      }
    );
  },
};
