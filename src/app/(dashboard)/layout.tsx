'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CommandPalette } from '@/components/shared/command-palette';
import type { UserRole } from '@/types';
import { buildDemoProgress } from '@/lib/progress/calculator';
import { CompactProgressBar } from '@/components/features/progress/project-progress-tracker';
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
  CheckCircle,
  Timer,
  GitCompare,
  CalendarRange,
  Flag,
  FileOutput,
  Users,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  DollarSign,
  Rocket,
  HelpCircle,
  Heart,
  RefreshCw,
  Beaker,
  MessageSquare,
  Database,
  Zap,
  UserCog,
  Activity,
  Briefcase,
  History,
  Network,
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
/*  Role override from settings                                        */
/* ------------------------------------------------------------------ */

function useRoleOverride(): UserRole | null {
  const [override, setOverride] = useState<UserRole | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('govai_user_role_override');
      if (saved) setOverride(saved as UserRole);
    } catch { /* ignore */ }

    const handler = () => {
      try {
        const saved = localStorage.getItem('govai_user_role_override');
        setOverride(saved ? (saved as UserRole) : null);
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', handler);
    // Also listen for custom event from settings page
    window.addEventListener('govai-role-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('govai-role-change', handler);
    };
  }, []);
  return override;
}

/* ------------------------------------------------------------------ */
/*  Navigation data                                                    */
/* ------------------------------------------------------------------ */

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Portfolio Posture', href: '/portfolio', icon: Shield, roles: ['admin', 'consultant', 'executive'] },
  { label: 'Portfolio Heatmap', href: '/portfolio/heatmap', icon: Grid3X3, roles: ['admin', 'consultant', 'executive'] },
];

/**
 * Navigation restructured to 6-area Information Architecture.
 * Areas: Home (mainNavItems), Pilot Setup, Governance,
 * Build & Validate, Launch & Monitor, Reports.
 * Each item has optional `roles` for role-based filtering.
 */
