# GovAI Studio — Forward Roadmap & Adoption-Focused Redesign

> **Premise:** The current product is engineering-complete but
> adoption-incomplete. It encodes the right governance model, but the
> surface area is too heavy for a team to pick up and run with on a
> Monday morning. This document proposes a redesign — UI, backend,
> functionality, and workflow — that prioritizes time-to-first-value
> over feature breadth.

## 1. The Adoption Problem (Honest Diagnosis)

### What's working
- The five-phase model is correct. We've validated this with consultants.
- The scoring engine, gate reviews, and persona-specific reports are
  the features that close deals.
- The mobile work in Session 8 unblocks executives reviewing on phones.

### What's blocking adoption
1. **Cognitive load on day one.** A new project surfaces 91 pages
   organized into 5 phases × 7 roles. Even with phase-gating, a new
   admin sees an intimidating tree before they have a single artifact.
2. **No "starter" path for low-risk pilots.** A 3-engineer pilot with
   public-data-only requires the same governance footprint as a 200-
   engineer rollout in regulated finance. The intake scorecard tries
   to differentiate but downstream pages don't actually shrink for
   Fast Track.
3. **Manual data entry is the rate-limiting step.** Most artifacts
   start blank. Teams that already have a SOC 2 SoC, an existing AUP,
   or a Jira backlog have to re-enter that information here.
4. **No clear value in the first 30 minutes.** A user can spend half an
   hour configuring a project before seeing a single report or
   recommendation. We need an "aha moment" in under 10.
5. **Standalone artifacts, not plugged into work systems.** Teams live
   in Jira, GitHub, Slack, Confluence, Notion. GovAI Studio has a
   catalog of integrations but no actual sync; it's a parallel
   universe of work.
6. **One-shot reports, not living documents.** Reports are generated
   moments-in-time. By next week they're stale and re-generation is a
   manual user action.
7. **Consultants love it, internal teams resist it.** The product is
   shaped like a consulting deliverable. Internal champions need
   something that feels like a tool they own, not a process imposed
   on them.

## 2. Design Principles for the Redesign

These principles should govern every change proposed below.

1. **Time-to-first-artifact under 10 minutes.** Pick a strict budget
   and design backwards from it.
2. **The product reads more than it writes.** Every artifact a team
   already has elsewhere (Jira tickets, AUPs in Confluence, security
   policies in GRC tools, GitHub repos) should be ingested and
   refernced — not re-typed.
3. **Defaults beat blank forms.** Every form field should have a
   reasonable default; users edit the default rather than fill from
   empty.
4. **Phase compression by risk tier.** Fast Track shows 3 pages, not 91.
5. **Living documents, not one-shot reports.** Reports auto-refresh
   when underlying state changes; a stale report is a bug.
6. **Show the executive view first.** The first thing an admin sees
   when they open a project should be the state-of-the-project at a
   glance, not a setup checklist.
7. **Make the consultant the power user, but the engineering lead the
   primary user.** Internal-team adoption is the wedge; consultant
   sales-enablement is the upsell.

## 3. UI Redesign

### 3.1 Replace the 91-page sidebar with a 3-mode shell

```
┌─────────────────────────────────────────────────────────────┐
│  GovAI Studio                       [Quick] [Standard] [Full]│
├─────────────────────────────────────────────────────────────┤
│  [Today's State]  [What's Blocked]  [What's Next]            │
└─────────────────────────────────────────────────────────────┘
```

Three top-level modes, switchable per project:
- **Quick** (Fast Track risk tier) — 3 pages: Intake, Sandbox-Ready,
  Decision. Each page bundles what previously required 6–8 pages.
- **Standard** (Standard risk tier) — 8 pages organized by phase,
  consolidating the current 30-folder tree.
- **Full** (High-Risk tier) — current 30-folder tree, for regulated
  industries.

Default to Quick. Promote when the intake scorecard says High-Risk.

### 3.2 The "Today" home page (replaces Overview as default)

A single page that answers three questions any team member asks first:

