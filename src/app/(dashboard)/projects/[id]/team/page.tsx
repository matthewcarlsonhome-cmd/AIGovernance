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
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Plus,
  ListTodo,
  Mail,
  X,
  UserPlus,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-auth';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TeamRole = 'admin' | 'consultant' | 'it' | 'legal' | 'engineering' | 'executive' | 'marketing';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  roleLabel: string;
  status: 'Active' | 'Inactive';
  tasksAssigned: number;
  initials: string;
}

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: 'admin', label: 'Project Administrator' },
  { value: 'consultant', label: 'Governance Consultant' },
  { value: 'executive', label: 'Executive Sponsor' },
  { value: 'it', label: 'IT / Security Lead' },
  { value: 'legal', label: 'Legal / Compliance Lead' },
  { value: 'engineering', label: 'Engineering Lead' },
  { value: 'marketing', label: 'Communications Lead' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Project Administrator',
  consultant: 'Governance Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRoleBadgeClasses(role: TeamRole): string {
  switch (role) {
    case 'admin':
      return 'bg-violet-500/15 text-violet-700 border-violet-500/25';
    case 'consultant':
      return 'bg-cyan-500/15 text-cyan-700 border-cyan-500/25';
    case 'it':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/25';
    case 'legal':
      return 'bg-amber-500/15 text-amber-700 border-amber-500/25';
    case 'engineering':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25';
    case 'executive':
      return 'bg-pink-500/15 text-pink-700 border-pink-500/25';
    case 'marketing':
      return 'bg-orange-500/15 text-orange-700 border-orange-500/25';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getAvatarBg(role: TeamRole): string {
  switch (role) {
    case 'admin':
      return 'bg-violet-500';
    case 'consultant':
      return 'bg-cyan-500';
    case 'it':
      return 'bg-blue-500';
    case 'legal':
      return 'bg-amber-500';
    case 'engineering':
      return 'bg-emerald-500';
    case 'executive':
      return 'bg-pink-500';
    case 'marketing':
      return 'bg-orange-500';
    default:
      return 'bg-slate-500';
  }
}

function getInitials(name: string): string {
  return name.trim().split(' ').map((w) => w[0]?.toUpperCase()).join('').slice(0, 2);
}

/* ------------------------------------------------------------------ */
/*  Normalize API response to TeamMember shape                         */
/* ------------------------------------------------------------------ */

function normalizeMembers(data: unknown): TeamMember[] {
  if (!Array.isArray(data)) return [];
  return data.map((m: Record<string, unknown>) => {
    const user = m.user as Record<string, unknown> | undefined;
    const name = (user?.full_name ?? m.name ?? 'Unknown') as string;
    const email = (user?.email ?? m.email ?? '') as string;
    const role = ((m.role ?? 'engineering') as TeamRole);
    return {
      id: m.id as string,
      name,
      email,
      role,
      roleLabel: ROLE_LABELS[role] ?? role,
      status: 'Active' as const,
      tasksAssigned: (m.tasksAssigned as number) ?? 0,
      initials: getInitials(name),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // Fetch team members from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['team-members', id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}/team`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: Boolean(id),
  });

  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<TeamRole>('engineering');
  const [addError, setAddError] = React.useState('');

  // Add member mutation
  const addMember = useMutation({
    mutationFn: async (data: { name: string; email: string; role: TeamRole }) => {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? 'Failed to add team member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', id] });
      setNewName('');
      setNewEmail('');
      setNewRole('engineering');
      setShowAddForm(false);
      setAddError('');
    },
    onError: (err: Error) => {
      setAddError(err.message);
    },
  });

  // Remove member mutation
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}/team`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? 'Failed to remove team member');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  const teamMembers = normalizeMembers(fetchedData);
  const totalTasks = teamMembers.reduce((sum, m) => sum + m.tasksAssigned, 0);

  const handleAddMember = (): void => {
    if (!newName.trim() || !newEmail.trim()) return;
    setAddError('');
    addMember.mutate({ name: newName.trim(), email: newEmail.trim(), role: newRole });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Project Team
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? 'Manage team members, roles, and assignments.'
              : 'View team members and their roles.'}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => { setShowAddForm(!showAddForm); setAddError(''); }}
            className={showAddForm ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800'}
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Invite Team Member
              </>
            )}
          </Button>
        )}
      </div>

      {/* Admin-only notice for non-admins */}
      {!isAdmin && teamMembers.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Shield className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-600">
            Team management is restricted to project administrators.
            Contact your admin to add or remove team members.
          </p>
        </div>
      )}

      <Separator />

      {/* Add Member Form (admin only) */}
      {isAdmin && showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite Team Member</CardTitle>
            <CardDescription>
              Add a team member and assign their role. They will receive access to the project based on their assigned role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {addError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 mb-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">{addError}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="member-name">Full Name</Label>
                <Input
                  id="member-name"
                  placeholder="Enter full name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">Email Address</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="name@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-role">Role</Label>
                <select
                  id="member-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as TeamRole)}
                  className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAddMember}
              disabled={!newName.trim() || !newEmail.trim() || addMember.isPending}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              {addMember.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Users className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {teamMembers.length}
                </p>
                <p className="text-xs text-slate-500">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {teamMembers.filter((m) => m.status === 'Active').length}
                </p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <ListTodo className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
                <p className="text-xs text-slate-500">Total Tasks Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {teamMembers.length === 0 && (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No team members yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            {isAdmin
              ? 'Invite team members and assign roles to get started. Each member will see tasks and pages relevant to their role.'
              : 'Your project administrator will invite team members and assign roles.'}
          </p>
          {isAdmin && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="mt-4 gap-2 bg-slate-900 text-white hover:bg-slate-800"
            >
              <UserPlus className="h-4 w-4" />
              Invite First Team Member
            </Button>
          )}
        </Card>
      )}

      {/* Team Member Cards */}
      {teamMembers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm',
                      getAvatarBg(member.role)
                    )}
                  >
                    {member.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getRoleBadgeClasses(member.role))}
                      >
                        {member.roleLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/15 text-emerald-700 border-emerald-500/25 text-xs"
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.tasksAssigned > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <ListTodo className="h-3 w-3" />
                        <span>{member.tasksAssigned} tasks assigned</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions (admin only) */}
                {isAdmin && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeMember.mutate(member.id)}
                      disabled={removeMember.isPending}
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
