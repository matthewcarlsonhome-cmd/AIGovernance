# GovAI Studio — UI Overhaul Plan

## Executive Summary

The current interface has **47 pages** across **40+ menu items** in **10 navigation sections** — all visible to every user regardless of role. There is no work queue, no role-based filtering, and no unified progress tracker. Several critical features have display bugs or missing interactivity. This plan addresses all of these issues in a phased approach.

---

## Part 1: Confirmed Bugs (Fix Immediately)

### Bug 1: Readiness Assessment Scoring Display
**File:** `src/app/(dashboard)/projects/[id]/discovery/readiness/page.tsx`

**Root Cause:** The page displays `ds.score` (raw weighted score, e.g. 2.6, 4.2) with a "/100" label and uses it for progress bar width. It should use `ds.percentage` (the normalized 0-100 value). The `passed` boolean is correctly computed from `percentage >= threshold` in the scoring engine, which is why domains show "Pass" even though the displayed number looks low.

**Fix (4 locations in readiness page):**
- Line 317: Change `ds.score` → `ds.percentage` in the score display
- Line 318: The "/100" label is then correct
- Line 328: Change `scoreBarColor(ds.score)` → `scoreBarColor(ds.percentage)`
- Line 329: Change `ds.score` → `ds.percentage` in progress bar width
- Line 357: Change `ds.score` → `ds.percentage` in domain detail cards

**Also fix in:** `src/app/(dashboard)/projects/[id]/discovery/data-readiness/page.tsx` (same pattern)

### Bug 2: Gantt Chart — No Way to Add/Edit Tasks
**File:** `src/app/(dashboard)/projects/[id]/timeline/gantt/page.tsx`

**Current State:** 26 hardcoded demo tasks. API routes exist (`/api/timeline/tasks` with full CRUD). Hooks exist (`useSaveTask`, `useUpdateTask`, `useDeleteTask`). But the page has zero UI for creating, editing, or deleting tasks. Drag-and-drop libraries are installed (`@dnd-kit`) but not wired up.

**Fix:**
- Add "Add Task" button that opens a dialog with fields: title, phase, start date, end date, assigned to, status
- Add click-to-edit on existing task bars (or a side panel)
- Add delete capability (context menu or edit panel)
- Wire up `useSaveTask()` and `useDeleteTask()` mutations
- (Phase 2) Wire up @dnd-kit for drag-to-reschedule

### Bug 3: Pilot Program Designer — Missing CRUD for Several Sections
**File:** `src/app/(dashboard)/projects/[id]/poc/pilot-design/page.tsx`

**Current State:** The page is actually more functional than reported — objectives, success criteria status toggling, risk register, kill switch criteria, and Go/No-Go gate status toggling all work. However:
- **Participant Selection Criteria:** Structure exists but no add/edit/delete UI
- **Quantitative Metrics:** Display-only, no way to add/edit metrics
- **Evidence on Go/No-Go Gates:** The `evidence` field exists in the type but there's no text input to enter it
- **Data persistence:** localStorage only, no API integration

**Fix:**
- Add CRUD dialog for Participant Selection Criteria (name, weight, ideal profile)
- Add CRUD dialog for Quantitative Metrics (name, baseline, target, actual, method)
- Add evidence text input on each Go/No-Go gate card
- (Future) Create API route to persist pilot designs to Supabase

---

## Part 2: Role-Based Navigation Overhaul

### Problem
All 7 roles (admin, consultant, executive, it, legal, engineering, marketing) see the same 40+ menu items. An executive doesn't need "Sandbox Configure" or "Config Files." An engineer doesn't need "Ethics Review" or "Client Brief." The sidebar is overwhelming and nothing guides users to what *they* need to do.

### Solution: Role-Based View Profiles

#### 2.1 Define Role → Page Mapping

Each role gets a **primary view** (their home when entering a project) and **accessible pages** (what appears in their sidebar). Pages not in their list are hidden from nav but still accessible via direct URL (no hard blocking — just decluttering).

| Role | Primary View | Sidebar Sections |
|------|-------------|-----------------|
| **Admin** | Project Overview | All sections (full access) |
| **Consultant** | Project Overview | All sections (full access) |
| **Executive** | Executive Dashboard (new) | Overview, Readiness Summary, Gate Reviews, ROI, Reports, Timeline (milestones only) |
| **IT/Security** | Sandbox & Security Hub | Discovery (readiness, prerequisites), Governance (compliance, risk), Sandbox (all), Agent Deployment (all), Monitoring |
| **Legal** | Governance Hub | Governance (policies, compliance, ethics, data flows), Gate Reviews, Reports |
| **Engineering** | Pilot & Tools Hub | Discovery (questionnaire), Sandbox (configure, validate), PoC (all), Timeline (gantt, milestones), Monitoring |
| **Marketing** | Communications Hub | Reports (communications, client brief), Change Management |

#### 2.2 Implementation: NavItem Role Filter

