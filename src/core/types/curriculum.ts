export type Subject = 'math' | 'english';

export type Stage = 'E1' | 'E2' | 'E3' | 'J' | 'S';

export const STAGE_LABELS: Record<Stage, string> = {
  E1: '國小低年級 (1-2年級)',
  E2: '國小中年級 (3-4年級)',
  E3: '國小高年級 (5-6年級)',
  J: '國中 (7-9年級)',
  S: '高中 (10-12年級)',
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: '數學',
  english: '英語',
};

export interface GradeRange {
  min: number;
  max: number;
}

export interface CurriculumStandard {
  id: string;
  subject: Subject;
  gradeRange: GradeRange;
  stage: Stage;
  competency: string;
  indicator: string;
  content: string;
  description: string;
  keywords: string[];
}

export interface CurriculumFramework {
  framework: 'taiwan-108';
  subject: Subject;
  version: string;
  lastUpdated: string;
  standards: CurriculumStandard[];
}

export interface AlignedLearningObjective {
  objective: string;
  description: string;
  teachingExample?: string;
  alignedStandards: string[];
  bloomLevel: BloomLevel;
}

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export const BLOOM_LEVEL_LABELS: Record<BloomLevel, string> = {
  remember: '記憶',
  understand: '理解',
  apply: '應用',
  analyze: '分析',
  evaluate: '評鑑',
  create: '創造',
};

export function getStageFromGrade(grade: number): Stage {
  if (grade >= 1 && grade <= 2) return 'E1';
  if (grade >= 3 && grade <= 4) return 'E2';
  if (grade >= 5 && grade <= 6) return 'E3';
  if (grade >= 7 && grade <= 9) return 'J';
  return 'S';
}

export function getGradeRangeFromStage(stage: Stage): GradeRange {
  switch (stage) {
    case 'E1':
      return { min: 1, max: 2 };
    case 'E2':
      return { min: 3, max: 4 };
    case 'E3':
      return { min: 5, max: 6 };
    case 'J':
      return { min: 7, max: 9 };
    case 'S':
      return { min: 10, max: 12 };
  }
}
