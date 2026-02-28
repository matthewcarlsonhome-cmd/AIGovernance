'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser, useSignOut } from '@/hooks/use-auth';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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
  CheckCircle,
  Timer,
  GitCompare,
  Users,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  DollarSign,
  HelpCircle,
  Heart,
  Beaker,
  Database,
  Activity,
  Briefcase,
  Circle,
  Radar,
  FileOutput,
  Flag,
  LogOut,
  Menu,
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

type PhaseStatus = 'complete' | 'active' | 'not_started';

interface PhaseNavSection {
  phase: number;
  title: string;
  status: PhaseStatus;
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
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Project Administrator',
  consultant: 'Governance Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

/* ------------------------------------------------------------------ */
/*  Navigation data                                                    */
/* ------------------------------------------------------------------ */

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
];

function buildProjectTopItems(projectId: string): NavItem[] {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return [
    { label: 'Overview', href: p('/overview'), icon: BarChart3 },
    { label: 'My Tasks', href: p('/my-tasks'), icon: ClipboardList },
    { label: 'Project Plan', href: p('/project-plan'), icon: Flag },
    { label: 'Project Risks', href: p('/risks'), icon: AlertTriangle },
  ];
}

/**
 * Compute phase status based on which phase is currently active.
 * Phases before the active one are 'complete', the active one is 'active',
 * and everything after is 'locked'.
 */
function phaseStatus(phaseNumber: number, activePhase: number): PhaseStatus {
  if (phaseNumber < activePhase) return 'complete';
  if (phaseNumber === activePhase) return 'active';
  return 'not_started';
}

