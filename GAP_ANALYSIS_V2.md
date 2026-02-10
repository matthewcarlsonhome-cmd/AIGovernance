# GovAI Studio — Development Gap Analysis V2

> **Date:** February 2026 | **Version:** 2.0 | **Status:** Post-Backend Implementation

---

## Executive Summary

Session 2 transformed GovAI Studio from a frontend-only demo into a production-architected
application with full backend infrastructure, three new features, a test suite, and document
generation capabilities. This gap analysis documents the remaining work to reach production
readiness, organized by priority and effort.

### Completed in Session 2

| Category | Items Built | File Count |
|----------|------------|------------|
| Database | 11 SQL migrations, 30+ tables with RLS | 11 |
| Auth & Middleware | Supabase Auth helpers, route protection, security headers | 3 |
| Data Access Layer | 10 database modules (projects, assessments, governance, etc.) | 10 |
| API Routes | 18 RESTful API endpoints | 18 |
| Server Actions | 5 mutation modules (assessment, project, governance, timeline, team) | 5 |
| TanStack Query Hooks | 10 hook modules for all data domains | 10 |
| New Features | ROI Calculator, RACI Matrix, Meeting Tracker (full pages) | 3 |
| Document Generation | 5 report content generators (PDF + DOCX pipelines) | 5 |
| Test Infrastructure | Vitest config, 4 test suites, 61 passing tests | 6 |
| Error Boundaries | 14 error.tsx + 14 loading.tsx route boundaries | 28 |
| Configuration | Environment validation, QueryProvider, security headers | 4 |
| Documentation | SETUP_MANUAL.md (comprehensive), CLAUDE.md (updated) | 2 |
| **Total** | | **~105 files** |

---

## Gap Categories

### Legend

| Priority | Description |
|----------|-------------|
| **P0 - Critical** | Blocks production deployment |
| **P1 - High** | Required for MVP launch |
| **P2 - Medium** | Important for user experience |
| **P3 - Low** | Nice-to-have enhancements |

---

## 1. Frontend Integration Gaps

### 1.1 Page Data Wiring (P0)

**Status:** All 27 existing pages still use hardcoded demo data. TanStack Query hooks
are built but not yet wired into pages.

| Page | Route | Hook Available | Effort |
|------|-------|---------------|--------|
| Dashboard Home | `/(dashboard)/page.tsx` | `useProjects` | Small |
| Project Overview | `/projects/[id]/overview/page.tsx` | `useProject` | Small |
| Questionnaire | `/projects/[id]/discovery/questionnaire/page.tsx` | `useAssessmentQuestions`, `useAssessmentResponses` | Medium |
| Readiness Dashboard | `/projects/[id]/discovery/readiness/page.tsx` | `useFeasibilityScores` | Medium |
| Prerequisites | `/projects/[id]/discovery/prerequisites/page.tsx` | `useAssessmentResponses` | Small |
| Policy Editor | `/projects/[id]/governance/policies/page.tsx` | `usePolicies` | Medium |
| Gate Reviews | `/projects/[id]/governance/gates/page.tsx` | `useGateReviews` | Medium |
| Compliance Mapping | `/projects/[id]/governance/compliance/page.tsx` | `useComplianceMappings` | Medium |
| Risk Classification | `/projects/[id]/governance/risk/page.tsx` | `useRiskClassifications` | Small |
| Sandbox Configure | `/projects/[id]/sandbox/configure/page.tsx` | `useSandboxConfig` | Medium |
| Config Files | `/projects/[id]/sandbox/files/page.tsx` | `useConfigFiles` | Small |
| Validation | `/projects/[id]/sandbox/validate/page.tsx` | `useEnvironmentValidations` | Small |
| PoC Projects | `/projects/[id]/poc/projects/page.tsx` | `usePocProjects` | Medium |
| Sprint Tracker | `/projects/[id]/poc/sprints/page.tsx` | `usePocSprints` | Medium |
| Tool Comparison | `/projects/[id]/poc/compare/page.tsx` | `useToolEvaluations` | Medium |
| Metrics | `/projects/[id]/poc/metrics/page.tsx` | `usePocMetrics` | Medium |
| Gantt Chart | `/projects/[id]/timeline/gantt/page.tsx` | `useTimelineTasks` | Large |
| Milestones | `/projects/[id]/timeline/milestones/page.tsx` | `useTimelineMilestones` | Small |
| Snapshots | `/projects/[id]/timeline/snapshots/page.tsx` | `useTimelineSnapshots` | Small |
| Report Builder | `/projects/[id]/reports/generate/page.tsx` | `useReportTemplates` | Medium |
| Report History | `/projects/[id]/reports/history/page.tsx` | `useGeneratedReports` | Small |
| Team Management | `/projects/[id]/team/page.tsx` | `useTeamMembers` | Small |
| Settings | `/settings/page.tsx` | `useAuth` | Small |
| Login | `/(auth)/login/page.tsx` | `useSignIn` | Small |
| Register | `/(auth)/register/page.tsx` | `useSignUp` | Small |
| Forgot Password | `/(auth)/forgot-password/page.tsx` | `useResetPassword` | Small |
| New Project | `/projects/new/page.tsx` | `useCreateProject` | Medium |