**File to modify:** `src/app/(dashboard)/layout.tsx`

Add a `roles` property to `NavItem`:

```typescript
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];  // If undefined, visible to all roles
}
```

Filter the sidebar sections based on `currentUser.role`:

```typescript
const visibleSections = PROJECT_SECTIONS
  .map(section => ({
    ...section,
    items: section.items.filter(item =>
      !item.roles || item.roles.includes(currentUser?.role ?? 'consultant')
    )
  }))
  .filter(section => section.items.length > 0);
```

#### 2.3 Sidebar Reorganization

**Current structure (10 sections, 40+ items):**
Discovery (4) → Governance (8) → Sandbox (4) → PoC (7) → Timeline (3) → Change Mgmt (1) → Monitoring (1) → Agent Deployment (4) → Reports (4) → plus 5 standalone items

**Proposed structure (6 sections, streamlined):**

```
── Project Home (overview + progress tracker)
── Assess & Plan
   ├── Readiness Assessment
   ├── Questionnaire
   ├── Prerequisites Checklist
   └── Data Readiness
── Govern & Comply
   ├── Policies & Playbook
   ├── Compliance Mapping
   ├── Risk Classification
   ├── RACI Matrix
   ├── Gate Reviews
   └── Ethics & Data Flows (collapsed subsection)
── Build & Test
   ├── Sandbox Setup
   ├── Sandbox Validation
   ├── Pilot Designer
   ├── Sprint Tracker
   ├── Tool Comparison
   └── Agent Deployment (collapsed subsection)
── Track & Report
   ├── Timeline / Gantt
   ├── Milestones
   ├── ROI Calculator
   ├── Report Generator
   └── Meeting Notes
── Team & Settings
   ├── Team Members
   ├── Change Management
   └── Project Settings
```

This reduces from 10 sections to 6, groups by workflow phase, and collapses rarely-used items. Combined with role filtering, most users will see 3-4 sections with 8-15 items instead of 40+.

---

## Part 3: Work Queue / Inbox System

### Problem
No user can see "what do I need to do next?" There's no concept of pending actions, approvals needed, or items awaiting their input.

### Solution: Role-Aware Action Queue

#### 3.1 New Component: `WorkQueue`
**File:** `src/components/features/work-queue/work-queue.tsx`

A card/panel that appears at the top of the project overview (and optionally as a persistent sidebar widget) showing the current user's pending items:

```typescript
interface WorkQueueItem {
  id: string;
  type: 'approval' | 'review' | 'action' | 'input_needed' | 'overdue';
  title: string;
  description: string;
  href: string;           // Link to the relevant page
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  source_page: string;    // Which feature generated this item
  assigned_role: UserRole;
}
```

#### 3.2 Queue Items by Role

| Role | Queue Item Examples |
|------|-------------------|
| **Executive** | "Gate 2 approval pending your sign-off", "ROI report ready for review", "Go/No-Go decision needed" |
| **IT/Security** | "Sandbox validation has 2 failing checks", "DLP rules need configuration", "Penetration test report due" |
| **Legal** | "AUP draft needs legal review", "Compliance mapping incomplete for HIPAA", "Gate 3 approval pending" |
| **Engineering** | "Sprint 2 metrics need entry", "3 questionnaire sections unanswered", "Tool comparison scores need update" |
| **Marketing** | "Communications plan not started", "Change management narrative due" |

#### 3.3 Implementation Approach

Initially, the work queue can be computed client-side from the existing demo/localStorage data:
- Check gate reviews for pending approvals matching user role
- Check prerequisites checklist for uncompleted items assigned to user role
- Check pilot design for empty sections
- Check timeline for overdue tasks assigned to user

Later, this becomes a database-backed notification system with Supabase real-time subscriptions.

---

## Part 4: Project Progress Tracker

### Problem
No single view shows overall project progress across all phases. Users have to click into each section to understand status. The project overview page shows some stats but doesn't provide a clear "you are here, here's what's done, here's what's left" view.

### Solution: Master Progress Dashboard

#### 4.1 New Component: `ProjectProgressTracker`
**File:** `src/components/features/progress/project-progress-tracker.tsx`

A visual stepper/checklist that shows the full project lifecycle with completion status:

```
Discovery ──→ Governance ──→ Sandbox ──→ Pilot ──→ Evaluation ──→ Production
   85%            60%          40%        10%         0%             0%
```

Each phase expands to show its constituent tasks with status:

```
✅ Discovery (85%)
  ✅ Questionnaire completed (25/25 questions)
  ✅ Readiness assessment scored (71/100)
  ⬜ Data readiness review (not started)
  ✅ Prerequisites checklist (12/15 items)

🔄 Governance (60%)
  ✅ AUP policy drafted
  ✅ Risk classification set
  🔄 Compliance mapping (3/5 frameworks)
  ⬜ RACI matrix (not started)
  🔄 Gate 1 approved, Gate 2 in review
  ⬜ Ethics review (not started)
```

