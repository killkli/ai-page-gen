import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateSCORMPackage,
  downloadSCORMPackage,
} from '../../../services/export/scormExportService';
import { QuizDifficulty, OnlineInteractiveQuiz } from '../../../types';
import JSZip from 'jszip';

const createMockQuiz = (): OnlineInteractiveQuiz => ({
  [QuizDifficulty.Easy]: {
    trueFalse: [
      {
        statement: '地球是平的',
        isTrue: false,
        explanation: '地球是球形的',
      } as any,
    ],
    multipleChoice: [
      {
        question: '1+1=?',
        options: ['1', '2', '3', '4'],
        correctAnswerIndex: 1,
      } as any,
    ],
    fillInTheBlanks: [],
    sentenceScramble: [],
    memoryCardGame: [],
  },
  [QuizDifficulty.Normal]: {
    trueFalse: [],
    multipleChoice: [],
    fillInTheBlanks: [],
    sentenceScramble: [],
    memoryCardGame: [],
  },
  [QuizDifficulty.Hard]: {
    trueFalse: [],
    multipleChoice: [],
    fillInTheBlanks: [],
    sentenceScramble: [],
    memoryCardGame: [],
  },
});

describe('scormExportService', () => {
  describe('generateSCORMPackage', () => {
    it('generates a valid zip blob', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '測試主題');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/zip');
    });

    it('contains all required SCORM files', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '測試主題');

      const zip = await JSZip.loadAsync(blob);
      const fileNames = Object.keys(zip.files);

      expect(fileNames).toContain('imsmanifest.xml');
      expect(fileNames).toContain('index.html');
      expect(fileNames).toContain('quiz.js');
      expect(fileNames).toContain('scorm-api.js');
      expect(fileNames).toContain('styles.css');
      expect(fileNames).toContain('content/questions.json');
    });

    it('generates valid imsmanifest.xml with correct topic', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '數學基礎');

      const zip = await JSZip.loadAsync(blob);
      const manifest = await zip.file('imsmanifest.xml')?.async('string');

      expect(manifest).toContain('ADL SCORM');
      expect(manifest).toContain('1.2');
      expect(manifest).toContain('數學基礎');
      expect(manifest).toContain('AI 學習測驗');
    });

    it('escapes XML special characters in topic', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '測試 <script> & "引號"');

      const zip = await JSZip.loadAsync(blob);
      const manifest = await zip.file('imsmanifest.xml')?.async('string');

      expect(manifest).toContain('&lt;script&gt;');
      expect(manifest).toContain('&amp;');
      expect(manifest).toContain('&quot;');
    });

    it('generates valid questions.json with quiz data', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '測試主題');

      const zip = await JSZip.loadAsync(blob);
      const questionsJson = await zip
        .file('content/questions.json')
        ?.async('string');
      const parsedQuestions = JSON.parse(questionsJson!);

      expect(parsedQuestions.easy.trueFalse).toHaveLength(1);
      expect(parsedQuestions.easy.trueFalse[0].statement).toBe('地球是平的');
      expect(parsedQuestions.easy.multipleChoice).toHaveLength(1);
    });

    it('generates index.html with correct topic', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '英語會話');

      const zip = await JSZip.loadAsync(blob);
      const indexHtml = await zip.file('index.html')?.async('string');

      expect(indexHtml).toContain('英語會話');
      expect(indexHtml).toContain('<!DOCTYPE html>');
      expect(indexHtml).toContain('lang="zh-TW"');
    });

    it('includes SCORM API wrapper script', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '測試');

      const zip = await JSZip.loadAsync(blob);
      const scormApi = await zip.file('scorm-api.js')?.async('string');

      expect(scormApi).toContain('LMSInitialize');
      expect(scormApi).toContain('LMSFinish');
      expect(scormApi).toContain('LMSGetValue');
      expect(scormApi).toContain('LMSSetValue');
      expect(scormApi).toContain('LMSCommit');
    });

    it('includes quiz player with scoring logic', async () => {
      const quiz = createMockQuiz();
      const blob = await generateSCORMPackage(quiz, '測試');

      const zip = await JSZip.loadAsync(blob);
      const quizJs = await zip.file('quiz.js')?.async('string');

      expect(quizJs).toContain('loadQuiz');
      expect(quizJs).toContain('renderQuestion');
      expect(quizJs).toContain('showResults');
      expect(quizJs).toContain('cmi.core.score.raw');
      expect(quizJs).toContain('cmi.core.lesson_status');
    });
  });

  describe('downloadSCORMPackage', () => {
    beforeEach(() => {
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      });
    });

    it('creates and clicks a download link', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockLink as unknown as HTMLAnchorElement
      );

      const quiz = createMockQuiz();
      await downloadSCORMPackage(quiz, '下載測試');

      expect(mockLink.download).toBe('下載測試_SCORM.zip');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