**Estimated effort:** 3-5 days for full wiring

**Approach:** For each page:
1. Replace `useState` demo data with TanStack Query hooks
2. Replace mock mutation handlers with server action calls or API mutations
3. Add loading states using hook `isLoading` / `isPending`
4. Add error handling using hook `error` state
5. Remove `'use client'` where possible (convert to Server Components for data-fetch pages)

### 1.2 Auth Flow Pages (P0)

**Status:** Login, Register, and Forgot Password pages exist with UI but are not wired to
Supabase Auth.

| Task | Description | Effort |
|------|-------------|--------|
| Wire login form | Connect to `signIn()` from auth helpers | Small |
| Wire register form | Connect to `signUp()`, create org + user record | Medium |
| Wire forgot password | Connect to `resetPassword()` | Small |
| Session redirect | After login, redirect to dashboard or last page | Small |
| Logout button | Wire sidebar logout to `signOut()` | Small |

### 1.3 Form Validation (P1)

**Status:** Zod schemas are not yet applied to form inputs. React Hook Form is installed
but forms use plain `useState`.

| Task | Description | Effort |
|------|-------------|--------|
| Assessment forms | Zod schema for questionnaire responses | Medium |
| Policy editor forms | Zod schema for policy content | Small |
| Project creation form | Zod schema for project fields | Small |
| Team invitation form | Zod schema for email + role | Small |
| Sandbox config form | Zod schema for infrastructure settings | Medium |
| Gate review form | Zod schema for review submission | Small |

---

## 2. Backend Gaps

### 2.1 PDF File Generation (P1)

**Status:** Report content generators produce structured data objects. The actual
PDF rendering pipeline (`@react-pdf/renderer`) is not yet wired.

| Task | Description | Effort |
|------|-------------|--------|
| Install @react-pdf/renderer | Package is in package.json but may need version check | Small |
| Create PDF layout components | Header, footer, section templates, page numbers | Medium |
| Readiness report PDF | Wire `generateReadinessReportContent()` to PDF renderer | Medium |
| Executive briefing PDF | Wire `generateExecutiveBriefingContent()` to slide-style layout | Large |
| IT/Security report PDF | Combine readiness data with sandbox config details | Medium |
| Engineering report PDF | Tool comparison + metrics tables + setup guides | Medium |
| PDF storage | Upload generated files to Supabase Storage `reports` bucket | Small |

### 2.2 DOCX File Generation (P1)

**Status:** DOCX content generators produce structured data. The `docx` (docx-js) package
rendering pipeline is not yet wired.

| Task | Description | Effort |
|------|-------------|--------|
| Install docx package | Verify docx-js is properly installed | Small |
| Create DOCX templates | Base styles, headers, footers, page breaks | Medium |
| Legal report DOCX | Wire `generateLegalReportContent()` to docx builder | Medium |
| Proposal DOCX | Wire `generateProposalContent()` to docx builder | Medium |
| Meeting summary DOCX | Wire `generateMeetingSummaryContent()` to docx builder | Small |
| Marketing report DOCX | Create content generator + DOCX builder | Medium |
| DOCX download endpoint | Stream DOCX file from `/api/export/docx` | Small |

### 2.3 AI Integration (P2)

**Status:** `/api/ai/route.ts` exists with Claude API integration structure but needs
prompt engineering and response formatting.