```
┌──────────────────────────────────────────────────────────────┐
│  Today's State                                                │
│  ● Phase 2 of 5 — Classify & Govern                           │
│  ● 4 of 9 controls in place · Gate 1 in 3 days                │
│  ● Score: 72 (Conditional)  ↑ from 68 last week               │
├──────────────────────────────────────────────────────────────┤
│  What's Blocking You                                          │
│  • Legal hasn't reviewed the AUP (assigned 4 days ago)        │
│  • Sandbox VPC config missing CIDR — IT to confirm             │
├──────────────────────────────────────────────────────────────┤
│  What I (eng-lead) Should Do Next                             │
│  → Provide pilot scope draft (15 min) [start]                 │
│  → Review tool comparison metrics (5 min) [start]              │
└──────────────────────────────────────────────────────────────┘
```

This single screen replaces the current "Overview + My Tasks + Action
Queue + Decision Hub summary" sprawl. Drill-downs from each card go
deeper.

### 3.3 Inline data ingestion ("Bring your stuff")

On every page that asks for input, offer:
- **Paste from doc** — paste a Word/Markdown AUP and the system
  parses sections.
- **Connect** — Confluence, Notion, Google Drive: pull existing docs.
- **Upload** — file upload with parsing.
- **Start blank** — current behavior, but de-emphasized.

The act of asking "do you have this already?" changes the user's
mental model from "fill out forms" to "we know you have stuff —
show us what."

### 3.4 The persistent "GovAI assistant" sidebar

A right-side rail (collapsible) where Claude reads project state and
proactively offers:
- "Your AUP is missing a section on data retention. Shall I draft it?"
- "Three controls are unmapped to a framework. Want a SOC 2 mapping?"
- "Engineering Lead hasn't logged in for 5 days — bug them?"

This is what makes the product feel intelligent and not bureaucratic.
Backed by `/api/ai` (already exists) but currently underused.

### 3.5 Per-page redesign principles
- **Above the fold = decision; below the fold = detail.** Today many
  pages bury the call-to-action.
- **Maximum 5 form fields per screen.** If you need more, paginate or
  use defaults.
- **Show the diff, not the full state.** A policy editor should
  highlight what changed since last review, not re-render the whole
  document neutrally.
- **Status pills > status badges > status icons.** Progressively
  reduce visual noise as fidelity decreases.

## 4. Backend / Infrastructure Changes

### 4.1 Move notifications to a queryable store
Replace `lib/notifications/` in-memory store with a `notifications`
Postgres table. Required for any multi-replica deploy. Schema:
```sql
notifications (
  id, organization_id, user_id, kind, title, body,
  link, metadata jsonb, read_at, created_at, expires_at
)
```

### 4.2 Add a "project_snapshots" table
Today, we generate reports on demand. Instead, snapshot the project
state nightly (or on every gate/exception/policy change) to a
`project_snapshots` table. Reports become queries over snapshots.
Benefits:
- Reports are instant (no re-computation)
- Trend lines become trivial
- Auditors get reproducible historical state
- Stale reports become a non-issue

### 4.3 Real integrations, not catalog
The integrations catalog has 10 connectors documented but none
implemented. Pick the three highest-leverage and implement them
end-to-end:
- **GitHub** — read repo metadata, count contributors, fetch
  CODEOWNERS, list workflows. Used to populate engineering
  prerequisites and tool comparison baselines automatically.
- **Jira** — bidirectional sync of governance tasks. A gate review
  becomes a Jira epic; sprint metrics pull from existing Jira sprints.
- **Slack** — notification delivery and gate-vote bot.

### 4.4 Webhooks out (and in)
Outbound: when a gate decision is made, when an exception expires,
when a state transition happens, fire a webhook. Lets customers wire
GovAI Studio into their existing alerting.

Inbound: a `/api/webhook/[token]` endpoint that accepts events from
external systems (security scanner findings, CI failures) and
attaches them as evidence to the relevant control.

### 4.5 Background jobs
Currently everything is request-driven. Add a job runner (BullMQ on
Redis, or Supabase Edge Functions on cron) for:
- Nightly project snapshots
- Exception expiry reminders (T-7d, T-1d, expired)
- Stale-task pings (T+3d after assignment, T+7d before due date)
- Scheduled report regeneration

### 4.6 Database-backed user preferences
Today, dismissed banners, Gantt edits, and role overrides live in
localStorage. Move to a `user_preferences` table so a user opening
the app on a new device sees the same state.

### 4.7 Rate limiting and abuse prevention
`/api/ai` is the most expensive route. Implement per-org token
budgets (already partially in `lib/utils/rate-limit.ts`) with a
configurable monthly cap and a "soft" cap that downgrades model
selection (Opus → Sonnet) before hard-limiting.

