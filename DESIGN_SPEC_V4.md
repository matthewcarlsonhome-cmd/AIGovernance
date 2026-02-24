# GovAI Studio — Design Specification v4

## UI/UX Overhaul: Professional Workflow-Driven Governance Platform

**Date:** 2026-02-24
**Status:** Draft — Pending Approval
**Scope:** Full UI restructuring, navigation redesign, role-based views, workflow automation, tone/copy overhaul

---

## 1. Problem Statement

### 1.1 Why AI Governance Projects Fail

Most AI governance and implementation projects at US companies are failing due to:

- **Unclear requirements** — Teams don't know what "governance" means in practice, what artifacts they need, or what standard they're being held to.
- **Lack of understanding of complexity** — Stakeholders underestimate the cross-functional coordination required across Legal, IT Security, Engineering, and Executive teams.
- **Security and data handling blind spots** — Organizations don't discover data classification, DLP, or access control gaps until they're deep into implementation.
- **No single source of truth** — Work is scattered across spreadsheets, email threads, and Slack. No one has a clear picture of overall progress.
- **Role confusion** — People don't know what's expected of them or when their input is needed.

GovAI Studio must directly address every one of these failures.

### 1.2 Current UI Problems

| Problem | Evidence |
|---|---|
| **Navigation overload** | 46 sidebar items when fully expanded. No clear path through them. Users see everything at once regardless of what phase they're in. |
| **No workflow guidance** | The sidebar is organized by category (Governance, Build, Reports), not by what to do next. A new user has no idea where to start or what order to follow. |
| **Unprofessional tone** | Role labels like "Grand Architect", "Strategy Wizard", "Code Captain". Dashboard greetings like "Afternoon hustle mode", "Night owl energy". Activity feed verbs like "crushed the assessment", "leveled up the policy". These undermine credibility with enterprise buyers. |
| **Role-agnostic views** | All roles see the same dashboards and task lists. An executive sees sandbox configuration details they'll never touch. A legal reviewer sees sprint tracking they don't need. |
| **No task ownership clarity** | Tasks exist but aren't assigned to specific roles. There's no "My Tasks" view showing exactly what a logged-in user needs to do. |
| **Claustrophobic layout** | Dense sidebar + breadcrumb bar + content area leaves little breathing room. Sections are collapsed but still overwhelming when opened. |

---

## 2. Design Principles

### 2.1 Core Principles

1. **One clear path forward.** At any point, every user should know the single most important thing they need to do next. The interface should make this obvious within 3 seconds of landing on any page.

2. **Show less, guide more.** Hide what isn't relevant to the current phase, the current role, and the current moment. Progressive disclosure, not information dumping.

3. **Professional, not playful.** The tone should match a management consulting deliverable. No gamification, no personality quirks, no forced fun. Clean, direct, confident.

4. **Role-native views.** Each role sees a purpose-built interface. An executive sees decisions requiring their input and project health. An engineer sees technical tasks and configurations. Legal sees policies requiring review.

5. **Transparent progress.** Every stakeholder can see overall project health, their team's progress, and where bottlenecks exist — without needing to dig through nested menus.

6. **Day-one usability.** A new team member should be productive within one working session. This means: clear onboarding, contextual guidance, and no hidden prerequisites.

---

## 3. Information Architecture Redesign

### 3.1 Current Structure (Problem)

```
Sidebar (always visible, 46 items):
├── Main (4 items)
├── Current Project
│   ├── Overview
│   ├── Workspaces (6)
│   ├── Pilot Setup (5)
│   ├── Governance (10)
│   ├── Build & Validate (6)
│   ├── Launch & Monitor (6)
│   └── Reports & Decisions (8)
├── Help & Guide
└── Admin & Settings
```

This is a sitemap, not a workflow. Users are forced to understand the entire structure before they can be productive.

### 3.2 New Structure: Phase-Driven Navigation

Replace the category-based sidebar with a **phase-driven navigation** that reveals content progressively as the project advances.

```
Top Bar (persistent):
├── GovAI Studio [logo]
├── [Project Selector dropdown]
├── [My Tasks badge count]
├── [Notifications]
└── [User profile + role]

Left Rail (slim, context-aware):
├── Dashboard
├── Projects
├── Portfolio (admin/exec only)
│
├── ── Current Project ──
├── Project Overview + Health
├── My Tasks (role-filtered)
│
├── ── Active Phase ──
│   (Only shows steps for current phase)
│   Phase 1: Scope & Assess
│   Phase 2: Classify & Govern
│   Phase 3: Approve & Gate
│   Phase 4: Build & Test
│   Phase 5: Evaluate & Decide
│
├── Project Plan (master view)
├── Team & Roles
│
├── ── Quick Access ──
├── Settings
└── Help
```

