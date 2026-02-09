# CLAUDE.md - GovAI Studio Development Instructions

## Project Overview
GovAI Studio is a Next.js 15 (App Router) web application for AI governance
and enterprise implementation management. It guides organizations from initial
assessment through sandbox setup, pilot execution, and production deployment
of AI coding agents (Claude Code, OpenAI Codex, and similar tools).

## Technology Stack (DO NOT CHANGE)
- **Framework:** Next.js 15 (App Router, Server Components)
- **Language:** TypeScript (strict mode)
- **UI:** shadcn/ui components + Tailwind CSS 4
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth with RBAC custom claims
- **State:** Zustand (client) + TanStack Query (server)
- **Charts:** Recharts
- **DnD:** @dnd-kit/core + @dnd-kit/sortable
- **PDF:** @react-pdf/renderer
- **DOCX:** docx (docx-js)
- **Dates:** date-fns
- **Validation:** Zod
- **Deployment:** Vercel

## Architecture Rules
1. Use Server Components by default. Add `'use client'` only when needed for interactivity.
2. All database access through Supabase client (server-side) or API routes. Never query from client components directly.
3. Every table has RLS policies. Never bypass RLS. Never use service_role key in client code.
4. Use Zod for all form validation and API input validation.
5. Error handling: use `error.tsx` boundaries per route segment.
6. Loading states: use `loading.tsx` per route segment.
7. All API routes in `app/api/` return typed JSON responses with consistent error shape.
8. Prefer server actions for mutations over API routes when possible.

## File Organization
```
src/
  app/                    # Next.js App Router pages and layouts
    (auth)/               # Public auth routes (login, register, forgot-password)
    (dashboard)/          # Protected dashboard routes
      layout.tsx          # Sidebar nav, role-based menu rendering
      page.tsx            # Dashboard home (project overview cards)
      projects/
        new/              # New project wizard
        [id]/
          overview/       # Project summary, health score, status
          discovery/
            questionnaire/# Guided assessment questionnaire
            readiness/    # Readiness Assessment dashboard (radar chart)
            prerequisites/# Checklist tracker with assignments
          governance/
            policies/     # Policy editor (AUP, IRP, data classification)
            gates/        # Three-gate review board
            compliance/   # Compliance framework mapping
            risk/         # Risk classification manager
          sandbox/
            configure/    # Infrastructure questionnaire + config generator
            files/        # Generated config file viewer/editor
            validate/     # Sandbox health check results
          poc/
            projects/     # PoC definition and selection scoring
            sprints/      # Sprint evaluation tracker
            compare/      # Tool comparison dashboard (Claude Code vs Codex)
            metrics/      # Baseline vs. AI-assisted metrics
          timeline/
            gantt/        # Interactive Gantt chart (drag/drop)
            milestones/   # Milestone tracker
            snapshots/    # Schedule baseline comparisons
          reports/
            generate/     # Report builder (select persona + sections)
            history/      # Previously generated reports
          team/           # Team member management + roles
      settings/           # Org settings, billing, integrations
    api/
      assessments/        # Assessment CRUD + scoring engine
      reports/            # Report generation endpoints
      configs/            # Sandbox config generation
      ai/                 # Claude API integration endpoints
      export/             # DOCX/PDF export endpoints
  components/
    ui/                   # shadcn/ui base components (DO NOT EDIT directly)
    shared/               # Shared components used across features
    features/             # Feature-specific components
      assessment/         # Questionnaire wizard, scoring views, readiness
      governance/         # Policy editor, gate reviews, compliance mapper
      sandbox/            # Config generator, file viewer, validation
      timeline/           # Gantt chart, milestones, task management
      reports/            # Report builder, persona-specific views
      poc/                # PoC tracking, sprint eval, tool comparison
  lib/
    supabase/             # Supabase client, server client, generated types
    scoring/              # Feasibility scoring engine
    config-gen/           # Sandbox config file generators (JSON, TOML, YAML, HCL)
    report-gen/           # Report generation logic (PDF + DOCX)
    ai/                   # Claude API integration + prompt templates
    utils/                # Shared utilities
  types/                  # TypeScript type definitions
  stores/                 # Zustand stores
  hooks/                  # Custom React hooks
```

## Database Schema - Core Tables

### Multi-tenant Foundation
```sql
-- organizations: Multi-tenant root entity
-- projects: Governance engagement projects per org
-- users: All users with role assignments (admin, consultant, executive, it, legal, engineering, marketing)
-- team_members: Project-scoped team assignments with roles
```

### Assessment Engine
```sql
-- assessment_templates: Configurable questionnaire templates
-- assessment_questions: Questions with type, weight, scoring, branching rules
-- assessment_responses: User responses per project
-- feasibility_scores: Computed scores per domain (infrastructure, security, governance, engineering, business)
```

