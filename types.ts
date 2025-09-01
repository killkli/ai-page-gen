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

export interface DialogueLine {
  speaker: string; // e.g., "A", "B", "Learner"
  line: string;    // The text of the dialogue line
}

export interface MemoryCardGameQuestion {
  pairs: { question: string; answer: string }[]; // Each pair is a card match (e.g., word/definition, term/translation)
  instructions?: string; // Optional instructions for the memory game
}

export interface QuizDifficultyContent {
  trueFalse: TrueFalseQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
  fillInTheBlanks: FillBlankQuestion[];
  sentenceScramble: SentenceScrambleQuestion[];
  memoryCardGame?: MemoryCardGameQuestion[]; // Optional: memory card game questions
}

export interface OnlineInteractiveQuiz {
  easy: QuizDifficultyContent;
  normal: QuizDifficultyContent;
  hard: QuizDifficultyContent;
}

export interface LearningObjectiveItem {
  objective: string;
  description: string;
  teachingExample?: string;
}

export interface ContentBreakdownItem {
  topic: string;
  details: string;
  teachingExample?: string;
}

export interface ConfusingPointItem {
  point: string;
  clarification: string;
  teachingExample?: string;
}

export interface ClassroomActivity {
  title: string;
  description: string;
  objective?: string;
  materials?: string;
  environment?: string;
}

export interface GeneratedLearningContent {
  learningObjectives: LearningObjectiveItem[];
  contentBreakdown: ContentBreakdownItem[];
  confusingPoints: ConfusingPointItem[];
  classroomActivities: ClassroomActivity[];
  onlineInteractiveQuiz: OnlineInteractiveQuiz;
  englishConversation?: DialogueLine[]; // Added for English conversation practice
  learningLevels?: LearningLevelSuggestions; // Added for automatic learning level suggestions
}

export interface LearningLevel {
  id: string;
  name: string;
  description: string;
  order: number; // For sorting the levels
}

export interface LearningLevelSuggestions {
  suggestedLevels: LearningLevel[];
  defaultLevelId: string; // Which level to select by default
}

export enum QuizDifficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

// Vocabulary level for English-related topics
export interface VocabularyLevel {
  id: string;
  name: string;
  wordCount: number;
  description: string;
}

export interface VocabularyLevelSuggestions {
  suggestedLevels: VocabularyLevel[];
  defaultLevelId: string;
}

// Helper type for quiz section props
export type QuizContentKey = keyof QuizDifficultyContent;