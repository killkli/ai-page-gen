import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}) => {
  const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-700';

  const getStyle = (): React.CSSProperties => ({
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  });

  if (variant === 'circular') {
    return (
      <div
        className={`${baseClass} rounded-full ${className}`}
        style={{
          ...getStyle(),
          width: width || '40px',
          height: height || '40px',
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={`${baseClass} rounded ${className}`}
        style={{ ...getStyle(), height: height || '100px' }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`${baseClass} rounded-lg p-4 ${className}`}
        aria-hidden="true"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-slate-300 dark:bg-slate-600 rounded-full w-12 h-12" />
          <div className="flex-1 space-y-2">
            <div className="bg-slate-300 dark:bg-slate-600 rounded h-4 w-3/4" />
            <div className="bg-slate-300 dark:bg-slate-600 rounded h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-slate-300 dark:bg-slate-600 rounded h-4" />
          <div className="bg-slate-300 dark:bg-slate-600 rounded h-4 w-5/6" />
          <div className="bg-slate-300 dark:bg-slate-600 rounded h-4 w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${baseClass} rounded h-4`}
          style={{
            ...getStyle(),
            width: index === lines - 1 && lines > 1 ? '75%' : width || '100%',
          }}
        />
      ))}
    </div>
  );
};

interface ContentSkeletonProps {
  type?: 'quiz' | 'learning' | 'list';
  className?: string;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  type = 'learning',
  className = '',
}) => {
  if (type === 'quiz') {
    return (
      <div
        className={`space-y-4 ${className}`}
        role="status"
        aria-label="載入中"
      >
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <SkeletonLoader variant="text" lines={1} className="mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <SkeletonLoader variant="circular" width={20} height={20} />
                <SkeletonLoader variant="text" width="80%" />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">內容載入中，請稍候...</span>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div
        className={`space-y-3 ${className}`}
        role="status"
        aria-label="載入中"
      >
        {[1, 2, 3].map(i => (
          <SkeletonLoader key={i} variant="card" />
        ))}
        <span className="sr-only">內容載入中，請稍候...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="status" aria-label="載入中">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <SkeletonLoader variant="text" width="60%" className="mb-4" />
        <SkeletonLoader variant="text" lines={4} />
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <SkeletonLoader variant="text" width="40%" className="mb-4" />
        <SkeletonLoader variant="rectangular" height={120} />
      </div>
      <span className="sr-only">內容載入中，請稍候...</span>
    </div>
  );
};

export default SkeletonLoader;