| Task | Description | Effort |
|------|-------------|--------|
| Policy draft prompts | Prompt templates for AUP, IRP, data classification | Medium |
| Report narrative prompts | Prompt templates per persona for executive summaries | Medium |
| Meeting summary prompts | Prompt to summarize meeting notes into action items | Small |
| Risk assessment prompts | Prompt for risk tier recommendations based on responses | Medium |
| Proposal generation prompts | Prompt for engagement proposal narrative sections | Medium |
| Prompt template library | Centralized `lib/ai/prompts/` with typed templates | Medium |
| Response parsing | Zod schemas for validating AI-generated structured responses | Medium |
| Rate limiting | Per-user rate limiting on AI endpoints | Small |
| Cost tracking | Track token usage per project for billing | Medium |

### 2.4 Real-time Subscriptions (P2)

**Status:** Supabase real-time is not yet configured.

| Task | Description | Effort |
|------|-------------|--------|
| Timeline real-time | Live Gantt chart updates when team members change tasks | Medium |
| Assessment real-time | See other team members' questionnaire progress | Small |
| Notifications | Real-time notification system for gate reviews, assignments | Large |

### 2.5 File Upload & Storage (P2)

**Status:** Supabase Storage bucket creation is documented but not implemented.

| Task | Description | Effort |
|------|-------------|--------|
| Storage bucket setup | Create `reports` and `attachments` buckets | Small |
| Upload component | Reusable file upload component with drag-and-drop | Medium |
| Policy attachments | Attach supporting documents to policies | Medium |
| Evidence uploads | Upload evidence documents for gate reviews | Medium |
| Report storage | Save generated reports (PDF/DOCX) to storage | Small |

---

## 3. Feature Enhancement Gaps

### 3.1 Gantt Chart Interactivity (P1)

**Status:** Gantt chart page renders static demo bars. Needs drag-and-drop and
dependency visualization.

| Task | Description | Effort |
|------|-------------|--------|
| Wire to real data | Replace demo tasks with `useTimelineTasks` hook | Medium |
| @dnd-kit integration | Drag task bars to change dates | Large |
| Dependency arrows | SVG arrows between connected tasks | Large |
| Critical path highlighting | Calculate and highlight the critical path | Medium |
| Zoom levels | Day/Week/Month/Quarter view switches | Medium |
| Task creation inline | Click to add tasks directly on the chart | Medium |
| Export to PNG/CSV | Canvas export and CSV download | Medium |

### 3.2 Readiness Radar Chart (P1)

**Status:** Readiness dashboard shows score cards but no radar chart visualization.

| Task | Description | Effort |
|------|-------------|--------|
| Recharts radar | 5-axis radar chart for domain scores | Medium |
| Score comparison | Overlay current vs. target scores | Small |
| Drill-down | Click domain to see question-level breakdown | Medium |

### 3.3 Policy Editor Enhancement (P2)

**Status:** Policy editor has basic textarea. Needs rich text capabilities.

| Task | Description | Effort |
|------|-------------|--------|
| Rich text editor | Integrate Tiptap or Lexical for policy content editing | Large |
| Version diff view | Side-by-side diff of policy versions | Medium |
| Approval workflow | Multi-step approval with comments | Medium |
| Template library | Pre-built policy templates (AUP, IRP, data classification) | Medium |

### 3.4 Command Palette (P3)

**Status:** Not implemented. shadcn Command component exists.

| Task | Description | Effort |
|------|-------------|--------|
| Cmd+K handler | Global keyboard shortcut listener | Small |
| Search index | Index all pages, projects, policies, tasks | Medium |
| Quick actions | Navigate, create project, run assessment from palette | Medium |

### 3.5 Dashboard Analytics (P2)

**Status:** Dashboard home shows project cards but no aggregate analytics.

| Task | Description | Effort |
|------|-------------|--------|
| Org-level metrics | Total projects, avg readiness, active assessments | Medium |
| Activity feed | Recent actions across all projects | Medium |
| Health indicators | Project health scores with trend arrows | Small |

---

## 4. Quality & Testing Gaps

### 4.1 Expand Unit Tests (P1)

**Status:** 61 tests covering scoring engine, ROI calculator, config generator, and utils.