## 5. Functionality Changes

### 5.1 "Express" risk path collapses 91 pages to 8
For Fast Track-classified projects:
- One page covers intake + assessment + readiness (combined form)
- One page covers policies (auto-drafted from a template, user
  reviews + signs)
- One page covers sandbox (auto-config from cloud-provider answer)
- One page covers pilot launch (5-minute checklist, no separate
  controls/exceptions/raci/ethics screens)
- One Decision Hub page

Standard and Full retain more granularity. The point is that low-risk
pilots — the volume case — don't pay for high-risk overhead.

### 5.2 AI-drafted artifacts
Use Claude to first-pass-draft:
- AUPs (given industry, jurisdiction, AI tool selection)
- Risk classifications (given data classification answers)
- Compliance mappings (given selected frameworks and policy text)
- Executive briefs (given the rest of the project state)

The user's role becomes review/edit/approve, not write-from-scratch.
This is the single biggest time-to-value lever.

### 5.3 Templates marketplace
A library of starter projects per industry (healthcare, finance,
manufacturing, SaaS, public sector) and per AI tool (Claude Code,
Codex, Copilot Agent, Cursor). Selecting a template pre-populates
80% of the assessment, policies, and risk profile.

### 5.4 Living dashboards for executives
Replace one-shot Executive Brief PDFs with:
- A live dashboard URL the executive can bookmark.
- Email digest cadences (weekly summary, on-state-change alert).
- Mobile-optimized (already partly there post-Session 8).

A PDF export remains for board packets, but the primary interface
is the live page.

### 5.5 Comparative benchmarks
Show "your score is 72; the median for SaaS / 100-engineer / Claude Code
deployments in our dataset is 81." Anonymized cross-org aggregates,
opt-in. This is the single most-requested feature in informal
conversations.

### 5.6 Decision audit replay
Reopen any past gate decision and see the exact state of the project
at that moment, the evidence presented, the approvers, and the
discussion. Forensics for compliance, postmortem material for the
team.

### 5.7 Self-service exception management
Today, exceptions go through a heavy approval flow. Add a "policy-
defined automatic exception" — for low-severity controls in low-risk
contexts, the system can auto-approve a 30-day exception without
human review, log it, and surface it in the executive brief.

## 6. Workflow Changes

### 6.1 Default to async + SLA-driven
Replace synchronous "wait for legal" handoffs with async + SLA. When
Legal is asked to review the AUP:
- Notification + Slack ping
- 3-day SLA shown on the task
- T-1d reminder
- Auto-escalation to legal manager on day 4

This is how real cross-functional work happens; the product should
encode it.

### 6.2 Phase 0 — Discovery week
Add a "Phase 0" before Scope & Assess: a one-week window where the
consultant or admin runs through a guided import of existing docs,
connects integrations, and does the intake interview. The output of
Phase 0 is a pre-populated project — Phase 1 starts with 70% of the
assessment already filled in.

### 6.3 The "minimum viable governance" workflow
For any pilot, the absolute minimum to pass governance is:
1. AUP signed
2. Data classification done
3. Sandbox isolated
4. Sprint metrics baselined
5. One-page decision

Document this MVG path in the product itself, mark all other steps
as "recommended" not "required" for Fast Track, and let teams
graduate to deeper governance if their pilot scales.

### 6.4 Consultant view vs. customer view
Today, consultants and customer admins see the same UI. Consultants
need:
- A multi-project overview (already partly there in `/portfolio`)
- Templated playbooks they can apply across customers
- Time-tracking per project
- White-labeled executive output

Customer admins need:
- Their single project, prominent
- No multi-project clutter
- Self-service onboarding

Split into two layouts gated by `account_type` on the user record.