function buildProjectSections(projectId: string): NavSection[] {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return [
    {
      title: 'Workspaces',
      items: [
        { label: 'Plan', href: p('/plan'), icon: Target },
        { label: 'Govern', href: p('/govern'), icon: ShieldCheck },
        { label: 'Execute', href: p('/execute'), icon: Rocket },
        { label: 'Decide', href: p('/decide'), icon: Scale },
        { label: 'Workflow', href: p('/workflow'), icon: RefreshCw },
        { label: 'Action Queue', href: p('/action-queue'), icon: ClipboardList },
      ],
    },
    {
      title: 'Pilot Setup',
      items: [
        { label: 'Intake Scorecard', href: p('/intake'), icon: ClipboardList },
        { label: 'Pilot Wizard', href: p('/pilot-setup'), icon: Zap },
        { label: 'Setup Guide', href: p('/setup'), icon: Rocket },
        { label: 'Pilot Designer', href: p('/poc/pilot-design'), icon: Beaker, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Prerequisites', href: p('/discovery/prerequisites'), icon: CheckSquare },
      ],
    },
    {
      title: 'Governance',
      items: [
        { label: 'Control Center', href: p('/controls'), icon: Shield },
        { label: 'Policies', href: p('/governance/policies'), icon: FileText, roles: ['admin', 'consultant', 'legal', 'it'] },
        { label: 'Gate Reviews', href: p('/governance/gates'), icon: ShieldCheck },
        { label: 'Compliance', href: p('/governance/compliance'), icon: Scale, roles: ['admin', 'consultant', 'legal', 'it'] },
        { label: 'Risk', href: p('/governance/risk'), icon: AlertTriangle, roles: ['admin', 'consultant', 'it', 'legal'] },
        { label: 'Exceptions', href: p('/governance/exceptions'), icon: AlertTriangle, roles: ['admin', 'consultant', 'it', 'legal'] },
        { label: 'RACI', href: p('/governance/raci'), icon: Grid3X3, roles: ['admin', 'consultant'] },
        { label: 'Ethics & Data Flows', href: p('/governance/ethics'), icon: Heart, roles: ['admin', 'consultant', 'legal'] },
        { label: 'Data Classification', href: p('/governance/data-classification'), icon: Database, roles: ['admin', 'consultant', 'it', 'legal'] },
        { label: 'Security Controls', href: p('/governance/security-controls'), icon: ShieldCheck, roles: ['admin', 'consultant', 'it'] },
      ],
    },
    {
      title: 'Build & Validate',
      items: [
        { label: 'Sandbox Setup', href: p('/sandbox/configure'), icon: Settings, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Sandbox Validation', href: p('/sandbox/validate'), icon: CheckCircle, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Sprint Tracker', href: p('/poc/sprints'), icon: Timer, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Tool Comparison', href: p('/poc/compare'), icon: GitCompare, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Agent Deployment', href: p('/agent-deployment/readiness'), icon: Radar, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Architecture', href: p('/sandbox/architecture'), icon: Network, roles: ['admin', 'consultant', 'it', 'engineering'] },
      ],
    },
    {
      title: 'Launch & Monitor',
      items: [
        { label: 'Timeline', href: p('/timeline/gantt'), icon: CalendarRange },
        { label: 'Milestones', href: p('/timeline/milestones'), icon: Flag },
        { label: 'ROI Calculator', href: p('/roi'), icon: DollarSign, roles: ['admin', 'consultant', 'executive'] },
        { label: 'KPI Metrics', href: p('/metrics'), icon: BarChart3, roles: ['admin', 'consultant', 'executive'] },
        { label: 'Monitoring', href: p('/monitoring'), icon: Activity, roles: ['admin', 'consultant', 'it'] },
        { label: 'Security Dashboard', href: p('/monitoring/security'), icon: Shield, roles: ['admin', 'consultant', 'it'] },
      ],
    },
    {
      title: 'Reports & Decisions',
      items: [
        { label: 'Decision Hub', href: p('/decision-hub'), icon: Scale },
        { label: 'Executive Brief', href: p('/executive-brief'), icon: Briefcase },
        { label: 'Outcome Metrics', href: p('/outcomes'), icon: Target },
        { label: 'Report Generator', href: p('/reports/generate'), icon: FileOutput },
        { label: 'Report History', href: p('/reports/history'), icon: History },
        { label: 'Client Brief', href: p('/reports/client-brief'), icon: Briefcase },
        { label: 'Communications', href: p('/reports/communications'), icon: MessageSquare, roles: ['admin', 'consultant', 'marketing'] },
        { label: 'Evidence Packages', href: p('/reports/evidence'), icon: FileOutput, roles: ['admin', 'consultant', 'legal'] },
      ],
    },
  ];
}

function buildProjectItems(projectId: string) {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return {
    overviewItem: { label: 'Overview', href: p('/overview'), icon: BarChart3 } as NavItem,
  };
}

/** Extract the project ID from the current URL pathname, if present. */
function extractProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  if (!match) return null;
  const id = match[1];
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
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-slate-900 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-0.5',
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
  admin: 'Grand Architect',
  consultant: 'Strategy Wizard',
  executive: 'Decision Maker',
  it: 'Security Guardian',
  legal: 'Compliance Sage',
  engineering: 'Code Captain',
  marketing: 'Story Crafter',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-violet-600',
  consultant: 'bg-blue-600',
  executive: 'bg-amber-600',
  it: 'bg-emerald-600',
  legal: 'bg-rose-600',
  engineering: 'bg-cyan-600',
  marketing: 'bg-pink-600',
};

function TopBar({ pathname, effectiveRole }: { pathname: string; effectiveRole: UserRole | undefined }) {
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

  const displayName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Team Member';
  const role = effectiveRole || currentUser?.role;
  const displayRole = role ? ROLE_LABELS[role] : '';
  const roleColor = role ? ROLE_COLORS[role] : 'bg-slate-600';
  const initials = getInitials(displayName);

  // Time-based greeting with personality
  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Burning the midnight oil?' : hour < 12 ? 'Good morning, champion' : hour < 17 ? 'Afternoon hustle mode' : hour < 21 ? 'Evening shift activated' : 'Night owl energy';

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
        <div className="hidden sm:block text-right text-sm mr-2">
          <p className="text-xs text-slate-400">{greeting}</p>
          <p className="font-medium leading-none text-slate-900">{displayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-semibold transition-all',
            roleColor
          )}>
            {initials}
          </div>
          {displayRole && (
            <span className={cn(
              'hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white',
              roleColor
            )}>
              {displayRole}
            </span>
          )}
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
  const roleOverride = useRoleOverride();
  const projectId = extractProjectId(pathname);

  // Effective role: override from settings > user's actual role
  const effectiveRole = roleOverride || currentUser?.role;

  // Build project-scoped nav only when viewing a real project
  const allSections = projectId ? buildProjectSections(projectId) : [];
  // Filter by effective role
  const projectSections = filterSectionsByRole(allSections, effectiveRole);
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
          <div className="relative">
            <Shield className="h-6 w-6 shrink-0 text-slate-900" />
            <Zap className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold tracking-tight">
                GovAI Studio
              </span>
              <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide">govern boldly</p>
            </div>
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

                <NavLink item={projectNav.overviewItem} collapsed={collapsed} pathname={pathname} />

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
                <div className="px-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <FolderKanban className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">
                    Pick your adventure
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Select a project to unlock its full toolkit
                  </p>
                  <Link href="/projects" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    Explore Projects
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Bottom area */}
        <div className="border-t px-2 py-3 space-y-1">
          {/* Compact progress indicator when viewing a project */}
          {!collapsed && projectId && (
            <CompactProgressBar progress={buildDemoProgress()} />
          )}
          {/* Role indicator when not collapsed */}
          {!collapsed && effectiveRole && (
            <div className="px-3 py-2 mb-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className={cn('w-2 h-2 rounded-full', ROLE_COLORS[effectiveRole])} />
                <span>Viewing as <strong className="text-slate-700">{ROLE_LABELS[effectiveRole]}</strong></span>
              </div>
              {roleOverride && (
                <p className="text-[10px] text-amber-600 mt-0.5 pl-4">Role preview active</p>
              )}
            </div>
          )}
          <NavLink
            item={{ label: 'Help & Guide', href: '/help', icon: HelpCircle }}
            collapsed={collapsed}
            pathname={pathname}
          />
          <NavLink
            item={{ label: 'Admin & Settings', href: '/settings', icon: UserCog }}
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
                <span className="text-sm">Tuck away</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* ---- Command Palette (Cmd+K) ---- */}
      <CommandPalette />

      {/* ---- Main content ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar pathname={pathname} effectiveRole={effectiveRole} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
