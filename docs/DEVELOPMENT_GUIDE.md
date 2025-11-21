# AI Learning Page Generator - Development Guide

## Project Overview

The AI Learning Page Generator is a React-based web application that uses Google's Gemini AI to generate comprehensive learning materials for educational topics. The app creates structured learning content including objectives, interactive quizzes, classroom activities, and conversation practice.

### Key Features
- AI-powered learning content generation via Gemini API
- Interactive quiz components (True/False, Multiple Choice, Fill-in-blanks, Sentence Scramble, Memory Card Game)
- Shareable learning content with unique URLs
- Responsive design with Tailwind CSS
- English conversation practice generation
- Real-time content validation and error handling

## Technology Stack

### Core Technologies
- **Frontend Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.6.2
- **Styling**: Tailwind CSS (via CDN in index.html)
- **AI Integration**: Google GenAI (@google/genai 1.6.0)
- **Package Manager**: pnpm

### Development Tools
- **TypeScript**: 5.7.2
- **Vite React Plugin**: @vitejs/plugin-react 4.6.0
- **Type Definitions**: @types/react, @types/react-dom, @types/node
- **Deployment**: GitHub Pages via gh-pages 6.3.0

## Project Structure

```
ai-page-gen/
├── components/                 # React components
│   ├── quizTypes/             # Quiz-specific components
│   │   ├── TrueFalseQuizItem.tsx
│   │   ├── MultipleChoiceQuizItem.tsx
│   │   ├── SentenceScrambleQuizItem.tsx
│   │   └── ...
│   ├── ApiKeyModal.tsx        # API key management
│   ├── ConversationPractice.tsx # English conversation display
│   ├── InputBar.tsx           # Main topic input component
│   ├── LearningContentDisplay.tsx # Content display orchestrator
│   ├── LoadingSpinner.tsx     # Loading UI component
│   ├── QuizView.tsx          # Quiz interface manager
│   ├── SectionCard.tsx       # Content section wrapper
│   ├── Tabs.tsx              # Tab navigation component
│   └── icons.tsx             # SVG icon components
├── services/                  # Business logic and API calls
│   ├── geminiServiceAdapter.ts      # Gemini AI integration
│   └── jsonbinService.ts     # Content sharing service
├── utils/                    # Utility functions
├── dist/                     # Build output
├── App.tsx                   # Main application component
├── index.tsx                 # Application entry point
├── types.ts                  # TypeScript type definitions
├── global.d.ts              # Global type declarations
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Core Architecture

### Component Hierarchy

1. **App.tsx** - Root component managing routing, API key state, and main application flow
2. **InputBar.tsx** - Topic input and content generation trigger
3. **LearningContentDisplay.tsx** - Main content renderer with tabbed interface
4. **QuizView.tsx** - Interactive quiz component coordinator
5. **Individual Quiz Components** - Specific implementations for each quiz type

### Data Flow

1. User inputs learning topic → InputBar
2. App.tsx calls geminiServiceAdapter.generateLearningPlan()
3. Service makes parallel API calls to generate different content sections
4. Generated content is displayed through LearningContentDisplay
5. Users can interact with quizzes and share content

### Type System

The application uses comprehensive TypeScript interfaces defined in `types.ts`:

- **GeneratedLearningContent** - Main content structure
- **Quiz Types** - TrueFalseQuestion, MultipleChoiceQuestion, FillBlankQuestion, etc.
- **Content Sections** - ContentBreakdownItem, ConfusingPointItem, ClassroomActivity
- **UI Types** - QuizDifficulty enum, QuizContentKey utility type

## Development Setup

### Prerequisites
- Node.js (latest LTS recommended)
- pnpm package manager
- Gemini API key from Google AI Studio

### Installation Steps

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd ai-page-gen
   pnpm install
   ```

