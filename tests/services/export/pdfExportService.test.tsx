import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateLessonPlanPDF,
  downloadLessonPlanPDF,
} from '../../../services/export/pdfExportService';
import type { ExtendedLearningContent } from '../../../types';

vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
  Font: {
    register: vi.fn(),
  },
  pdf: vi.fn(() => ({
    toBlob: vi.fn(() =>
      Promise.resolve(
        new Blob(['mock pdf content'], { type: 'application/pdf' })
      )
    ),
  })),
}));

const createEmptyQuiz = () => ({
  easy: {
    trueFalse: [],
    multipleChoice: [],
    fillInTheBlanks: [],
    sentenceScramble: [],
    memoryCardGame: [],
  },
  normal: {
    trueFalse: [],
    multipleChoice: [],
    fillInTheBlanks: [],
    sentenceScramble: [],
    memoryCardGame: [],
  },
  hard: {
    trueFalse: [],
    multipleChoice: [],
    fillInTheBlanks: [],
    sentenceScramble: [],
    memoryCardGame: [],
  },
});

const createMockContent = (): ExtendedLearningContent => ({
  topic: '測試主題',
  learningObjectives: [
    {
      objective: '學習目標一',
      description: '描述一',
      teachingExample: '範例一',
    },
    { objective: '學習目標二', description: '描述二' },
  ],
  contentBreakdown: [
    {
      topic: '內容主題一',
      details: '詳細內容一',
      teachingExample: '教學範例一',
    },
  ],
  confusingPoints: [
    {
      point: '易混淆點一',
      clarification: '澄清說明一',
      teachingExample: '範例一',
    },
  ],
  classroomActivities: [
    {
      title: '活動一',
      description: '活動描述',
      objective: '活動目標',
      timing: '15分鐘',
      materials: '紙筆',
    },
  ],
  onlineInteractiveQuiz: createEmptyQuiz() as any,
});

describe('pdfExportService', () => {
  describe('generateLessonPlanPDF', () => {
    it('generates a PDF blob', async () => {
      const content = createMockContent();
      const blob = await generateLessonPlanPDF(content, '測試主題');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });

    it('handles content with minimal data', async () => {
      const minimalContent: ExtendedLearningContent = {
        topic: '簡單主題',
        learningObjectives: [],
        contentBreakdown: [],
        confusingPoints: [],
        classroomActivities: [],
        onlineInteractiveQuiz: createEmptyQuiz() as any,
      };

      const blob = await generateLessonPlanPDF(minimalContent, '簡單主題');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('handles content with only learning objectives', async () => {
      const content: ExtendedLearningContent = {
        topic: '目標主題',
        learningObjectives: [{ objective: '目標', description: '描述' }],
        contentBreakdown: [],
        confusingPoints: [],
        classroomActivities: [],
        onlineInteractiveQuiz: createEmptyQuiz() as any,
      };

      const blob = await generateLessonPlanPDF(content, '目標主題');
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('downloadLessonPlanPDF', () => {
    beforeEach(() => {
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      });
    });

    it('creates and triggers download', async () => {
      const mockLink = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockLink as unknown as HTMLAnchorElement
      );

      const content = createMockContent();
      await downloadLessonPlanPDF(content, '下載測試');

      expect(mockLink.download).toBe('下載測試_教案.pdf');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('sets correct href from blob URL', async () => {
      const mockLink = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockLink as unknown as HTMLAnchorElement
      );

      const content = createMockContent();
      await downloadLessonPlanPDF(content, '測試');

      expect(mockLink.href).toBe('blob:mock-url');
    });
  });
});
