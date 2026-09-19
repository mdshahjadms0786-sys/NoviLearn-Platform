# NoviLearn Phase 3 Final Report

## 1. Status

Phase 3 — Authentication + Student Account Foundation is **complete**. Backend auth (signup/login/logout/me) is implemented, database-backed session revocation works, the Web and Mobile apps both have full auth UI with persisted sessions and protected-route foundation, and all verification gates pass. The report ends at the Phase 3/4 boundary; **Phase 4 has NOT been started.**

## 2. Authentication (API)

- JWT **bearer tokens** signed with `jsonwebtoken` (`JWT_SECRET`, `JWT_EXPIRES_IN` from env).
- Endpoints: `POST /auth/signup` (201), `POST /auth/login` (200), `GET /auth/me` (200), `POST /auth/logout` (200).
- Passwords hashed with `bcryptjs@^3.0.3` at cost 12; never returned in responses; email normalized to lowercase on signup.
- Token revocation via a custom `tokenVersion` claim compared against the user row on every request; logout increments it, invalidating all previously issued tokens.
- Reusable `requireAuth` middleware (expiresAt, signature, role/membership placeholders, tokenVersion match) ready for Phase 4 routes.
- Validation: shared `signupSchema`/`loginSchema` in `@novilearn/shared`, enforced server-side in `validators/auth.ts` (zod). `confirmPassword` mismatch reported on the `confirmPassword` path.
- All responses use the standard `ApiResponse` envelope (`createApiResponse`); errors carry { code, message, statusCode, details }.
- Error handler in `index.ts` maps `AppError`, Prisma `P2002` (unique email) → 409, and body-parser client errors (malformed JSON) → 400.
- CORS restricted to the web origin (`WEB_URL`); custom in-memory rate limiter (login 30/15 min, signup 20/hour) with no new dependency.

## 3. Database

- `User` gains `tokenVersion Int @default(0)`; applied via `prisma db:push` (non-destructive). `db:generate` regenerated Prisma Client.
- Verified in DB: one test user (`ada@example.com`), password stored as a `$2b$12$...` bcrypt hash (60 chars, not plaintext), `tokenVersion` incremented to 1 after logout.
- Prisma Client singleton (`prisma.ts`) with global caching for dev hot-reload.

## 4. Web

- Typed API client (`lib/api.ts`) hitting `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`), `ApiClientError` with server error messages.
- Zustand auth store (`lib/auth-store.ts`) with `loading/authenticated/unauthenticated`, `login/signup/logout/restore`, token+user persisted in `localStorage`.
- `useAuth` hook (client bootstrap restore); `AuthLinks` (Sign in / account) on the home page; `ProtectedRoute` wrapper.
- Pages: `/login`, `/signup` (react-hook-form + shared zod schemas via `AuthShell` layout), `/account` (profile card, avatar initials, role badge, Sign out) behind `ProtectedRoute`.
- `FormField` extended with `autoComplete` for password-manager support.

## 5. Mobile

- New dependency `@react-native-async-storage/async-storage@1.23.1` (Expo SDK-compatible) for session persistence.
- Typed API client (`lib/api.ts`) mirroring the web client; `lib/config.ts` reads `EXPO_PUBLIC_API_URL` (default `http://localhost:3001`).
- Zustand auth store (`lib/auth-store.ts`) persisting token+user in AsyncStorage with guarded `restore()`.
- `RequireAuth` wrapper (loading state while checking, redirect to `/login` when unauthenticated); `AuthScreen` + `AuthFormField` (Controller-based) shared auth components.
- Screens: `/login`, `/signup` (server + field errors, submitting state), `/account` (avatar initials, name/email card, role badge, Membership card, Sign out). Home (`/index`) shows a status bar (Hello, name + Account, or Sign in).

## 6. Security

