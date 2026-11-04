# CLAUDE.md — Spark

Spark — an AI dating app (Tinder-like) where Claude drives the value: AI onboarding, smart matching, icebreakers and coach, moderation, Wingman agent, evals.

**Source of truth — [SPEC.md](./SPEC.md).** Before any task, find it in SPEC §14 and read §4 (FSD) and §15 (agent rules). If SPEC and this file disagree, SPEC wins. If SPEC is missing something, don't invent it — leave `// TODO(spec): …` and describe the question in the report.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** (strict)
- **Tailwind v4** + **shadcn/ui** + **framer-motion**
- **Zod 4** — validation at every boundary
- **Supabase** — Postgres + pgvector, Auth (email), Realtime; clients via `@supabase/ssr`
- **Claude API** via `@anthropic-ai/sdk` (Sonnet — tier `smart`, Haiku — tier `fast`)
- **Voyage AI** — embeddings
- **Vitest** — tests; `npm run eval` — evals
- **Steiger** + ESLint — architecture checks
- **Vercel** — deploy on push to `main`

## Architecture: Feature-Sliced Design

```
app/          # Next.js routing only: page.tsx/route.ts — one-line re-exports from src/
proxy.ts      # Next.js 16 (formerly middleware.ts): Supabase session refresh and redirects
src/
  _app/       # providers, global styles
  _pages/     # screen composition
  widgets/    # large UI blocks
  features/   # user actions
  entities/   # business entities
  shared/     # ui, lib, config, api/supabase, ai
```

- `_app` and `_pages` use underscores to avoid conflicts with Next.js folders (FSD recommendation for Next.js).
- Imports flow down only: _app → _pages → widgets → features → entities → shared.
- Slices within the same layer do not import each other.
- Outside a slice — only its public API: `index.ts` (client-safe) or `server.ts` (server-only). Deep imports (`@/features/x/ui/Y`) are forbidden.
- `shared` is imported by file: `@/shared/ui/button`, `@/shared/lib/utils`, `@/shared/config/env.server`, `@/shared/api/supabase/server`.
- Segments: `ui/`, `model/`, `api/` (client requests), `server/` (server-only), `lib/`, `config/`.
- Alias: `@/*` → `src/*`.

## Conventions

### TypeScript

- `strict: true` plus `noUncheckedIndexedAccess`. No `any`, `@ts-ignore`, or `as` without a comment explaining why it can't be done otherwise.
- Named exports. `default` only where Next.js requires it (`app/**`).
- Names: components — `PascalCase.tsx`, other files — `camelCase.ts`, slice folders — `kebab-case`.
- DB types — only from the generated `src/shared/api/supabase/database.types.ts`, never edited by hand.

### Zod

- Validated: body and query of every endpoint, every LLM response, env (`src/shared/config/env.ts`), agent tool inputs.
- Schemas live in `model/schemas.ts` of their slice; types are inferred via `z.infer`, not duplicated.
- Endpoint validation error → 400 in format `{ error: { code, message } }` (helper `@/shared/lib/http`).

### Claude calls

- **All Claude and Voyage calls — only via `@/shared/ai`** (`src/shared/ai`). Importing `@anthropic-ai/sdk` anywhere else is blocked by the linter.
- Use `complete()`, `stream()`, `structured(opts, schema)`, `embed()`. Every call passes `feature` and `promptVer` so it is logged in `ai_calls` with tokens, cost, and latency.
- Model is selected via `tier: 'smart' | 'fast'`. Model IDs come from env/config only, never hardcoded. Prices are constants in `pricing.ts` (will move to DB later).
- User content (bio, messages, onboarding answers) is passed in XML tags (`<profile>`, `<message>`, `<conversation>`) as data, never as instructions.
- IDs from model responses are verified against the input data.
- Every AI endpoint is preceded by `rateLimit()`.

### Server and security

- Server code lives in `server/`, first line — `import 'server-only'`.
- Supabase clients: `browser.ts` (client), `server.ts` (RLS as the user), `admin.ts` (secret key, bypasses RLS — only in `server/`, `scripts/`, `evals/`, `shared/ai`).
- Env is read only via `publicEnv()` (`env.public.ts`) and `serverEnv()` (`env.server.ts`), never directly from `process.env`.
- Keys — server-side env only, never in `NEXT_PUBLIC_*`.
- DB schema changes via migrations in `supabase/migrations/`, followed by `npm run db:types`.

