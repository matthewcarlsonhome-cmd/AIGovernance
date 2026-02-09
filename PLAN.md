# GovAI Studio — Production Readiness Implementation Plan

## Overview

Transform GovAI Studio from a frontend-only demo into a production-ready application with full backend, authentication, data persistence, document generation, testing, and new consultant features.

---

## Phase 1: Foundation — Database, Auth & Data Layer

### 1A. Supabase Database Schema (SQL Migrations)
Create `supabase/migrations/` with ordered SQL files:

- **001_organizations_users.sql** — organizations, users tables with RLS
- **002_projects.sql** — projects, team_members with org-scoped RLS
- **003_assessments.sql** — assessment_templates, questions, responses, feasibility_scores
- **004_governance.sql** — policies, policy_versions, compliance_mappings, risk_classifications, gate_reviews
- **005_sandbox.sql** — sandbox_configs, config_files, environment_validations
- **006_poc.sql** — poc_projects, poc_sprints, poc_metrics, tool_evaluations
- **007_timeline.sql** — timeline tasks, dependencies, milestones, snapshots
- **008_reports.sql** — report_templates, generated_reports
- **009_meetings_raci.sql** — meeting_notes, action_items, raci_matrices (new features)
- **010_rls_policies.sql** — Row Level Security policies for all tables (org-scoped multi-tenancy)
- **011_seed_data.sql** — Default assessment templates, report templates, compliance frameworks

### 1B. Data Access Layer (`src/lib/db/`)
Abstract all database operations behind a typed service layer:

- `src/lib/db/organizations.ts` — CRUD for orgs
- `src/lib/db/projects.ts` — CRUD for projects, scoped to org
- `src/lib/db/assessments.ts` — Questions, responses, scoring
- `src/lib/db/governance.ts` — Policies, gates, compliance, risks
- `src/lib/db/sandbox.ts` — Config management
- `src/lib/db/timeline.ts` — Tasks, milestones, dependencies
- `src/lib/db/poc.ts` — PoC projects, sprints, metrics
- `src/lib/db/reports.ts` — Report generation records
- `src/lib/db/meetings.ts` — Meeting notes, action items (NEW)
- `src/lib/db/raci.ts` — RACI matrix management (NEW)

