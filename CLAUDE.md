# CLAUDE.md — GovAI Studio Development Foundation

> Read this file at the start of every coding session. It encodes the
> design principles, the tech stack as it actually exists in `package.json`,
> and the pitfalls we've already paid for. Trust this over your priors.

## Project Overview
GovAI Studio is a Next.js 16 (App Router) web application for AI governance
and enterprise implementation management. It guides organizations from initial
intake through sandbox setup, pilot execution, and production deployment of
AI coding agents (Claude Code, OpenAI Codex, and similar tools), enforcing a
five-phase workflow with role-based responsibility, gate reviews, and
auditable evidence at every step.

## Technology Stack — Verified Against package.json (2026-04-29)

**Core framework**
- Next.js 16.1.6 (App Router, Server Components, Promise-based route params)
- React 19.2.3 + React DOM 19.2.3
- TypeScript 5 (strict mode — `ignoreBuildErrors` is forbidden)

**UI & styling**
- Tailwind CSS 4 + `@tailwindcss/postcss`
- shadcn/ui base components (25 files in `src/components/ui/`):
  accordion, avatar, badge, button, card, checkbox, dialog, dropdown-menu,
  form, input, label, progress, radio-group, scroll-area, select, separator,
  sheet, slider, switch, table, tabs, textarea, toast, tooltip
- Lucide React icons
- `class-variance-authority`, `clsx`, `tailwind-merge` (use the `cn()` helper)

**Data & state**
- Supabase: `@supabase/supabase-js` 2.95 + `@supabase/ssr` 0.8 (server-side auth)
- Zustand 5 (client-side ephemeral state)
- TanStack React Query 5 (server-state cache & mutations)

**Forms & validation**
- React Hook Form 7 + `@hookform/resolvers`
- Zod 4 (validation everywhere — forms, API routes, env)

**Visualization & docs**
- Recharts 3 (charts)
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (Gantt drag/drop)
- @react-pdf/renderer 4 (PDF reports)
- docx 9 (DOCX reports — legal, meeting, proposal renderers)
- @tiptap/react + starter-kit + placeholder (rich text editing)

**Utilities**
- date-fns 4
- diff 8 (policy version diffs)

**Observability**
- @sentry/nextjs 10.38 — **INSTALLED**. Use it for new error reporting;
  do not write a parallel logging stack.

**Testing — Vitest only**
- vitest 4.0, @testing-library/react 16, @testing-library/jest-dom 6,
  @testing-library/user-event 14, jsdom 28, msw 2.12
- Single config: `vitest.config.ts`. **There is no Jest in this project.**
  Run tests with `npx vitest`. Do NOT run `npx jest` — it will appear to
  fail "all 24 suites" because Jest cannot find a config or transform `.ts`.

**Packages still NOT installed (do not import without adding to package.json)**
- `@tanstack/react-table` — referenced in plans, not yet a dependency
- `cmdk` — not yet a dependency (custom command palette in `components/shared/`)

## Architecture Rules
1. Use Server Components by default. Add `'use client'` only when you need
   interactivity (state, effects, browser APIs, event handlers).
2. All database access goes through the Supabase client (server-side) or
   API routes. Never query Supabase directly from client components.
3. Every table has Row-Level Security policies. Never bypass RLS. Never
   ship `service_role` keys to client code or `NEXT_PUBLIC_` env vars.
4. Use Zod for all form validation and all API input validation.
5. Error handling: per-route `error.tsx` boundaries. Sentry is wired up
   for unhandled exceptions.
6. Loading states: per-route `loading.tsx` segments.
7. API routes in `app/api/` return typed JSON with a consistent error
   shape: `{ error: string, message?: string }`.
8. Prefer Server Actions for mutations when you don't need a separate API
   surface; reach for API routes when external clients will consume them.