### UI

- Primitives come from `@/shared/ui/*`. New components — `npx shadcn@latest add <name>`: `components.json` is configured so they land in `src/shared/ui`.
- Every screen has loading (Skeleton), empty, and error states.
- Mobile-first, from 360 px.

### Tests

- Tests live in `__tests__/` inside the slice.
- Network calls to Claude/Voyage in tests are forbidden — mock `@/shared/ai` only.
- E2E — Playwright in `e2e/*.spec.ts`, projects `desktop` and `mobile-360`. Locators by role and text (`getByRole`), not CSS classes. AI responses in e2e are not checked verbatim.
- CI (`.github/workflows/ci.yml`): on every PR and push to `main` — `npm run check`, then `build` + e2e. Real keys are not used in CI.
- `server-only` is stubbed out in tests (`vitest.config.ts`); `seed`/`eval` scripts run with `--conditions=react-server`.

## Human-authored zones

This is code Natallia writes herself. The agent only scaffolds: types, signatures, Zod schemas, and `throw new Error('TODO(human)')`. Do not touch the implementation without an explicit request.

- `src/features/*/server/prompts.ts` — prompt text
- `src/features/onboarding/server/extractProfile.ts`
- `src/features/rank-feed/server/rerank.ts`
- `src/entities/message/server/moderate.ts`
- `src/features/icebreakers/server/*`, `src/features/chat-coach/server/*` — building system blocks with `cache_control`
- `src/features/wingman/server/loop.ts` and agent tool descriptions
- `evals/cases/*`, judge rubric

## Getting started

Requires Node.js 20.9+ (see `.nvmrc`), npm. Supabase CLI is installed as a dev dependency. For local Supabase you need Docker; otherwise use a cloud Supabase project.

```bash
npm install
cp .env.example .env.local     # fill in keys — see SPEC §12

# Database option A — local (Docker)
npx supabase init               # once, creates supabase/config.toml
npx supabase start             # prints URL and keys for .env.local
npx supabase db reset          # applies migrations

# Database option B — cloud project
npx supabase link --project-ref <ref>
npx supabase db push

npm run db:types               # generate DB types
npm run seed                   # 50 profiles via Claude + embeddings (uses API credits)
npm run dev                    # http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run lint:fsd` | `steiger ./src` |
| `npm run test` | Vitest |
| `npm run check` | typecheck + lint + lint:fsd + test |
| `npm run test:e2e` | Playwright e2e (`e2e/`), starts dev server automatically |
| `npm run test:e2e:ui` | Playwright in UI mode |
| `npm run db:types` | Generate Supabase types |
| `npm run seed` | Seed profiles (`--reset` to recreate) |
| `npm run eval` | Evals (uses API credits) |

## Jira (MCP)

Tasks live in Jira, accessed via the `atlassian` MCP server (`.mcp.json`).

- `/jira-setup <KEY>` — create tasks from SPEC §14 once (zone H tasks split into `-a` agent and `-b` Natallia).
- `/next-task [KEY-N]` — pick the next task with label `agent`, plan → "ok" → code → `npm run check` → commit to branch → comment in Jira.
- Statuses: To Do → In Progress (agent, after "ok") → In Review (agent, after commit) → Done (Natallia only).
- Tasks with label `human` are not executed by the agent.
- Deleting tasks and comments in Jira is forbidden.

## Skills

- For React/Next.js code use the `vercel-react-best-practices` skill. If it conflicts with FSD or the rules in this file — CLAUDE.md and SPEC win.

## Code review

- Before pushing or opening a PR, run the `code-reviewer` subagent (`.claude/agents/code-reviewer.md`) or `/review`.
- A PR is opened only with verdict APPROVE. Blockers are fixed, not argued away; H-zone findings go to Natallia.

## Definition of done

1. `code-reviewer` verdict is APPROVE. `npm run check` is green; if the task changes UI — an e2e test is added or updated and `npm run test:e2e` is green.
2. Only slices from the task are changed; new public API exports are listed in the report.
3. New env variables are added to `.env.example`, `src/shared/config/env.ts`, and SPEC §12.
4. If the contract changed (schema, endpoint, table) — SPEC.md is updated.
5. Do not run `npm run seed` or `npm run eval` unless asked: they consume API credits.
