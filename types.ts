export interface TrueFalseQuestion {
  statement: string; // The statement to be evaluated
  isTrue: boolean;   // Whether the statement is true or false
  explanation?: string; // Optional explanation for the answer
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // Index of the correct option in the options array
}

export interface FillBlankQuestion {
  sentenceWithBlank: string; // e.g., "The capital of France is ____."
  correctAnswer: string;
}

export interface SentenceScrambleQuestion {
  originalSentence: string; // The correct, unscrambled sentence
  scrambledWords: string[]; // An array of words from the original sentence, in scrambled order
}

// SpellingQuestion is removed

export interface QuizDifficultyContent {
  trueFalse: TrueFalseQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
  fillInTheBlanks: FillBlankQuestion[];
  sentenceScramble: SentenceScrambleQuestion[];
  // spelling: SpellingQuestion[]; // Removed
}

export interface OnlineInteractiveQuiz {
  easy: QuizDifficultyContent;
  normal: QuizDifficultyContent;
  hard: QuizDifficultyContent;
}

export interface ContentBreakdownItem {
  topic: string;
  details: string;
}

export interface ConfusingPointItem {
  point: string;
  clarification: string;
}

export interface GeneratedLearningContent {
  learningObjectives: string[];
  contentBreakdown: ContentBreakdownItem[];
  confusingPoints: ConfusingPointItem[];
  classroomActivities: string[];
  onlineInteractiveQuiz: OnlineInteractiveQuiz;
}

export enum QuizDifficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

// Helper type for quiz section props
export type QuizContentKey = keyof QuizDifficultyContent;