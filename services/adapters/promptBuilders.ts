
import { MathGenerationParams, EnglishGenerationParams } from '../../types';

// Helper maps for human-readable strings
const GRADE_MAP: Record<string, string> = {
    'preschool': 'Preschool',
    'elementary_low': 'Elementary School (Grades 1-2)',
    'elementary_mid': 'Elementary School (Grades 3-4)',
    'elementary_high': 'Elementary School (Grades 5-6)',
    'junior_7': 'Junior High School (Grade 7)',
    'junior_8': 'Junior High School (Grade 8)',
    'junior_9': 'Junior High School (Grade 9)',
    'high_school_review': 'High School Review'
};

const CONTEXT_MAP: Record<string, string> = {
    'physical': 'Physical Classroom',
    'online': 'Online / Remote Learning'
};

const EXPERIENCE_MAP: Record<string, string> = {
    'none': 'Standard / No specific prior issues',
    'partial': 'Partial Knowledge / Needs Review',
    'special_needs': 'Special Needs / Requires Extra Scaffolding'
};

const MATH_METHOD_MAP: Record<string, string> = {
    'visual': 'Visual Learning (Diagrams, Graphs)',
    'cpa': 'CPA (Concrete-Pictorial-Abstract)',
    'concept_oriented': 'Concept-Oriented (Understanding over Rote Memorization)',
    'discovery': 'Discovery Learning',
    'gamification': 'Gamification',
    'contextual': 'Contextual Learning (Real-world applications)'
};

const ENGLISH_METHOD_MAP: Record<string, string> = {
    'clt': 'Communicative Language Teaching (CLT)',
    'tbl': 'Task-Based Learning (TBL)',
    'pbl': 'Project-Based Learning (PBL)',
    'tpr': 'Total Physical Response (TPR)',
    'phonics': 'Phonics',
    'grammar_translation': 'Grammar-Translation',
    'ppp': 'PPP (Presentation, Practice, Production)',
    'cooperative': 'Cooperative Learning',
    'gamification': 'Gamification',
    'flipped': 'Flipped Classroom',
    'scaffolding': 'Scaffolding / Educational Drama',
    'clil': 'CLIL (Content and Language Integrated Learning)'
};

// Helper functions for building rich topics
export const buildMathRichTopic = (params: MathGenerationParams): string => {
    const { selectedMaterials, studentCount, classDuration, teachingContext, priorExperience, studentGrade, teachingMethod } = params;

    const materialsStr = selectedMaterials.map(m => m.title).join(', ');

    return `
Topic: ${materialsStr}

Class Context:
- Grade Level: ${GRADE_MAP[studentGrade] || studentGrade}
- Number of Students: ${studentCount}
- Duration: ${classDuration} minutes
- Setting: ${CONTEXT_MAP[teachingContext] || teachingContext}
- Student Background: ${EXPERIENCE_MAP[priorExperience] || priorExperience}
- Teaching Method: ${MATH_METHOD_MAP[teachingMethod] || teachingMethod}
`.trim();
};

export const buildEnglishRichTopic = (params: EnglishGenerationParams): string => {
    const { selectedMaterials, studentCount, classDuration, teachingContext, priorExperience, studentGrade, teachingMethod } = params;

    const materialsStr = selectedMaterials.map(m => m.title).join(', ');

    return `
Topic: ${materialsStr}

Class Context:
- Grade Level: ${GRADE_MAP[studentGrade] || studentGrade}
- Number of Students: ${studentCount}
- Duration: ${classDuration} minutes
- Setting: ${CONTEXT_MAP[teachingContext] || teachingContext}
- Student Background: ${EXPERIENCE_MAP[priorExperience] || priorExperience}
- Teaching Method: ${ENGLISH_METHOD_MAP[teachingMethod] || teachingMethod}
`.trim();
};
