# AI Learning Page Generator - Improvement Plan

**Generated**: 2026-01-07  
**Status**: Phase 0+1 Complete, Phase 2 In Progress

---

## Executive Summary

This document outlines a phased improvement plan for the AI Learning Page Generator project. The analysis identified critical issues in type safety, runtime validation, and testing that pose significant risk of production failures. The plan prioritizes risk reduction while maintaining system stability.

### Current Health Status

| Metric    | Status     | Notes                          |
| --------- | ---------- | ------------------------------ |
| Lint      | PASS       | 0 errors                       |
| TypeCheck | PASS       | Strict mode enabled            |
| Tests     | 70/70 PASS | UI + Schema + Validation tests |
| Build     | PASS       | Vite production build          |

### Critical Risk Summary

| Risk Area                    | Severity | Impact                                 |
| ---------------------------- | -------- | -------------------------------------- |
| No Runtime Validation (Zod)  | CRITICAL | AI schema drift causes UI crashes      |
| `any` Types (~400 instances) | HIGH     | Silent type errors at boundaries       |
| AI Services Untested         | HIGH     | No regression detection for core logic |
| Component Duplication        | MEDIUM   | Maintenance burden, inconsistency      |
| Accessibility Gaps           | MEDIUM   | WCAG compliance issues                 |

---

## Phase 0: Stabilize Interfaces & Safety Rails - COMPLETED

**Duration**: 0.5 days  
**Priority**: CRITICAL  
**Goal**: Prevent AI failures from crashing the UI

### Tasks

- [x] **0.1** Create centralized error boundary for AI responses
  - Location: `services/ai/validation/`
  - Add structured error reporting (provider, model, prompt name, truncated output)
  - User-safe error messages in Chinese

- [x] **0.2** Add AI response boundary wrapper
  - Single function that wraps all AI calls
  - Catches parse failures before reaching UI
  - Logs failures for debugging

### Success Criteria

- [x] AI parse failures show user-friendly error (not white screen)
- [x] Error logs include: provider, model, prompt identifier, raw output preview
- [x] Existing 31 tests still pass

---

## Phase 1: Runtime Validation with Zod - COMPLETED

**Duration**: 1-2 days  
**Priority**: CRITICAL  
**Goal**: Guarantee AI outputs match expected schema before reaching UI

### Tasks

- [x] **1.1** Install Zod (v4.3.5)

  ```bash
  pnpm add zod
  ```

- [x] **1.2** Create core Zod schemas in `services/ai/schemas/`

  | Schema                        | File                 | Status |
  | ----------------------------- | -------------------- | ------ |
  | `LearningObjectiveSchema`     | `learningContent.ts` | DONE   |
  | `ContentBreakdownSchema`      | `learningContent.ts` | DONE   |
  | `QuizDifficultyContentSchema` | `quiz.ts`            | DONE   |
  | `OnlineInteractiveQuizSchema` | `quiz.ts`            | DONE   |
  | `ConfusingPointsSchema`       | `learningContent.ts` | DONE   |
  | `ClassroomActivitiesSchema`   | `learningContent.ts` | DONE   |

- [x] **1.3** Add validation at provider boundary
  - Location: `services/ai/validation/index.ts`
  - Created `parseAndValidate()` for JSON parsing + schema validation
  - Created `AIResponseValidationError` class with user-friendly messages

- [x] **1.4** Create validation test fixtures
  - `tests/fixtures/ai/learningObjectives.json`
  - `tests/fixtures/ai/quizEasy.json`
  - 39 tests covering schemas and validation

### Success Criteria

- [x] Schema violations return structured error (not crash)
- [x] Fixture tests pass for all major content types
- [x] Type inference works: `z.infer<typeof Schema>` used in returns

### Files to Create/Modify

```
services/
  ai/
    schemas/           # NEW
      index.ts
      learningObjectives.ts
      contentBreakdown.ts
      quiz.ts
      writingPractice.ts
      conversation.ts
    validation.ts      # NEW - boundary validation wrapper
tests/
  fixtures/
    ai/               # NEW
      learningObjectives.json
      quiz-easy.json
      quiz-normal.json
      quiz-hard.json
```

---

## Phase 2: Service Layer Testing

**Duration**: 1-2 days  
**Priority**: HIGH  
**Goal**: Add regression detection for AI services and business logic

### Tasks

- [ ] **2.1** Add unit tests for AI parsing/validation
  - Location: `services/ai/__tests__/`
  - Test using recorded fixtures (no network)
  - Test malformed JSON handling
  - Test partial response handling

