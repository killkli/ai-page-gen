import React from 'react';
import { XCircleIcon } from './icons';

interface RecoveryAction {
  label: string;
  action: () => void;
}

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  recoveryActions?: RecoveryAction[];
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  onDismiss,
  recoveryActions,
  className = '',
}) => {
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
          <p className="text-red-700 font-medium">{message}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                重試
              </button>
            )}

            {recoveryActions?.map((action, index) => (
              <button
                key={index}
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