### 6.5 The "consultant marketplace" play
Allow consulting partners to publish opinionated playbooks ("Acme
Healthcare's 30-day Claude Code rollout") that customers can adopt
in one click. Revenue share with the consultant. This turns the
consultant from a customer-acquisition cost into a distribution
channel.

## 7. Architecture Trade-offs to Reconsider

### 7.1 Should we still be a single Next.js monolith?
**Yes, for now.** The data layer is one Postgres database; splitting
into services would add latency and ops cost. Reconsider if (a) we
add a model-running component, (b) consultant marketplace requires a
public API distinct from the app's internal API, or (c) team size
exceeds ~15 engineers.

### 7.2 Should we move off Supabase?
**No.** RLS-as-tenant-isolation is genuinely valuable; replacing it
with app-level filtering would be slower and less secure. The
managed-Postgres dependency is acceptable.

### 7.3 Should we add a public API?
**Yes, eventually.** A scoped, versioned `/api/public/v1/*` surface
gated by API tokens. Lets consulting partners create projects, attach
evidence, and pull reports programmatically. Probably 2–3 sessions of
work to do well.

### 7.4 Should we deepen on-prem?
**Selectively.** Some regulated customers will not put governance
data in any third-party cloud. A "BYO-Postgres" deploy mode (bring
your own database, run our app in your VPC) is a valuable upsell.
Don't build a fully on-prem appliance — too expensive to maintain.

## 8. Sequenced Roadmap (next 6–8 sessions)

### Session 9 (next): Time-to-value foundation
- "Today" home page replacing default Overview
- AI-drafted AUP from intake answers
- Quick / Standard / Full mode selector skeleton
- Database-backed notifications

### Session 10: Real integrations (pick one)
- Full GitHub integration: connect, read repo metadata, populate
  engineering prerequisites
- Webhook outbound for state transitions
- Project snapshots table + nightly job

### Session 11: Express path
- Compress Fast Track to 8 pages
- Auto-population from intake answers
- AI-drafted policy templates (AUP, IRP, risk classifications)

### Session 12: Living dashboards
- Replace Executive Brief PDF with live URL
- Weekly email digest
- Mobile push (PWA)

### Session 13: Templates marketplace
- 5 industry templates (healthcare, finance, manufacturing, SaaS, public)
- 4 tool templates (Claude Code, Codex, Copilot Agent, Cursor)
- One-click apply

### Session 14: Async + SLA workflow
- Per-task SLA fields
- Reminder + escalation engine (BullMQ on Redis)
- Slack delivery for reminders

### Session 15: Public API + consultant features
- `/api/public/v1/*` scoped API tokens
- Consultant multi-project overview enhancements
- White-label theming for agency partners

### Session 16: Adoption polish
- Onboarding tutorial overlay
- "Bring your stuff" import for Confluence / Notion / Drive
- Cross-org benchmark opt-in

## 9. Metrics That Will Tell Us If This Is Working

Pick these and instrument them:

| Metric | Today | Target |
|---|---|---|
| Time from project create → first artifact | ~45 min | <10 min |
| Median # of pages visited per project | 12+ | 4 (Quick) / 8 (Standard) |
| % of projects reaching Phase 5 | unknown | >60% |
| % of artifacts AI-drafted | <5% | >50% |
| Avg time to gate decision | unknown | < 5 days |
| Cross-tool integrations active per org | 0 | ≥1 |
| Mobile session % | <5% | >25% |
| WAU / MAU ratio | unknown | >0.4 |

## 10. What This Roadmap Deliberately Does NOT Do

- **Doesn't add a fourth role.** Seven roles is enough; complexity
  would multiply.
- **Doesn't introduce a separate mobile app.** PWA is sufficient; a
  native app is an order of magnitude more cost for marginal benefit.
- **Doesn't pivot to general-purpose AI compliance.** Stay focused
  on AI coding agents — this is the wedge.
- **Doesn't expand the data model speculatively.** Schema changes
  only when a feature needs them.
- **Doesn't add a billing system.** Use Stripe Checkout when needed;
  don't build a billing platform.

## 11. Risks of This Roadmap

- **AI-drafted artifacts could erode trust if quality is uneven.**
  Mitigation: ship with editor-mode-by-default; the user reviews
  and approves every AI output.
- **Integrations introduce ops burden.** Mitigation: each integration
  must have a graceful disconnect path and a "this integration is
  unhealthy" UI.
- **Express path could under-govern serious deployments.** Mitigation:
  intake scorecard determines path, and graduating to Standard /
  Full is one click — never automatic-and-quiet.
- **Consultant features risk product complexity.** Mitigation: gate
  consultant-only features behind `account_type`, do not surface to
  customer admins.

---

**Maintenance:** Review this roadmap at the start of each session.
Move completed items to `DESIGN.md`. Adjust sequencing based on
customer feedback and adoption metrics. The point is not to ship
every item — it's to keep a coherent next-three-sessions visible
and to make sure we're optimizing for adoption, not feature count.
