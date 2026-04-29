# GovAI Studio — Design Document

> **Status:** Authoritative current-state design as of 2026-04-29.
> **Supersedes:** `DESIGN_SPEC_V4.md` (retained for historical context).
> **For future direction, see:** `ROADMAP.md`.

## 1. Purpose

GovAI Studio is the workflow system organizations use to evaluate, govern,
and roll out AI coding agents (Claude Code, OpenAI Codex, GitHub Copilot
Agent, Cursor agents, and similar tools). It guides cross-functional teams
— legal, security, engineering, executive, communications — through a
defensible, auditable five-phase process from intake to go/no-go decision.

The product takes a position: **AI agent rollout is a governance problem
first and a tooling problem second.** Most failures we have observed in
the field are not technical — they are organizational. Engineering pushes
ahead, security is surprised, legal scrambles, executives lose confidence,
and the rollout stalls or gets shadow-banned. GovAI Studio enforces the
sequence: intake → assess → classify → govern → gate → build → evaluate.

## 2. Users

### Primary personas
| Role | Display label | Primary surface |
|---|---|---|
| `consultant` | Governance Consultant | Project setup, drives all phases |
| `admin` | Project Administrator | Tenant config, team, integrations |
| `executive` | Executive Sponsor | Decision Hub, Executive Brief, ROI |
| `legal` | Legal / Compliance Lead | Policies, compliance, ethics |
| `it` | IT / Security Lead | Sandbox, controls, monitoring |
| `engineering` | Engineering Lead | Pilot design, sprints, comparison |
| `marketing` | Communications Lead | Comms drafting, change management |

Each role sees a **filtered view** of the same underlying project. The
sidebar hides pages a role can't act on; "My Tasks" surfaces only their
work. The data model is single-source-of-truth — there is no per-role
fork of state.

## 3. Mental Model

A project moves through **five phases**. Each phase has exit criteria,
owned by one or more roles, that must be satisfied before the project
advances.

```
1. Scope & Assess      → Intake scorecard, assessment, prerequisites, team
2. Classify & Govern   → Data classification, policies, compliance, risk, RACI, ethics
3. Approve & Gate      → Gate reviews (1, 2, 3), exceptions, evidence
4. Build & Test        → Sandbox, pilot design, sprints, comparison, monitoring
5. Evaluate & Decide   → Outcomes, decision hub, executive brief, ROI, reports
```

Phases are gated, not just sequential. The 7-state project FSM
(`src/lib/state-machine/index.ts`) enforces transitions — a project cannot
enter Phase 4 without a Gate 1 approval; cannot enter Phase 5 without a
Gate 2 approval; cannot reach a final go/no-go without Gate 3.

## 4. Novel Functionality

These are the load-bearing features that distinguish GovAI Studio from
generic project management tools.

### 4.1 Feasibility Scoring Engine
File: `src/lib/scoring/engine.ts`

A pure-function scorer that takes assessment responses (25 questions
across 5 domains) and emits a structured score:
- Per-domain scores (0–100): Infrastructure, Security, Governance,
  Engineering, Business
- Weighted aggregate (Infra 25 / Sec 25 / Gov 20 / Eng 15 / Biz 15)
- Categorical rating: High Feasibility, Moderate, Conditional, Not Ready
- Recommendations array (per-domain remediation suggestions)
- Remediation tasks array (concrete checklist items)

The engine is intentionally side-effect-free so it can be tested with
fixtures, run client-side for "what-if" exploration, and re-run server-side
for the persisted score-of-record.

### 4.2 Pilot Intake Scorecard
File: `src/lib/intake/scorecard.ts`

A short (10-question) screener that runs **before** the full assessment,
producing a risk path: Fast Track, Standard, or High-Risk. The path
determines which governance steps are required vs. optional, preventing
over-engineering for low-stakes pilots and under-governing high-stakes ones.

### 4.3 Three-Gate Review Board
- **Gate 1** — Sandbox Access (after policies, classifications, controls)
- **Gate 2** — Pilot Launch (after sandbox validation, training, baseline metrics)
- **Gate 3** — Production Decision (after pilot data, ROI, executive review)

Each gate has a required evidence checklist, designated approvers per
role, and a structured outcome (Approved / Approved with Conditions /
Denied / Deferred). Gate decisions are audit-logged.