- [ ] **2.2** Add tests for core services

  | Service                | Test File                   | Coverage Focus                       |
  | ---------------------- | --------------------------- | ------------------------------------ |
  | `diagnosticService.ts` | `diagnosticService.test.ts` | Report generation, score calculation |
  | `jsonbinService.ts`    | `jsonbinService.test.ts`    | Save/load, error handling, retry     |
  | `lessonPlanStorage.ts` | `lessonPlanStorage.test.ts` | IndexedDB CRUD operations            |
  | `providerService.ts`   | `providerService.test.ts`   | Provider selection, fallback         |

- [ ] **2.3** Add 1-2 integration tests
  - Test: Raw AI text -> Parse -> Validate -> Component render
  - Mock provider layer, test UI integration
  - Location: `tests/integration/`

### Success Criteria

- [ ] Service layer has >60% coverage
- [ ] CI fails on schema/fixture mismatch
- [ ] Error paths tested (not just happy path)

---

## Phase 3: Type Safety Cleanup

**Duration**: 2-3 days  
**Priority**: HIGH  
**Goal**: Eliminate dangerous `any` types, complete type migration

### Tasks

- [ ] **3.1** Replace `Promise<any>` in generators with Zod-inferred types

  Files to update:
  - `services/ai/basicGenerators.ts`
  - `services/ai/coreGenerationFunctions.ts`
  - `services/ai/levelSpecificGenerators.ts`
  - `services/ai/subjectGenerators.ts`
  - `services/ai/studentContentTransformers.ts`

- [ ] **3.2** Remove `as any` at boundaries
  - Priority: Service layer returns
  - Priority: Component props interfaces
  - Use type guards where runtime checking needed

- [ ] **3.3** Ratchet ESLint rules

  ```javascript
  // eslint.config.js - gradual approach
  // Week 1: warn
  '@typescript-eslint/no-explicit-any': 'warn',
  // Week 2+: error (per directory)
  ```

- [ ] **3.4** Complete type migration
  - Audit: What's still using old `/types.ts` vs `/src/core/types/`
  - Define single source of truth in `/src/core/types/`
  - Re-export for backward compatibility

### Success Criteria

- [ ] 0 `Promise<any>` in service layer
- [ ] 50%+ reduction in `any` usage
- [ ] Type migration complete (single source of truth)

### Measurement

```bash
# Count current any usage
grep -r "any" --include="*.ts" --include="*.tsx" services/ components/ | wc -l
```

---

## Phase 4: Component Refactoring

**Duration**: 2-3 days  
**Priority**: MEDIUM  
**Goal**: Reduce duplication, improve accessibility

### Tasks

- [ ] **4.1** Create shared hooks

  | Hook        | Consolidates          | Location             |
  | ----------- | --------------------- | -------------------- |
  | `useShare`  | JSONBin sharing logic | `hooks/useShare.ts`  |
  | `useQRCode` | QR generation/display | `hooks/useQRCode.ts` |

- [ ] **4.2** Extract base UI components

  | Component | Replaces                        | Location                   |
  | --------- | ------------------------------- | -------------------------- |
  | `Button`  | Repeated Tailwind button styles | `components/ui/Button.tsx` |
  | `Card`    | SectionCard variants            | `components/ui/Card.tsx`   |
  | `Modal`   | Multiple modal implementations  | `components/ui/Modal.tsx`  |

- [ ] **4.3** Add keyboard accessibility

  | Component                      | Issues                 | Fix                           |
  | ------------------------------ | ---------------------- | ----------------------------- |
  | `MemoryCardGameQuizItem.tsx`   | No keyboard nav        | Add `tabIndex`, `onKeyDown`   |
  | `SentenceScrambleQuizItem.tsx` | Click-only interaction | Add keyboard drag alternative |

- [ ] **4.4** Add accessibility tests
  - Test keyboard navigation flows
  - Use `@testing-library/user-event` for keyboard simulation

### Success Criteria

- [ ] Sharing logic consolidated to 1 implementation
- [ ] 31 existing tests still pass
- [ ] New a11y tests for keyboard flows
- [ ] No WCAG contrast violations

---

## Phase 5: Performance Optimization

**Duration**: 1-2 days  
**Priority**: MEDIUM  
**Goal**: Improve responsiveness for AI-heavy operations

### Tasks

- [ ] **5.1** Add AbortController support
  - Allow cancellation of AI requests
  - Cancel on: navigation, new search, component unmount
  - Location: `services/geminiService.ts`, `src/core/providers/`

- [ ] **5.2** Add memoization where beneficial

  | Location                         | What to Memoize        |
  | -------------------------------- | ---------------------- |
  | `LearningContentDisplay.tsx`     | Content transformation |
  | Quiz components                  | Question lists         |
  | `TeacherInteractivePrepPage.tsx` | Heavy render logic     |

- [ ] **5.3** Add debouncing for generation triggers
  - Prevent rapid re-generation
  - 300ms debounce on topic input

- [ ] **5.4** Profile and optimize
  - Use React DevTools Profiler
  - Identify unnecessary re-renders
  - Add `React.memo` where needed

