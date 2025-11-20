# AI Learning Page Generator - Comprehensive Improvement Plan

## Analysis Summary

**Independent Plan Key Focus** (from codebase exploration):
- TDD foundation: Testing infrastructure first (Vitest, RTL, MSW) to stabilize AI prompts/services.
- App.tsx refactor: Extract hooks/layout for maintainability.
- Performance: Lazy loading, memoization, accessibility.
- Prompt diagnostics to protect critical AI generation.

**Kimi's Plan Strengths**:
- Specific TS error fix (`geminiService.ts:1118`).
- AI caching, bundle analysis, virtual scroll.
- Detailed phases with code examples, risks/KPIs.
- Heavy refactor of LearningContentDisplay and geminiService.

**Synthesis**:
- Start with critical fixes + testing (combines P0 urgency + stability).
- Prioritize TDD throughout (per CLAUDE.md).
- Include high-impact: cache, bundle opt, component splits.
- Incremental: 5 stages, each testable.
- No timelines; focus on verifiable outcomes.

**Priorities**: Tests > Stability > Performance > Refactor > DX. Estimated impact: 60% perf gain, 0% test coverage → 70%, code maintainability +50%.

## 🚀 Execution Workflow (MANDATORY)
**原則**: 逐步執行，每步確保**完整功能正常**（生成內容→測驗→分享→本地儲存全流程）。每階段結束後**良好 GIT 操作**，在**專用分支**進行追蹤。

1. **分支建立**: `git checkout -b improvement/stage-N-[name]` (e.g., `improvement/stage-1-testing-setup`).
2. **每步實現**:
   - 實現變更。
   - **驗證**:
     | Command | Purpose |
     |---------|---------|
     | `pnpm typecheck` | TS 無錯誤 |
     | `pnpm test` | 測試通過 |
     | `pnpm build` | 建置成功 |
     | `pnpm dev` + Manual | 全流程測試: 輸入主題 → 生成 → 切換等級 → 測驗互動 → 分享/QR → 本地儲存/匯出 |
3. **階段完成 GIT**:
   ```
   git add .
   git commit -m \"feat(improvement/stage-N): complete Stage N - [goal summary]\\n\\nCloses: [any issues]\\n🤖 Generated with Claude Code\"
   git push origin improvement/stage-N-[name]
   ```
4. **合併**: PR 至 `main`，審核後 merge。刪除分支。
5. **檢查點**: 每階段 PR 描述包含 Success Criteria 證明。

**重要**: 功能異常 → 回滾/修復，不前進下一階段。

## Stage 1: Critical Fixes & Testing Setup
**Goal**: Fix TS errors, add error boundaries, setup Vitest/RTL/MSW. Achieve clean `pnpm typecheck && pnpm test`.
**Success Criteria**:
- No TS errors/warnings (`pnpm typecheck`).
- 10+ tests pass (snapshots, basic services).
- MSW mocks Gemini APIs.
- **Full functionality**: Generate English/Math topics, quizzes render/share works.
**Tests**:
- Snapshot: `LoadingSpinner.tsx`, `InputBar.tsx`.
- Mock `generateObjectives()` → valid `LearningObjective[]`.
- Error handling in `geminiService.ts`.
**Files**:
- Fix: `services/geminiService.ts` (line ~1118, unused var).
- Add: `vitest.config.ts`, `tests/setup.ts`, `tests/services/geminiService.test.ts`.
- Update: `package.json` (add vitest@^2, @testing-library/react@^16, msw@^2), `tsconfig.json`.
**Status**: Not Started

## Stage 2: Core AI & UI Tests
**Goal**: Test generation/parsing for quizzes/objectives, key components. Ensure prompt stability.
**Success Criteria**:
- 80% coverage on `services/geminiService.ts`, `components/quizTypes/*`.
- Tests pass for invalid JSON, rate limits.
- Manual: Generate 3 topics (English/Math), all content renders.
- **Full functionality**: Quiz interactions (T/F, MC, scramble, memory), share/export.
**Tests**:
- `generateLearningPlan()` full flow → `ExtendedLearningContent`.
- `QuizView.tsx`: Render easy/normal/hard quizzes.
- `TrueFalseQuizItem.tsx`, `MemoryCardGameQuizItem.tsx` interactions.
**Files**:
- Add: `tests/components/QuizView.test.tsx`, `tests/components/quizTypes/*.test.tsx`.
**Status**: Not Started

## Stage 3: Performance Optimizations
**Goal**: Reduce bundle/load times, add caching/virtualization/memo.
**Success Criteria**:
- Bundle <400KB gzipped (`pnpm build --mode analyze`).
- Lighthouse Perf >85, Acc >95.
- Cache hits >50% on repeat generations (dev mode).
- **Full functionality**: Faster loads, no regressions in generation/quiz.
**Tests**:
- Lazy components mount without errors.
- Cached `generateObjectives()` returns mocked data fast.
**Files**:
- Add: `services/aiCache.ts` (in-memory TTL cache).
- Update: `vite.config.ts` (rollup-plugin-visualizer, manualChunks for react/ai/quiz).
- Lazy: `components/QuizView.tsx`, `components/InteractiveLearning/*`.
- Memo callbacks in `LearningContentDisplay.tsx`.
**Status**: Not Started

## Stage 4: Component & Service Refactor
**Goal**: Split monoliths (`App.tsx`, `LearningContentDisplay.tsx`, `geminiService.ts`). Extract hooks/generators.
**Success Criteria**:
- Components <200 lines each.
- New structure passes tests, no UI regression.
- SRP enforced (single hook/service per concern).
- **Full functionality**: All views (student/teacher, conversation, diagnostics) intact.
**Tests**:
- Refactored hooks: `useContentGeneration.test.ts`.
- Generators: `LearningObjectiveGenerator.test.ts`.
**Files**:
- Refactor `App.tsx` → `hooks/useApiKey.ts`, `hooks/useContentGeneration.ts`, `components/AppLayout.tsx`.
- Split `LearningContentDisplay.tsx` → `sections/ObjectivesSection.tsx`, etc.
- `services/` → `generators/BaseGenerator.ts`, `providers/GeminiProvider.ts`.
**Status**: Not Started

## Stage 5: Dev Experience & Polish
**Goal**: Git hooks, ADR, prompt validation, accessibility.
**Success Criteria**:
- Hooks/lint/test on commit.
- Dev console: prompt/response validator.
- Full manual flow: Generate → Quiz → Share → Local save.
- **Full functionality**: Prod-ready, all features verified.
**Tests**:
- Invalid prompt → fallback UI.
**Files**:
- Add: `.husky/pre-commit`, `.lintstagedrc.js`, `utils/promptValidator.ts`.
- ADR: `docs/adr/001-ai-cache.md`.
- ARIA/quizzes.
**Status**: Not Started

## Risks & Mitigations
- Regressions: TDD + manual generations per stage.
- AI Breaks: Feature flags (`USE_NEW_GENERATOR`), validate JSON schemas.
- Scope Creep: Stick to plan; Stage 1-2 before major refactors.

**Next**: Create branch `improvement/stage-1-testing-setup`, start Stage 1."
