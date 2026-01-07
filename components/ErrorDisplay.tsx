import React from 'react';
import { XCircleIcon } from './icons';
import { AppError, isAppError, RecoveryAction } from '../src/core/errors';

interface ErrorDisplayProps {
  error?: AppError | Error | string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  recoveryActions?: RecoveryAction[];
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  message,
  onRetry,
  onDismiss,
  recoveryActions,
  className = '',
}) => {
  const displayMessage = React.useMemo(() => {
    if (message) return message;
    if (isAppError(error)) return error.userMessage;
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return '發生未知錯誤';
  }, [error, message]);

  const allRecoveryActions = React.useMemo(() => {
    const actions: RecoveryAction[] = [];
    if (isAppError(error) && error.recoveryActions) {
      actions.push(...error.recoveryActions);
    }
    if (recoveryActions) {
      actions.push(...recoveryActions);
    }
    return actions;
  }, [error, recoveryActions]);

  const primaryActions = allRecoveryActions.filter(
    a => a.variant === 'primary'
  );
  const secondaryActions = allRecoveryActions.filter(
    a => a.variant !== 'primary'
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg ${className}`}
    >
      <div className="flex items-start">
        <XCircleIcon
          className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="ml-3 flex-1">
          <p className="text-red-700 font-medium">{displayMessage}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                重試
              </button>
            )}

            {primaryActions.map((action, index) => (
              <button
                key={`primary-${index}`}
                onClick={action.action}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                {action.label}
              </button>
            ))}

            {secondaryActions.map((action, index) => (
              <button
                key={`secondary-${index}`}
                onClick={action.action}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                {action.label}
              </button>
            ))}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              >
                關閉
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
