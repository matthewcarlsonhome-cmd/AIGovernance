'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Settings,
  Users,
  Shield,
  UserCircle,
  Save,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  Eye,
  BookOpen,
  Link as LinkIcon,
  FileText,
  BarChart3,
  Lock,
  Unlock,
  Info,
  ArrowRight,
  RefreshCw,
  Crown,
  Briefcase,
  Monitor,
  Gavel,
  Code2,
  Megaphone,
  ClipboardCheck,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { useCurrentUser } from '@/hooks/use-auth';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LOCALSTORAGE_ROLE_KEY = 'govai_user_role_override';
const LOCALSTORAGE_TEAM_KEY = 'govai_team_members';

const ALL_ROLES: { value: UserRole; label: string; icon: React.ElementType; color: string; bgColor: string }[] = [
  { value: 'admin', label: 'Admin', icon: Crown, color: 'text-violet-700', bgColor: 'bg-violet-100' },
  { value: 'consultant', label: 'Consultant', icon: Briefcase, color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'executive', label: 'Executive', icon: BarChart3, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { value: 'it', label: 'IT / Security', icon: Monitor, color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  { value: 'legal', label: 'Legal', icon: Gavel, color: 'text-rose-700', bgColor: 'bg-rose-100' },
  { value: 'engineering', label: 'Engineering', icon: Code2, color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  { value: 'marketing', label: 'Marketing', icon: Megaphone, color: 'text-orange-700', bgColor: 'bg-orange-100' },
];

const ROLE_COLORS: Record<UserRole, { badge: string; dot: string }> = {
  admin: { badge: 'bg-violet-500/15 text-violet-700 border-violet-500/25', dot: 'bg-violet-500' },
  consultant: { badge: 'bg-blue-500/15 text-blue-700 border-blue-500/25', dot: 'bg-blue-500' },
  executive: { badge: 'bg-amber-500/15 text-amber-700 border-amber-500/25', dot: 'bg-amber-500' },
  it: { badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25', dot: 'bg-emerald-500' },
  legal: { badge: 'bg-rose-500/15 text-rose-700 border-rose-500/25', dot: 'bg-rose-500' },
  engineering: { badge: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/25', dot: 'bg-cyan-500' },
  marketing: { badge: 'bg-orange-500/15 text-orange-700 border-orange-500/25', dot: 'bg-orange-500' },
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TeamMemberEntry {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  addedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Default Team Members                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TEAM_MEMBERS: TeamMemberEntry[] = [
  { id: 'tm-1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'admin', addedAt: '2026-01-15' },
  { id: 'tm-2', name: 'Alex Rivera', email: 'alex.rivera@company.com', role: 'it', addedAt: '2026-01-16' },
  { id: 'tm-3', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', role: 'it', addedAt: '2026-01-16' },
  { id: 'tm-4', name: 'Jordan Lee', email: 'jordan.lee@company.com', role: 'engineering', addedAt: '2026-01-17' },
  { id: 'tm-5', name: 'Michael Torres', email: 'michael.torres@company.com', role: 'legal', addedAt: '2026-01-18' },
  { id: 'tm-6', name: 'Lisa Park', email: 'lisa.park@company.com', role: 'consultant', addedAt: '2026-01-18' },
  { id: 'tm-7', name: 'David Park', email: 'david.park@company.com', role: 'executive', addedAt: '2026-01-19' },
  { id: 'tm-8', name: 'Emily Thompson', email: 'emily.thompson@company.com', role: 'marketing', addedAt: '2026-01-20' },
];

/* ------------------------------------------------------------------ */
/*  Role Permissions Matrix                                            */
/* ------------------------------------------------------------------ */

interface PermissionRow {
  feature: string;
  admin: 'full' | 'view' | 'none';
  consultant: 'full' | 'view' | 'none';
  executive: 'full' | 'view' | 'none';
  it: 'full' | 'view' | 'none';
  legal: 'full' | 'view' | 'none';
  engineering: 'full' | 'view' | 'none';
  marketing: 'full' | 'view' | 'none';
}

const PERMISSIONS: PermissionRow[] = [
  { feature: 'Project Settings', admin: 'full', consultant: 'full', executive: 'view', it: 'view', legal: 'none', engineering: 'none', marketing: 'none' },
  { feature: 'Team Management', admin: 'full', consultant: 'view', executive: 'view', it: 'none', legal: 'none', engineering: 'none', marketing: 'none' },
  { feature: 'Discovery & Assessment', admin: 'full', consultant: 'full', executive: 'view', it: 'full', legal: 'view', engineering: 'view', marketing: 'none' },
  { feature: 'Governance & Policies', admin: 'full', consultant: 'full', executive: 'view', it: 'view', legal: 'full', engineering: 'none', marketing: 'none' },
  { feature: 'Gate Reviews', admin: 'full', consultant: 'full', executive: 'full', it: 'view', legal: 'view', engineering: 'view', marketing: 'none' },
  { feature: 'Compliance Mapping', admin: 'full', consultant: 'full', executive: 'view', it: 'full', legal: 'full', engineering: 'none', marketing: 'none' },
  { feature: 'Risk Management', admin: 'full', consultant: 'full', executive: 'view', it: 'full', legal: 'full', engineering: 'view', marketing: 'none' },
  { feature: 'Sandbox Configuration', admin: 'full', consultant: 'full', executive: 'none', it: 'full', legal: 'none', engineering: 'full', marketing: 'none' },
  { feature: 'PoC / Pilot Tracking', admin: 'full', consultant: 'full', executive: 'view', it: 'view', legal: 'none', engineering: 'full', marketing: 'none' },
  { feature: 'Timeline / Gantt', admin: 'full', consultant: 'full', executive: 'view', it: 'view', legal: 'view', engineering: 'view', marketing: 'view' },
  { feature: 'Reports (Generate)', admin: 'full', consultant: 'full', executive: 'view', it: 'view', legal: 'view', engineering: 'view', marketing: 'view' },
  { feature: 'Reports (Executive)', admin: 'full', consultant: 'full', executive: 'full', it: 'none', legal: 'none', engineering: 'none', marketing: 'none' },
  { feature: 'Billing & Subscription', admin: 'full', consultant: 'none', executive: 'view', it: 'none', legal: 'none', engineering: 'none', marketing: 'none' },
  { feature: 'API Keys & Integrations', admin: 'full', consultant: 'view', executive: 'none', it: 'full', legal: 'none', engineering: 'view', marketing: 'none' },
  { feature: 'Change Management', admin: 'full', consultant: 'full', executive: 'view', it: 'none', legal: 'none', engineering: 'none', marketing: 'full' },
];

/* ------------------------------------------------------------------ */
/*  Helper: Role label                                                 */
/* ------------------------------------------------------------------ */

function getRoleLabel(role: UserRole): string {
  return ALL_ROLES.find((r) => r.value === role)?.label ?? role;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ------------------------------------------------------------------ */
/*  Section 1: Your Profile                                            */
/* ------------------------------------------------------------------ */

function ProfileSection({
  activeRole,
  onRoleChange,
}: {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}): React.ReactElement {
  const { data: user } = useCurrentUser();
  const [saved, setSaved] = React.useState(false);

  const displayName = user?.full_name ?? 'Demo User';
  const displayEmail = user?.email ?? 'demo@govai-studio.com';

  const handleRoleSave = (role: UserRole): void => {
    onRoleChange(role);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <UserCircle className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and manage your account details and current role.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* User Info */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Full Name</Label>
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Email</Label>
              <p className="text-sm font-medium text-slate-900">{displayEmail}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Current Role</Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs', ROLE_COLORS[activeRole].badge)}
                >
                  {getRoleLabel(activeRole)}
                </Badge>
                {saved && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Role updated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-wider">
                Switch Role (for testing)
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                Preview the app as a different role. This affects navigation visibility and permissions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = r.value === activeRole;
                return (
                  <button
                    key={r.value}
                    onClick={() => handleRoleSave(r.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-white' : r.color)} />
                    <span className="font-medium">{r.label}</span>
                    {isActive && <CheckCircle2 className="h-3.5 w-3.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2: Team Management                                         */
/* ------------------------------------------------------------------ */

function TeamManagementSection(): React.ReactElement {
  const [members, setMembers] = React.useState<TeamMemberEntry[]>([]);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMemberEntry | null>(null);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<UserRole>('engineering');
  const [removeConfirm, setRemoveConfirm] = React.useState<string | null>(null);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_TEAM_KEY);
      if (stored) {
        const parsed: TeamMemberEntry[] = JSON.parse(stored);
        setMembers(parsed);
      } else {
        // First visit: populate with defaults
        setMembers(DEFAULT_TEAM_MEMBERS);
        localStorage.setItem(LOCALSTORAGE_TEAM_KEY, JSON.stringify(DEFAULT_TEAM_MEMBERS));
      }
    } catch {
      setMembers(DEFAULT_TEAM_MEMBERS);
    }
  }, []);

  const persist = (updated: TeamMemberEntry[]): void => {
    setMembers(updated);
    localStorage.setItem(LOCALSTORAGE_TEAM_KEY, JSON.stringify(updated));
  };

  const handleAdd = (): void => {
    if (!newName.trim() || !newEmail.trim()) return;
    const entry: TeamMemberEntry = {
      id: `tm-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      addedAt: new Date().toISOString().split('T')[0],
    };
    persist([...members, entry]);
    setNewName('');
    setNewEmail('');
    setNewRole('engineering');
    setShowAddDialog(false);
  };

  const handleEditSave = (): void => {
    if (!editingMember) return;
    persist(
      members.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: newName.trim() || m.name, email: newEmail.trim() || m.email, role: newRole }
          : m
      )
    );
    setEditingMember(null);
  };

  const handleRemove = (id: string): void => {
    persist(members.filter((m) => m.id !== id));
    setRemoveConfirm(null);
  };

  const openEdit = (m: TeamMemberEntry): void => {
    setEditingMember(m);
    setNewName(m.name);
    setNewEmail(m.email);
    setNewRole(m.role);
  };

  const roleCounts = ALL_ROLES.map((r) => ({
    ...r,
    count: members.filter((m) => m.role === r.value).length,
  }));

  return (
    <>
      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to this governance project. They will receive role-based access to dashboards and features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                placeholder="e.g. Jane Smith"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email Address</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="jane.smith@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role</Label>
              <select
                id="add-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || !newEmail.trim()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingMember !== null}
        onOpenChange={(open) => { if (!open) setEditingMember(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update details for {editingMember?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage team members and their roles for this governance engagement.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setNewName('');
                setNewEmail('');
                setNewRole('engineering');
                setShowAddDialog(true);
              }}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Team Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Role Summary Chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {roleCounts
              .filter((r) => r.count > 0)
              .map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.value}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                      r.bgColor,
                      r.color
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {r.label}: {r.count}
                  </div>
                );
              })}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Total: {members.length}
            </div>
          </div>

          {/* Team Table */}
          {members.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No team members yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add your first team member to start assigning roles and permissions for this governance project.
              </p>
              <Button
                size="sm"
                className="mt-4 bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Member
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Added
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, idx) => (
                    <tr
                      key={member.id}
                      className={cn(
                        'border-b border-slate-100 transition-colors hover:bg-slate-50',
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                              ROLE_COLORS[member.role].dot
                            )}
                          >
                            {getInitials(member.name)}
                          </div>
                          <span className="font-medium text-slate-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{member.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cn('text-xs', ROLE_COLORS[member.role].badge)}
                        >
                          {getRoleLabel(member.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">{member.addedAt}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(member)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          {removeConfirm === member.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(member.id)}
                                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRemoveConfirm(null)}
                                className="h-8 px-2 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemoveConfirm(member.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3: Role Permissions Guide                                  */
/* ------------------------------------------------------------------ */

function RolePermissionsSection(): React.ReactElement {
  const [expandedRole, setExpandedRole] = React.useState<UserRole | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Shield className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <CardTitle>Role Permissions Guide</CardTitle>
            <CardDescription>
              Visual reference showing what each role can see and do across the platform. Use the role switcher above to preview any role.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Role Legend */}
        <div className="flex flex-wrap gap-3 mb-5">
          {ALL_ROLES.map((r) => {
            const Icon = r.icon;
            const isExpanded = expandedRole === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setExpandedRole(isExpanded ? null : r.value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                  isExpanded
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                <Icon className={cn('h-4 w-4', isExpanded ? 'text-white' : r.color)} />
                {r.label}
              </button>
            );
          })}
          <button
            onClick={() => setExpandedRole(null)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
              expandedRole === null
                ? 'border-slate-300 bg-slate-100 text-slate-900'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            )}
          >
            Show All
          </button>
        </div>

        {/* Access Level Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-emerald-100 flex items-center justify-center">
              <Unlock className="h-2.5 w-2.5 text-emerald-700" />
            </div>
            Full Access
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-amber-100 flex items-center justify-center">
              <Eye className="h-2.5 w-2.5 text-amber-700" />
            </div>
            View Only
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-slate-100 flex items-center justify-center">
              <Lock className="h-2.5 w-2.5 text-slate-400" />
            </div>
            No Access
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3 text-left font-semibold uppercase tracking-wider text-slate-500 min-w-[160px]">
                  Feature
                </th>
                {ALL_ROLES
                  .filter((r) => expandedRole === null || r.value === expandedRole)
                  .map((r) => {
                    const Icon = r.icon;
                    return (
                      <th
                        key={r.value}
                        className="py-2.5 px-3 text-center font-semibold uppercase tracking-wider text-slate-500 min-w-[80px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon className={cn('h-3.5 w-3.5', r.color)} />
                          <span>{r.label}</span>
                        </div>
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, idx) => (
                <tr
                  key={perm.feature}
                  className={cn(
                    'border-b border-slate-100',
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  )}
                >
                  <td className="py-2.5 px-3 font-medium text-slate-700">{perm.feature}</td>
                  {ALL_ROLES
                    .filter((r) => expandedRole === null || r.value === expandedRole)
                    .map((r) => {
                      const level = perm[r.value];
                      return (
                        <td key={r.value} className="py-2.5 px-3 text-center">
                          {level === 'full' && (
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-100">
                              <Unlock className="h-3 w-3 text-emerald-700" />
                            </div>
                          )}
                          {level === 'view' && (
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded bg-amber-100">
                              <Eye className="h-3 w-3 text-amber-700" />
                            </div>
                          )}
                          {level === 'none' && (
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100">
                              <Lock className="h-3 w-3 text-slate-300" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4: Project Settings Quick Links                            */
/* ------------------------------------------------------------------ */

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const PROJECT_LINKS: QuickLink[] = [
  {
    title: 'Organization Settings',
    description: 'Update org name, industry, and size classification.',
    href: '/settings',
    icon: Settings,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
  },
  {
    title: 'API Keys & Integrations',
    description: 'Configure LLM provider keys and third-party connections.',
    href: '/settings',
    icon: LinkIcon,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Governance Policies',
    description: 'Edit AUP, incident response plans, and data classification.',
    href: '#',
    icon: FileText,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },
  {
    title: 'Compliance Mapping',
    description: 'Map controls to SOC 2, HIPAA, NIST, and GDPR frameworks.',
    href: '#',
    icon: ClipboardCheck,
    color: 'text-violet-700',
    bgColor: 'bg-violet-100',
  },
  {
    title: 'Risk Management',
    description: 'View risk classifications and mitigation strategies.',
    href: '#',
    icon: Shield,
    color: 'text-rose-700',
    bgColor: 'bg-rose-100',
  },
  {
    title: 'Reports & Exports',
    description: 'Generate persona-specific reports in PDF and DOCX.',
    href: '#',
    icon: BarChart3,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  {
    title: 'Admin Analytics',
    description: 'Platform adoption metrics, workflow completion, and governance health.',
    href: '/settings/analytics',
    icon: Monitor,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
];

function ProjectSettingsSection(): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Settings className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <CardTitle>Project Settings</CardTitle>
            <CardDescription>
              Quick access to project-level configuration, policies, and management tools.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECT_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                onClick={() => {
                  if (link.href !== '#') {
                    window.location.href = link.href;
                  }
                }}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-left transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', link.bgColor)}>
                  <Icon className={cn('h-4.5 w-4.5', link.color)} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                    {link.title}
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{link.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5: How It Works Guide                                      */
/* ------------------------------------------------------------------ */

function HowItWorksSection(): React.ReactElement {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const steps = [
    {
      icon: UserCircle,
      title: 'Switch Roles',
      description: 'Use the role switcher in "Your Profile" to preview the app as any team role. Navigation and feature visibility adapt to each role.',
    },
    {
      icon: Users,
      title: 'Manage Team Members',
      description: 'Add, edit, or remove team members. Each member gets role-based access to governance dashboards, discovery tools, and reports.',
    },
    {
      icon: Shield,
      title: 'Understand Permissions',
      description: 'The permissions matrix shows exactly what each role can access. Use it to plan team structure and identify gaps.',
    },
    {
      icon: Settings,
      title: 'Configure Settings',
      description: 'Use quick links to jump to organization configuration, API keys, compliance mappings, and report generation.',
    },
  ];

  return (
    <Card className="border-slate-200 bg-slate-50/50">
      <CardContent className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <BookOpen className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">How It Works: Admin Control Panel</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Learn what you can do on this page and how role-based access control works.
              </p>
            </div>
          </div>
          <div className={cn('transition-transform', isExpanded && 'rotate-180')}>
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        {isExpanded && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex items-start gap-3 rounded-lg bg-white p-4 border border-slate-200">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
            <div className="sm:col-span-2 rounded-lg bg-white p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Info className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Demo Mode</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    This application runs in demo mode with localStorage persistence. All team members, role overrides,
                    and settings are stored locally in your browser. In production, these would be persisted to Supabase
                    with row-level security enforcing real RBAC policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SettingsPage(): React.ReactElement {
  const [activeRole, setActiveRole] = React.useState<UserRole>('admin');

  // Load persisted role override on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_ROLE_KEY);
      if (stored && ALL_ROLES.some((r) => r.value === stored)) {
        setActiveRole(stored as UserRole);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleRoleChange = (role: UserRole): void => {
    setActiveRole(role);
    localStorage.setItem(LOCALSTORAGE_ROLE_KEY, role);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Your Control Panel
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tweak your profile, manage team access, switch roles, and fine-tune everything.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Badge variant="outline" className={cn('text-xs', ROLE_COLORS[activeRole].badge)}>
            Viewing as: {getRoleLabel(activeRole)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleRoleChange('admin');
            }}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Reset to Admin
          </Button>
        </div>
      </div>

      <Separator />

      {/* How It Works (collapsible) */}
      <HowItWorksSection />

      {/* Profile + Role Switcher */}
      <ProfileSection activeRole={activeRole} onRoleChange={handleRoleChange} />

      {/* Team Management */}
      <TeamManagementSection />

      {/* Role Permissions Guide */}
      <RolePermissionsSection />

      {/* Project Settings Quick Links */}
      <ProjectSettingsSection />
    </div>
  );
}
