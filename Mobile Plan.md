# Mobile Responsiveness Plan — GovAI Studio

## Problem Summary

The app is **desktop-first with no mobile breakpoint strategy for the shell layout**. The sidebar is always visible (224px expanded / 56px collapsed), which on a 375px phone leaves only ~150–320px for content — making the app unusable on mobile. Several overlay components (notifications, help panel, command palette) also use fixed widths that exceed mobile viewports.

Individual page grids (cards, stats) already collapse to single columns via Tailwind breakpoints, so the **content inside pages is mostly fine** — the core blocker is the sidebar + shell chrome.

---

## Proposed Solution

### 1. Responsive Sidebar → Off-Canvas Drawer (Critical)

**File:** `src/app/(dashboard)/layout.tsx`

- **Desktop (md and up, ≥768px):** Sidebar stays exactly as-is — persistent, collapsible.
- **Mobile (<768px):** Sidebar is **hidden by default**. A hamburger button appears in the top bar. Tapping it opens the sidebar as a slide-out drawer using the existing shadcn `<Sheet>` component (already installed, side="left"). Tapping a nav link or the overlay closes the drawer automatically.

**Changes:**
- Add `isMobile` state derived from a `useMediaQuery(768)` hook (or `window.matchMedia`)
- Wrap sidebar JSX in a conditional: on desktop render inline; on mobile render inside `<Sheet side="left">`
- Add a hamburger `<Button>` to the top bar, visible only below `md:`
- Hide the desktop sidebar with `hidden md:flex` on the outer wrapper
- Auto-close the Sheet on route change (listen to `usePathname()`)

### 2. Top Bar Adjustments (High)

**File:** `src/app/(dashboard)/layout.tsx`

- Show hamburger icon (`Menu` from lucide-react) on the left side of the top bar, `md:hidden`
- Reduce breadcrumb segments on mobile — show only the current page name, not the full trail
- Ensure notification bell + user avatar remain accessible (they already are)

### 3. Main Content Padding (Medium)

**File:** `src/app/(dashboard)/layout.tsx`

- Change `px-8 py-6 lg:px-10` → `px-4 py-4 sm:px-6 sm:py-6 lg:px-10`
- This gives mobile screens tighter padding so content has more room

### 4. Notification Center Dropdown (High)

**File:** `src/components/shared/notification-center.tsx`

- Change fixed `w-[360px]` → `w-[calc(100vw-2rem)] sm:w-[360px]`
- On mobile, dropdown spans nearly full width with 1rem margin on each side
- Add `right-0 sm:right-0` positioning to keep it anchored to the bell icon

### 5. Contextual Help Panel (High)

**File:** `src/components/shared/contextual-help.tsx`

- **Desktop:** Keep the current fixed `w-80` side panel
- **Mobile:** Render as a shadcn `<Sheet side="bottom">` (bottom sheet) instead of a fixed side panel
- Use the same `useMediaQuery` hook to switch between rendering modes

### 6. Command Palette Dialog (Medium)

**File:** `src/components/shared/command-palette.tsx`

- Add responsive width: `max-w-[calc(100vw-2rem)] sm:max-w-lg`
- Hide keyboard shortcut hints on mobile (`hidden sm:inline-flex` — partially done already)

### 7. Gantt Chart Mobile Fallback (Medium)

**File:** `src/app/(dashboard)/projects/[id]/timeline/gantt/page.tsx`

- On mobile (<768px), hide the fixed 300px left task-list panel and show only the scrollable timeline
- Add a toggle button to show/hide the task list as an overlay on mobile
- Alternatively, stack them vertically: task list on top, timeline below with horizontal scroll
- The Gantt is inherently a wide-format visualization — a horizontal scroll indicator and pinch-to-zoom hint is acceptable on mobile

### 8. Dialog/Modal Width Guards (Low)

**Across multiple files using shadcn Dialog**

- Audit dialogs that use `max-w-lg` or wider and add `max-w-[calc(100vw-2rem)]` as a floor
- This is a one-line Tailwind class addition per dialog, prevents viewport overflow

---

## Implementation Order

| Step | Scope | Files Changed | Impact |
|------|-------|---------------|--------|
| 1 | Sidebar drawer + hamburger | `layout.tsx` + new `useMediaQuery` hook | Unblocks all mobile usage |
| 2 | Top bar adjustments | `layout.tsx` | Cleaner mobile header |
| 3 | Content padding | `layout.tsx` | More breathing room |
| 4 | Notification dropdown | `notification-center.tsx` | Fixes overflow |
| 5 | Help panel → bottom sheet | `contextual-help.tsx` | Fixes overlap |
| 6 | Command palette width | `command-palette.tsx` | Fixes overflow |
| 7 | Gantt mobile fallback | `gantt/page.tsx` | Improves complex page |
| 8 | Dialog width audit | Multiple files | Polish |

---

## What Does NOT Change

- No new packages — uses existing shadcn `Sheet`, Tailwind breakpoints, and native `matchMedia`
- No design system changes — same colors, typography, spacing scale
- No navigation restructure — same phase-based nav, just rendered differently on mobile
- Desktop experience is 100% unchanged
- No changes to API routes, data layer, or business logic

---

## New Files

| File | Purpose |
|------|---------|
| `src/hooks/use-media-query.ts` | Reusable `useMediaQuery` hook (~15 lines) |

---

## Estimated Scope

~8 files modified, 1 new hook file. The sidebar drawer (step 1) is the biggest change and delivers ~80% of the mobile improvement on its own. Steps 4–8 are incremental polish.
