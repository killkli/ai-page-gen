import React, { useState, useCallback } from 'react';
import { downloadLessonPlanPDF } from '../services/export/pdfExportService';
import type { ExtendedLearningContent } from '../types';

interface PDFExportButtonProps {
  content: ExtendedLearningContent;
  topic: string;
  className?: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  content,
  topic,
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);

    try {
      await downloadLessonPlanPDF(content, topic);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('PDF 匯出失敗，請稍後再試');
    } finally {
      setIsExporting(false);
    }
  }, [content, topic]);

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          inline-flex items-center gap-2 px-4 py-2 
          bg-green-600 text-white rounded-lg 
          hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${className}
        `}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            匯出中...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            匯出 PDF
          </>
        )}
      </button>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default PDFExportButton;
