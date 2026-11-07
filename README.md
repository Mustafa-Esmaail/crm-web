# Smart CRM — web

Dashboard for a multi-tenant CRM (real estate first). Arabic-first (RTL), English supported, light and dark. See [ARCHITECTURE.md](ARCHITECTURE.md) for how it is built and [PROGRESS.md](PROGRESS.md) for what is done.

## Requirements

- Node 22+
- pnpm 12 (`corepack enable` or `npm i -g pnpm`)
- The Laravel API (`crm-api`) running and seeded, for example on Laravel Herd at `https://crm-api.test`

## Setup

```bash
pnpm install
cp apps/app/.env.example apps/app/.env.local   # then edit API_BASE_URL
pnpm dev                                       # http://localhost:3000
```

Sign in with the demo account `owner@demo.test` (the "Try the demo account" button fills it in during development).

### Laravel Herd and HTTPS

Herd serves the API over a local HTTPS certificate that Node does not trust, so every API call fails with **502 "Upstream API is unreachable"**. Point Node at Herd's CA before starting the dev server:

```bash
# macOS / Linux / Git Bash
NODE_EXTRA_CA_CERTS=/path/to/LaravelValetCASelfSigned.crt pnpm dev
# PowerShell
$env:NODE_EXTRA_CA_CERTS = "C:\Users\<you>\.config\herd\config\valet\CA\LaravelValetCASelfSigned.crt"; pnpm dev
```

## Environment

| Variable              | Purpose                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `API_BASE_URL`        | Base URL of the API, including `/api/v1`. Server-side only; the browser talks to the app's own `/api/proxy`. |
| `NODE_EXTRA_CA_CERTS` | Path to a CA file, only needed for a locally trusted HTTPS API (see above).                                  |

## Scripts

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Start the dashboard                                     |
| `pnpm build`     | Production build of every workspace                     |
| `pnpm lint`      | ESLint, including the dependency-boundary and RTL rules |
| `pnpm typecheck` | TypeScript (strict)                                     |
| `pnpm test`      | Vitest unit and component tests (MSW mocks the API)     |
| `pnpm e2e`       | Playwright end-to-end tests against the real API        |

Husky runs `lint-staged` and `typecheck` before each commit.

## End-to-end tests

`pnpm e2e` starts (or reuses) the dev server on port 3100 and drives it in Chromium, so the API must be running and seeded with `owner@demo.test`. Install the browser once with `pnpm --filter @crm/app exec playwright install chromium`.

The API limits login attempts (a "Too Many Attempts" error after a handful in a minute), so the suite signs in once in a `setup` step and reuses that session; only the login tests themselves go through the form. If a run fails with that error, wait a minute and run again.

The flows covered: sign-in and sign-out, branch + employee + suspend + audit log, roles and permissions, a lead from creation to deletion, and a deal moving across the pipeline. Tests that create leads, deals, roles or branches delete them again.

The main organisation flow creates a branch, creates an employee and suspends them. The branch is deleted at the end, but employees cannot be deleted through the API, so each run leaves one suspended `E2E Employee …` in the demo data.

## Project layout

```
apps/app            the dashboard
apps/site           placeholder for the marketing site
packages/ui         design tokens and shadcn primitives
packages/api-client Zod schemas and error normalisation
packages/config     shared tsconfig and ESLint rules
docs/               screenshots of every screen
```