2. **Environment configuration**:
   ```bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Build for production**:
   ```bash
   pnpm build
   ```

5. **Deploy to GitHub Pages**:
   ```bash
   pnpm deploy
   ```

## Configuration Details

### Vite Configuration
- **Base Path**: `/ai-page-gen/` for GitHub Pages deployment
- **Environment Variables**: GEMINI_API_KEY injected at build time
- **Alias**: `@` points to project root
- **React Plugin**: Handles JSX and Fast Refresh

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext
- **JSX**: react-jsx
- **Strict mode**: Enabled with comprehensive type checking

## Key Implementation Patterns

### 1. Service Layer Pattern
The `geminiService.ts` (via adapters/) implements a modular approach to AI content generation:

```typescript
// Individual content generators
const generateLearningObjectives = async (topic: string, apiKey: string): Promise<string[]>
const generateContentBreakdown = async (topic: string, apiKey: string, learningObjectives: string[])
const generateConfusingPoints = async (topic: string, apiKey: string, learningObjectives: string[])
// ... etc

// Main orchestrator with parallel execution
export const generateLearningPlan = async (topic: string, apiKey: string): Promise<GeneratedLearningContent>
```

### 2. Component Composition
Components are designed for reusability and single responsibility:

```typescript
// Generic section wrapper
<SectionCard title="Learning Objectives" icon={TargetIcon}>
  {/* Section-specific content */}
</SectionCard>

// Quiz component composition
<QuizView 
  quiz={content.onlineInteractiveQuiz}
  difficulty={selectedDifficulty}
  onDifficultyChange={setSelectedDifficulty}
/>
```

### 3. State Management
- **Local State**: useState for component-specific state
- **Props Drilling**: Simple prop passing for data flow
- **LocalStorage**: API key persistence
- **URL Parameters**: Share functionality and API key handling

### 4. Error Handling
Comprehensive error boundaries and user feedback:

```typescript
// API error handling with user-friendly messages
if (error.message.includes("API key not valid")) {
  errorMessage = "Gemini API 金鑰無效。請檢查您的設定。";
} else if (error.message.includes("quota")) {
  errorMessage = "已超出 API 配額。請稍後再試。";
}
```

### 5. Responsive Design
Mobile-first approach using Tailwind CSS:

```tsx
<div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
  {/* Mobile: stacked, Desktop: horizontal */}
</div>
```

## API Integration

### Gemini AI Service
- **Model**: gemini-2.5-flash
- **Response Format**: JSON with strict validation
- **Error Recovery**: Automatic JSON parsing with fallback strategies
- **Content Generation**: Parallel requests for optimal performance

### Content Sharing
- Uses JSONBin.io for storing generated content
- Generates shareable URLs with unique bin IDs
- Supports content retrieval without API key requirements

## Component Development Guidelines

### 1. Component Structure
```typescript
interface ComponentProps {
  // Required props
  requiredProp: string;
  // Optional props
  optionalProp?: boolean;
}