### 4.4 Sandbox Configuration Generator
File: `src/lib/config-gen/`

Given an infrastructure questionnaire (cloud provider, model selection,
network constraints, DLP requirements), generate the actual config files
the IT team needs to provision:
- `managed-settings.json` (Claude Code settings)
- `requirements.toml` (allowed packages)
- Terraform / CloudFormation IaC stub
- Network policy YAML

These are not templates — they're specific, validated, downloadable.

### 4.5 Multi-Stakeholder Report Generation
Files: `src/lib/report-gen/`

The same project state generates **persona-specific** reports:
- **Executive PDF** (3–5 pages) — feasibility, ROI, risk heat map, go/no-go
- **Legal DOCX** (editable) — contract analysis, compliance mapping, AUP
- **IT/Security PDF + configs** — architecture, network, DLP rules
- **Engineering Markdown + PDF** — tool comparison, metrics, setup
- **Communications DOCX** (editable) — messaging guide, FAQ, change narrative

Each persona gets exactly the level of detail and format they need; one
data model, five expressions.

### 4.6 Risk Exception Workflow
File: `src/lib/exceptions/index.ts`

When a control cannot be met, a time-bound risk exception with
compensating controls can be issued. Exceptions:
- Have explicit expiry dates (auto-reminder before expiry)
- Require role-based approval
- Carry compensating controls that must be in place
- Cannot extend past Gate 3 without re-approval
- Are surfaced in the Executive Brief as open risks

### 4.7 RACI-Aware Task Engine
File: `src/lib/tasks/role-assignment.ts`

35+ task types are mapped to a {Responsible, Accountable, Consulted,
Informed} matrix per role. The "My Tasks" page shows a user only the
work where they are R or A; "Project Plan" shows the full RACI context.

### 4.8 Decision Hub
File: `src/app/(dashboard)/projects/[id]/decision-hub/`

The terminal phase aggregates every governance artifact, every metric,
and every open risk into a single decision brief. Output: a rendered
recommendation (Go / Conditional Go / Pivot / Stop) with the evidence
inline. This is what the executive sees, signs, and forwards.

## 5. Architecture

### 5.1 Layers
```
┌──────────────────────────────────────────────────────────────┐
│  UI: Server Components by default, 'use client' as needed     │
│  shadcn/ui base + composed feature components                 │
├──────────────────────────────────────────────────────────────┤
│  State: Zustand (ephemeral) + TanStack Query (server cache)   │
│  Forms: React Hook Form + Zod                                 │
├──────────────────────────────────────────────────────────────┤
│  API routes (66): Zod-validated, typed JSON, RBAC-checked     │
│  Server Actions for in-page mutations                         │
├──────────────────────────────────────────────────────────────┤
│  Domain logic: src/lib/* (pure where possible, testable)      │
│  scoring · tasks · state-machine · rbac · exceptions ·         │
│  report-gen · config-gen · intake · workflow · escalation     │
├──────────────────────────────────────────────────────────────┤
│  Data: Supabase (Postgres + Auth + Storage + Realtime)        │
│  RLS on every table; multi-tenant via organization_id         │
├──────────────────────────────────────────────────────────────┤
│  Observability: Sentry (errors), audit_log table (compliance) │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Multi-tenant model
- Every domain table includes `organization_id`.
- RLS policies restrict reads/writes to the calling user's org.
- App code also filters explicitly — RLS is the safety net, not the
  primary mechanism. Bugs that bypass app-level filtering are the most
  common source of cross-tenant leaks.
- Service role key is **server-side only** and never injected into
  client bundles.

### 5.3 Phase-driven sidebar
The dashboard sidebar dynamically renders the active phase's pages,
collapsing completed phases and dimming future ones. This is intentional:
the affordance for "what should I do next" is the structure of the
sidebar itself.

### 5.4 Mobile responsiveness (Session 8)
- Custom `useMediaQuery(768)` hook in `src/hooks/use-media-query.ts`.
- Sidebar becomes a `<Sheet side="left">` drawer below 768px.
- Dialog component has a `max-w-[calc(100vw-2rem)]` floor — fixes 18+
  dialog usages without per-page changes.
- Notification dropdown, command palette, and contextual help all switch
  to mobile layouts. Gantt task list collapses to overlay; timeline
  scrolls horizontally.

## 6. Technology Stack (verified against package.json)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Server Components default, route handlers, RSC streaming |
| UI | React 19 + shadcn/ui + Tailwind 4 | Owned components, no UI library lock-in |
| State | Zustand + TanStack Query | Clear split between local UI state and server cache |
| Forms | React Hook Form + Zod | Schema-shared with API validation |
| Auth | Supabase Auth + custom claims | Multi-provider, RLS-friendly |
| DB | Supabase (Postgres) | RLS, real-time, managed |
| Charts | Recharts | Composable, accessible |
| Drag/drop | @dnd-kit | Modern, headless |
| PDF | @react-pdf/renderer | React-tree-to-PDF, server-renderable |
| DOCX | docx | Editable output for legal/marketing |
| Editor | Tiptap | Rich text for policy authoring |
| Tests | Vitest + Testing Library + msw | Single config, fast |
| Errors | Sentry | Source maps, breadcrumbs, tenancy-aware |

**Deliberately NOT in stack:**
- No Redux (Zustand covers it without ceremony)
- No GraphQL (REST + RSC is sufficient at current scale)
- No microservices (one Next.js app + Supabase scales to current scope)
- No `cmdk` (custom palette is small enough)
- No `@tanstack/react-table` yet (custom tables sufficient; reconsider
  when sortable/virtualized tables are needed)

## 7. Data Model (18 migrations)

```
Tier 1 — multi-tenant foundation
  organizations, users, team_members, audit_log

