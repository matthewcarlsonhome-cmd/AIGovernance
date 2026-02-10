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
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TeamRole = 'admin' | 'it' | 'legal' | 'engineering' | 'executive' | 'marketing';

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

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'admin',
    roleLabel: 'Project Lead',
    status: 'Active',
    tasksAssigned: 12,
    initials: 'SC',
  },
  {
    id: 'tm-2',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'it',
    roleLabel: 'IT Security Lead',
    status: 'Active',
    tasksAssigned: 8,
    initials: 'JW',
  },
  {
    id: 'tm-3',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    role: 'legal',
    roleLabel: 'Legal Counsel',
    status: 'Active',
    tasksAssigned: 5,
    initials: 'MG',
  },
  {
    id: 'tm-4',
    name: 'Alex Kim',
    email: 'alex.kim@company.com',
    role: 'engineering',
    roleLabel: 'Engineering Lead',
    status: 'Active',
    tasksAssigned: 15,
    initials: 'AK',
  },
  {
    id: 'tm-5',
    name: 'David Park',
    email: 'david.park@company.com',
    role: 'executive',
    roleLabel: 'Executive Sponsor',
    status: 'Active',
    tasksAssigned: 3,
    initials: 'DP',
  },
  {
    id: 'tm-6',
    name: 'Lisa Zhang',
    email: 'lisa.zhang@company.com',
    role: 'marketing',
    roleLabel: 'Marketing Director',
    status: 'Active',
    tasksAssigned: 4,
    initials: 'LZ',
  },
];

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'executive', label: 'Executive' },
  { value: 'it', label: 'IT/Security' },
  { value: 'legal', label: 'Legal' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRoleBadgeClasses(role: TeamRole): string {
  switch (role) {
    case 'admin':
      return 'bg-violet-500/15 text-violet-700 border-violet-500/25';
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
      return 'bg-muted text-muted-foreground border-border';
  }
}

function getAvatarBg(role: TeamRole): string {
  switch (role) {
    case 'admin':
      return 'bg-violet-500';
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
      return 'bg-muted-foreground';
  }
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

  // Inline fetch for team members
  const { data: fetchedMembers, isLoading, error } = useQuery({
    queryKey: ['team-members', id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}/team`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
    enabled: Boolean(id),
  });

  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<TeamRole>('engineering');

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">Error: {(error as Error).message}</p></div>;

  const teamMembers: TeamMember[] = (fetchedMembers && Array.isArray(fetchedMembers) && fetchedMembers.length > 0)
    ? fetchedMembers as TeamMember[]
    : TEAM_MEMBERS;

  const totalTasks = teamMembers.reduce((sum, m) => sum + m.tasksAssigned, 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage project team members, role assignments, and task allocation.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Add Team Member
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Add Member Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Team Member</CardTitle>
            <CardDescription>
              Invite a new member to the project team
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
            <Button>
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {teamMembers.length}
                </p>
                <p className="text-xs text-muted-foreground">Team Members</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {teamMembers.filter((m) => m.status === 'Active').length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
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
                <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Member Cards */}
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
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
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
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <ListTodo className="h-3 w-3" />
                    <span>{member.tasksAssigned} tasks assigned</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1">
                  <ListTodo className="h-3.5 w-3.5" />
                  View Tasks
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
