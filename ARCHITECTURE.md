# Architecture

Smart CRM web is the dashboard for a multi-tenant CRM (real estate first). It is Arabic-first (RTL) with full English support, and talks to the Laravel API in `crm-api` through a thin backend-for-frontend (BFF) layer.

## Monorepo

```
apps/app            Next.js dashboard (App Router)       built
apps/site           Marketing site                       placeholder
packages/ui         shadcn/Radix primitives + tokens.css  no app imports
packages/api-client Zod schemas + error normaliser        no React
packages/config     tsconfig, ESLint (boundaries, RTL)
```

pnpm workspaces + Turborepo. Versions shared across workspaces live in the `catalog` of `pnpm-workspace.yaml`.

## Layers inside `apps/app/src`

```
app/        routes only: compose a feature's page component, nothing else
features/   one folder per business area; each exposes a public API in index.ts
shared/     components, hooks, providers reused by features (no feature imports)
lib/        framework-free infrastructure: HTTP client, i18n, auth, query setup
config/     navigation registry, permissions, site constants
messages/   en.json / ar.json (every user-visible string)
```

Dependencies point one way: `app → features → shared → lib`, and `features` may use another feature only through its `index.ts`. This is enforced by ESLint (`no-restricted-imports` per folder in `packages/config/eslint.mjs`), not by convention.

A feature folder looks the same everywhere:

```
types/       Zod schemas and inferred types (API shapes)
constants/   query-key factory, filter ids, enums
api/         request functions: (HttpClient, params) -> parsed data
hooks/       TanStack Query hooks and mutations
schemas/     form schemas (messages are i18n keys)
utils/       pure mappers (form values <-> payload), unit-tested
components/  UI
```

## Authentication (BFF)

The browser never sees the API token.

1. `POST /api/auth/login|register|logout` (a route handler) calls the Laravel API and stores the token in an **httpOnly cookie**; only the user object is returned.
2. Every API call goes through `/api/proxy/[...path]`, which reads the cookie, adds `Authorization`, `X-Locale` and `X-Request-Id`, and forwards the request. A `401` from upstream clears the cookie.
3. `proxy.ts` (Next 16's replacement for middleware) redirects anonymous visitors to the login page and signed-in users away from it.
4. On the client, the HTTP client reports `401` (clear cache, go to login) and `403` (a no-permission screen, not a retry).

Server-only code (`lib/auth/session.ts`, `lib/api/upstream.ts`) imports `server-only`, so it cannot leak into a client bundle.

## Data flow

`component → hook (TanStack Query) → api function → HttpClient → /api/proxy → Laravel`.

- `HttpClient` is an interface; production uses `fetch`, tests use MSW. Every response is parsed with a Zod schema, so a backend change fails loudly at the boundary.
- Failures are normalised to one `ApiError { status, message, fieldErrors }`. Forms map a Laravel 422 onto their fields (`mapLaravelErrorsToForm`); anything unmapped becomes a form-level alert.
- Query keys come from a factory per feature, so a mutation invalidates exactly what it changed (employee changes also refresh the audit log).
- List screens keep search, filters, page and page size **in the URL** (nuqs), so a view can be shared and survives a refresh.

## Patterns used (and where)

| Pattern                       | Where                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Compound components           | `DataTable.*`, `PageHeader.*`                                                                  |
| Registry (open for extension) | navigation (`config/navigation.ts`), status tones, audit action tones                          |
| Adapter / mapper              | form values ↔ API payload (`utils/mappers.ts`), org-chart adapters                             |
| Builder                       | `buildListParams` turns UI state into a query string                                           |
| Factory                       | query-key factories, column factories (`createXColumns`)                                       |
| Hook injection                | async filters and selects take a `useOptions` hook, so the table knows nothing about employees |
| Strategy                      | the chart lays out the same `ChartNode` shape for both "by manager" and "by department"        |

## RTL and theming

- Layout uses logical utilities only (`ms-`, `pe-`, `start-`, `text-start`); a lint rule rejects `ml-`, `left-`, `text-left` and friends.
- Icons that point somewhere (chevrons, arrows) get `rtl:rotate-180`. Codes, emails and numbers are isolated as LTR (`CodeLabel`, `.ltr-field`).
- All colours, radii, shadows and heights are tokens in `packages/ui/src/styles/tokens.css` (light and dark). No hex value exists anywhere else.
- `next-intl` handles routing and messages (`/ar/...`, `/en/...`); `next-themes` handles light/dark.

## Testing

- **Unit** (Vitest): mappers, URL/query helpers, tree/layout maths, audit diffing, pagination.
- **Component + HTTP** (Vitest + Testing Library + MSW): the HTTP client (success, 422, 401, 403, network) and the login form against mocked auth routes. Unhandled requests fail the test.
- **End to end** (Playwright, `apps/app/e2e`): sign in as the demo owner, create a branch, create an employee, suspend them, and find the suspension in the audit log. It runs against the real seeded API.

## Known limits

See "Backend findings" in `PROGRESS.md`: no stats endpoint (KPIs are derived from list totals), no employee sort, no audit search or module list, no password reset, no import/export, and no OpenAPI (types are hand-written and guarded by Zod).