### 1C. Authentication & Middleware
- `src/middleware.ts` — Route protection: redirect unauthenticated users to /login, protect /api/* routes
- `src/lib/auth/` — Auth helpers: getCurrentUser(), requireAuth(), requireRole()
- Wire login/register/forgot-password pages to Supabase Auth
- Add RBAC role checking to sidebar navigation (show/hide based on user role)
- Session management with Supabase SSR cookie handling

### 1D. Environment & Configuration
- `.env.local.example` — Template with all required env vars
- `src/lib/env.ts` — Zod-validated environment variable loading
- Update `next.config.ts` — CSP headers, image domains, security headers

---

## Phase 2: API Routes & Server Actions

### 2A. API Routes (`src/app/api/`)
- `api/assessments/route.ts` — GET (list), POST (create response)
- `api/assessments/[id]/route.ts` — GET, PUT, DELETE individual responses
- `api/assessments/score/route.ts` — POST: run scoring engine on responses
- `api/projects/route.ts` — GET (list), POST (create)
- `api/projects/[id]/route.ts` — GET, PUT, DELETE
- `api/configs/route.ts` — POST: generate sandbox configs
- `api/configs/[id]/route.ts` — GET, PUT generated configs
- `api/reports/route.ts` — POST: trigger report generation
- `api/reports/[id]/route.ts` — GET report status/content
- `api/export/pdf/route.ts` — POST: generate PDF
- `api/export/docx/route.ts` — POST: generate DOCX
- `api/ai/route.ts` — POST: Claude API proxy for AI-assisted features
- `api/meetings/route.ts` — CRUD for meeting notes (NEW)
- `api/raci/route.ts` — CRUD for RACI matrices (NEW)

All routes return typed JSON with consistent error shape: `{ data?, error?, message }`

### 2B. Server Actions (`src/lib/actions/`)
- `assessment-actions.ts` — saveResponse, submitAssessment, recalculateScore
- `project-actions.ts` — createProject, updateProject, updateStatus
- `governance-actions.ts` — savePolicy, submitGateReview, updateCompliance
- `timeline-actions.ts` — updateTask, createMilestone, saveDependency
- `team-actions.ts` — addMember, removeMember, updateRole

---

## Phase 3: Wire Existing Pages to Real Data

### 3A. Integrate TanStack Query
- `src/lib/query/provider.tsx` — QueryClientProvider wrapper
- `src/hooks/use-projects.ts` — useProjects(), useProject(id)
- `src/hooks/use-assessments.ts` — useAssessmentQuestions(), useResponses(), useScore()
- `src/hooks/use-governance.ts` — usePolicies(), useGates(), useCompliance(), useRisks()
- `src/hooks/use-timeline.ts` — useTasks(), useMilestones()
- `src/hooks/use-poc.ts` — usePocProjects(), useSprints(), useMetrics()
- `src/hooks/use-reports.ts` — useReportTemplates(), useGeneratedReports()
- `src/hooks/use-meetings.ts` — useMeetings(), useActionItems() (NEW)
- `src/hooks/use-raci.ts` — useRaciMatrix() (NEW)

### 3B. Wire Each Page (replace hardcoded demo data with hooks)
Every page gets refactored:
1. Replace inline demo data with TanStack Query hooks
2. Add React Hook Form + Zod for all form inputs
3. Add loading states (skeleton UI) and error handling
4. Connect mutations to server actions / API routes

Pages to wire (27 total):
- Dashboard home, Project creation wizard, Project overview
- Assessment questionnaire, Readiness dashboard, Prerequisites
- Policy editor, Gate reviews, Compliance, Risk
- Sandbox configure, Config files, Validation
- Gantt chart, Milestones, Snapshots
- PoC projects, Sprints, Compare, Metrics
- Report generator, Report history
- Team management, Settings

### 3C. Frontend Feature Upgrades
- **Recharts Radar Chart** — Add to readiness dashboard (replace simple bars with radar visualization)
- **@dnd-kit Gantt Chart** — Add drag-and-drop task repositioning, dependency arrows (SVG), critical path highlighting
- **Rich Text Policy Editor** — Replace textarea with a proper editor for policy documents
- **React Hook Form + Zod** — Add to: assessment questionnaire, project wizard, sandbox config, team management, settings
- **Command Palette (Cmd+K)** — Global search across projects, pages, team members
- **Role-based Sidebar** — Filter navigation items based on user role
- **date-fns** — Replace all manual date formatting throughout the app

---

## Phase 4: New Features

### 4A. ROI Calculator (`projects/[id]/roi/`)
- Input form: team size, avg salary, current velocity, projected lift, license costs, implementation costs
- Output: monthly savings, annual savings, payback period, 3-year NPV
- Sensitivity analysis table (what-if scenarios at different lift percentages)
- Chart visualization with Recharts
- Export as standalone PDF

### 4B. RACI Matrix (`projects/[id]/governance/raci/`)
- Matrix editor: rows = tasks/deliverables from timeline, columns = team members
- Cell values: R (Responsible), A (Accountable), C (Consulted), I (Informed)
- Validation: every task has exactly 1 Accountable, at least 1 Responsible
- Phase-based filtering
- Export as formatted table in governance reports

### 4C. Meeting Tracker (`projects/[id]/meetings/`)
- Meeting log: date, title, attendees (from team), notes (rich text), action items
- Action items linked to timeline tasks
- Status tracking (open / in-progress / complete)
- Meeting summary export

### 4D. Engagement Proposal Generator
- Auto-generates scoped consulting proposal from assessment data
- Sections: objectives, scope, deliverables, timeline, team requirements, investment
- DOCX export for customization

### 4E. Executive Briefing Slide Deck
- 5-slide PDF: Feasibility Score, Domain Gaps, Risk Heat Map, Timeline, Go/No-Go
- Talking points as annotations
- Auto-generated from project data

---

## Phase 5: Document Generation

### 5A. Install & Configure
- Install `@react-pdf/renderer` for PDF generation
- Install `docx` (docx-js) for DOCX generation

### 5B. PDF Generation (`src/lib/report-gen/pdf/`)
- `readiness-report.tsx` — Readiness Assessment PDF with radar chart, domain scores, recommendations
- `executive-briefing.tsx` — 5-slide executive summary PDF
- `roi-report.tsx` — ROI calculator results PDF
- `governance-report.tsx` — Full governance package PDF

### 5C. DOCX Generation (`src/lib/report-gen/docx/`)
- `legal-report.ts` — Contract analysis, compliance mapping, AUP review
- `marketing-report.ts` — Messaging guide, FAQ, change management
- `proposal.ts` — Engagement proposal document
- `meeting-summary.ts` — Meeting notes export

### 5D. Export API Integration
- Wire export buttons on all relevant pages
- Stream file downloads from API routes
- Store generated reports in Supabase Storage with references in generated_reports table

---

## Phase 6: Quality Infrastructure

### 6A. Error & Loading Boundaries
Create for every route segment:
- `error.tsx` — Error boundary with retry button, error details in dev mode
- `loading.tsx` — Skeleton loading states matching page layouts

Routes needing boundaries (create shared patterns, then per-route):
- Dashboard root, Settings
- All project sub-routes (discovery/*, governance/*, sandbox/*, timeline/*, poc/*, reports/*, team)

### 6B. Test Infrastructure
- Install: vitest, @testing-library/react, @testing-library/jest-dom, msw (Mock Service Worker)
- `vitest.config.ts` — Configuration with path aliases, jsdom environment
- `src/test/setup.ts` — Global test setup (testing-library matchers)
- `src/test/mocks/` — MSW handlers for API mocking, Supabase mock client

### 6C. Test Suite
**Unit Tests** (`__tests__/unit/`):
- `scoring-engine.test.ts` — All scoring functions, edge cases, domain weights
- `config-generator.test.ts` — All config file generators
- `env-validation.test.ts` — Environment variable validation
- `auth-helpers.test.ts` — Auth utility functions
- `utils.test.ts` — cn() and other utilities

**Integration Tests** (`__tests__/integration/`):
- `api-assessments.test.ts` — Assessment API routes
- `api-projects.test.ts` — Project API routes
- `api-reports.test.ts` — Report generation API
- `api-export.test.ts` — PDF/DOCX export endpoints
- `server-actions.test.ts` — Server action mutations

**Component Tests** (`__tests__/components/`):
- `ui-components.test.tsx` — All 23 UI components render correctly
- `assessment-form.test.tsx` — Questionnaire form behavior
- `gantt-chart.test.tsx` — Gantt chart rendering and interactions
- `roi-calculator.test.tsx` — ROI calculator inputs/outputs
- `raci-matrix.test.tsx` — RACI matrix editing and validation

### 6D. ESLint & Code Quality
- Update ESLint config with stricter rules
- Add `lint` and `test` to CI pipeline scripts in package.json
- Add `typecheck` script: `tsc --noEmit`

---

## Phase 7: Documentation

### 7A. Setup & Implementation Manual (`SETUP_MANUAL.md`)
- Prerequisites (Node.js, Supabase account, environment)
- Step-by-step Supabase setup (create project, run migrations, configure auth)
- Environment variable configuration
- Local development setup
- Deployment to Vercel
- First-time admin setup
- Troubleshooting guide

### 7B. Updated Gap Analysis (`GAP_ANALYSIS_V2.md`)
- Comprehensive review of what was built in this cycle
- Remaining gaps for future development
- Prioritized roadmap for next cycle

---

## Execution Order

Given dependencies, the build order is:

1. **Phase 1** (Foundation) — Must come first, everything depends on it
2. **Phase 6B** (Test Infrastructure) — Set up early so we can test as we build
3. **Phase 2** (API Routes) — Backend endpoints needed before wiring pages
4. **Phase 3** (Wire Pages) — Connect frontend to backend
5. **Phase 4** (New Features) — Build on top of wired infrastructure
6. **Phase 5** (Document Generation) — Needs data flowing to generate from
7. **Phase 6A, 6C, 6D** (Error boundaries, tests, lint) — Quality pass
8. **Phase 7** (Documentation) — Final step after everything works

---

## Files to Create/Modify (Estimated)

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Database migrations | 11 | 0 |
| Data access layer | 10 | 0 |
| Auth & middleware | 4 | 3 |
| API routes | 14 | 0 |
| Server actions | 5 | 0 |
| TanStack Query hooks | 10 | 0 |
| New feature pages | 5 | 2 |
| Document generation | 8 | 0 |
| Error/loading boundaries | ~40 | 0 |
| Test infrastructure | 4 | 1 |
| Test files | ~15 | 0 |
| Wire existing pages | 0 | 27 |
| Configuration | 3 | 3 |
| Documentation | 2 | 0 |
| **Total** | **~131** | **~36** |