### Governance Artifacts
```sql
-- policies: AUP, IRP addendum, data classification documents
-- policy_versions: Version history with diffs
-- compliance_mappings: Control-to-framework mappings (SOC2, HIPAA, NIST, GDPR)
-- risk_classifications: Risk tier definitions
-- gate_reviews: Three-gate approval records with evidence checklists
```

### Implementation Tracking
```sql
-- workflow_templates: Reusable implementation workflow definitions
-- workflow_phases: Phase definitions within a workflow
-- workflow_tasks: Individual tasks with dependencies, durations, assignments
-- task_assignments: Who owns each task
-- task_status_history: Status changes with timestamps for audit trail
```

### Sandbox Configuration
```sql
-- sandbox_configs: Infrastructure config per project (cloud provider, model, settings)
-- config_files: Generated config files (managed-settings.json, requirements.toml, etc.)
-- environment_validations: Sandbox health check results
```

### PoC Evaluation
```sql
-- poc_projects: Proof-of-concept definitions with selection scores
-- poc_sprints: Sprint evaluation windows
-- poc_metrics: Captured metrics per sprint (velocity, defect rate, satisfaction)
-- tool_evaluations: Claude Code vs Codex head-to-head data
```

### Timeline / PM
```sql
-- timeline_milestones: Major milestone definitions
-- timeline_dependencies: Task-to-task dependency links (FS, SS, FF, SF)
-- timeline_snapshots: Point-in-time schedule captures for baseline comparison
```

### Reporting
```sql
-- report_templates: Report format definitions per persona
-- generated_reports: Report generation history + file references in Supabase Storage
```

## Database Conventions
- Table names: snake_case, plural (e.g., `assessment_responses`)
- Column names: snake_case
- All tables include: `id` (uuid, default gen_random_uuid()), `created_at` (timestamptz), `updated_at` (timestamptz)
- Foreign keys: `[referenced_table_singular]_id` (e.g., `project_id`, `organization_id`)
- Soft deletes: `deleted_at` column (nullable timestamptz)
- Enums: stored as text with CHECK constraints, not Postgres enums (easier to migrate)
- Indexes: on all foreign keys and commonly filtered columns

## Coding Standards
- Named exports only (no default exports except page.tsx files)
- Functional components with explicit return types
- Use `satisfies` for type-safe object literals
- All user-facing strings should be extractable for future i18n
- Minimum test coverage: utility functions, scoring engine, config generators
- Use `cn()` utility (from shadcn) for conditional class merging
- Prefer early returns over deeply nested conditionals

## Security Rules
- NEVER store API keys in client-accessible code or environment variables prefixed with NEXT_PUBLIC_
- All AI API calls (Claude) go through server-side API routes ONLY
- Input sanitization on all user inputs (DOMPurify for any rich text rendering)
- Rate limiting on API routes
- CSP headers configured in next.config.js
- All file uploads validated for type and size server-side

## Component Patterns
- Forms: React Hook Form + Zod resolver + shadcn Form components
- Data tables: TanStack Table + shadcn DataTable pattern
- Modals: shadcn Dialog with controlled state
- Toast notifications: shadcn Sonner
- Command palette: shadcn Command (Cmd+K)

## Key Feature: Feasibility Scoring Engine
The scoring engine in `lib/scoring/` must:
1. Accept assessment responses as input
2. Calculate per-domain scores (0-100) across 5 domains with configurable weights
3. Apply weighted aggregate for overall score
4. Return score object with: domain_scores, overall_score, rating, recommendations[], remediation_tasks[]
5. Be pure functions with no side effects (testable)
6. Domain weights: Infrastructure 25%, Security 25%, Governance 20%, Engineering 15%, Business 15%

## Key Feature: Gantt Chart Component
The timeline in `components/features/timeline/` must:
1. Render tasks as horizontal bars on a time axis
2. Support drag-and-drop for date adjustment (@dnd-kit)
3. Draw SVG dependency arrows between connected tasks
4. Calculate and highlight critical path
5. Support zoom levels: Day, Week, Month, Quarter
6. Use Supabase real-time for live collaboration updates
7. Export to PDF, PNG, CSV

## Key Feature: Multi-Stakeholder Reports
Reports in `lib/report-gen/` generate persona-specific content:
- **Executive:** Feasibility score, ROI, risk heat map, go/no-go (PDF, 3-5 pages)
- **Legal:** Contract analysis, compliance mapping, AUP review (DOCX, editable)
- **IT/Security:** Sandbox architecture, network config, DLP rules (PDF + config files)
- **Engineering:** Tool comparison, metrics, setup guides (Markdown + PDF)
- **Marketing:** Messaging guide, FAQ, change management narrative (DOCX, editable)

## Current Sprint
[Update this section each sprint with current objectives]
