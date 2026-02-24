# GovAI Studio — Deployment & Database Guide

## Table of Contents
1. [Render Deployment](#1-render-deployment)
2. [Supabase Database Setup](#2-supabase-database-setup)
3. [Running Migrations](#3-running-migrations)
4. [Environment Variables](#4-environment-variables)
5. [Post-Deployment Verification](#5-post-deployment-verification)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Render Deployment

### Option A: Blueprint (Recommended)

A `render.yaml` is included in the repo root. Render reads this automatically.

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **New** > **Blueprint**
3. Connect your GitHub repo (`AIGovernance`)
4. Render detects `render.yaml` and provisions a **Web Service** named `govai-studio`
5. You'll be prompted to fill in environment variables (see [Section 4](#4-environment-variables))
6. Click **Apply** — Render builds and deploys

### Option B: Manual Setup

1. Go to **New** > **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `govai-studio` |
| **Region** | Oregon (or nearest) |
| **Runtime** | Node |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Starter ($7/mo) or higher |
| **Node Version** | 20 |

4. Under **Environment**, add the variables from [Section 4](#4-environment-variables)
5. Click **Create Web Service**

### Build Details

- **Build time**: ~2-4 minutes (Next.js SSR build)
- **Port**: Render auto-detects Next.js on port 3000 (no `PORT` env var needed)
- **Auto-deploy**: Enabled by default — pushes to `main` trigger a new deploy
- **Health check**: `GET /` returns 200

### Custom Domain

1. In your Render service dashboard, go to **Settings** > **Custom Domains**
2. Add your domain (e.g., `govai.yourcompany.com`)
3. Add the CNAME record Render provides to your DNS
4. Render provisions a TLS certificate automatically
5. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## 2. Supabase Database Setup

Your Supabase project provides PostgreSQL with Row-Level Security (RLS), Auth, and real-time subscriptions.

### If Starting Fresh

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**, choose a name and strong database password
3. Select a region close to your Render deployment (e.g., `us-west-1` for Oregon)
4. Wait for the project to provision (~2 minutes)
5. Run all migrations in order (see [Section 3](#3-running-migrations))

### If You Already Have the GovAI Database

You already have migrations 001-016 applied. You need to run the two new migrations:

- **017_risk_exceptions.sql** — Risk exception workflow table
- **018_project_state_machine.sql** — Wider project status values + notifications table

See [Section 3](#3-running-migrations) for how to apply them.

---

## 3. Running Migrations

All migration files are in `supabase/migrations/` and must be run **in order**.

### Migration Inventory

| # | File | Tables Created | New for You? |
|---|------|---------------|--------------|
| 001 | `001_organizations_users.sql` | organizations, users + `update_updated_at()` function | No |
| 002 | `002_projects.sql` | projects, team_members | No |
| 003 | `003_assessments.sql` | assessment_templates, assessment_questions, assessment_responses, feasibility_scores | No |
| 004 | `004_governance.sql` | policies, policy_versions, compliance_mappings, risk_classifications, gate_reviews | No |
| 005 | `005_sandbox.sql` | sandbox_configs, config_files | No |
| 006 | `006_poc.sql` | poc_projects, poc_sprints, poc_metrics, tool_evaluations | No |
| 007 | `007_timeline.sql` | timeline_tasks, timeline_dependencies, timeline_milestones, timeline_snapshots, task_status_history | No |
| 008 | `008_reports.sql` | report_templates, generated_reports | No |
| 009 | `009_meetings_raci.sql` | meeting_notes, action_items, raci_matrices, raci_entries, roi_calculations | No |
| 010 | `010_rls_policies.sql` | RLS policies for all tables + `auth_org_id()` function | No |
| 011 | `011_seed_data.sql` | Seed data (templates, demo questions) | No |
| 012 | `012_audit_log.sql` | audit_logs | No |
| 013 | `013_environment_validations.sql` | environment_validations | No |
| 014 | `014_data_governance.sql` | data_asset_records, data_processing_activities, governance_gates, pilot_setups | No |
| 015 | `015_security_evidence.sql` | control_checks, policy_rules, security_incidents, evidence_packages, audit_events | No |
| 016 | `016_rls_new_tables.sql` | RLS for tables from 014 & 015 | No |
| **017** | **`017_risk_exceptions.sql`** | **risk_exceptions** (exception workflow) | **Yes** |
| **018** | **`018_project_state_machine.sql`** | **Widens projects.status CHECK + notifications table** | **Yes** |

### How to Run Migrations

#### Option A: Supabase SQL Editor (Easiest)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open each migration file, copy the contents, paste into the editor
5. Click **Run**
6. Repeat for each migration **in numerical order**

**For your existing database, you only need to run migrations 017 and 018.**

#### Option B: Supabase CLI

```bash
# Install the Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

> **Note**: `supabase db push` runs all migrations that haven't been applied yet.
> It tracks which migrations have run in a `supabase_migrations.schema_migrations` table.

#### Option C: psql Direct Connection

```bash
# Find your connection string in Supabase: Settings > Database > Connection string
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f supabase/migrations/017_risk_exceptions.sql

psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f supabase/migrations/018_project_state_machine.sql
```

### What the New Migrations Do

#### 017: Risk Exceptions Table

Creates `risk_exceptions` — a workflow for granting time-bound exceptions to governance policies or security controls:

- **Fields**: title, justification, compensating_controls (JSONB array), requested_by, approved_by, expires_at, status
- **Statuses**: `requested` → `approved` / `denied` → `expired` / `revoked`
- **RLS**: Org-scoped. Any team member can request; admins/consultants can approve/deny
- **Indexes**: On project_id, status, expires_at (for expiry queries)

#### 018: Project State Machine + Notifications

1. **Widens `projects.status`** — Adds 7 state-machine values alongside the original 7:
   - Original: `discovery`, `governance`, `sandbox`, `pilot`, `evaluation`, `production`, `completed`
   - New: `draft`, `scoped`, `data_approved`, `security_approved`, `pilot_running`, `review_complete`, `decision_finalized`

   Both sets are valid. The app's state machine (`lib/state-machine/`) uses the new values.

2. **Creates `notifications`** — In-app notification center:
   - Targeted by `user_id` (direct) or `target_role` (broadcast to role)
   - Types: task_assigned, phase_transition, gate_decided, deadline_approaching, etc.
   - RLS: Users see their own + role-targeted + broadcast notifications

---

## 4. Environment Variables

Set these in the Render dashboard under your service's **Environment** tab.

| Variable | Where to Find | Example |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL | `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > `anon` `public` key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > `service_role` key | `eyJhbGci...` |
| `ANTHROPIC_API_KEY` | Anthropic Console > API Keys | `sk-ant-api03-...` |
| `NEXT_PUBLIC_APP_URL` | Your Render URL or custom domain | `https://govai-studio.onrender.com` |

### Security Notes

- `NEXT_PUBLIC_*` variables are embedded in the client-side JavaScript bundle. This is safe for Supabase URL and anon key (they're designed for public use with RLS).
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — it is **server-side only** and never exposed to the browser.
- `ANTHROPIC_API_KEY` is **server-side only** — all AI calls go through `/api/ai` server routes.
- In Render, all env vars are encrypted at rest. Mark sensitive values as **Secret** in the Render dashboard.

---

## 5. Post-Deployment Verification

After deploying to Render and running migrations, verify:

### Quick Checks

1. **App loads**: Visit your Render URL — you should see the Dashboard
2. **Demo mode works**: Without Supabase configured, pages show demo data. With Supabase configured, they query the database.
3. **No console errors**: Open browser DevTools > Console, check for connection errors

### Supabase Connection Test

1. Go to your deployed app
2. If auth is set up, try signing in
3. Check the browser Network tab — API calls to `/api/*` should return 200
4. If you see `{ error: "Not authenticated" }`, auth is working (you need to sign in)
5. If you see demo data on all pages, check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

### Database Verification

Run this in the Supabase SQL Editor to confirm all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables (39 total):

```
action_items
assessment_questions
assessment_responses
assessment_templates
audit_events
audit_logs
compliance_mappings
config_files
control_checks
data_asset_records
data_processing_activities
environment_validations
evidence_packages
feasibility_scores
gate_reviews
generated_reports
governance_gates
meeting_notes
notifications
organizations
pilot_setups
poc_metrics
poc_projects
poc_sprints
policies
policy_rules
policy_versions
projects
raci_entries
raci_matrices
report_templates
risk_classifications
risk_exceptions
roi_calculations
sandbox_configs
security_incidents
task_status_history
team_members
timeline_dependencies
timeline_milestones
timeline_snapshots
timeline_tasks
tool_evaluations
users
```

### RLS Verification

```sql
-- Check that RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

---

## 6. Troubleshooting

### Build Fails on Render

| Error | Fix |
|-------|-----|
| `Module not found: @sentry/nextjs` | This package IS in package.json but may have install issues. If so, add `SENTRY_IGNORE_BUILD_ERRORS=true` env var, or remove the import (it's aspirational) |
| TypeScript errors | Run `npx tsc --noEmit` locally first. The build enforces zero TS errors |
| Out of memory during build | Upgrade to a higher Render plan (Standard has 2GB RAM) |
| `npm ci` fails | Ensure `package-lock.json` is committed and up to date |

### Supabase Connection Issues

| Symptom | Fix |
|---------|-----|
| All pages show demo data | Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set and correct |
| "Invalid API key" errors | Double-check the anon key — it should start with `eyJ` |
| RLS blocks all queries | Ensure the user is authenticated and the `auth_org_id()` function exists (migration 010) |
| "relation does not exist" | Run missing migrations in order |

### Migration Errors

| Error | Fix |
|-------|-----|
| `relation "projects" does not exist` | Run migrations in numerical order starting from 001 |
| `constraint already exists` | The migration was already applied — safe to skip |
| `function "update_updated_at" does not exist` | Run migration 001 first (creates this function) |
| `function "auth_org_id" does not exist` | Run migration 010 first (creates this function) |

### Performance

- **Cold start**: First request after idle may take 5-10 seconds on Render Starter plan. Upgrade to Standard for always-on.
- **Database latency**: Keep Render region and Supabase region in the same area (both in US West, both in EU, etc.)
- **Build cache**: Render caches `node_modules` between deploys. If dependencies seem stale, click **Clear build cache** in the Render dashboard.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                  │     │                  │     │                 │
│   Browser        │────▶│  Render          │────▶│  Supabase       │
│   (React SPA)    │     │  (Next.js SSR)   │     │  (PostgreSQL)   │
│                  │◀────│                  │◀────│                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                        │
                              │                        ├── Auth
                              ▼                        ├── Storage
                        ┌──────────┐                   └── Realtime
                        │ Anthropic│
                        │ API      │
                        └──────────┘
```

- **Browser → Render**: Next.js serves SSR pages and handles API routes
- **Render → Supabase**: Server-side Supabase client for authenticated DB queries
- **Render → Anthropic**: Server-side AI API calls (never from browser)
- **Browser → Supabase**: Client-side Supabase for auth and realtime subscriptions only