function buildProjectPhases(projectId: string, activePhase: number): PhaseNavSection[] {
  const p = (path: string) => `/projects/${projectId}${path}`;
  return [
    {
      phase: 1,
      title: 'Scope & Assess',
      status: phaseStatus(1, activePhase),
      items: [
        { label: 'Intake Scorecard', href: p('/intake'), icon: ClipboardList },
        { label: 'Discovery Questionnaire', href: p('/discovery/questionnaire'), icon: FileText },
        { label: 'Readiness Assessment', href: p('/discovery/readiness'), icon: Radar },
        { label: 'Prerequisites', href: p('/discovery/prerequisites'), icon: CheckSquare },
        { label: 'Team', href: p('/team'), icon: Users },
      ],
    },
    {
      phase: 2,
      title: 'Classify & Govern',
      status: phaseStatus(2, activePhase),
      items: [
        { label: 'Data Classification', href: p('/governance/data-classification'), icon: Database, roles: ['admin', 'consultant', 'it', 'legal'] },
        { label: 'Policies', href: p('/governance/policies'), icon: FileText, roles: ['admin', 'consultant', 'legal', 'it'] },
        { label: 'Compliance', href: p('/governance/compliance'), icon: Scale, roles: ['admin', 'consultant', 'legal', 'it'] },
        { label: 'Risk Register', href: p('/governance/risk'), icon: AlertTriangle, roles: ['admin', 'consultant', 'it', 'legal'] },
        { label: 'RACI Matrix', href: p('/governance/raci'), icon: Grid3X3, roles: ['admin', 'consultant'] },
        { label: 'Ethics Review', href: p('/governance/ethics'), icon: Heart, roles: ['admin', 'consultant', 'legal'] },
        { label: 'Security Controls', href: p('/governance/security-controls'), icon: ShieldCheck, roles: ['admin', 'consultant', 'it'] },
      ],
    },
    {
      phase: 3,
      title: 'Approve & Gate',
      status: phaseStatus(3, activePhase),
      items: [
        { label: 'Gate Reviews', href: p('/governance/gates'), icon: ShieldCheck },
        { label: 'Evidence Packages', href: p('/reports/evidence'), icon: FileOutput, roles: ['admin', 'consultant', 'legal'] },
        { label: 'Exceptions', href: p('/governance/exceptions'), icon: AlertTriangle, roles: ['admin', 'consultant', 'it', 'legal'] },
        { label: 'Control Center', href: p('/controls'), icon: Shield },
      ],
    },
    {
      phase: 4,
      title: 'Build & Test',
      status: phaseStatus(4, activePhase),
      items: [
        { label: 'Sandbox Setup', href: p('/sandbox/configure'), icon: Settings, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Sandbox Validation', href: p('/sandbox/validate'), icon: CheckCircle, roles: ['admin', 'consultant', 'it', 'engineering'] },
        { label: 'Pilot Design', href: p('/poc/pilot-design'), icon: Beaker, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Sprint Tracker', href: p('/poc/sprints'), icon: Timer, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Tool Comparison', href: p('/poc/compare'), icon: GitCompare, roles: ['admin', 'consultant', 'engineering'] },
        { label: 'Monitoring', href: p('/monitoring'), icon: Activity, roles: ['admin', 'consultant', 'it'] },
      ],
    },
    {
      phase: 5,
      title: 'Evaluate & Decide',
      status: phaseStatus(5, activePhase),
      items: [
        { label: 'Outcome Metrics', href: p('/outcomes'), icon: Target },
        { label: 'Decision Hub', href: p('/decision-hub'), icon: Scale },
        { label: 'Executive Brief', href: p('/executive-brief'), icon: Briefcase },
        { label: 'ROI Calculator', href: p('/roi'), icon: DollarSign, roles: ['admin', 'consultant', 'executive'] },
        { label: 'Report Generator', href: p('/reports/generate'), icon: FileOutput },
        { label: 'Action Queue', href: p('/action-queue'), icon: ClipboardList },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Active phase tracking (per project, stored in localStorage)        */
/* ------------------------------------------------------------------ */

/**
 * Read and write the active phase for a project.
 * Phase 1 = Scope & Assess, Phase 5 = Evaluate & Decide.
 * New projects start at Phase 1.
 */
function useActivePhase(projectId: string | null): {
  activePhase: number;
  advancePhase: () => void;
} {
  const storageKey = projectId ? `govai_project_phase_${projectId}` : null;
  const [activePhase, setActivePhase] = useState(1);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 5) setActivePhase(parsed);
      }
    } catch { /* localStorage unavailable */ }

    // Listen for phase-advance events from other components
    const handler = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (parsed >= 1 && parsed <= 5) setActivePhase(parsed);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('govai-phase-advance', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('govai-phase-advance', handler);
      window.removeEventListener('storage', handler);
    };
  }, [storageKey]);

  const advancePhase = () => {
    if (!storageKey) return;
    const next = Math.min(activePhase + 1, 5);
    setActivePhase(next);
    try {
      localStorage.setItem(storageKey, String(next));
      window.dispatchEvent(new Event('govai-phase-advance'));
    } catch { /* ignore */ }
  };

  return { activePhase, advancePhase };
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

/** Extract the project ID from the current URL pathname, if present. */
function extractProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  if (!match) return null;
  const id = match[1];
  if (id === 'new') return null;
  return id;
}

/** Filter phase sections by user role, removing items the role cannot see. */
function filterPhasesByRole(
  phases: PhaseNavSection[],
  role: UserRole | undefined,
): PhaseNavSection[] {
  return phases
    .map((phase) => ({
      ...phase,
      items: phase.items.filter(
        (item) => !item.roles || (role && item.roles.includes(role)),
      ),
    }))
    .filter((phase) => phase.items.length > 0);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter((v): v is string => Boolean(v))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav link                                                   */
/* ------------------------------------------------------------------ */

function NavLink({
  item,
  collapsed,
  pathname,
  dimmed = false,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  dimmed?: boolean;
  onNavigate?: () => void;
}): React.ReactElement {
  const Icon = item.icon;
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-slate-900 text-white shadow-sm'
          : dimmed
            ? 'text-slate-400 hover:bg-slate-50 hover:text-slate-500'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-0.5',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', dimmed && !isActive && 'opacity-50')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase section (collapsible with status indicator)                   */
/* ------------------------------------------------------------------ */

const PHASE_STATUS_CONFIG: Record<
  PhaseStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  complete: { icon: CheckCircle, label: 'Complete', color: 'text-emerald-500' },
  active: { icon: Circle, label: 'In Progress', color: 'text-blue-500' },
  not_started: { icon: Circle, label: 'Not Started', color: 'text-slate-400' },
};

