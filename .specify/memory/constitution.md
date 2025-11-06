<!--
Sync Impact Report:
- Version: N/A → 1.0.0 (Initial ratification)
- Modified Principles: N/A (initial creation)
- Added Sections: All (new constitution)
- Removed Sections: N/A
- Templates Status:
  ✅ plan-template.md: Verified - Constitution Check section aligns
  ✅ spec-template.md: Verified - Requirements & acceptance criteria align
  ✅ tasks-template.md: Verified - Task categorization matches principles
  ⚠ Command files: No .specify/templates/commands/ directory exists yet
- Follow-up TODOs: None
-->

# AI Learning Page Generator Constitution

## Core Principles

### I. AI Prompt Integrity (NON-NEGOTIABLE)

**The AI prompts in `geminiService.ts` are the operational core of this application. Any simplification breaks content generation functionality.**

Rules:
- **NEVER** remove details from prompts: every example, structure description, and "at least X" clause serves a purpose
- **NEVER** translate to pure Chinese: use English instructions + Chinese examples (proven working pattern)
- **NEVER** remove JSON structure examples: AI needs exact format specifications
- **NEVER** remove quantity requirements: "at least 5 questions", "at least 3 micro-units" are essential
- **NEVER** remove field descriptions: every JSON field must be explained with examples

**Rationale**: Historical issues show that simplified prompts cause complete system failures. Prompts like `generateOnlineInteractiveQuizForLevel` with reduced detail resulted in no quiz generation, malformed data, and component crashes. Prompts are not documentation—they are executable specifications.

**Validation**: Before any prompt modification:
1. Compare with working version: `git show f83808d:services/geminiService.ts`
2. Test all quiz types and content generation immediately after changes
3. Maintain all examples, field descriptions, and quantity requirements
4. Add constraints only; never remove existing structure

### II. Educational Value First

**Every decision must consider impact on teaching and learning experience.**

Rules:
- User experience prioritized for both teachers (content creation) and students (learning interactions)
- Features must enhance educational outcomes, not just technical capabilities
- Content generation must be pedagogically sound and culturally appropriate
- Accessibility and inclusive design are mandatory for all learners

**Rationale**: Developed by Boyo Social Welfare Foundation for education. The application serves educators and learners—technical excellence must translate to educational value.

### III. Type Safety & Component Architecture

**TypeScript strict mode enforced; component patterns are standardized.**

Rules:
- All new code must have comprehensive TypeScript types
- Component interface pattern: Single responsibility, consistent props interface (especially quiz components)
- Service layer separation: Business logic in services, not components
- Error boundaries with user-friendly messages required
- No `any` types without explicit justification in code comments

**Rationale**: Maintains codebase quality, prevents runtime errors, and ensures consistent patterns for future development. Quiz components sharing a consistent interface enable easier extension.

### IV. Accessibility & Responsive Design

**Mobile-first responsive design with WCAG compliance.**

Rules:
- Tailwind CSS utility-first approach (no custom CSS without justification)
- Mobile-first breakpoints: base → sm: → md: → lg:
- ARIA labels and keyboard navigation required for all interactive elements
- Color contrast must meet WCAG AA standards minimum
- All features must work on mobile devices

**Rationale**: Educational tools must be accessible to all learners regardless of device or ability. Many students access content via mobile devices; teachers need responsive interfaces for classroom use.

### V. Test-Driven Development (Encouraged)

**Write tests for user interactions and critical paths; test behavior, not implementation.**

Rules (when tests are written):
- Component tests focus on user interactions using React Testing Library patterns
- Service tests mock external dependencies (e.g., `@google/genai`)
- Error handling must be tested (API failures, malformed responses)
- Tests should be deterministic and independent

**Rationale**: While not strictly enforced currently, testing user-facing behavior ensures features work as intended and prevents regressions. The codebase values quality and reliability for educational use.

### VI. Prompt Maintenance & Version Control

**AI prompts evolve through validated changes only.**