- bcrypt cost 12; generic login failure message (`Invalid email or password`, no user enumeration on login; duplicate-signup 409 on signup as intended).
- JWT payload carries `version`; middleware rejects tokens whose `version` does not match the DB `tokenVersion`.
- Bearer tokens sent only over Authorization headers; API keys never baked into web/mobile bundles (env placeholders only).
- CORS origin allowlist; rate limiting on auth routes; P2002 mapped to a clean 409.
- Secrets stay in gitignored `.env`; `.env.example` documents all variables.

## 7. Verification

- **API (live, against running dev server):** `/health` 200; invalid signup → 400 `VALIDATION_ERROR` with field details; valid signup → 201 (lowercased email, no password, hashed in DB); duplicate → 409; wrong password → 401 generic; login → 200; `/auth/me` with token → 200; without token → 401; logout → 200; `/auth/me` after logout → 401 (`Invalid or expired token`); malformed JSON → 400. All pass.
- **Typecheck:** `pnpm typecheck` — all packages pass (types, design-tokens, shared, api, web, mobile).
- **Lint:** `pnpm lint` — zero errors. API has 1 intentional `no-console` warning (startup log); web and mobile are clean (web 0 warnings).
- **Builds:** API emits `dist/`; web `next build` succeeds with all 6 routes prerendered; mobile `expo export --platform android` bundles successfully (1337 modules) including AsyncStorage and the new screens.
- **Formatting:** prettier `--single-quote` applied to all changed files.

## 8. Files Changed

**API (apps/api):** `src/config.ts`, `src/env.ts`, `src/errors.ts`, `src/index.ts`, `src/prisma.ts`, `src/controllers/auth.controller.ts`, `src/middleware/auth.ts`, `src/routes/auth.routes.ts`, `src/services/auth.service.ts`, `src/validators/auth.ts`, `src/utils/async-handler.ts`, `src/utils/rate-limit.ts`, `tsconfig.json` (`noEmit: false`), `prisma/schema.prisma` (`tokenVersion`), `package.json` (jsonwebtoken, @types/jsonwebtoken, bcryptjs).

**Shared:** `packages/types/src/index.ts` (LoginInput, SignupInput, AuthSession); `packages/shared/src/validation.ts` (loginSchema, signupSchema).

**Web (apps/web):** `src/lib/api.ts`, `src/lib/auth-store.ts`, `src/lib/use-auth.ts`, `src/components/protected-route.tsx`, `src/components/auth/auth-shell.tsx`, `src/components/auth/auth-links.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/account/page.tsx`, `src/components/ui/form.tsx` (autoComplete).

**Mobile (apps/mobile):** `package.json` (+@react-native-async-storage/async-storage), `src/lib/config.ts`, `src/lib/api.ts`, `src/lib/auth-store.ts`, `src/components/require-auth.tsx`, `src/components/auth/auth-screen.tsx`, `src/components/auth/form-field.tsx`, `src/app/index.tsx`, `src/app/login.tsx`, `src/app/signup.tsx`, `src/app/account.tsx`.

**Root/Docs:** `.env.example`; `docs/architecture.md`, `docs/development-guide.md`, `docs/project-structure.md`.

## 9. Remaining Issues

- No automated tests yet (unit/E2E are a future phase); verification was manual (live curl + builds).
- API lint shows one intentional `no-console` warning on the startup log line 116.
- `next lint` deprecation warning (Next 16 migration to ESLint CLI); `@types/react-native@0.73.0` deprecation warning during installs (RN ships its own types); `MODULE_TYPELESS_PACKAGE_JSON` warning for design-tokens (cosmetic; would be resolved by adding `"type": "module"`).
- Mobile default API URL `http://localhost:3001` works on emulators; physical devices need `EXPO_PUBLIC_API_URL` set to the machine's LAN IP (documented in `.env.example`).
- All signups are assigned `role: DEFAULT`; role-gated access and authenticated course content are Phase 4 work.
- Temporary verification script `check-users-tmp.cjs` was removed.
- Repo has no commits yet; everything remains untracked (no commit/push performed).

## 10. Phase Boundary

Phase 4 (dashboard, courses, AI tutor, payments, additional roles, tests) is outside the scope of this phase. No Phase 4 work has been performed.

Phase 4 has NOT been started.