Tier 2 — assessment
  assessment_templates, assessment_questions,
  assessment_responses, feasibility_scores

Tier 3 — governance
  policies, policy_versions, compliance_mappings,
  risk_classifications, gate_reviews, risk_exceptions

Tier 4 — implementation
  workflow_templates, workflow_phases, workflow_tasks,
  task_assignments, task_status_history

Tier 5 — sandbox
  sandbox_configs, config_files, environment_validations

Tier 6 — PoC
  poc_projects, poc_sprints, poc_metrics, tool_evaluations

Tier 7 — timeline
  timeline_milestones, timeline_dependencies, timeline_snapshots

Tier 8 — outputs
  report_templates, generated_reports, evidence_packages

Tier 9 — operational
  meetings, meeting_actions, raci_assignments,
  data_classifications, data_flows, security_evidence,
  project_state_history (FSM)
```

All tables: `id uuid`, `created_at timestamptz`, `updated_at timestamptz`,
`organization_id uuid` (where tenant-scoped), `deleted_at` for soft delete.

## 8. Key Cross-Cutting Concerns

### 8.1 Error handling
- Per-route `error.tsx` boundaries (App Router pattern)
- Per-route `loading.tsx` for streaming SSR
- API routes return `{ error: string, message?: string }` with appropriate
  HTTP status (4xx for client, 5xx for server)
- Sentry captures unhandled exceptions with tenant context attached
- Demo-mode fallback: when Supabase isn't configured (preview / local
  without env vars), API routes return curated demo data so the UI
  remains explorable

### 8.2 RBAC (`src/lib/rbac/index.ts`)
27 permissions × 7 roles × tenant isolation. Permissions are checked
at three layers: (1) sidebar visibility (UX), (2) API route handlers
(authorization), (3) RLS policies (defense in depth).

### 8.3 Audit trail
Every state transition, gate decision, exception, and policy version
diff is recorded in `audit_log` with actor, target, timestamp, and a
JSONB delta. Compliance teams can export this for SOC 2 / ISO 27001
evidence.

### 8.4 Real-time collaboration
Supabase Realtime channels are used for:
- Gantt chart task updates (`use-realtime-timeline.ts`)
- Presence indicators on shared editors (`use-realtime-presence.ts`)
- Live notification fan-out (`use-realtime.ts`)

### 8.5 AI integration
Anthropic Claude API calls go through `/api/ai` only — never client-side.
Used for: report draft generation, policy language suggestions, risk
analysis hints, and meeting action-item extraction. Prompts live in
`src/lib/ai/prompts/`.

## 9. Key Insights from Development

These are non-obvious lessons we've learned that should inform any
future contributor.

1. **Phase-gating beats freeform navigation.** Early designs let users
   jump to any page at any time. Adoption testing showed users got lost
   and skipped governance steps. Locking future phases until exit
   criteria are met increased completion rates and reduced support cost.

2. **Role filtering must be opt-in per page, not central.** A central
   "show this role X pages" config is too coarse and gets stale.
   Each NavItem declares an optional `roles` array; pages compose their
   own role-aware content. This stays correct as pages are added.

3. **Pure scoring functions are a moat.** Because the feasibility scoring
   engine is a pure function, executives can see "what would my score be
   if I closed this gap?" without round-trips to the server. This is
   what users find magical about the assessment, more than the assessment
   itself.

4. **DOCX output for legal beats PDF.** Lawyers want to redline and
   negotiate. We tried PDF-only briefs first; legal teams asked for
   DOCX every single time. Now legal-facing artifacts default to DOCX
   while executive-facing ones default to PDF.

5. **Empty states beat fake demo data.** Hardcoded sample projects
   confused real users into thinking they had pre-existing data. Tenant
   onboarding now shows clean empty states with calls-to-action.

6. **Tone matters.** The product was originally written with playful
   gamified language ("launch your mission", "level up your governance").
   Enterprise buyers laughed it off. We rewrote for direct, professional
   language. This was a low-cost change with outsized credibility impact.

7. **The "Next Step" CTA on every completion screen is essential.**
   Users completed an assessment, saw a score, and bounced. Adding a
   single explicit "Next: classify your data" card on every completion
   page roughly doubled multi-page session depth.

8. **Mobile usability was a real blocker for executives.** Executives
   reviewing briefs and approving gates often do so on phones between
   meetings. Until Session 8, the desktop-first sidebar made the app
   unusable below 768px. The off-canvas drawer pattern was both small
   in scope and large in user value.

## 10. Out of Scope (and Why)

- **Generic ticketing.** We integrate with Jira (planned) but do not
  attempt to replace it. GovAI Studio is governance-of-AI, not generic
  PM.
- **Bring-your-own-LLM hosting.** We do not run model inference. We
  configure customer-owned environments and read evaluation metrics
  out of them.
- **Procurement.** We surface vendor evaluation data but do not handle
  contracts, billing, or licensing.
- **General-purpose RBAC editor.** Roles are a fixed set of seven; the
  product's opinion is that these are the right seven for AI governance.
  We may relax this in the future if customer demand justifies it.

## 11. Known Issues and Tech Debt

- **Demo data leakage in localStorage.** Some pages persist user
  experiments (Gantt edits, dismissed guides) in localStorage. This is
  fine for single-tenant local use but couples to the browser; should
  migrate to per-user server-side preferences for cross-device
  consistency.
- **Notification system is in-memory.** `src/lib/notifications/` is
  a single-process store. Production multi-replica deploys will need
  a database-backed implementation.
- **Some governance pages still use mock content.** Pages built before
  the empty-state principle (e.g., parts of `governance/playbook`)
  retain hardcoded examples that should move to seed data or removable
  templates.
- **No automated test coverage report in CI.** Tests run, coverage isn't
  gated. Pre-1.0 we should set a floor (suggested: 70% for `lib/`).
- **`Mobile Plan.md` and `plan.md` are duplicates.** Should be cleaned up
  alongside other plan docs in a future commit.

## 12. Steps for Further Development

The detailed roadmap lives in `ROADMAP.md`. At a glance:

**Near-term (next 1–2 sessions)**
- Database-backed notifications (replace in-memory store)
- Coverage gating in CI (set 70% floor for `lib/`)
- Replace remaining mock content with real seed data
- Consolidate plan docs (`PLAN.md`, `Mobile Plan.md`, `plan.md`)

**Medium-term (next 1–2 quarters)**
- Lightweight "Express" mode for low-risk pilots (hides 60% of governance)
- Native Jira / GitHub / Slack integrations (currently catalog-only)
- Editable policy templates with diff history (Tiptap is in stack but
  not fully utilized)
- Real-time co-editing on the Gantt and policy editor

**Longer-term**
- Cross-org benchmark anonymized aggregates
- Self-hosted deployment option for regulated customers
- API for programmatic project creation (for partner consultancies)
- White-label theming for agency partners

---

**Maintenance:** This document should be updated at the end of any session
that adds a new top-level feature, changes the data model, or alters the
phase structure. CLAUDE.md handles routine session-to-session continuity;
this document handles the system's identity.
