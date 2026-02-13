'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CommandPalette } from '@/components/shared/command-palette';
import type { UserRole } from '@/types';
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
  Radar,
  ClipboardCheck,
  GitBranch,
  ShieldAlert,
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
  Grid3X3,
  Calendar,
  DollarSign,
  Camera,
  Rocket,
  HelpCircle,
  Heart,
  BookOpen,
  Network,
  RefreshCw,
  Beaker,
  ListOrdered,
  PackageSearch,
  Activity,
  Layers,
  MessageSquare,
  Briefcase,
  Database,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** If set, item only visible to these roles. Undefined = visible to all. */
  roles?: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  Navigation data                                                    */
/* ------------------------------------------------------------------ */

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
];

/**
 * Reorganized navigation: 6 sections grouped by workflow phase.
 * Each item has optional `roles` for role-based filtering.
 */
function buildProjectSections(projectId: string): NavSection[] {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return [
    {
      title: 'Assess & Plan',
      items: [
        { label: 'Readiness Assessment', href: p('/discovery/readiness'), icon: Target, roles: ['admin', 'consultant', 'executive', 'it', 'engineering'] },
        { label: 'Questionnaire', href: p('/discovery/questionnaire'), icon: ClipboardList, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Data Readiness', href: p('/discovery/data-readiness'), icon: Database, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Prerequisites', href: p('/discovery/prerequisites'), icon: CheckSquare },
      ],
    },
    {
      title: 'Govern & Comply',
      items: [
        { label: 'Policies & Playbook', href: p('/governance/policies'), icon: FileText, roles: ['admin', 'consultant', 'legal', 'it'] },
        { label: 'Gate Reviews', href: p('/governance/gates'), icon: ShieldCheck },
        { label: 'Compliance', href: p('/governance/compliance'), icon: Scale, roles: ['admin', 'consultant', 'legal', 'it'] },
        { label: 'Risk Classification', href: p('/governance/risk'), icon: AlertTriangle, roles: ['admin', 'consultant', 'it', 'legal'] },
        { label: 'RACI Matrix', href: p('/governance/raci'), icon: Grid3X3, roles: ['admin', 'consultant'] },
        { label: 'Ethics & Data Flows', href: p('/governance/ethics'), icon: Heart, roles: ['admin', 'consultant', 'legal'] },
      ],
    },
    {
      title: 'Build & Test',
      items: [
        { label: 'Sandbox Setup', href: p('/sandbox/configure'), icon: Settings, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Sandbox Validation', href: p('/sandbox/validate'), icon: CheckCircle, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Pilot Designer', href: p('/poc/pilot-design'), icon: Beaker, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Sprint Tracker', href: p('/poc/sprints'), icon: Timer, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Tool Comparison', href: p('/poc/compare'), icon: GitCompare, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Agent Deployment', href: p('/agent-deployment/readiness'), icon: Radar, roles: ['admin', 'consultant', 'it', 'engineering'] },
      ],
    },
    {
      title: 'Track & Report',
      items: [
        { label: 'Timeline', href: p('/timeline/gantt'), icon: CalendarRange },
        { label: 'Milestones', href: p('/timeline/milestones'), icon: Flag },
        { label: 'ROI Calculator', href: p('/roi'), icon: DollarSign, roles: ['admin', 'consultant', 'executive'] },
        { label: 'Report Generator', href: p('/reports/generate'), icon: FileOutput },
        { label: 'Meeting Notes', href: p('/meetings'), icon: Calendar },
      ],
    },
    {
      title: 'Team & Change',
      items: [
        { label: 'Team Members', href: p('/team'), icon: Users },
        { label: 'Change Management', href: p('/change-management'), icon: RefreshCw, roles: ['admin', 'consultant', 'marketing'] },
        { label: 'Communications', href: p('/reports/communications'), icon: MessageSquare, roles: ['admin', 'consultant', 'marketing'] },
        { label: 'Monitoring', href: p('/monitoring'), icon: Activity, roles: ['admin', 'consultant', 'it', 'engineering'] },
      ],
    },
  ];
}

function buildProjectItems(projectId: string) {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return {
    setupItem: { label: 'Setup Guide', href: p('/setup'), icon: Rocket } as NavItem,
    overviewItem: { label: 'Overview', href: p('/overview'), icon: BarChart3 } as NavItem,
  };
}

/** Extract the project ID from the current URL pathname, if present. */
function extractProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  if (!match) return null;
  const id = match[1];
  // Exclude "new" — that's the create-project page, not a real project
  if (id === 'new') return null;
  return id;
}

/** Filter nav sections by user role */
function filterSectionsByRole(sections: NavSection[], role: UserRole | undefined): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        !item.roles || (role && item.roles.includes(role))
      ),
    }))
    .filter((section) => section.items.length > 0);
}

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
  // Auto-expand if any child is active
  const hasActiveChild = section.items.some((item) => pathname === item.href);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

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
        <span className="flex items-center gap-1.5">
          {section.title}
          <span className="text-[10px] font-normal text-slate-300">
            ({section.items.length})
          </span>
        </span>
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  consultant: 'Consultant',
  executive: 'Executive',
  it: 'IT / Security',
  legal: 'Legal / Compliance',
  engineering: 'Engineering',
  marketing: 'Marketing / Comms',
};

function TopBar({ pathname }: { pathname: string }) {
  const { data: currentUser } = useCurrentUser();

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

  const displayName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'User';
  const displayRole = currentUser?.role
    ? ROLE_LABELS[currentUser.role]
    : '';
  const initials = getInitials(displayName);

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
            {initials}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium leading-none">{displayName}</p>
            {displayRole && (
              <p className="text-xs text-slate-500">{displayRole}</p>
            )}
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
  const { data: currentUser } = useCurrentUser();
  const projectId = extractProjectId(pathname);

  // Build project-scoped nav only when viewing a real project
  const allSections = projectId ? buildProjectSections(projectId) : [];
  // Filter by user role — admin and consultant see everything
  const projectSections = filterSectionsByRole(allSections, currentUser?.role);
  const projectNav = projectId ? buildProjectItems(projectId) : null;

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
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
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

          {projectNav && (
            <>
              <Separator />

              {/* Current Project */}
              <div className="space-y-2">
                {!collapsed && (
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Current Project
                  </p>
                )}

                {/* Overview (always visible) */}
                <NavLink item={projectNav.overviewItem} collapsed={collapsed} pathname={pathname} />

                {/* Setup Guide */}
                <NavLink item={projectNav.setupItem} collapsed={collapsed} pathname={pathname} />

                {/* Sections — role-filtered */}
                {projectSections.map((section) => (
                  <CollapsibleSection
                    key={section.title}
                    section={section}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                ))}
              </div>
            </>
          )}

          {!projectNav && (
            <>
              <Separator />
              {!collapsed && (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-slate-400">
                    Select a project to see navigation options
                  </p>
                  <Link href="/projects" className="text-xs text-slate-600 hover:text-slate-900 underline mt-1 inline-block">
                    View Projects
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Bottom area */}
        <div className="border-t px-2 py-3 space-y-1">
          <NavLink
            item={{ label: 'Help & Guide', href: '/help', icon: HelpCircle }}
            collapsed={collapsed}
            pathname={pathname}
          />
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