const Component: React.FC<ComponentProps> = ({ requiredProp, optionalProp = false }) => {
  // Hooks at top
  const [state, setState] = useState<Type>(initialValue);
  
  // Event handlers
  const handleEvent = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // Render
  return (
    <div className="responsive-classes">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### 2. Quiz Component Pattern
All quiz components follow a consistent interface:

```typescript
interface QuizItemProps {
  question: QuestionType;
  onAnswer: (isCorrect: boolean) => void;
  showResult: boolean;
  userAnswer?: UserAnswerType;
}
```

### 3. Styling Conventions
- **Utility-first**: Prefer Tailwind utilities over custom CSS
- **Responsive**: Mobile-first breakpoints (sm:, md:, lg:)
- **Color Scheme**: Sky/Indigo primary, Slate neutral, Red/Green feedback
- **Spacing**: Consistent padding/margin using Tailwind scale

## Testing Strategy

### Current State
The project currently lacks automated testing. Consider implementing:

1. **Unit Tests**: Component logic testing with Jest + React Testing Library
2. **Integration Tests**: API service testing with mock responses
3. **E2E Tests**: User flow testing with Playwright or Cypress

### Recommended Test Structure
```
tests/
├── components/        # Component unit tests
├── services/         # Service integration tests
├── utils/            # Utility function tests
└── e2e/             # End-to-end tests
```

## Deployment

### GitHub Pages Setup
1. **Build Process**: `vite build && cp dist/index.html dist/404.html`
2. **Base Path**: Configured for `/ai-page-gen/` subdirectory
3. **SPA Routing**: 404.html fallback for client-side routing
4. **Automated Deployment**: `gh-pages` package handles deployment

### Environment Variables
- **Development**: `.env.local` for local API keys
- **Production**: API keys injected via build process
- **Runtime**: API key modal for user-provided keys

## Performance Considerations

### 1. Code Splitting
Consider implementing dynamic imports for quiz components:
```typescript
const TrueFalseQuizItem = lazy(() => import('./quizTypes/TrueFalseQuizItem'));
```

### 2. API Optimization
- **Parallel Requests**: Content generation requests run concurrently
- **Response Caching**: Consider implementing client-side content caching
- **Request Batching**: Potential for combining related API calls

### 3. Bundle Optimization
- **Tree Shaking**: Vite automatically removes unused code
- **Asset Optimization**: Images and static assets are optimized during build
- **Chunk Splitting**: Consider manual chunk splitting for large dependencies

## Security Considerations

### 1. API Key Management
- **Client-side Storage**: Keys stored in localStorage (consider security implications)
- **URL Parameters**: Temporary API key passing (cleared from URL)
- **No Server**: Fully client-side application reduces server-side vulnerabilities

### 2. Content Validation
- **Input Sanitization**: User topics are parameterized in API calls
- **JSON Parsing**: Robust error handling for AI-generated content
- **XSS Prevention**: React's built-in XSS protection

### 3. Privacy
- **No User Data**: Application doesn't collect personal information
- **API Calls**: Direct to Google/JSONBin, no intermediary servers
- **Local Storage**: Only API keys and user preferences

## Common Development Tasks

### Adding a New Quiz Type

1. **Define Type Interface** in `types.ts`:
   ```typescript
   export interface NewQuizQuestion {
     // Define structure
   }
   ```

2. **Create Component** in `components/quizTypes/`:
   ```typescript
   const NewQuizItem: React.FC<QuizItemProps<NewQuizQuestion>> = ({ question, onAnswer }) => {
     // Implementation
   };
   ```

3. **Update Service** in `geminiService.ts`:
   ```typescript
   // Add to quiz generation prompts
   ```

4. **Integrate in QuizView** component

### Modifying Content Generation

1. **Update Prompts** in `geminiService.ts`
2. **Modify Types** in `types.ts` if needed
3. **Update Display Components** to handle new content structure
4. **Test with Various Topics** to ensure robustness

### Adding New Features

1. **Plan Component Structure** - Single responsibility principle
2. **Update Type Definitions** - Maintain type safety
3. **Implement Service Logic** - Keep AI integration clean
4. **Add to Main Display** - Update LearningContentDisplay
5. **Test Responsive Design** - Ensure mobile compatibility

## Troubleshooting

### Common Issues

1. **API Key Errors**:
   - Verify key is valid and has quota
   - Check environment variable setup
   - Ensure key permissions include Gemini API

2. **Build Failures**:
   - Check TypeScript errors: `pnpm type-check`
   - Verify all imports are correct
   - Ensure environment variables are set

3. **Deployment Issues**:
   - Confirm base path matches repository name
   - Check GitHub Pages settings
   - Verify build artifacts in dist/

### Debug Tools
- **React DevTools**: Component hierarchy and props inspection
- **Vite DevTools**: Build process and HMR debugging
- **Browser DevTools**: Network requests and console errors
- **TypeScript**: Compile-time error checking

## Future Enhancements

### Recommended Improvements

1. **Testing Infrastructure**: Comprehensive test suite
2. **Performance Optimization**: Code splitting and caching
3. **Accessibility**: WCAG compliance improvements
4. **Internationalization**: Multi-language support
5. **Offline Support**: Service worker for offline quiz functionality
6. **Analytics**: Usage tracking and content effectiveness metrics
7. **Content Management**: Admin interface for content curation
8. **Advanced Quiz Types**: Drag-and-drop, audio-based questions
9. **Progress Tracking**: User learning progress persistence
10. **Social Features**: Content sharing and collaboration

### Architecture Evolution
- **State Management**: Consider Zustand or Redux for complex state
- **Backend Integration**: Optional server for user accounts and progress
- **Real-time Features**: WebSocket integration for collaborative learning
- **AI Enhancement**: Multiple AI provider support and fallback strategies

This development guide provides a comprehensive foundation for maintaining and extending the AI Learning Page Generator. The modular architecture and clear separation of concerns make it straightforward to add new features while maintaining code quality and user experience.