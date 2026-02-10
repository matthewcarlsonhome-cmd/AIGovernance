# GovAI Studio - Setup and Implementation Manual

> **Version:** 2.1
> **Date:** February 9, 2026
> **Application:** GovAI Studio v0.1.0
> **Framework:** Next.js 16 (App Router) with TypeScript

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Supabase Setup](#3-supabase-setup)
4. [Environment Variables](#4-environment-variables)
5. [Running the Application](#5-running-the-application)
6. [First-Time Admin Setup](#6-first-time-admin-setup)
7. [Application Structure](#7-application-structure)
8. [Deployment to Vercel](#8-deployment-to-vercel)
9. [Troubleshooting](#9-troubleshooting)
10. [Testing](#10-testing)

---

## 1. Prerequisites

Before setting up GovAI Studio, ensure you have the following installed and available.

### Required

| Tool | Minimum Version | Verify Command | Notes |
|------|----------------|----------------|-------|
| **Node.js** | 20.0+ | `node --version` | LTS recommended. Download from [nodejs.org](https://nodejs.org) |
| **npm** | 10.0+ | `npm --version` | Bundled with Node.js 20+. Alternatively, use **pnpm** (`npm install -g pnpm`) |
| **Git** | 2.30+ | `git --version` | Required for cloning and version control |
| **Supabase Account** | Free tier works | [supabase.com](https://supabase.com) | Used for PostgreSQL database, authentication, and file storage |

### Optional

| Tool | Purpose | Notes |
|------|---------|-------|
| **pnpm** | Alternative package manager (faster installs) | `npm install -g pnpm`, then use `pnpm install` instead of `npm install` |
| **Anthropic API Key** | AI-assisted report generation, policy drafting | Obtain from [console.anthropic.com](https://console.anthropic.com). The application functions without it; AI features will be unavailable. |
| **Vercel Account** | Production deployment | Free tier available at [vercel.com](https://vercel.com) |
| **Supabase CLI** | Local database development and migration management | `npm install -g supabase` |

### System Requirements

- **OS:** macOS, Linux, or Windows (WSL2 recommended on Windows)
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk:** 500 MB free space for project dependencies

---

## 2. Quick Start

Get GovAI Studio running locally in 5 steps:

```bash
# Step 1: Clone the repository
git clone <repository-url> govai-studio
cd govai-studio

# Step 2: Install dependencies
npm install

# Step 3: Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials (see Section 4)

# Step 4: Run database migrations on Supabase
# Execute each SQL file in order via the Supabase SQL Editor:
#   supabase/migrations/001_organizations_users.sql
#   supabase/migrations/002_projects.sql
#   ... through 011_seed_data.sql
# (See Section 3 for detailed instructions)

# Step 5: Start the development server
npm run dev
```

The application will be available at **http://localhost:3000**.

---

## 3. Supabase Setup

GovAI Studio uses Supabase (PostgreSQL) for its database, authentication, and file storage. Follow these steps to configure your Supabase project.

### 3.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New Project**.
3. Choose your organization (or create one).
4. Fill in the project details:
   - **Project name:** `govai-studio` (or your preferred name)
   - **Database password:** Choose a strong password and store it securely.
   - **Region:** Select the region closest to your users.
5. Click **Create new project** and wait for provisioning (approximately 1-2 minutes).

### 3.2 Get Your API Credentials

1. In your Supabase dashboard, navigate to **Settings > API**.
2. Copy these three values (you will need them for your `.env.local` file):
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon / public** key (safe for client-side use)
   - **service_role** key (server-side only -- this key bypasses Row Level Security, so keep it secret)

### 3.3 Run Database Migrations

The database schema is defined across 11 SQL migration files in `supabase/migrations/`. They must be executed in numerical order, as later files depend on tables created by earlier ones.

**Option A: Supabase SQL Editor (recommended for first setup)**

1. In your Supabase dashboard, go to **SQL Editor**.
2. For each migration file listed below, paste the full SQL content into the editor and click **Run**. Verify each succeeds before proceeding to the next.

| Order | File | Description |
|-------|------|-------------|
| 1 | `001_organizations_users.sql` | Organizations and users tables with role assignments |
| 2 | `002_projects.sql` | Projects table with organization foreign key, team members |
| 3 | `003_assessments.sql` | Assessment templates, questions, responses, feasibility scores |
| 4 | `004_governance.sql` | Policies, compliance mappings, risk classifications, gate reviews |
| 5 | `005_sandbox.sql` | Sandbox configs, generated config files, environment validations |
| 6 | `006_poc.sql` | PoC projects, sprints, metrics, tool evaluations |
| 7 | `007_timeline.sql` | Milestones, task dependencies, workflow phases, snapshots |
| 8 | `008_reports.sql` | Report templates and generated report history |
| 9 | `009_meetings_raci.sql` | Meetings, action items, RACI matrices, ROI calculations |
| 10 | `010_rls_policies.sql` | Row Level Security policies for all tables (multi-tenant isolation) |
| 11 | `011_seed_data.sql` | Seed data: assessment templates, default questions, framework data |

**Option B: Supabase CLI (for advanced users)**

```bash
# Install the Supabase CLI if you have not already
npm install -g supabase

# Link to your remote project
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

### 3.4 Configure Authentication

1. In the Supabase dashboard, go to **Authentication > Providers**.
2. Ensure the **Email** provider is enabled (it is enabled by default).
3. Navigate to **Authentication > URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` for development (update to your production URL later).
   - Add the following to **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com/auth/callback` (add when deploying)
4. Optional: Customize email templates under **Authentication > Email Templates** to match your organization branding.

### 3.5 Create a Storage Bucket (Optional)

If you plan to generate and store PDF/DOCX reports:

1. Go to **Storage** in the Supabase dashboard.
2. Click **New bucket**.
3. Name it `reports`.
4. Set access to **Private** (files will be accessed through authenticated API routes only).
5. Optionally create a second bucket named `documents` for client document uploads.

---

## 4. Environment Variables

GovAI Studio requires environment variables for Supabase connectivity and optionally for AI features. All variables are validated at startup using Zod (defined in `src/lib/env.ts`).

### Setup

```bash
cp .env.local.example .env.local
```

Then open `.env.local` in your editor and fill in the values.

### Variable Reference

| Variable | Required | Exposed to Client | Description |
|----------|----------|-------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Your Supabase project URL (e.g., `https://abc.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anon/public key for client-side authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | No | **NO -- Never expose** | Service role key for server-side admin operations. Bypasses RLS. |
| `ANTHROPIC_API_KEY` | No | **NO -- Never expose** | Anthropic API key for AI-assisted features (report narratives, policy drafting). Obtain from [console.anthropic.com](https://console.anthropic.com). |
| `NEXT_PUBLIC_APP_URL` | No | Yes | Application base URL. Defaults to `http://localhost:3000` if not set. |

### Example `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Anthropic API (for AI-assisted features)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Security Rules

- **NEVER** commit `.env.local` to version control. It is listed in `.gitignore`.
- **NEVER** prefix secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) with `NEXT_PUBLIC_`. Doing so would expose them to the browser.
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security -- it must only be used in server-side code (API routes and server actions).
- If required variables are missing or malformed, the application will throw a descriptive error at startup with details about which variables failed validation.

---

## 5. Running the Application

### Development

```bash
npm run dev
```

- Starts the Next.js development server on **http://localhost:3000**
- Uses Turbopack for fast hot module reloading
- Source file changes are reflected immediately in the browser

### Production Build

```bash
npm run build
```

- Compiles and optimizes the application for production
- Runs TypeScript type checking as part of the build
- Outputs optimized bundles to the `.next/` directory

### Production Server

```bash
npm start
```

- Serves the compiled production build on port 3000
- Requires `npm run build` to have completed successfully first

### Type Checking

```bash
npm run typecheck
```

- Runs the TypeScript compiler in check-only mode (`tsc --noEmit`)
- Faster than a full build for catching type errors during development

### Linting

```bash
npm run lint
```

- Runs ESLint with the Next.js configuration
- Reports code quality issues and potential bugs

### Complete Script Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint checks |
| `npm test` | Run full test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode (re-runs on file changes) |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run typecheck` | TypeScript type check without emitting files |

---

## 6. First-Time Admin Setup

After deploying the application and running all database migrations, follow these steps to configure your first organization and project.

### Step 1: Register the First User

1. Navigate to `http://localhost:3000/register`.
2. Create an account with your email and password.
3. The first user registered is automatically assigned the **admin** role.
4. If Supabase email confirmation is enabled, confirm your email before proceeding.

### Step 2: Create Your Organization

1. After logging in, you will be directed to the dashboard.
2. Navigate to **Settings** in the sidebar.
3. Fill in your organization details: name, industry, and size.
4. Save the organization profile.

### Step 3: Create Your First Project

1. From the dashboard home page, click **New Project**.
2. Complete the 3-step project creation wizard:
   - **Step 1:** Project name, client organization name, description
   - **Step 2:** Select target AI tools for evaluation (Claude Code, OpenAI Codex, etc.)
   - **Step 3:** Set project timeline and team size
3. Click **Create Project** to finalize.

### Step 4: Navigate the 6-Phase Workflow

Each project follows a structured 6-phase AI governance implementation workflow. Work through them in order:

1. **Discovery** -- Conduct the readiness assessment questionnaire (30 questions across 5 domains), review feasibility scores on the readiness dashboard, and track prerequisite completion with the checklist.
2. **Governance** -- Define Acceptable Use Policies (AUP), configure the 3-gate review pipeline, map controls to compliance frameworks (SOC 2, HIPAA, NIST, GDPR), classify risks using the 5x5 heat map, and build the RACI matrix.
3. **Sandbox** -- Configure sandbox infrastructure through the 4-step wizard, generate config files (JSON, TOML, YAML, HCL), and run environment health validation checks.
4. **PoC (Proof of Concept)** -- Define PoC projects with selection scoring, run sprint evaluations, compare AI tools side-by-side, and capture baseline vs. AI-assisted metrics.
5. **Timeline** -- Build and manage the implementation timeline with the Gantt chart, define milestones, and create baseline snapshots for variance tracking.
6. **Reports** -- Generate persona-specific reports (Executive PDF, Legal DOCX, IT/Security PDF, Engineering PDF, Marketing DOCX) and review report history.

### Step 5: Invite Team Members

1. Navigate to the **Team** page within your project.
2. Add team members by email with their assigned roles:

| Role | Access Level |
|------|-------------|
| `admin` | Full access to all features, settings, and team management |
| `consultant` | Project management, report generation, all project phases |
| `executive` | Read-only access to dashboards, reports, and project overview |
| `it` | Sandbox configuration, security settings, validation |
| `legal` | Policy review, compliance mapping, gate review participation |
| `engineering` | PoC execution, metrics tracking, tool comparison |
| `marketing` | Messaging guides, change management narratives, FAQ |

---

## 7. Application Structure

### 7.1 The Six Project Phases

GovAI Studio guides organizations through a structured AI governance implementation across six phases:

| Phase | Pages | Purpose |
|-------|-------|---------|
| **Discovery** | Questionnaire, Readiness Dashboard, Prerequisites | Assess organizational readiness across 5 domains: Infrastructure (25% weight), Security (25%), Governance (20%), Engineering (15%), Business (15%) |
| **Governance** | Policies, Gate Reviews, Compliance, Risk, RACI Matrix | Establish governance artifacts including AUP, incident response plans, compliance framework mappings, risk classifications, and a 3-gate approval pipeline |
| **Sandbox** | Configure, Config Files, Validate | Set up isolated AI coding environments with auto-generated config files and 6-point health validation |
| **PoC** | Projects, Sprints, Compare, Metrics | Run proof-of-concept evaluations comparing AI coding tools with sprint-level metric tracking and selection scoring |
| **Timeline** | Gantt Chart, Milestones, Snapshots | Plan and track implementation with interactive Gantt charts, milestone tracking, and baseline schedule comparisons |
| **Reports** | Generate, History | Produce stakeholder-specific reports in PDF and DOCX formats with persona-tailored content |

### 7.2 New Features (This Development Cycle)

| Feature | Route | Description |
|---------|-------|-------------|
| **ROI Calculator** | `/projects/[id]/roi` | Data-driven cost-benefit analysis with configurable inputs (team size, salaries, velocity lift, license costs). Outputs monthly savings, annual savings, payback period, and 3-year NPV. Includes sensitivity analysis for variable assumptions. |
| **RACI Matrix** | `/projects/[id]/governance/raci` | Responsibility assignment matrix editor. Rows are tasks/deliverables, columns are team members. Values: Responsible, Accountable, Consulted, Informed. Includes validation (one Accountable per task). |
| **Meeting Tracker** | `/projects/[id]/meetings` | Meeting log with date, attendees, notes, and action items. Action item status tracking (open/in-progress/complete). Meeting summary generation for distribution. |

### 7.3 API Routes

The backend exposes 18 API route endpoints organized by feature domain. All routes require authentication (enforced by `middleware.ts`) and return typed JSON responses with a consistent shape: `{ data }` on success or `{ error, message }` on failure.

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/projects` | GET, POST | List all projects for the organization, create new projects |
| `/api/projects/[id]` | GET, PUT, DELETE | Read, update, or soft-delete a single project |
| `/api/assessments` | GET, POST | List assessment responses, submit new responses |
| `/api/assessments/[id]` | GET, PUT, DELETE | Manage a single assessment response |
| `/api/assessments/score` | POST | Run the feasibility scoring engine on submitted responses |
| `/api/configs` | POST | Generate sandbox configuration files |
| `/api/configs/[id]` | GET, PUT, DELETE | Manage a single config set |
| `/api/reports` | GET, POST | List report history, trigger report generation |
| `/api/reports/[id]` | GET, DELETE | Retrieve or delete a generated report |
| `/api/export/pdf` | POST | Generate and return a PDF document |
| `/api/export/docx` | POST | Generate and return a DOCX document |
| `/api/ai` | POST | Claude AI integration for assisted content generation (requires `ANTHROPIC_API_KEY`) |
| `/api/meetings` | GET, POST | List and create meetings |
| `/api/meetings/[id]` | GET, PUT, DELETE | Manage a single meeting |
| `/api/meetings/[id]/actions` | GET, POST | Manage action items for a meeting |
| `/api/raci` | GET, POST | List and create RACI matrix entries |
| `/api/raci/[id]` | GET, PUT, DELETE | Manage a single RACI entry |
| `/api/roi` | POST | Run ROI calculation with provided inputs |

### 7.4 Report Generation Capabilities

GovAI Studio includes content generators for 5 report types, each tailored to a specific stakeholder persona:

| Report | Format | Target Audience | Key Content |
|--------|--------|-----------------|-------------|
| **Readiness Assessment** | PDF | CISO, CTO, Sponsors | Domain scores, pass/fail per domain, top recommendations, remediation timeline |
| **Executive Briefing** | PDF | C-Suite | Feasibility score summary, domain gaps, risk heat map, go/no-go recommendation |
| **Legal Report** | DOCX | Legal, Compliance | Contract analysis, compliance framework mapping, AUP review, risk register |
| **Engagement Proposal** | DOCX | Clients, Sponsors | Scope of work, deliverables, timeline, team requirements, investment |
| **Meeting Summary** | DOCX | All Stakeholders | Attendees, agenda, discussion notes, decisions, action items with owners |

### 7.5 Technology Stack

| Library | Version | Usage in GovAI Studio |
|---------|---------|----------------------|
| Next.js | 16.1.6 | App Router, Server Components, API routes, middleware |
| React | 19.2.3 | UI rendering with Server and Client Components |
| TypeScript | 5.x | Strict-mode type safety across the entire codebase |
| Tailwind CSS | 4.x | Utility-first styling with CSS variable theme system |
| Supabase JS | 2.95.3 | Database queries, authentication, real-time subscriptions, storage |
| @supabase/ssr | 0.8.0 | Server-side Supabase client for App Router and middleware |
| TanStack Query | 5.90.20 | Server state caching, background refetch, optimistic updates |
| Zustand | 5.0.11 | Client-side state management (UI state, form state) |
| Recharts | 3.7.0 | Data visualization: bar charts, radar charts, pie charts |
| @dnd-kit/core | 6.3.1 | Drag-and-drop framework for Gantt chart interactions |
| @dnd-kit/sortable | 10.0.0 | Sortable list primitives for task reordering |
| Zod | 4.3.6 | Schema validation for forms, API inputs, and environment variables |
| React Hook Form | 7.71.1 | Form state management with controlled/uncontrolled inputs |
| Lucide React | 0.563.0 | Icon library (700+ icons) |
| date-fns | 4.1.0 | Date arithmetic and formatting |
| class-variance-authority | 0.7.1 | Component variant management for shadcn-style UI components |
| Vitest | 4.0.18 | Testing framework with jsdom environment |
| Testing Library | 16.3.2 | React component testing utilities |

---

## 8. Deployment to Vercel

GovAI Studio is built for deployment on Vercel with zero additional configuration.

### Step 1: Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New Project**.
3. Import your GitHub (or GitLab/Bitbucket) repository.
4. Vercel will auto-detect the Next.js framework preset.

### Step 2: Set Environment Variables

In the Vercel project settings (**Settings > Environment Variables**), add all five variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-your-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

Mark `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` as **Sensitive** so they are not visible in logs or the Vercel dashboard after creation.

### Step 3: Verify Build Settings

Vercel should auto-detect these settings, but confirm they are correct:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 4: Update Supabase Redirect URLs

1. In the Supabase dashboard, go to **Authentication > URL Configuration**.
2. Add your Vercel deployment URL to **Redirect URLs**:
   - `https://your-domain.vercel.app/auth/callback`
3. Update the **Site URL** to your Vercel domain.

### Step 5: Deploy

1. Click **Deploy** in the Vercel dashboard.
2. Subsequent pushes to the `main` branch will trigger automatic deployments.
3. Pull request branches receive automatic preview deployments with unique URLs.

### Custom Domain (Optional)

1. In Vercel, go to **Settings > Domains**.
2. Add your custom domain and follow the DNS configuration instructions.
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain.
4. Add the custom domain to Supabase redirect URLs.

---

## 9. Troubleshooting

### Database Connection Errors

**Symptom:** `Error: Invalid environment variables. Check .env.local`

- Verify `.env.local` exists in the project root directory.
- Confirm `NEXT_PUBLIC_SUPABASE_URL` is a valid URL starting with `https://`.
- Confirm `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not empty.
- Restart the dev server after making any changes to environment variables.

**Symptom:** `relation "organizations" does not exist`

- One or more migration files have not been executed. Run all 11 migration files in order (001 through 011) in the Supabase SQL Editor.
- Verify the migrations ran against the correct database by checking the project reference in the Supabase dashboard URL.

**Symptom:** `permission denied for table ...`

- Row Level Security policies may not have been applied. Run `010_rls_policies.sql`.
- Verify your user has the correct role and `organization_id` in the `users` table.
- Check that the user's organization matches the project's `organization_id`.

### Authentication Redirect Issues

**Symptom:** Login redirects to a blank page or causes an infinite redirect loop

- Verify the **Site URL** in Supabase Authentication settings matches your application URL exactly (including protocol).
- Verify `http://localhost:3000/auth/callback` (or your production equivalent) is listed in the **Redirect URLs** in Supabase.
- Clear browser cookies and local storage, then attempt login again.

**Symptom:** All pages redirect to `/login` even after signing in

- The authentication middleware (`src/middleware.ts`) checks for a valid Supabase session. Ensure cookies are not being blocked by browser extensions or privacy settings.
- Check the browser developer console for Supabase auth errors.

### "Unauthorized" API Responses

- Ensure you are logged in with a valid session cookie.
- The middleware returns a 401 for all unauthenticated API route requests.
- Verify the user's record exists in the `users` table with the correct `organization_id`.
- Check that RLS policies allow access for your user's organization by reviewing `010_rls_policies.sql`.

### Build Errors

**Symptom:** `Failed to fetch 'Geist' from Google Fonts`

- This project uses system fonts and does not import Google Fonts. If you see this error, verify that `src/app/layout.tsx` does not import from `next/font/google`. The font stack is defined in `globals.css` using system fonts.

**Symptom:** TypeScript compilation errors during `npm run build`

- Run `npm run typecheck` for detailed TypeScript error messages with file locations.
- Ensure you are using Node.js 20 or later.
- Delete and reinstall dependencies: `rm -rf node_modules && npm install`.

**Symptom:** Tailwind CSS classes are not applying styles

- This project uses Tailwind CSS 4, which uses `@import "tailwindcss"` instead of the v3 `@tailwind base; @tailwind components; @tailwind utilities;` directives.
- Verify `postcss.config.mjs` includes the `@tailwindcss/postcss` plugin.
- Verify `src/app/globals.css` contains the `@theme inline { }` block that maps CSS variables to Tailwind color utilities.

### Port Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

```bash
# Find and kill the process occupying port 3000
lsof -ti:3000 | xargs kill -9

# Alternatively, start the dev server on a different port
npm run dev -- --port 3001
```

### Missing Data After Login

- Run the seed migration (`011_seed_data.sql`) to populate default assessment templates, questions, and compliance framework data.
- Verify your user record exists in the `users` table with a valid `organization_id`.
- Confirm the `organization_id` on your user matches the `organization_id` on the projects you are trying to access.

---

## 10. Testing

GovAI Studio uses [Vitest](https://vitest.dev/) as its testing framework with jsdom for browser API simulation.

### Running Tests

```bash
# Run the full test suite
npm test

# Run tests in watch mode (re-runs automatically on file changes)
npm run test:watch

# Run tests with V8 coverage report
npm run test:coverage

# Run TypeScript type checking (complements test suite)
npm run typecheck
```

### Current Test Suite

The test suite includes **61 passing tests** across 4 test files:

| Test File | Test Count | Description |
|-----------|-----------|-------------|
| `__tests__/unit/scoring-engine.test.ts` | 17 | Feasibility scoring engine: domain score calculation, weighted aggregation, rating thresholds, recommendation generation |
| `__tests__/unit/roi-calculator.test.ts` | 22 | ROI calculator: monthly/annual savings, payback period, 3-year NPV, sensitivity analysis, edge cases |
| `__tests__/unit/config-generator.test.ts` | 15 | Sandbox config generation: JSON, TOML, YAML, HCL output across all cloud providers and sandbox models |
| `__tests__/unit/utils.test.ts` | 7 | Shared utilities: `cn()` class merging, formatting functions, helper utilities |

### Test Directory Structure

```
__tests__/
  unit/                   # Pure function unit tests (no DOM rendering, no React)
    scoring-engine.test.ts
    roi-calculator.test.ts
    config-generator.test.ts
    utils.test.ts
  integration/            # API route and database integration tests (planned)
  components/             # React component tests with Testing Library (planned)
```

### Test Configuration

Tests are configured in `vitest.config.ts` with these settings:

- **Environment:** jsdom (provides browser-like DOM APIs)
- **Globals:** Enabled (`describe`, `it`, `expect` available without explicit imports)
- **Setup file:** `src/test/setup.ts` (loads Testing Library jest-dom matchers)
- **Path aliases:** `@/` resolves to `src/`
- **File patterns:** `__tests__/**/*.test.{ts,tsx}` and `src/**/*.test.{ts,tsx}`
- **Coverage provider:** V8
- **Coverage includes:** `src/lib/**/*.ts`, `src/components/**/*.tsx`
- **Coverage excludes:** `src/test/**`, `src/types/**`

### Writing New Tests

Example of a unit test following project conventions:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateScore } from '@/lib/scoring/engine';

describe('calculateScore', () => {
  it('returns zero scores for empty response set', () => {
    const result = calculateScore([]);
    expect(result.overall_score).toBe(0);
  });

  it('applies correct domain weights to aggregate score', () => {
    const responses = [
      { domain: 'infrastructure', questionId: 'q1', value: 5 },
      { domain: 'security', questionId: 'q2', value: 4 },
    ];
    const result = calculateScore(responses);
    expect(result.domain_scores.infrastructure).toBeGreaterThan(0);
    expect(result.overall_score).toBeGreaterThan(0);
    expect(result.rating).toBeDefined();
  });
});
```

### Coverage Expectations

- **Required coverage:** Unit tests for all pure utility functions, the scoring engine, the ROI calculator, and config file generators.
- **Recommended:** Component tests for interactive features using `@testing-library/react` (forms, wizards, data tables).
- **Planned:** Integration tests with MSW (Mock Service Worker) for API route mocking, and end-to-end tests for critical user workflows.

---

## Appendix: Project File Summary

| Category | Count |
|----------|-------|
| Total source files (`.ts` + `.tsx`) | ~150 |
| Dashboard pages | 27 |
| Auth pages | 3 (login, register, forgot-password) |
| UI components (shadcn-style) | 23 |
| API route files | 18 |
| Database migration files | 11 |
| Data access modules (`lib/db/`) | 10 |
| TanStack Query hooks (`hooks/`) | 10 |
| Server action modules (`lib/actions/`) | 5 |
| Report content generators (`lib/report-gen/`) | 5 |
| Error boundary files (`error.tsx`) | 15 |
| Loading state files (`loading.tsx`) | 15 |
| Zustand stores (`stores/`) | 2 |
| Test files | 4 (61 passing tests) |

## Architecture Overview

```
Browser (React 19)
    |
    +-- Pages (30 routes)
    |   +-- (auth) --- Login, Register, Forgot Password
    |   +-- (dashboard) --- 27 project management pages
    |
    +-- TanStack Query Hooks (10 modules)
    |   +-- Fetch from API routes with caching
    |
    +-- API Routes (/api/*)
    |   +-- Auth enforcement (middleware.ts)
    |   +-- Data access layer (lib/db/*)
    |   +-- Server actions (lib/actions/*)
    |   +-- Scoring engine (lib/scoring/*)
    |   +-- Config generators (lib/config-gen/*)
    |   +-- Report generators (lib/report-gen/*)
    |
    +-- Supabase
        +-- PostgreSQL (30+ tables with RLS)
        +-- Auth (email/password)
        +-- Storage (report files)
```