### Success Criteria

- [ ] Generation cancellation works reliably
- [ ] No stale state updates after navigation
- [ ] Measurable re-render reduction (before/after metrics)

---

## Phase 6: Documentation Alignment

**Duration**: 0.5 days  
**Priority**: LOW  
**Goal**: Accurate documentation for contributors

### Tasks

- [ ] **6.1** Update CLAUDE.md
  - Fix project structure description
  - Document actual `/services/ai/` organization
  - Document provider architecture in `/src/core/providers/`
  - Add Zod schema documentation

- [ ] **6.2** Add architecture diagram
  - Service layer relationships
  - Provider flow
  - Data flow from AI to UI

### Success Criteria

- [ ] New contributor can locate "where to add X" in <5 minutes
- [ ] Documentation matches actual codebase structure

---

## Implementation Timeline

```
Week 1:
  Day 1-2: Phase 0 + Phase 1 (Safety + Zod)
  Day 3-4: Phase 2 (Service Tests)
  Day 5:   Phase 3 Start (Type Cleanup)

Week 2:
  Day 1-2: Phase 3 Continue (Type Cleanup)
  Day 3-4: Phase 4 (Component Refactoring)
  Day 5:   Phase 5 (Performance) + Phase 6 (Docs)
```

**Total Estimated Effort**: 8-12 days

---

## Risk Mitigation

### During Implementation

1. **Always run full test suite** before committing
2. **Incremental commits** - one logical change per commit
3. **Feature flags** if needed for large refactors
4. **Keep UI functional** - never break existing features

### Rollback Plan

- Each phase is independent and can be paused
- Zod validation can use `.passthrough()` for gradual adoption
- ESLint rules can be reverted to `warn` if blocking

---

## Appendix A: File Impact Matrix

| File/Directory                   | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
| -------------------------------- | ------- | ------- | ------- | ------- | ------- | ------- |
| `services/geminiService.ts`      |         | X       |         | X       |         | X       |
| `services/ai/basicGenerators.ts` |         |         | X       | X       |         |         |
| `services/ai/schemas/` (NEW)     |         | X       | X       |         |         |         |
| `src/core/providers/`            | X       |         |         | X       |         | X       |
| `components/quizTypes/`          |         |         |         |         | X       |         |
| `components/learning-content/`   |         |         |         |         | X       | X       |
| `hooks/`                         |         |         |         |         | X       |         |
| `tests/`                         |         | X       | X       |         | X       |         |
| `CLAUDE.md`                      |         |         |         |         |         | X       |

---

## Appendix B: Zod Schema Priority List

### Must Have (Phase 1)

```typescript
// services/ai/schemas/quiz.ts
const TrueFalseQuestionSchema = z.object({
  statement: z.string(),
  isTrue: z.boolean(),
  explanation: z.string().optional(),
});

const MultipleChoiceQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctAnswerIndex: z.number().int().min(0),
});

const QuizDifficultyContentSchema = z.object({
  trueFalse: z.array(TrueFalseQuestionSchema),
  multipleChoice: z.array(MultipleChoiceQuestionSchema),
  fillInTheBlanks: z.array(FillBlankQuestionSchema),
  sentenceScramble: z.array(SentenceScrambleQuestionSchema),
  memoryCardGame: z.array(MemoryCardGameQuestionSchema).optional(),
});

const OnlineInteractiveQuizSchema = z.object({
  easy: QuizDifficultyContentSchema,
  normal: QuizDifficultyContentSchema,
  hard: QuizDifficultyContentSchema,
});
```

### Nice to Have (Phase 1 Extension)

- `ConversationPracticeSchema`
- `DiagnosticResultSchema`
- `MaterialGenerationParamsSchema`

---

## Appendix C: Test Priority Matrix

| Service/Function                        | Risk Level | Test Priority | Fixture Needed |
| --------------------------------------- | ---------- | ------------- | -------------- |
| `generateLearningObjectives`            | HIGH       | P0            | Yes            |
| `generateOnlineInteractiveQuizForLevel` | HIGH       | P0            | Yes            |
| `generateContentBreakdown`              | HIGH       | P0            | Yes            |
| `parseAIResponse` (JSON cleanup)        | HIGH       | P0            | Yes            |
| `diagnosticService.generateReport`      | MEDIUM     | P1            | Yes            |
| `jsonbinService.save/load`              | MEDIUM     | P1            | No (mock)      |
| `providerService.selectProvider`        | MEDIUM     | P1            | No (mock)      |
| `lessonPlanStorage.*`                   | LOW        | P2            | No (mock)      |

---

## Approval

- [ ] Reviewed by: **\*\***\_\_\_**\*\***
- [ ] Approved for implementation: **\*\***\_\_\_**\*\***
- [ ] Start date: **\*\***\_\_\_**\*\***