#### 4.2 Placement
- **Project Overview page:** Full-width progress tracker at the top, replacing the current scattered stats cards
- **Sidebar footer:** Compact progress bar showing overall % (always visible)
- **Dashboard home:** Each project card shows its progress bar

#### 4.3 Data Source
Computed from existing data:
- Assessment responses → Discovery %
- Policy/compliance/gate status → Governance %
- Sandbox config + validation → Sandbox %
- PoC project + sprint status → Pilot %
- Metrics captured → Evaluation %
- All gates approved → Production readiness

---

## Part 5: Simplified Project Overview Page

### Current State
The project overview (`/projects/[id]/overview/page.tsx`) shows:
- Basic project info card
- Domain scores (5 bars)
- Phase progress cards (5 cards linking to sub-sections)

### Proposed Redesign

Replace with a **3-panel layout:**

```
┌─────────────────────────────────────────────────┐
│  Project Progress Tracker (Part 4 component)     │
│  [Discovery ✅]→[Governance 🔄]→[Sandbox ⬜]→... │
└─────────────────────────────────────────────────┘
┌──────────────────────┐ ┌────────────────────────┐
│  Your Action Items   │ │  Project Health        │
│  (Work Queue - top 5)│ │  Readiness: 71/100     │
│  • Gate 2 approval   │ │  ██████████░░ 71%      │
│  • DLP config needed │ │  Risk: Medium          │
│  • Sprint 2 metrics  │ │  Timeline: On Track    │
│  [View All →]        │ │  Budget: Within        │
└──────────────────────┘ └────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Recent Activity Feed                            │
│  • Maria approved Gate 1 — 2 days ago            │
│  • David submitted Sprint 1 metrics — 3 days ago │
│  • System: Sandbox validation passed — 5 days ago│
└─────────────────────────────────────────────────┘
```

This gives every user — regardless of role — immediate answers to:
1. Where is the project overall? (Progress Tracker)
2. What do I need to do? (Work Queue)
3. Is the project healthy? (Health Panel)
4. What happened recently? (Activity Feed)

---

## Part 6: Detailed Changes by File

### Layout Changes (`src/app/(dashboard)/layout.tsx`)
1. Add `roles?: UserRole[]` to `NavItem` interface
2. Add role assignments to each nav item
3. Filter sections by `currentUser.role`
4. Reorganize from 10 sections → 6 sections
5. Add compact progress bar in sidebar footer
6. Collapse less-used items under expandable sub-sections

### New Files
- `src/components/features/work-queue/work-queue.tsx` — Work queue component
- `src/components/features/progress/project-progress-tracker.tsx` — Master progress tracker
- `src/lib/progress/calculator.ts` — Pure functions to compute phase completion percentages from existing data

### Modified Pages
- `src/app/(dashboard)/projects/[id]/overview/page.tsx` — Redesigned with progress tracker + work queue
- `src/app/(dashboard)/projects/[id]/discovery/readiness/page.tsx` — Fix `ds.score` → `ds.percentage` (Bug 1)
- `src/app/(dashboard)/projects/[id]/discovery/data-readiness/page.tsx` — Same scoring fix
- `src/app/(dashboard)/projects/[id]/timeline/gantt/page.tsx` — Add task CRUD UI (Bug 2)
- `src/app/(dashboard)/projects/[id]/poc/pilot-design/page.tsx` — Add missing CRUD sections (Bug 3)
- `src/app/(dashboard)/page.tsx` — Dashboard home: add per-project progress bars

---

## Implementation Phases

### Phase 1: Bug Fixes (Critical)
1. Fix readiness scoring display (ds.score → ds.percentage)
2. Fix data-readiness scoring display (same pattern)
3. Add task add/edit/delete UI to Gantt chart
4. Add Participant Criteria CRUD to Pilot Designer
5. Add Quantitative Metrics CRUD to Pilot Designer
6. Add Evidence input to Go/No-Go gates

### Phase 2: Navigation Overhaul
7. Reorganize sidebar from 10 → 6 sections
8. Add `roles` property to nav items
9. Implement role-based filtering in layout
10. Update section names and groupings

### Phase 3: Progress & Work Queue
11. Build progress calculator (`lib/progress/calculator.ts`)
12. Build ProjectProgressTracker component
13. Build WorkQueue component
14. Redesign project overview page with new layout
15. Add progress bars to dashboard project cards

### Phase 4: Polish
16. Add compact progress indicator to sidebar
17. Add role badge and greeting to top bar ("Welcome, Maria — Security Lead")
18. Test all role views render correctly
19. Ensure build passes with strict TypeScript

---

## What This Plan Does NOT Change
- No new database tables (all computed from existing data)
- No new API routes (work queue is client-computed initially)
- No changes to auth system (role already exists on User)
- No removal of any pages (just hidden from nav for certain roles)
- No changes to the scoring engine itself (it's correct; only the display is wrong)
- No changes to existing component library (shadcn components stay as-is)
