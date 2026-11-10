# NoviLearn Product & Architecture Roadmap

NoviLearn's mission is to become the premier open-source, extensible AI learning platform for students and developers worldwide. This roadmap outlines current achievements, active milestones, and future development horizons.

---

## Vision & Core Pillars

1. **Adaptive AI Tutoring Engine**: Context-aware, multi-mode Socratic explanations, exam prep, and bilingual teaching (Hinglish/English).
2. **Student & Developer Workspace**: Distraction-free study environments with session persistence, auto-generated notes, quizzes, and spaced-repetition flashcards.
3. **Pluggable AI Architecture**: Freedom from vendor lock-in. Seamlessly swap between Google Gemini, OpenAI GPT, Anthropic Claude, and self-hosted local models (Ollama/vLLM).
4. **Frictionless Self-Hosting**: One-command Docker Compose setup, lightweight footprint, and zero cloud dependency requirements for privacy-conscious institutions.

---

## Milestones

### Phase 1: Core Foundation & Monorepo (Completed)

- [x] Monorepo setup with `pnpm workspaces` (Web, API, Mobile, Shared packages).
- [x] PostgreSQL relational schema with Prisma ORM.
- [x] Shared design system (`@novilearn/design-tokens`) with light/dark theme support.
- [x] Comprehensive CI workflow (.github/workflows/ci.yml) verifying lint, format, and unit tests.

### Phase 2: Multi-Provider AI Learning Engine (Completed / v0.2.0)

- [x] Multi-mode educational engine (`simple`, `detailed`, `example`, `visual`, `exam`, `hinglish`).
- [x] Google Gemini REST provider integration with automatic fallback to offline educational engine.
- [x] Dynamic in-place mode switching without scroll jumping or page reloading.
- [x] Defensive JSON schema parsing and resilient UI error boundaries.
- [x] Session history persistence and follow-up question chaining.

### Phase 3: Socratic Dialogue & Multi-Modal Document RAG (In Progress)

- [ ] **Socratic Tutoring Mode**: Interactive step-by-step questioning rather than direct answer dumping, guiding students to deduce principles themselves.
- [ ] **Document & PDF Ingestion**: Client-side & server-side document parsing (PDF, Markdown, EPUB) for AI-assisted note generation and textbook Q&A.
- [ ] **Vector Search / RAG**: Integration with pgvector to ground AI responses directly in course syllabus or uploaded reference materials.
- [ ] **Streaming Responses (SSE)**: Real-time token streaming for low-latency feedback.

### Phase 4: Mastery Tracking & Spaced Repetition (Upcoming)

- [ ] **SM-2 / FSRS Spaced Repetition**: Intelligent scheduling for AI-generated flashcards.
- [ ] **Dynamic Knowledge Graph**: Visual mastery tree showing conceptual prerequisites and weak areas.
- [ ] **Automated Diagnostic Quizzes**: AI generates targeted diagnostic tests based on past session misunderstandings.

### Phase 5: Self-Hosting & Ecosystem Extensibility (Upcoming)

- [ ] **One-Click Deployments**: Pre-built Helm charts, Railway template, and Cloud Run single-command deploy.
- [ ] **Local LLM Support**: Native Ollama and LocalAI provider drivers with zero external internet required.
- [ ] **Plugin & Tooling SDK**: Public API to register custom subject analyzers, LaTeX renderers, and interactive code sandboxes (Python/JS).

---

## How to Influence the Roadmap

Community feedback drives our development priorities.

- To propose a new feature or change, open an idea on [GitHub Discussions](https://github.com/mdshahjadms0786-sys/NoviLearn-Platform/discussions) or submit a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md).
- To pick up an in-progress milestone, check open issues tagged `help wanted` or `good first issue`.