**Key changes:**

| Aspect | Before | After |
|---|---|---|
| Sidebar items visible | 46 at once | 8-12 based on phase |
| Organization | By feature category | By project phase |
| Phase gating | None — all phases accessible | Past phases collapse, future phases show as locked with preview |
| Role filtering | Basic — hides some items | Primary — each role sees only their relevant tasks within each phase |

### 3.3 Phase Definitions

The project lifecycle maps to 5 phases. Each phase has a clear entry gate, required outputs, and exit criteria.

#### Phase 1: Scope & Assess
**Goal:** Define the pilot, assess organizational readiness, classify risk.
**Pages visible:**
- Intake Scorecard (risk path classification)
- Discovery Questionnaire (organizational readiness)
- Readiness Assessment (scored results)
- Prerequisites Checklist
- Team Assignment

**Exit criteria:** Intake scored, readiness assessed, team assigned, risk path classified.

#### Phase 2: Classify & Govern
**Goal:** Establish governance framework, classify data, draft policies, map compliance.
**Pages visible:**
- Data Classification
- Policy Editor (AUP, IRP, data handling)
- Compliance Mapping (SOC2, HIPAA, NIST, GDPR)
- Risk Register
- RACI Matrix
- Ethics Review
- Security Controls

**Exit criteria:** Policies drafted, compliance mapped, risks classified, RACI defined.