## File Organization
```
src/
  app/
    (auth)/                        # Public auth — login, register, forgot-password
    (dashboard)/
      layout.tsx                   # Sidebar + responsive Sheet drawer (mobile)
      page.tsx                     # Dashboard home
      portfolio/                   # Cross-project heatmap
      projects/
        new/                       # New project wizard + onboarding
        [id]/                      # Project-scoped pages (30 phase folders)
          overview/                # Project summary, health
          my-tasks/                # Role-filtered task queue (primary landing)
          project-plan/, plan/     # Master task list across phases
          intake/                  # 10-question pilot scorecard
          discovery/               # questionnaire, readiness, prerequisites, data-readiness
          governance/              # policies, gates, compliance, risk, raci, ethics, security-controls, exceptions, data-classification, data-flows, playbook
          sandbox/                 # configure, files, validate, architecture
          poc/                     # pilot-design, sprints, compare, metrics, projects, prioritize, vendor-eval
          timeline/                # gantt, milestones, snapshots
          reports/                 # generate, history, evidence, communications, client-brief
          decision-hub/, executive-brief/, outcomes/, roi/
          team/, controls/, action-queue/, workflow/
          monitoring/, change-management/, meetings/, risks/
          agent-deployment/        # 4 readiness sub-pages
      settings/                    # Profile, integrations, analytics, audit, monitoring
    api/                           # 66 API routes — see "API Routes Reference" below
  components/
    ui/                            # shadcn/ui base components — DO NOT EDIT directly
    shared/                        # notification-center, contextual-help, command-palette
    features/                      # Feature-specific composites (assessment, governance, sandbox, timeline, reports, poc)
  hooks/                           # use-auth, use-projects, use-timeline, use-realtime, use-media-query, etc.
  lib/                             # Domain logic — see "Custom Logic Locations"
  types/                           # Cross-cutting TypeScript types
  stores/                          # Zustand stores
supabase/
  migrations/                      # 18 SQL migrations
__tests__/                         # Top-level test files
```

