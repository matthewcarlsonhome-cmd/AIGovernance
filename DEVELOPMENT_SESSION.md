# GovAI Studio - Development Session Insights

> **Purpose:** Upload this file at the start of each Claude Code development session to maintain
> context, avoid repeating mistakes, and accelerate coding velocity.
>
> **Last Updated:** 2026-02-09 (Session 1 - Initial Scaffold)

---

## Session History

### Session 1 (Feb 9, 2026) - Initial Project Scaffold
- **Goal:** Bootstrap full Next.js 15 application from CLAUDE.md + design spec
- **Outcome:** Complete scaffold with 60+ source files, all routes, UI components, and demo data
- **Key Decision:** Used demo/mock data inline in each page component rather than requiring Supabase connection for first demo

---

## Critical Errors Encountered & Fixes

### 1. Google Fonts Fail in Sandboxed/Offline Environments
- **Error:** `Failed to fetch 'Geist' from Google Fonts` - Turbopack build fails
- **Root Cause:** `next/font/google` requires network access at build time; sandboxed CI/dev environments have no internet
- **Fix:** Replace Google Fonts import with system font stack:
  ```tsx
  // BAD - breaks without internet
  import { Geist, Geist_Mono } from 'next/font/google';

  // GOOD - works everywhere
  // In layout.tsx: remove font imports, use className="antialiased font-sans"
  // In globals.css @theme inline:
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  ```
- **Alternative:** If local font files are available, use `next/font/local` pointing to `.woff` files in `src/app/fonts/`
- **Prevention:** Always check if build environment has network access before using Google Fonts

### 2. TypeScript `filter(Boolean)` Does Not Narrow Types
- **Error:** `Type 'string | false' is not assignable to type 'Key | null | undefined'`
- **Root Cause:** `[expr && 'string'].filter(Boolean)` produces `(string | false)[]` - TypeScript doesn't narrow through `filter(Boolean)`
- **Fix:** Use a type guard instead:
  ```tsx
  // BAD
  const list = [condition && 'value'].filter(Boolean);

  // GOOD
  const list = [condition && 'value'].filter((v): v is string => Boolean(v));
  ```
- **Prevention:** Always use explicit type guards with `.filter()` when the source array contains union types

### 3. shadcn/ui Registry Auth Failures
- **Error:** `You are not authorized to access the item at https://ui.shadcn.com/r/styles/new-york-v4/index.json`
- **Root Cause:** shadcn CLI `npx shadcn@latest add` requires authenticated access to the component registry; can fail in CI or sandboxed environments
- **Fix:** Write UI components manually instead of using the shadcn CLI. All components follow the same patterns:
  - Use `class-variance-authority` (cva) for variant props
  - Use `cn()` from `@/lib/utils` for class merging
  - Use `React.forwardRef` for input-like components
  - Named exports only (no default exports)
- **Prevention:** For greenfield projects in restricted environments, plan to write shadcn-compatible components manually

### 4. Tailwind CSS 4 Syntax Differences
- **Issue:** Tailwind CSS 4 uses `@import "tailwindcss"` instead of `@tailwind base/components/utilities`
- **Issue:** Color theming requires `@theme inline { }` block to map CSS variables to Tailwind utilities
- **Pattern:** CSS variable colors use HSL values WITHOUT `hsl()` wrapper in `:root`, then wrapped in `@theme inline`:
  ```css
  @layer base {
    :root { --primary: 240 5.9% 10%; }   /* raw HSL values */
  }
  @theme inline {
    --color-primary: hsl(var(--primary));  /* wrapped for Tailwind */
  }
  ```

---

## Architecture Patterns That Work

### Page Component Pattern (Use This)
```tsx
'use client';

import { useState } from 'react';
import { IconName } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Inline demo data - no external dependencies needed for demo
const DEMO_DATA = [ ... ];

export default function FeaturePage() {
  const [state, setState] = useState(initialValue);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page Title</h1>
        <Button>Action</Button>
      </div>
      {/* Content */}
    </div>
  );
}
```

### Dashboard Layout Pattern
- Collapsible sidebar (256px open, 64px collapsed) with border-right
- Navigation grouped by sections with small uppercase headers
- Active item highlighted with primary background
- Main content area with top header bar showing breadcrumbs + user menu
- Uses `usePathname()` from `next/navigation` for active state

### Demo Data Strategy
- Each page includes its own demo data as constants (`const DEMO_ITEMS = [...]`)
- This makes pages self-contained and independently demoable
- When Supabase is connected later, replace constants with `useQuery()` hooks
- Score engine and config generators work as pure functions with no DB dependency

---