| Module | Test File Needed | Tests to Write | Effort |
|--------|-----------------|---------------|--------|
| Auth helpers | `auth-helpers.test.ts` | signIn, signUp, signOut, requireAuth, requireRole | Medium |
| Server actions | `actions/*.test.ts` | All 5 action modules (mocked Supabase) | Large |
| Report generators | `report-gen/*.test.ts` | All 5 content generators | Medium |
| Environment validation | `env.test.ts` | Zod schema validation | Small |
| Date/formatting utils | `format-utils.test.ts` | Currency, date, percent formatters | Small |

**Target:** 150+ unit tests

### 4.2 Component Tests (P1)

**Status:** No component tests exist.

| Component Category | Estimated Tests | Effort |
|-------------------|----------------|--------|
| UI components (Button, Input, Card, etc.) | 30+ | Medium |
| Form components (with validation) | 20+ | Medium |
| Feature components (ScoreCard, GanttBar, etc.) | 25+ | Large |
| Layout components (Sidebar, Navigation) | 10+ | Small |

**Target:** 85+ component tests

### 4.3 Integration Tests (P2)

**Status:** No integration tests exist.

| Area | Tests to Write | Effort |
|------|---------------|--------|
| API route handlers | Request/response validation for all 18 routes | Large |
| Auth flow | Login → Dashboard → Protected route | Medium |
| Assessment flow | Answer questions → Score → View results | Large |
| Report generation | Select template → Generate → Download | Medium |

**Target:** 40+ integration tests

### 4.4 E2E Tests (P3)

**Status:** No E2E framework configured.

| Task | Description | Effort |
|------|-------------|--------|
| Install Playwright | Configure with Next.js | Small |
| Auth E2E | Register → Login → Logout flow | Medium |
| Project lifecycle E2E | Create → Assess → Report → Archive | Large |
| Cross-browser testing | Chrome, Firefox, Safari matrix | Medium |

### 4.5 Type Safety (P1)

**Status:** TypeScript strict mode is on. Some `any` types exist in API routes.

| Task | Description | Effort |
|------|-------------|--------|
| Eliminate `any` types | Replace all `any` with proper types in API routes | Medium |
| Supabase generated types | Run `supabase gen types` for database type safety | Small |
| Strict API contracts | Zod schemas for all API request/response bodies | Medium |
| Form type safety | Typed form values with React Hook Form + Zod | Medium |

---

## 5. Security Gaps

### 5.1 Input Validation (P0)

| Task | Description | Effort |
|------|-------------|--------|
| API input validation | Zod schemas on all POST/PUT route bodies | Medium |
| XSS prevention | DOMPurify on any rendered user HTML (policy content) | Small |
| SQL injection | Parameterized queries (Supabase handles this) | Done |
| CSRF protection | Verify Supabase auth token on mutations | Small |

### 5.2 Rate Limiting (P1)

| Task | Description | Effort |
|------|-------------|--------|
| API rate limiting | Per-user limits on API routes (upstash/ratelimit or custom) | Medium |
| AI endpoint limits | Stricter limits on `/api/ai` (cost control) | Small |
| Auth endpoint limits | Brute-force protection on login/register | Small |

### 5.3 Audit Logging (P2)

| Task | Description | Effort |
|------|-------------|--------|
| Audit log table | Create `audit_logs` table for compliance | Small |
| Log mutations | Record all data changes with user, timestamp, action | Medium |
| Log viewer UI | Admin page to browse audit logs | Medium |
| Export audit logs | CSV/JSON export for compliance reporting | Small |

---

## 6. Infrastructure Gaps

### 6.1 CI/CD Pipeline (P1)

| Task | Description | Effort |
|------|-------------|--------|
| GitHub Actions workflow | Lint → Typecheck → Test → Build on PR | Medium |
| Branch protection | Require passing checks before merge | Small |
| Preview deployments | Vercel preview for each PR | Small (Vercel default) |
| Database migrations CI | Automated migration validation | Medium |

### 6.2 Monitoring & Observability (P2)

| Task | Description | Effort |
|------|-------------|--------|
| Error tracking | Sentry integration for runtime errors | Medium |
| Performance monitoring | Vercel Analytics or custom Web Vitals | Small |
| API monitoring | Request logging, latency tracking | Medium |
| Uptime monitoring | External health check endpoint | Small |