## Custom Logic Locations
| Concern | File |
|---|---|
| Feasibility scoring (5 domains, weighted) | `src/lib/scoring/engine.ts` |
| Other scorers (data-readiness, maturity, risk, ROI, vendor) | `src/lib/scoring/*.ts` |
| Task → role mapping (35+ task types, 7 roles, 5 phases) | `src/lib/tasks/role-assignment.ts` |
| Phase exit-criteria & advancement | `src/lib/tasks/phase-gating.ts` |
| Auto-calculated due dates | `src/lib/tasks/due-dates.ts` |
| 7-state project FSM with transition guards | `src/lib/state-machine/index.ts` |
| RBAC: 27 permissions × 7 roles × tenant isolation | `src/lib/rbac/index.ts` |
| Notification engine (8 types, role-filtered) | `src/lib/notifications/index.ts` |
| Risk exception workflow (compensating controls, expiry) | `src/lib/exceptions/index.ts` |
| Domain event bus (35+ typed events) | `src/lib/events/*.ts` |
| KPI catalog (11 standard metrics) | `src/lib/metrics/*.ts` |
| SLA & escalation engine | `src/lib/escalation/index.ts` |
| Pilot intake scorecard (10 weighted Q's) | `src/lib/intake/scorecard.ts` |
| Canonical workflow mapping (6 steps, 35 page mappings) | `src/lib/workflow/*.ts` |
| Decision support / governance readiness service | `src/lib/services/index.ts` |
| Sandbox config generators (JSON/TOML/YAML/HCL) | `src/lib/config-gen/*.ts` |
| Report renderers (PDF + DOCX) | `src/lib/report-gen/*.ts` |
| Integration framework (10-connector catalog) | `src/lib/integrations/index.ts` |
| Security controls + scanning | `src/lib/security/*.ts` |
| Audit log access | `src/lib/db/audit.ts` |

## Database Conventions
- Tables: `snake_case`, plural (`assessment_responses`).
- Columns: `snake_case`. All tables include `id uuid default gen_random_uuid()`,
  `created_at timestamptz`, `updated_at timestamptz`. Soft delete is
  `deleted_at` (nullable).
- Foreign keys: `[singular_referenced_table]_id` (`project_id`, `organization_id`).
- Enums: stored as `text` with CHECK constraints, **not Postgres enums**
  (easier to migrate). Indexes on every FK and commonly-filtered column.
- 18 migrations in `supabase/migrations/` — never delete or rewrite an
  applied migration; add a new one.

## Coding Standards
- Named exports only (default exports reserved for `page.tsx` per Next.js).
- Functional components with explicit return types.
- `cn()` from `lib/utils` for conditional class merging.
- Prefer early returns over deeply nested conditionals.
- Use `satisfies` for type-safe object literals.
- All user-facing strings should be extractable for future i18n.
- Minimum test coverage targets: utility functions, scoring engine,
  config generators, intake scorecard, RBAC, state machine.

## Security Rules
- Never store API keys in client-accessible code or `NEXT_PUBLIC_` env vars.
- All Anthropic / OpenAI API calls go through server-side API routes only.
- Sanitize all user inputs (DOMPurify for any rich text rendering).
- Rate limit API routes (see `lib/utils/rate-limit.ts`).
- CSP headers configured in `next.config.ts`.
- All file uploads validated for type and size on the server.

## Component Patterns
- Forms: React Hook Form + Zod resolver + shadcn `Form` components.
- Modals: shadcn `Dialog` (mobile-safe — base component has
  `max-w-[calc(100vw-2rem)] sm:max-w-lg`).
- Mobile-only overlays: shadcn `Sheet` with `side="left"` (sidebar drawer)
  or `side="bottom"` (help / details panels).
- Toasts: shadcn `Sonner` / `Toast`.
- Command palette: custom `components/shared/command-palette.tsx` (no `cmdk`).

## Tone Rules
**No gamified language.** No "wizard", "champion", "fleet", "liftoff",
"mission control", etc. Use direct labels: "Dashboard" not "Mission Control",
"Create Project" not "Launch New Project". Activity verbs are professional:
"completed", "updated", "added", "flagged", "generated" — never "crushed",
"shipped", "leveled up". Reports for executives are persona-tailored but
always business-formal.

## Navigation Architecture (Phase-Driven)
The sidebar is **phase-driven**, not category-based:
- 5 phases: Scope & Assess → Classify & Govern → Approve & Gate →
  Build & Test → Evaluate & Decide
- Active phase auto-expands; completed collapse; future appear dimmed.
- Role-based filtering inside each phase (each NavItem has optional `roles`).
- "My Tasks" is the primary project landing (role-filtered task queue).
- "Project Plan" shows all tasks across all phases.

### Phase → page mapping
- **Phase 1 — Scope & Assess:** intake, discovery/{questionnaire, readiness, prerequisites, data-readiness}, team
- **Phase 2 — Classify & Govern:** governance/{data-classification, policies, compliance, risk, raci, ethics, security-controls, data-flows, playbook}
- **Phase 3 — Approve & Gate:** governance/{gates, exceptions}, reports/evidence, controls
- **Phase 4 — Build & Test:** sandbox/{configure, validate, architecture, files}, poc/{pilot-design, sprints, compare, metrics, vendor-eval}, monitoring
- **Phase 5 — Evaluate & Decide:** outcomes, decision-hub, executive-brief, roi, reports/generate, action-queue

### Role labels (no titles, no jargon)
| key | display |
|---|---|
| `admin` | Project Administrator |
| `consultant` | Governance Consultant |
| `executive` | Executive Sponsor |
| `it` | IT / Security Lead |
| `legal` | Legal / Compliance Lead |
| `engineering` | Engineering Lead |
| `marketing` | Communications Lead |

## Mobile Responsiveness (Session 8)
- `src/hooks/use-media-query.ts` — accepts a number (treated as max-width
  breakpoint) or raw media query string.
- Sidebar: hidden on `<768px`, opens as `<Sheet side="left">` via hamburger
  in the top bar; auto-closes on route change.
- Top bar: breadcrumbs collapse to current page only on mobile.
- Notification dropdown: `w-[calc(100vw-2rem)] sm:w-[360px]`.
- Contextual help: `<Sheet side="bottom">` on mobile, side panel on desktop.
- Command palette: `max-w-[calc(100vw-2rem)] sm:max-w-lg`; keyboard
  shortcut footer hidden on mobile.
- Gantt chart: 300px task list panel hidden on mobile, replaced by a
  collapsible overlay; timeline scrolls horizontally.
- Dialog base component has a mobile-safe max-width floor (no per-page
  changes needed).

## API Routes Reference (66 routes)
```
GET/POST          /api/assessments
GET/PATCH/DELETE  /api/assessments/[id]
POST              /api/assessments/score
GET/POST          /api/configs
GET/PATCH/DELETE  /api/configs/[id]
GET/POST          /api/configs/validate
POST              /api/ai
GET/POST          /api/export/pdf
POST              /api/export/docx
GET/POST          /api/meetings
GET/PATCH/DELETE  /api/meetings/[id]
GET/POST          /api/meetings/[id]/actions
PATCH/DELETE      /api/meetings/[id]/actions/[actionId]
GET/POST          /api/poc/tool-evaluations
GET/POST          /api/projects
GET/PATCH/DELETE  /api/projects/[id]
GET/POST/DELETE   /api/projects/[id]/team
GET/POST          /api/raci
GET/PATCH/DELETE  /api/raci/[id]
GET/POST          /api/reports
GET/PATCH/DELETE  /api/reports/[id]
GET/POST          /api/roi
POST              /api/storage
GET/POST          /api/timeline/tasks
PATCH/DELETE      /api/timeline/tasks/[id]
GET/POST          /api/timeline/milestones
GET/POST          /api/timeline/snapshots
GET/POST          /api/exceptions
GET/POST          /api/intake
GET               /api/action-queue
GET/POST          /api/decision
GET               /api/governance/readiness
```

## Shared Components
- `components/shared/notification-center.tsx` — bell + role-filtered dropdown.
- `components/shared/contextual-help.tsx` — floating "Guide" button with
  per-page help; bottom Sheet on mobile, side panel on desktop.
- `components/shared/command-palette.tsx` — Cmd+K command palette.

# Development Pitfalls — Lessons Already Paid For

These are not theoretical. Each entry is a bug we hit, debugged, and fixed.
Read this section before opening unfamiliar code.

### Verify packages exist before importing
Before adding `import x from 'pkg'`, check `package.json`. CLAUDE.md and
plan documents sometimes mention aspirational packages that aren't
installed (`cmdk`, `@tanstack/react-table`). Sentry IS installed —
prefer that over rolling new error reporting.

### Vitest, not Jest
Tests run via `vitest`. There is no Jest config. Running `npx jest` will
falsely report all 24 suites failing because Jest can't transform TS
without configuration. Always use `npx vitest`.

### `useSearchParams` requires `<Suspense>`
Pages calling `useSearchParams()` must wrap the consumer in `<Suspense>`,
or static prerender fails:
```tsx
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />  {/* useSearchParams() lives here */}
    </Suspense>
  );
}
```

### Tailwind CSS 4 — avoid CSS-variable utility classes
Classes like `bg-primary`, `text-foreground`, `text-muted-foreground`
depend on a `@theme inline {}` block defining `--primary`, `--foreground`,
etc. We don't ship that, so they render colorless. Use explicit colors:
| Avoid | Use |
|---|---|
| `bg-primary` | `bg-slate-900` |
| `text-primary-foreground` | `text-white` |
| `text-foreground` | `text-slate-900` |
| `text-muted-foreground` | `text-slate-500` |
| `bg-muted` | `bg-slate-100` |
| `border-border` | `border-slate-200` |
| `bg-destructive` | `bg-red-600` |

### API route patterns
1. Zod validation on every input (body and query params).
2. Demo-mode fallback: check `isServerSupabaseConfigured()` and return
   hardcoded demo data when Supabase is not configured (preview deploys).
3. Auth check: `supabase.auth.getUser()` when Supabase is configured.
4. Consistent error shape: `{ error: string, message?: string }`.
5. **Next.js 15+ route params are async:** `params: Promise<{ id: string }>`
   — must be awaited.

### Test fixtures must match types exactly
TypeScript strict mode means missing fields fail compilation, not runtime.
Common omissions:
- `TimelineTask`: `description`, `assigned_to`, `is_critical_path`,
  `gate_review_id`, `color`
- `AssessmentQuestion`: `options`, `scoring`, `help_text`
- `Project`: `feasibility_score`, `start_date`, `target_end_date`
- `SandboxConfig`: `vpc_cidr` (use `null`, never `undefined`)

### `ignoreBuildErrors` is forbidden
TypeScript strict is enforced. **Never** add
`typescript.ignoreBuildErrors: true` to `next.config.ts`. Fix the type
error in source.

### My Tasks and Project Plan need real role-specific data
Earlier sessions had `getTasksForRole()` returning `[]` for every role,
so the primary user landing page was empty. When adding a new role-aware
generator, populate it with meaningful tasks that link to real pages —
empty arrays look like bugs, not empty states.

### Role-ownership badges on governance pages
Every governance page shows which role owns it:
```tsx
<span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
  Owned by: IT / Security Lead
</span>
```

### Every page needs a "Next Step" exit
Users should never hit a dead-end. After completing a page's primary
action (intake, readiness, etc.), show a card pointing to the next
logical page. Especially important on completion screens.

### Onboarding wizard redirects must use the real project ID
Hardcoded `/projects/demo-new/overview` was a real bug. After project
creation, route to the dynamic ID returned from the API.

### Empty states beat fake demo data
Pages like PoC Projects, Sprint Evaluation, and Tool Comparison must
start empty for new tenants. Hardcoded demo entries confused real users
into thinking they had pre-existing data.

### Mobile responsiveness uses `useMediaQuery(768)`
For any new floating panel, dropdown, or fixed-width overlay, gate the
desktop layout on `!isMobile` and provide a Sheet-based mobile variant.
Don't introduce new fixed pixel widths above the 320px floor.

### Multi-tenant isolation
Always scope queries by `organization_id` from the session. Cross-tenant
data leakage is the worst class of bug we can ship — RLS is the
backstop, but app code should also filter explicitly.

# Current Sprint
**Session 8 focus:** mobile responsiveness — off-canvas sidebar,
responsive overlays, Gantt fallback, dialog mobile-width guard.

**Stats (2026-04-29):** 91 app pages · 66 API routes · 18 migrations ·
75 lib modules · 24 test files / 550+ tests · zero TypeScript errors.

# How to start any new session
1. Read this file end-to-end.
2. Run `git status` and `git log --oneline -10` to ground yourself in
   recent work.
3. Run `npx tsc --noEmit` to confirm clean baseline before changing code.
4. Use `npx vitest run` (NOT jest) to check tests.
5. Match the tone rules — no gamified language, no marketing fluff,
   no emoji unless the user asks.
6. When in doubt about a package or API, check `package.json` and the
   relevant lib module — do not invent.
