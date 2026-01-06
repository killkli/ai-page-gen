import { z } from 'zod';

export const LearningObjectiveItemSchema = z.object({
  objective: z.string().min(1),
  description: z.string().min(1),
  teachingExample: z.string().optional(),
});

export type LearningObjectiveItem = z.infer<typeof LearningObjectiveItemSchema>;

export const LearningObjectivesArraySchema = z
  .array(LearningObjectiveItemSchema)
  .min(1);

export const ContentBreakdownItemSchema = z.object({
  topic: z.string().min(1),
  details: z.string().min(1),
  teachingExample: z.string().optional(),
  coreConcept: z.string().optional(),
  teachingSentences: z.array(z.string()).optional(),
  teachingTips: z.string().optional(),
});

export type ContentBreakdownItem = z.infer<typeof ContentBreakdownItemSchema>;

export const ContentBreakdownArraySchema = z.array(ContentBreakdownItemSchema);

export const CorrectVsWrongSchema = z.object({
  correct: z.string(),
  wrong: z.string(),
  explanation: z.string(),
});

export const ConfusingPointItemSchema = z.object({
  point: z.string().min(1),
  clarification: z.string().min(1),
  teachingExample: z.string().optional(),
  errorType: z.string().optional(),
  commonErrors: z.array(z.string()).optional(),
  correctVsWrong: z.array(CorrectVsWrongSchema).optional(),
  preventionStrategy: z.string().optional(),
  correctionMethod: z.string().optional(),
  practiceActivities: z.array(z.string()).optional(),
});

export type ConfusingPointItem = z.infer<typeof ConfusingPointItemSchema>;

export const ConfusingPointsArraySchema = z.array(ConfusingPointItemSchema);

export const ClassroomActivitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  objective: z.string().optional(),
  timing: z.string().optional(),
  materials: z.string().optional(),
  environment: z.string().optional(),
  steps: z.array(z.string()).optional(),
  assessmentPoints: z.array(z.string()).optional(),
});

export type ClassroomActivity = z.infer<typeof ClassroomActivitySchema>;

export const ClassroomActivitiesArraySchema = z.array(ClassroomActivitySchema);

export const LearningLevelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().min(1),
});

export type LearningLevel = z.infer<typeof LearningLevelSchema>;

export const LearningLevelSuggestionsSchema = z.object({
  suggestedLevels: z.array(LearningLevelSchema).min(1),
  defaultLevelId: z.string().min(1),
});

export type LearningLevelSuggestions = z.infer<
  typeof LearningLevelSuggestionsSchema
>;

export const DialogueLineSchema = z.object({
  speaker: z.string().min(1),
  line: z.string().min(1),
});

export type DialogueLine = z.infer<typeof DialogueLineSchema>;

export const DialogueArraySchema = z.array(DialogueLineSchema);

export function validateLearningObjectives(
  data: unknown
):
  | { success: true; data: LearningObjectiveItem[] }
  | { success: false; error: string; details: z.ZodError } {
  const result = LearningObjectivesArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid learning objectives structure',
    details: result.error,
  };
}

export function validateContentBreakdown(
  data: unknown
):
  | { success: true; data: ContentBreakdownItem[] }
  | { success: false; error: string; details: z.ZodError } {
  const result = ContentBreakdownArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid content breakdown structure',
    details: result.error,
  };
}

export function validateConfusingPoints(
  data: unknown
):
  | { success: true; data: ConfusingPointItem[] }
  | { success: false; error: string; details: z.ZodError } {
  const result = ConfusingPointsArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid confusing points structure',
    details: result.error,
  };
}

export function validateClassroomActivities(
  data: unknown
):
  | { success: true; data: ClassroomActivity[] }
  | { success: false; error: string; details: z.ZodError } {
  const result = ClassroomActivitiesArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid classroom activities structure',
    details: result.error,
  };
}

export function validateLearningLevelSuggestions(
  data: unknown
):
  | { success: true; data: LearningLevelSuggestions }
  | { success: false; error: string; details: z.ZodError } {
  const result = LearningLevelSuggestionsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid learning level suggestions structure',
    details: result.error,
  };
}

export function validateDialogue(
  data: unknown
):
  | { success: true; data: DialogueLine[] }
  | { success: false; error: string; details: z.ZodError } {
  const result = DialogueArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid dialogue structure',
    details: result.error,
  };
}
