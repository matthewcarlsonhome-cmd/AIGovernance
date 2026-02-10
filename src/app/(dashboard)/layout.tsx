'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CommandPalette } from '@/components/shared/command-palette';
import {
  Shield,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  ClipboardList,
  Target,
  CheckSquare,
  FileText,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Settings,
  Code,
  CheckCircle,
  FlaskConical,
  Timer,
  GitCompare,
  TrendingUp,
  CalendarRange,
  Flag,
  FileOutput,
  History,
  Users,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  Calculator,
  Grid3X3,
  Calendar,
  DollarSign,
  Camera,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  Navigation data                                                    */
/* ------------------------------------------------------------------ */

const DEMO_PROJECT_ID = 'demo-1';
const p = (path: string) => `/projects/${DEMO_PROJECT_ID}${path}`;

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
];

const projectSections: NavSection[] = [
  {
    title: 'Discovery',
    items: [
      { label: 'Questionnaire', href: p('/discovery/questionnaire'), icon: ClipboardList },
      { label: 'Readiness', href: p('/discovery/readiness'), icon: Target },
      { label: 'Prerequisites', href: p('/discovery/prerequisites'), icon: CheckSquare },
    ],
  },
  {
    title: 'Governance',
    items: [
      { label: 'Policies', href: p('/governance/policies'), icon: FileText },
      { label: 'Gate Reviews', href: p('/governance/gates'), icon: ShieldCheck },
      { label: 'Compliance', href: p('/governance/compliance'), icon: Scale },
      { label: 'Risk', href: p('/governance/risk'), icon: AlertTriangle },
      { label: 'RACI Matrix', href: p('/governance/raci'), icon: Grid3X3 },
    ],
  },
  {
    title: 'Sandbox',
    items: [
      { label: 'Configure', href: p('/sandbox/configure'), icon: Settings },
      { label: 'Config Files', href: p('/sandbox/files'), icon: Code },
      { label: 'Validation', href: p('/sandbox/validate'), icon: CheckCircle },
    ],
  },
  {
    title: 'PoC',
    items: [
      { label: 'Projects', href: p('/poc/projects'), icon: FlaskConical },
      { label: 'Sprints', href: p('/poc/sprints'), icon: Timer },
      { label: 'Compare Tools', href: p('/poc/compare'), icon: GitCompare },
      { label: 'Metrics', href: p('/poc/metrics'), icon: TrendingUp },
    ],
  },
  {
    title: 'Timeline',
    items: [
      { label: 'Gantt Chart', href: p('/timeline/gantt'), icon: CalendarRange },
      { label: 'Milestones', href: p('/timeline/milestones'), icon: Flag },
      { label: 'Snapshots', href: p('/timeline/snapshots'), icon: Camera },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Generate', href: p('/reports/generate'), icon: FileOutput },
      { label: 'History', href: p('/reports/history'), icon: History },
    ],
  },
];

const projectOverviewItem: NavItem = {
  label: 'Overview',
  href: p('/overview'),
  icon: BarChart3,
};

const projectExtraItems: NavItem[] = [
  { label: 'ROI Calculator', href: p('/roi'), icon: DollarSign },
  { label: 'Meetings', href: p('/meetings'), icon: Calendar },
  { label: 'Team', href: p('/team'), icon: Users },
];

/* ------------------------------------------------------------------ */
/*  Sidebar nav link                                                   */
/* ------------------------------------------------------------------ */

function NavLink({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible section                                                */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  section,
  collapsed,
  pathname,
}: {
  section: NavSection;
  collapsed: boolean;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (collapsed) {
    return (
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
      >
        {section.title}
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
      {isOpen && (
        <div className="space-y-0.5 mt-0.5">
          {section.items.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top bar                                                            */
/* ------------------------------------------------------------------ */

function TopBar({ pathname }: { pathname: string }) {
  const getBreadcrumbs = (path: string): { label: string; href: string }[] => {
    if (path === '/') return [{ label: 'Dashboard', href: '/' }];
    const segments = path.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    let current = '';
    for (const seg of segments) {
      current += `/${seg}`;
      const label = seg
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      crumbs.push({ label, href: current });
    }
    return crumbs;
  };

  const crumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-400">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-slate-900">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-slate-900 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
            JS
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium leading-none">Jane Smith</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Main layout                                                        */
/* ------------------------------------------------------------------ */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ---- Sidebar ---- */}
      <aside
        className={cn(
          'flex flex-col border-r bg-white transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-14 items-center border-b px-4',
            collapsed ? 'justify-center' : 'gap-2'
          )}
        >
          <Shield className="h-6 w-6 shrink-0 text-slate-900" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              GovAI Studio
            </span>
          )}
        </div>

        {/* Scrollable nav region */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          {/* Main nav */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Main
              </p>
            )}
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
            ))}
          </div>

          <Separator />

          {/* Current Project */}
          <div className="space-y-3">
            {!collapsed && (
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Current Project
              </p>
            )}

            {/* Overview */}
            <NavLink item={projectOverviewItem} collapsed={collapsed} pathname={pathname} />

            {/* Sections */}
            {projectSections.map((section) => (
              <CollapsibleSection
                key={section.title}
                section={section}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))}

            {/* Extra items */}
            <Separator />
            {projectExtraItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
            ))}
          </div>
        </nav>

        {/* Bottom area */}
        <div className="border-t px-2 py-3 space-y-1">
          <NavLink
            item={{ label: 'Settings', href: '/settings', icon: Settings }}
            collapsed={collapsed}
            pathname={pathname}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full justify-start gap-3 text-slate-500',
              collapsed && 'justify-center px-2'
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* ---- Command Palette (Cmd+K) ---- */}
      <CommandPalette />

      {/* ---- Main content ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar pathname={pathname} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
