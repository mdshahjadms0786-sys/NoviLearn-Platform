# Changelog

All notable changes to **NoviLearn** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-11-10

### Added

- **Google Gemini Provider**: Added first-class Google Gemini (`gemini-1.5-flash`) REST provider in `apps/api/src/ai/providers/gemini.provider.js` with structured JSON output and prompt optimization.
- **Intelligent Multi-Mode Educational Engine**: Created `educational-engine.js` supporting 6 specialized pedagogical modes:
  - `simple`: Plain language explanations and core concepts.
  - `detailed`: Comprehensive mechanisms, scientific equations, and chemical/mathematical proofs.
  - `example`: Real-world applications, analogies, and case studies.
  - `visual`: Step-by-step ASCII and Mermaid diagram workflows.
  - `exam`: Key exam takeaways, grading criteria, and high-frequency test questions.
  - `hinglish`: Natural bilingual colloquial explanations designed for South Asian learners.
- **Open-Source Governance Infrastructure**:
  - Full MIT License (`LICENSE`).
  - Contribution guidelines (`CONTRIBUTING.md`).
  - Contributor Covenant Code of Conduct (`CODE_OF_CONDUCT.md`).
  - Vulnerability reporting policy (`SECURITY.md`).
  - Architecture roadmap (`ROADMAP.md`).
  - GitHub issue and PR templates.

### Changed

- **In-Place Mode Switching**: Updated `LearningExperience` and `AiTutor` components to toggle modes smoothly in place without jarring scroll jumps or auto-scrolling to the page bottom.
- **Resilient Payload Parser**: Refactored `apps/web/src/components/ai/learning-experience.jsx` to defensively handle both raw JSON strings and pre-parsed backend metadata objects, resolving `Cannot read properties of undefined (reading 'find')`.

### Fixed

- Fixed mode detection regex in `apps/api/src/ai/educational-engine.js` to strictly match mode commands instead of triggering on system prompt metadata.
- Fixed auto-scroll effect in `apps/web/src/components/ai/ai-tutor.jsx` to prevent erratic scrolling during session mode selection.

---

## [0.1.0] - 2026-09-24

### Added

- Initial monorepo architecture using pnpm workspaces.
- Next.js 15 web client with Tailwind CSS and Radix UI components.
- Express API server with Prisma ORM and PostgreSQL integration.
- Mobile client scaffold using Expo and React Native.
- Shared packages: `@novilearn/design-tokens`, `@novilearn/shared`, `@novilearn/types`, `@novilearn/config`.
- Docker Compose configuration for local PostgreSQL service.
- Automated GitHub Actions CI pipeline for linting, formatting, and unit tests.