## Patterns We Discarded (Do NOT Use)

### 1. Radix UI Primitives for Base Components
- **Why Discarded:** Cannot install Radix packages in all environments; adds unnecessary bundle weight for MVP
- **Use Instead:** Native HTML elements styled with Tailwind. For complex components (Dialog, Dropdown), use simple `useState` open/close patterns

### 2. Server Components for Interactive Pages
- **Why Discarded:** Nearly every feature page needs interactivity (forms, toggles, wizards, expandable sections)
- **Use Instead:** `'use client'` on all feature pages. Server Components only for static content like the dashboard home overview

### 3. Importing Shared Question Data Across Pages
- **Why Discarded:** Module resolution issues during build when questionnaire page imports from `@/lib/scoring/questions`
- **Use Instead:** Inline question data in the questionnaire page, or ensure the questions module has no side effects and exports plain arrays

### 4. Complex State Management for Demo
- **Why Discarded:** Zustand stores add complexity when demo data doesn't need persistence
- **Use Instead:** Local `useState` in each page for demo. Connect Zustand when real data flows exist

---

## Platform-Specific Notes

### Next.js 16.x (current)
- Uses Turbopack by default for builds
- `next/font/google` breaks without network (see Error #1)
- Route groups `(auth)` and `(dashboard)` work for layout separation
- Dynamic routes `[id]` receive params as `Promise<{ id: string }>` in Next.js 15+ - await them or use `use()`:
  ```tsx
  // Next.js 15+ pattern for dynamic params
  export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    // or in async server components: const { id } = await params;
  }
  ```

### Tailwind CSS 4
- Import: `@import "tailwindcss"` (not the v3 directives)
- Theme extension uses `@theme inline { }` block
- `@apply` still works inside `@layer base { }`
- Color utilities like `bg-primary` map to `--color-primary` in `@theme inline`
- Border color defaults: `* { @apply border-border; }` in base layer

### shadcn/ui Component Conventions
- All components: named exports, no default exports
- Variant components use `cva()` from `class-variance-authority`
- All class merging through `cn()` (clsx + tailwind-merge)
- Interactive components need `'use client'` directive
- Components expect HSL CSS variable colors (e.g., `bg-primary` = `hsl(var(--primary))`)

---

## File Structure Reference

```
src/
  app/
    layout.tsx              # Root layout (system fonts, no Google Fonts)
    globals.css             # Tailwind v4 + CSS variable theme
    (auth)/                 # Auth routes (login, register, forgot-password)
      layout.tsx            # Centered layout with gradient background
    (dashboard)/            # Protected routes with sidebar
      layout.tsx            # Sidebar + topbar layout (use client)
      page.tsx              # Dashboard home with project cards
      projects/
        new/page.tsx        # 3-step project wizard
        [id]/               # Dynamic project routes (25+ sub-pages)
      settings/page.tsx     # Org settings with tabs
  components/
    ui/                     # 24 shadcn-style base components
  lib/
    utils.ts                # cn() utility
    supabase/               # Client + server Supabase setup
    scoring/                # Feasibility engine + question bank
    config-gen/             # Sandbox config file generators
  types/index.ts            # All TypeScript interfaces
  stores/                   # Zustand stores (project, assessment)
```

---

## Supabase Integration Checklist (For When You Connect)

When connecting a real Supabase instance:

1. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Run database migrations for all tables (see CLAUDE.md schema section)

3. Enable RLS on all tables with organization-scoped policies

4. Replace inline demo data with `useQuery()` / server-side Supabase calls

5. Wire up auth flows in login/register pages using `supabase.auth.signInWithPassword()`

6. Add middleware.ts for auth protection on `(dashboard)` routes

---

## Performance & Build Notes

- Build time: ~3-4 seconds with Turbopack (after font fix)
- Total source files: ~65 TypeScript/TSX files
- No external API calls needed for demo - everything works with inline data
- All pages render independently - no cross-page state dependencies for demo

---

## Next Session Priorities

1. Run full build and fix any remaining TypeScript errors
2. Build remaining empty API route stubs
3. Add `loading.tsx` and `error.tsx` files per route segment
4. Wire Recharts radar chart into readiness assessment page
5. Add Supabase database migration files
6. Implement real auth flow with Supabase Auth
7. Connect Zustand stores to Supabase real-time subscriptions
8. Add form validation with Zod + react-hook-form on all forms

---

## Quick Commands

```bash
# Build (verify no errors)
npx next build

# Dev server
npx next dev

# TypeScript check only (faster than full build)
npx tsc --noEmit

# Find empty route directories (missing pages)
find src/app -type d -empty

# Count source files
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l
```
