import type {
  Subject,
  Stage,
  CurriculumStandard,
  CurriculumFramework,
  AlignedLearningObjective,
} from '../../src/core/types/curriculum';

import mathCurriculum from '../../src/data/curriculum/taiwan-108-math.json';
import englishCurriculum from '../../src/data/curriculum/taiwan-108-english.json';

const curriculumData: Record<Subject, CurriculumFramework> = {
  math: mathCurriculum as CurriculumFramework,
  english: englishCurriculum as CurriculumFramework,
};

export function loadCurriculumFramework(subject: Subject): CurriculumFramework {
  return curriculumData[subject];
}

export function getStandardsBySubjectAndGrade(
  subject: Subject,
  grade: number
): CurriculumStandard[] {
  const framework = curriculumData[subject];
  return framework.standards.filter(
    std => grade >= std.gradeRange.min && grade <= std.gradeRange.max
  );
}

export function getStandardsBySubjectAndStage(
  subject: Subject,
  stage: Stage
): CurriculumStandard[] {
  const framework = curriculumData[subject];
  return framework.standards.filter(std => std.stage === stage);
}

export function searchStandardsByKeyword(
  subject: Subject,
  keyword: string
): CurriculumStandard[] {
  const framework = curriculumData[subject];
  const lowerKeyword = keyword.toLowerCase();

  return framework.standards.filter(
    std =>
      std.description.toLowerCase().includes(lowerKeyword) ||
      std.keywords.some(kw => kw.toLowerCase().includes(lowerKeyword)) ||
      std.content.toLowerCase().includes(lowerKeyword)
  );
}

export function getStandardById(
  standardId: string
): CurriculumStandard | undefined {
  for (const subject of ['math', 'english'] as Subject[]) {
    const framework = curriculumData[subject];
    const found = framework.standards.find(std => std.id === standardId);
    if (found) return found;
  }
  return undefined;
}

export function getStandardsByIds(standardIds: string[]): CurriculumStandard[] {
  return standardIds
    .map(id => getStandardById(id))
    .filter((std): std is CurriculumStandard => std !== undefined);
}

export function buildAlignedPrompt(
  topic: string,
  standards: CurriculumStandard[]
): string {
  if (standards.length === 0) {
    return '';
  }

  const standardsText = standards
    .map(
      s =>
        `- ${s.id}: ${s.description} (核心素養: ${s.competency}, 學習表現: ${s.indicator})`
    )
    .join('\n');

  return `
Based on these Taiwan 108 Curriculum Standards:
${standardsText}

Generate learning objectives for "${topic}" that explicitly address these standards.
Each objective MUST:
1. Align with at least one standard ID from the list above
2. Use appropriate Bloom's taxonomy verbs (remember, understand, apply, analyze, evaluate, create)
3. Be measurable and observable
4. Be written primarily in Chinese (Traditional)

Output MUST be a valid JSON array:
[
  {
    "objective": "能夠理解${topic}的核心概念",
    "description": "此學習目標的詳細說明...",
    "teachingExample": "教學示例...",
    "alignedStandards": ["${standards[0]?.id || 'TW108-X-X-X-XX'}"],
    "bloomLevel": "understand"
  }
]

Important:
- Each objective should reference at least one standard ID
- Use Chinese for objective text
- BloomLevel must be one of: remember, understand, apply, analyze, evaluate, create
`;
}

export function suggestStandardsForTopic(
  topic: string,
  subject: Subject
): CurriculumStandard[] {
  const topicLower = topic.toLowerCase();
  const framework = curriculumData[subject];

  return framework.standards.filter(
    std =>
      std.keywords.some(kw => topicLower.includes(kw.toLowerCase())) ||
      std.description
        .toLowerCase()
        .split(/\s+/)
        .some(word => topicLower.includes(word))
  );
}

export function validateAlignedObjectives(
  objectives: AlignedLearningObjective[],
  selectedStandards: CurriculumStandard[]
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const validStandardIds = new Set(selectedStandards.map(s => s.id));

  for (const obj of objectives) {
    if (!obj.alignedStandards || obj.alignedStandards.length === 0) {
      issues.push(`目標「${obj.objective}」未對應任何課綱指標`);
      continue;
    }

    for (const stdId of obj.alignedStandards) {
      if (!validStandardIds.has(stdId)) {
        issues.push(`目標「${obj.objective}」對應了未選擇的課綱指標: ${stdId}`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function getGradeOptions(): { value: number; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} 年級`,
  }));
}

export function getSubjectOptions(): { value: Subject; label: string }[] {
  return [
    { value: 'math', label: '數學' },
    { value: 'english', label: '英語' },
  ];
}

export function getStageOptions(): { value: Stage; label: string }[] {
  return [
    { value: 'E1', label: '國小低年級 (1-2年級)' },
    { value: 'E2', label: '國小中年級 (3-4年級)' },
    { value: 'E3', label: '國小高年級 (5-6年級)' },
    { value: 'J', label: '國中 (7-9年級)' },
    { value: 'S', label: '高中 (10-12年級)' },
  ];
}