Rules:
- Prompt changes must be tested immediately with real content generation
- Keep detailed JSON examples in all AI prompts
- Maintain "English instructions + Chinese examples" pattern
- Document prompt changes with reasoning in commit messages
- Emergency recovery: Reference working version at commit `f83808d`

**Rationale**: Prompts control system behavior directly. Unlike code that compiles, prompt degradation is silent until runtime. Validated changes prevent production failures.

### VII. Package Management & Build Standards

**Use pnpm exclusively; maintain consistent dependency management.**

Rules:
- Always use `pnpm` commands, never `npm` or `yarn`
- Lock file (`pnpm-lock.yaml`) must be committed
- Dependencies added only when necessary with justification
- Security audits via `pnpm audit` before releases
- Build process must include 404.html for SPA routing (GitHub Pages requirement)

**Rationale**: pnpm provides disk space efficiency, faster installations, and strict dependency resolution. Mixing package managers causes lock file conflicts and phantom dependencies.

## Development Workflow

### Code Quality Gates

**Before any commit:**
- TypeScript compilation succeeds: `pnpm typecheck`
- Linting passes: `pnpm lint` (or `pnpm lint:fix` for auto-fixes)
- Formatting applied: `pnpm format`
- All existing tests pass (when tests exist)
- Prompt changes validated by generating sample content

### Feature Development Process

**Incremental development with clear stages:**
1. **Plan**: Break complex work into 3-5 stages documented in `IMPLEMENTATION_PLAN.md`
2. **Test** (when applicable): Write test first (red)
3. **Implement**: Minimal code to pass (green)
4. **Refactor**: Clean up with tests passing
5. **Commit**: Clear message linking to plan
6. **Remove** `IMPLEMENTATION_PLAN.md` when all stages complete

**When Stuck (After 3 Attempts)**:
- Document failures and error messages
- Research 2-3 alternative implementations
- Question abstraction level and architectural approach
- Try different angle: different library, pattern, or remove abstraction

### Security & Privacy

**Client-side security with no sensitive data handling:**
- API keys stored securely in localStorage, cleared from URLs
- Input sanitization: all user inputs parameterized in API calls
- XSS prevention via React's built-in protections
- Error messages don't expose internal system details
- AI response parsing includes robust JSON validation

### Deployment Standards

**GitHub Pages deployment with SPA support:**
- Base path configured: `/ai-page-gen/`
- 404.html fallback for client-side routing
- Build optimization via Vite (code splitting, minification)
- IndexedDB for local data; JSONBin for sharing
- No server-side rendering or backend dependencies

## Technology Constraints

**Fixed Stack** (changes require strong justification):
- **Frontend**: React 19.1.0 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI Service**: Google Gemini API
- **Package Manager**: pnpm
- **Storage**: IndexedDB (local), JSONBin (sharing), localStorage (preferences)
- **Deployment**: GitHub Pages (static hosting)

## Governance

### Constitution Authority

This constitution supersedes all other development practices. When conflicts arise, constitution principles take precedence.

### Amendment Procedure

1. Propose amendment with rationale and impact analysis
2. Verify no breaking changes to existing workflows
3. Update dependent templates (spec, plan, tasks, checklist)
4. Increment version according to semantic versioning:
   - **MAJOR**: Backward incompatible governance changes or principle removals
   - **MINOR**: New principles/sections or material expansions
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
5. Update LAST_AMENDED_DATE
6. Document changes in Sync Impact Report

### Compliance Review

- All PRs must verify compliance with Core Principles
- Constitution violations require explicit justification in PR description
- Complexity must be justified (see CLAUDE.md decision framework)
- Prompt changes require immediate validation testing

### Development Guidance

For runtime development workflow and detailed guidelines, see:
- **Global Instructions**: `~/.claude/CLAUDE.md` (agent-agnostic best practices)
- **Project Instructions**: `/CLAUDE.md` (project-specific development guide)

**Version**: 1.0.0 | **Ratified**: 2025-10-08 | **Last Amended**: 2025-10-08