### 6.3 Environment Management (P2)

| Task | Description | Effort |
|------|-------------|--------|
| Staging environment | Separate Supabase project for staging | Medium |
| Database seeding script | Automated seed data for dev/staging | Medium |
| Migration runner | CLI tool or script for applying migrations in order | Medium |

---

## 7. Documentation Gaps

### 7.1 Developer Documentation (P1)

| Document | Description | Status |
|----------|-------------|--------|
| SETUP_MANUAL.md | Setup and implementation guide | Done |
| CLAUDE.md | Development instructions | Done |
| API documentation | OpenAPI spec or route documentation | Not started |
| Component storybook | Visual component documentation | Not started |
| Architecture decision records | ADRs for key decisions | Not started |

### 7.2 User Documentation (P2)

| Document | Description | Status |
|----------|-------------|--------|
| User guide | End-user walkthrough of all features | Not started |
| Admin guide | Organization setup and management | Not started |
| FAQ | Common questions and answers | Not started |
| Video tutorials | Screen recordings of key workflows | Not started |

---

## Priority Roadmap

### Sprint 1 (P0 - Critical Path)

1. Wire auth pages to Supabase Auth (login, register, forgot password)
2. Wire Dashboard and Project Overview to real data
3. Wire Assessment Questionnaire + Readiness to real data
4. Add Zod validation on all API route inputs
5. Expand unit tests to 100+

### Sprint 2 (P1 - MVP Features)

1. Wire remaining 20 pages to TanStack Query hooks
2. Build PDF rendering pipeline with @react-pdf/renderer
3. Build DOCX rendering pipeline with docx-js
4. Wire Gantt chart to real data with basic drag-and-drop
5. Add Recharts radar chart to Readiness dashboard
6. Set up GitHub Actions CI pipeline
7. Add API rate limiting

### Sprint 3 (P1 - Quality)

1. Component tests for all UI and feature components (85+ tests)
2. Integration tests for API routes (40+ tests)
3. Supabase generated types for full type safety
4. Eliminate all `any` types
5. Form validation with React Hook Form + Zod on all forms

### Sprint 4 (P2 - Enhanced Features)

1. AI integration with prompt templates
2. Rich text policy editor (Tiptap)
3. Real-time Supabase subscriptions for timeline
4. File upload and storage
5. Dashboard analytics
6. Audit logging

### Sprint 5 (P2 - Polish)

1. Policy version diff view
2. Command palette (Cmd+K)
3. Sentry error tracking
4. Staging environment setup
5. User documentation

### Sprint 6 (P3 - Advanced)

1. E2E tests with Playwright
2. Advanced Gantt features (critical path, zoom levels)
3. Billing integration (Stripe)
4. Video tutorials
5. Performance optimization

---

## Metrics

### Current State

| Metric | Value |
|--------|-------|
| Source files | ~170 |
| Test files | 4 |
| Passing tests | 61 |
| Test coverage | Scoring, ROI, Config, Utils only |
| API routes | 18 |
| Database tables | 30+ |
| RLS policies | All tables covered |
| Pages with real data | 3 (ROI, RACI, Meetings — self-contained) |
| Pages with demo data | 27 |
| TypeScript errors | 0 (strict mode) |

### Target State (Post-Sprint 3)

| Metric | Target |
|--------|--------|
| Source files | ~200 |
| Test files | 20+ |
| Passing tests | 275+ |
| Test coverage | >80% on business logic |
| Pages with real data | 30 (all pages) |
| PDF/DOCX generation | 5 report types fully rendered |
| CI pipeline | Automated lint + test + build |

---

## Notes

- The backend architecture (migrations, data layer, API routes, hooks, actions) is
  complete and follows best practices. The primary remaining work is **wiring** the
  existing frontend pages to use the real data layer instead of hardcoded demo data.
- The three new features (ROI, RACI, Meetings) were built with real data patterns
  from the start — they can serve as reference implementations for wiring the other pages.
- Document generation has a clean two-phase architecture: content generators produce
  structured data, and renderers (PDF/DOCX) consume that data. Only the renderer
  layer needs to be built.
- All database tables have Row Level Security policies scoped to `organization_id`,
  ensuring multi-tenant data isolation from day one.