function PhaseSection({
  phase,
  collapsed: sidebarCollapsed,
  pathname,
  onNavigate,
}: {
  phase: PhaseNavSection;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}): React.ReactElement {
  const hasActiveChild = phase.items.some((item) => pathname === item.href);
  const defaultOpen = phase.status === 'active' || hasActiveChild;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-expand when a child becomes active via navigation
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  // When sidebar is collapsed, show only the item icons (no phase headers)
  if (sidebarCollapsed) {
    return (
      <div className="space-y-1">
        {phase.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed
            pathname={pathname}
            dimmed={phase.status === 'not_started'}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  const config = PHASE_STATUS_CONFIG[phase.status];
  const StatusIcon = config.icon;
  const isDimmed = phase.status === 'not_started';

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full flex-col px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center justify-between w-full">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {phase.phase}. {phase.title}
          </span>
          {isOpen ? (
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          )}
        </span>
        <span className={cn('flex items-center gap-1 mt-0.5', config.color)}>
          <StatusIcon
            className={cn(
              'h-2.5 w-2.5',
              phase.status === 'active' && 'fill-blue-500',
            )}
          />
          <span className="text-[10px] font-medium normal-case tracking-normal">
            {config.label}
          </span>
        </span>
      </button>
      {isOpen && (
        <div className="space-y-0.5 mt-0.5">
          {phase.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={false}
              pathname={pathname}
              dimmed={isDimmed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar content (shared between desktop inline and mobile drawer)   */
/* ------------------------------------------------------------------ */

function SidebarContent({
  collapsed,
  setCollapsed,
  pathname,
  filteredMainNav,
  projectId,
  projectTopItems,
  filteredPhases,
  onSignOut,
  onNavigate,
  showCollapseToggle,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  pathname: string;
  filteredMainNav: NavItem[];
  projectId: string | null;
  projectTopItems: NavItem[];
  filteredPhases: PhaseNavSection[];
  onSignOut: () => void;
  onNavigate?: () => void;
  showCollapseToggle: boolean;
}): React.ReactElement {
  return (
    <>
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-slate-200 px-4',
          collapsed ? 'justify-center' : 'gap-2',
        )}
      >
        <Shield className="h-6 w-6 shrink-0 text-slate-900" />
        {!collapsed && (
          <div>
            <span className="text-lg font-bold tracking-tight">
              GovAI Studio
            </span>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide">
              AI Governance Platform
            </p>
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
          {filteredMainNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {projectId ? (
          <>
            <Separator className="bg-slate-200" />

            {/* Current Project top-level items */}
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Current Project
                </p>
              )}
              {projectTopItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Phase sections — role-filtered */}
            {filteredPhases.map((phase) => (
              <PhaseSection
                key={phase.phase}
                phase={phase}
                collapsed={collapsed}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </>
        ) : (
          <>
            <Separator className="bg-slate-200" />
            {!collapsed && (
              <div className="px-3 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <FolderKanban className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mb-1">
                  Select a project to continue
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Choose a project to view tasks and progress
                </p>
                <Link
                  href="/projects"
                  onClick={onNavigate}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Explore Projects
                </Link>
              </div>
            )}
          </>
        )}
      </nav>

      {/* Bottom area */}
      <div className="border-t border-slate-200 px-2 py-3 space-y-1">
        <NavLink
          item={{ label: 'Settings', href: '/settings', icon: Settings }}
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <NavLink
          item={{ label: 'Help', href: '/help', icon: HelpCircle }}
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          title={collapsed ? 'Log Out' : undefined}
          className={cn(
            'w-full justify-start gap-3 text-slate-500 hover:bg-red-50 hover:text-red-600',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">Log Out</span>}
        </Button>
        {showCollapseToggle && (
          <>
            <Separator className="bg-slate-200 my-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'w-full justify-start gap-3 text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                collapsed && 'justify-center px-2',
              )}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Collapse sidebar</span>
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Top bar                                                            */
/* ------------------------------------------------------------------ */

function TopBar({
  pathname,
  effectiveRole,
  onMenuToggle,
  showMenuButton,
}: {
  pathname: string;
  effectiveRole: UserRole | undefined;
  onMenuToggle?: () => void;
  showMenuButton: boolean;
}): React.ReactElement {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(768);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

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

  // On mobile, show only the current page name (last crumb)
  const displayCrumbs = isMobile && crumbs.length > 1
    ? [crumbs[crumbs.length - 1]]
    : crumbs;

  const displayName =
    currentUser?.full_name ||
    currentUser?.email?.split('@')[0] ||
    'Team Member';
  const role = effectiveRole || currentUser?.role;
  const displayRole = role ? ROLE_LABELS[role] : '';
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      await signOut.mutateAsync();
    } catch { /* ignore */ }
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        {/* Hamburger button — mobile only */}
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <nav className="flex items-center gap-1.5 text-sm">
          {displayCrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-400">/</span>}
              {i === displayCrumbs.length - 1 ? (
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
      </div>

      {/* User menu with dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors"
        >
          <div className="hidden sm:block text-right text-sm">
            <p className="font-medium leading-none text-slate-900">{displayName}</p>
            {displayRole && (
              <p className="text-xs text-slate-500 mt-0.5">{displayRole}</p>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-white text-xs font-semibold">
            {initials}
          </div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-slate-100 sm:hidden">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              {displayRole && (
                <p className="text-xs text-slate-500">{displayRole}</p>
              )}
            </div>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        )}
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
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const signOut = useSignOut();
  const roleOverride = useRoleOverride();
  const projectId = extractProjectId(pathname);
  const { activePhase } = useActivePhase(projectId);
  const isMobile = useMediaQuery(768);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleSidebarSignOut = async () => {
    setMobileDrawerOpen(false);
    try {
      await signOut.mutateAsync();
    } catch { /* ignore */ }
    router.push('/login');
    router.refresh();
  };

  // Effective role: override from settings > user's actual role
  const effectiveRole = roleOverride || currentUser?.role;

  // Filter main nav items by role
  const filteredMainNav = mainNavItems.filter(
    (item) => !item.roles || (effectiveRole && item.roles.includes(effectiveRole)),
  );

  // Build project-scoped navigation only when viewing a real project
  const projectTopItems = projectId ? buildProjectTopItems(projectId) : [];
  const allPhases = projectId ? buildProjectPhases(projectId, activePhase) : [];
  const filteredPhases = filterPhasesByRole(allPhases, effectiveRole);

  const sidebarProps = {
    collapsed: isMobile ? false : collapsed,
    setCollapsed,
    pathname,
    filteredMainNav,
    projectId,
    projectTopItems,
    filteredPhases,
    onSignOut: handleSidebarSignOut,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ---- Desktop Sidebar (hidden on mobile) ---- */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <SidebarContent {...sidebarProps} showCollapseToggle />
      </aside>

      {/* ---- Mobile Sidebar Drawer (Sheet, hidden on desktop) ---- */}
      {isMobile && (
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
            <SidebarContent
              {...sidebarProps}
              showCollapseToggle={false}
              onNavigate={() => setMobileDrawerOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* ---- Command Palette (Cmd+K) ---- */}
      <CommandPalette />

      {/* ---- Main content ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          pathname={pathname}
          effectiveRole={effectiveRole}
          onMenuToggle={() => setMobileDrawerOpen(true)}
          showMenuButton={isMobile}
        />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