#### Phase 3: Approve & Gate
**Goal:** Pass formal gate reviews with evidence packages.
**Pages visible:**
- Gate Review Board (Gate 1: Scope, Gate 2: Security, Gate 3: Pilot)
- Evidence Package Builder
- Exception Requests (if controls can't be fully met)
- Control Center (consolidated governance status)

**Exit criteria:** All required gates passed or exceptions formally approved.

#### Phase 4: Build & Test
**Goal:** Configure sandbox, run the pilot, collect metrics.
**Pages visible:**
- Sandbox Configuration
- Sandbox Validation
- Pilot Design
- Sprint Tracker
- Tool Comparison (if evaluating multiple agents)
- Monitoring Dashboard

**Exit criteria:** Sandbox validated, pilot executed, baseline metrics captured.

#### Phase 5: Evaluate & Decide
**Goal:** Analyze results, generate decision brief, reach go/no-go.
**Pages visible:**
- Outcome Metrics (vs. baseline)
- Decision Hub (evidence + recommendation)
- Executive Brief
- ROI Calculator
- Report Generator
- Final Decision Board

**Exit criteria:** Executive decision recorded (go / conditional go / no-go).

### 3.4 Navigation Behavior

**Phase collapsing:**
- The active phase is expanded and shows all its pages.
- Completed phases show as a single collapsed line with a checkmark and completion date. Clicking expands to review but the visual weight is minimal.
- Future phases show as a single line with a lock icon and a brief description of what's ahead. They are not clickable until the prior phase exit criteria are met (or an admin overrides).

**Role filtering within phases:**
- Within the active phase, only pages relevant to the logged-in user's role appear in the nav.
- Example: During Phase 2, a Legal user sees Policy Editor, Compliance Mapping, Ethics Review. They do not see Data Classification (IT) or Security Controls (IT).
- A "Show all phase items" toggle exists for admins and consultants who need the full picture.

---

## 4. Role-Based Experience Design

### 4.1 Role Definitions (Professional Labels)

Replace all gamified role labels with clear, professional titles:

| Role Key | Current Label | New Label |
|---|---|---|
| `admin` | Grand Architect | Project Administrator |
| `consultant` | Strategy Wizard | Governance Consultant |
| `executive` | Decision Maker | Executive Sponsor |
| `it` | Security Guardian | IT / Security Lead |
| `legal` | Compliance Sage | Legal / Compliance Lead |
| `engineering` | Code Captain | Engineering Lead |
| `marketing` | Story Crafter | Communications Lead |

### 4.2 Role-Specific Dashboard Views

When a user lands on the dashboard or project overview, the content adapts to their role:

**Executive Sponsor:**
- Project health score (single number with trend)
- Decisions awaiting their approval (gate reviews, exceptions, go/no-go)
- Risk summary (high-level, not granular)
- Timeline status (on track / at risk / delayed)
- Budget/ROI summary
- Does NOT see: technical configuration, sprint details, sandbox setup

**IT / Security Lead:**
- Security control check status (pass/fail/pending)
- Sandbox configuration and validation status
- Data classification review items
- DLP and access control gaps flagged
- Items requiring their technical sign-off
- Does NOT see: budget details, marketing communications, policy drafting

**Legal / Compliance Lead:**
- Policies requiring review or approval
- Compliance mapping status (controls mapped vs. gaps)
- Exception requests requiring legal review
- Ethics review items
- Risk register entries needing legal assessment
- Does NOT see: sandbox configuration, sprint tracking, tool comparison

**Engineering Lead:**
- Sandbox setup tasks assigned to them
- Pilot sprint items and metrics
- Tool comparison data
- Technical prerequisites checklist
- Agent deployment readiness
- Does NOT see: policy drafting, compliance mapping, budget/ROI

**Communications Lead:**
- Stakeholder communications needing drafting
- Change management materials
- FAQ and messaging guides
- Client/external brief status
- Does NOT see: technical configuration, compliance mapping, risk classification

**Governance Consultant / Project Administrator:**
- Full visibility across all items (these are the orchestrators)
- Cross-role bottleneck detection
- Phase completion dashboards
- Ability to reassign tasks, override phase locks, manage exceptions

### 4.3 "My Tasks" — The Primary Landing Experience

Every user's default view when entering a project should be **My Tasks** — a focused, prioritized list of exactly what they need to do, review, or approve.

**My Tasks structure:**

```
┌─────────────────────────────────────────────────────┐
│  My Tasks                               Phase 2 of 5│
│  ─────────────────────────────────────────────────── │
│                                                      │
│  REQUIRES YOUR ACTION (3)                            │
│  ┌──────────────────────────────────────────────┐   │
│  │ ● Review AUP Policy Draft                     │   │
│  │   Assigned by: Sarah Chen · Due: Feb 28       │   │
│  │   [Open Policy Editor]                        │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ● Approve Risk Exception: PII in Sandbox      │   │
│  │   Requested by: James Liu · Due: Mar 1        │   │
│  │   [Review Exception]                          │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ● Provide Compliance Mapping for HIPAA        │   │
│  │   Phase 2 prerequisite · Due: Mar 5           │   │
│  │   [Open Compliance Mapper]                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  UPCOMING (2)                                        │
│  ○ Gate 2 Review — awaiting prerequisite completion  │
│  ○ Ethics Review — scheduled for Phase 2             │
│                                                      │
│  RECENTLY COMPLETED (1)                              │
│  ✓ Data Classification Sign-off · Feb 22            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Behaviors:**
- Tasks are sorted by: (1) blocking other people's work, (2) approaching due date, (3) phase requirement
- Each task card shows: title, who assigned/requested it, due date, and a direct link to the relevant page
- Completing a task from My Tasks automatically advances the master project plan
- Badge count on "My Tasks" in the nav updates in real time

---

## 5. Master Project Plan View

### 5.1 Purpose

Every team member — regardless of role — should be able to see the full project plan in one view. This replaces the need to navigate through 46 sidebar items to understand progress.

### 5.2 Layout

The Master Project Plan is a **single-page, scrollable view** organized by phase:

```
PROJECT PLAN — Acme Corp AI Coding Agent Pilot
Overall: 42% complete · Phase 2 of 5 · 14 of 33 items done
Target completion: April 15, 2026 · Status: On Track

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1: SCOPE & ASSESS                    ✓ Complete
Completed Feb 10 · 6 of 6 items
[Collapsed — click to expand]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 2: CLASSIFY & GOVERN                  ● In Progress
8 of 12 items · 3 assigned to you
├── ✓ Data Classification ................ IT Lead · Feb 14
├── ✓ Risk Register ...................... Consultant · Feb 16
├── ✓ RACI Matrix ....................... Admin · Feb 18
├── ✓ AUP Policy (draft) ............... Consultant · Feb 20
├── ✓ IRP Addendum (draft) ............. Consultant · Feb 20
├── ✓ Data Handling Policy (draft) ...... Consultant · Feb 21
├── ✓ SOC2 Compliance Mapping ........... IT Lead · Feb 22
├── ✓ HIPAA Compliance Mapping .......... Legal Lead · Feb 22
├── ● Ethics Review ..................... Legal Lead · Due Feb 28  ← YOU
├── ● AUP Policy (legal review) ........ Legal Lead · Due Feb 28  ← YOU
├── ○ Security Controls Baseline ........ IT Lead · Due Mar 3
└── ○ Gate 1 Review ..................... Exec Sponsor · Blocked

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 3: APPROVE & GATE                     ○ Not Started
0 of 5 items · Unlocks after Phase 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 4: BUILD & TEST                       ○ Not Started
0 of 8 items · Unlocks after Phase 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 5: EVALUATE & DECIDE                  ○ Not Started
0 of 5 items · Unlocks after Phase 4
```

### 5.3 Interactions

- **"← YOU" markers** highlight tasks assigned to the current user
- **Clicking any task** opens the relevant page inline or navigates to it
- **Blocked items** show what they're waiting on (e.g., "Blocked by: Ethics Review, AUP Policy review")
- **Role filter toggle** lets admins see all tasks or filter by a specific role to understand that person's workload
- **Export** the project plan as PDF or CSV for stakeholder reporting

---

## 6. Onboarding: Day-One Experience

### 6.1 First-Time Project Setup Flow

When an organization creates their first project, they should be guided through setup in a linear wizard — not dropped into an empty dashboard.

**Step 1: Organization Profile** (2 min)
- Company name, industry, size, regulatory environment
- This pre-configures compliance frameworks (e.g., healthcare → HIPAA enabled by default)

**Step 2: Project Definition** (5 min)
- What AI tool/agent are you evaluating?
- What's the business use case?
- What's the target timeline?
- Who is the executive sponsor?

**Step 3: Team Setup** (5 min)
- Invite team members by email with role assignment
- Each invited role shows a brief description of what that role will be responsible for
- Minimum viable team: Executive Sponsor, IT/Security Lead, one of Legal or Consultant

**Step 4: Intake Scorecard** (10 min)
- 10-question risk classification
- Results in immediate risk path assignment (Fast Track / Standard / High-Risk)
- The risk path determines which governance items are required vs. optional

**Step 5: Project Plan Generated** (automatic)
- Based on intake answers, risk path, and team composition, the system generates a tailored project plan
- Shows estimated timeline, assigned tasks per role, and phase structure
- User reviews and confirms, or adjusts

**Total time: ~25 minutes from account creation to a fully populated project plan with assigned tasks.**

### 6.2 Returning User Experience

When a returning user logs in:
1. They land on **My Tasks** for their active project
2. A banner at the top shows overall project status: "Phase 2 of 5 — Classify & Govern — 67% complete"
3. Their highest-priority task is highlighted at the top
4. No need to navigate anywhere — the work comes to them

### 6.3 Contextual Help

Instead of a separate Help page that users must seek out:
- Each phase has a **"What's expected"** panel that explains the purpose of the phase, what artifacts it produces, and why it matters
- Each task has a **"Why this matters"** tooltip that explains in one sentence why this task exists (e.g., "Data classification determines which security controls are required for your pilot environment")
- A persistent **"Guide"** button in the bottom-right opens a context-aware help panel relevant to the current page

---

## 7. Tone and Copy Standards

### 7.1 Remove All Gamified Language

**Headings and labels to replace:**

| Location | Current | Replacement |
|---|---|---|
| Dashboard heading | "Mission Control" | "Dashboard" |
| Dashboard subtitle | "Your AI governance empire at a glance" | "Project overview and recent activity" |
| Logo tagline | "govern boldly" | Remove entirely, or use "AI Governance Platform" |
| Time greeting | "Good morning, champion" / "Afternoon hustle mode" / etc. | Remove entirely. Show user name only. |
| Sidebar prompt | "Pick your adventure" | "Select a project to continue" |
| Sidebar description | "Select a project to unlock its full toolkit" | "Choose a project to view tasks and progress" |
| Collapse button | "Tuck away" | "Collapse sidebar" |
| Projects section | "Your Fleet" | "Recent Projects" |
| Empty state | "The hangar is empty!" | "No projects yet" |
| Empty state heading | "Ready for liftoff?" | "Get started" |
| Welcome heading | "Welcome, pioneer!" | "Welcome" |
| Activity: completed assessment | "crushed the assessment" | "completed the assessment" |
| Activity: updated policy | "leveled up the policy" | "updated the policy" |
| Activity: added team member | "recruited a new ally" | "added a team member" |
| Activity: generated report | "shipped a report" | "generated a report" |
| Stat card | "things to knock out" | "pending actions" |
| Team page heading | "The Crew" | "Project Team" |
| Team page subtitle | "Your governance squad..." | "Manage team members, roles, and assignments." |
| Help page heading | "Your Field Guide" | "Help & Documentation" |
| Settings heading | "Your Control Panel" | "Settings" |
| Settings subtitle | "Tweak your profile..." | "Manage your profile, team access, and project configuration." |

### 7.2 Tone Guidelines

- **Voice:** Direct, professional, confident. Think McKinsey report, not Slack bot.
- **Sentence structure:** Short declarative sentences. No questions as headings unless genuinely asking the user something.
- **Action labels:** Use clear verbs. "Review Policy" not "Check it out". "Create Project" not "Launch New Mission".
- **Error messages:** Specific and actionable. "The compliance mapping for SOC2 is incomplete. 3 of 12 controls are unmapped." — not "Oops! Something's missing."
- **Empty states:** Show what the user should do next, not a joke. "No risk exceptions have been requested. Exceptions are used when a governance control cannot be fully met during the pilot period."

### 7.3 Role Labels in UI

Everywhere a role appears (sidebar badge, task assignments, team page, settings), use the professional labels from Section 4.1. The role badge in the top bar should show the role name in plain text on a neutral background — not a colored pill with a fantasy title.

---

## 8. Layout and Visual Design Updates

### 8.1 Reduce Claustrophobia

**Sidebar:**
- Reduce width from 256px (w-64) to 220px when expanded
- Default to showing only: Dashboard, Projects, Portfolio, then the active phase's items
- Completed and future phases are single collapsed lines (not collapsible sections with items)
- Remove the progress bar, role indicator, and greeting from the sidebar bottom — move role info to the top bar user menu

**Top Bar:**
- Remove the time-based greeting entirely
- Show: Breadcrumbs (left), Project name and phase (center), User avatar + role + My Tasks badge (right)
- The top bar should feel like a professional toolbar, not a social media header

**Content Area:**
- Increase left and right padding from p-6 (24px) to p-8 (32px) on large screens
- Use max-width containers (max-w-5xl or max-w-6xl) to prevent content from stretching edge-to-edge on wide monitors
- Add more vertical whitespace between sections

### 8.2 Color and Typography

- **Primary palette:** Slate grays for structure, with a single accent color (blue-600 or indigo-600) for interactive elements and the active phase
- **Status colors:** Emerald for complete, amber for in-progress/warning, red for blocked/critical, slate for not started
- **No colored role badges** in the main interface — use simple text labels. Color-coded avatars are acceptable in team views.
- **Typography:** Keep system fonts. Headings should be heavier (font-bold) but not oversized. Body text at 14px (text-sm), with generous line-height.

---

## 9. Notification and Queuing System

### 9.1 Task Queue Engine

The existing `computeNextActions()` in `lib/progress/next-actions.ts` provides the foundation. Extend it with:

**Role assignment:** Every generated action must specify which role(s) it's assigned to. This enables the "My Tasks" view.

**Blocking detection:** If Task B depends on Task A, and Task A isn't complete, Task B should show as "Blocked by: [Task A title] — assigned to [Role]". This makes bottlenecks visible.

**Due date derivation:** Based on the project target end date and phase structure, auto-calculate suggested due dates for each task. Show amber warnings at 3 days before due, red at overdue.

**Notification triggers:**
- Task assigned to you → notification
- Task you're blocked by is completed → notification ("AUP Policy review is now ready for your input")
- Phase transition → notification to all team members
- Gate review scheduled → notification to reviewers
- Exception approaching expiry → notification to approver
- Weekly digest → summary of project progress and upcoming deadlines

### 9.2 Notification Center

Replace the current absence of notifications with a notification panel accessible from the top bar bell icon:

```
NOTIFICATIONS
─────────────
NEW
● Policy review assigned to you — AUP Policy
  2 hours ago · Phase 2: Classify & Govern

● Gate 1 prerequisites met — review scheduled
  Yesterday · Phase 3: Approve & Gate

EARLIER
○ SOC2 mapping completed by IT Lead
  Feb 22 · Phase 2: Classify & Govern

○ Risk register updated — 2 new items
  Feb 21 · Phase 2: Classify & Govern
```

---

## 10. Implementation Priorities

### 10.1 Phase 1 — Critical Path (Do First)

These changes have the highest impact on first impressions and usability:

1. **Tone cleanup** — Replace all gamified text across the application (Section 7.1). This is surgical find-and-replace work with no architectural changes.

2. **Role label update** — Replace ROLE_LABELS with professional titles (Section 4.1).

3. **Navigation restructure** — Rebuild sidebar as phase-driven navigation (Section 3.2-3.4). This is the largest architectural change and the single most impactful improvement.

4. **My Tasks view** — Build the role-filtered task list as the default project landing page (Section 4.3). Extend `computeNextActions()` with role assignment.

5. **Master Project Plan** — Build the single-page project plan view (Section 5). This gives all stakeholders immediate visibility into the full picture.

### 10.2 Phase 2 — Workflow Automation

6. **Phase gating** — Implement exit criteria checks and phase transitions (Section 3.3). Show locked future phases.

7. **Blocking detection** — Add dependency tracking to the task queue (Section 9.1).

8. **Notification system** — Build notification center and triggers (Section 9.2).

9. **Onboarding wizard** — Build the first-time project setup flow (Section 6.1).

### 10.3 Phase 3 — Role Polish

10. **Role-specific dashboards** — Customize the project overview per role (Section 4.2).

11. **Contextual help** — Add "Why this matters" tooltips and phase explanation panels (Section 6.3).

12. **Due date engine** — Auto-calculate suggested deadlines from project timeline (Section 9.1).

---

## 11. Files Requiring Changes

### 11.1 Critical Files (Phase 1 Tone + Navigation)

| File | Change Type | Description |
|---|---|---|
| `src/app/(dashboard)/layout.tsx` | **Major rewrite** | Rebuild sidebar as phase-driven nav, remove gamified text, update role labels, restructure top bar |
| `src/app/(dashboard)/page.tsx` | **Major rewrite** | Replace "Mission Control" dashboard with professional dashboard, fix activity feed verbs, remove gamified headings |
| `src/app/(dashboard)/settings/page.tsx` | **Moderate edit** | Update heading, subtitle, role labels in role switcher |
| `src/app/(dashboard)/help/page.tsx` | **Moderate edit** | Replace "Field Guide" with "Help & Documentation", professionalize copy |
| `src/app/(dashboard)/projects/[id]/team/page.tsx` | **Minor edit** | Replace "The Crew" with "Project Team", update subtitle |

### 11.2 New Files (Phase 1)

| File | Purpose |
|---|---|
| `src/app/(dashboard)/projects/[id]/my-tasks/page.tsx` | Role-filtered task list — the primary project landing page |
| `src/app/(dashboard)/projects/[id]/project-plan/page.tsx` | Master project plan with phase-organized task list |
| `src/lib/tasks/role-assignment.ts` | Extends next-actions with role-specific task assignment |
| `src/lib/tasks/phase-gating.ts` | Phase exit criteria evaluation and transition logic |

### 11.3 Files with Minor Copy Fixes

All files in `src/app/(dashboard)/projects/[id]/` that contain "unlock", "champion", or other casual language. Full list identified in the audit (Section 1.2 of this document refers to the audit findings — approximately 8 files with minor copy changes).

---

## 12. Success Metrics

After implementation, the redesign should measurably achieve:

| Metric | Target |
|---|---|
| Time from account creation to populated project plan | < 30 minutes |
| Number of nav items visible at any moment (non-admin) | < 12 |
| Percentage of users who can identify their next task within 5 seconds | > 90% |
| Reduction in support questions about "where do I go next" | > 70% |
| Enterprise buyer confidence score (user testing) | > 8/10 |

---

## 13. Summary

The redesign transforms GovAI Studio from a feature-rich but overwhelming tool catalog into a **guided workflow platform** where:

- Every user knows what to do next, who's responsible, and what's blocking progress
- The interface adapts to who you are (role) and where you are (phase)
- The tone communicates competence and professionalism
- A complete beginner can set up and start tracking a governance project in under 30 minutes
- All stakeholders share a single, transparent view of project health and progress

The current codebase has strong foundations — the state machine, scoring engine, event bus, RBAC service, and domain services are all well-built. The changes are primarily at the **presentation and navigation layer**, not the domain logic layer. The investment is in reorganizing how users interact with capabilities that already exist.
