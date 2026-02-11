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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
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
  Plug,
  CreditCard,
  Save,
  Database,
  Globe,
  GitBranch,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Building,
  Crown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ConnectionStatus = 'connected' | 'not_connected';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: ConnectionStatus;
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const INTEGRATIONS: Integration[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'PostgreSQL database with RLS and real-time subscriptions.',
    icon: Database,
    status: 'connected',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Edge deployment with preview environments and analytics.',
    icon: Globe,
    status: 'connected',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Project management and issue tracking integration.',
    icon: Settings,
    status: 'not_connected',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications, alerts, and workflow updates.',
    icon: MessageSquare,
    status: 'not_connected',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository access, PR workflows, and code scanning.',
    icon: GitBranch,
    status: 'not_connected',
  },
];

const ORG_USERS: OrgUser[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'Admin', lastActive: 'Today' },
  { id: 'u2', name: 'James Wilson', email: 'james.wilson@company.com', role: 'Member', lastActive: 'Today' },
  { id: 'u3', name: 'Maria Garcia', email: 'maria.garcia@company.com', role: 'Member', lastActive: 'Yesterday' },
  { id: 'u4', name: 'Alex Kim', email: 'alex.kim@company.com', role: 'Member', lastActive: 'Today' },
  { id: 'u5', name: 'David Park', email: 'david.park@company.com', role: 'Admin', lastActive: '3 days ago' },
  { id: 'u6', name: 'Lisa Zhang', email: 'lisa.zhang@company.com', role: 'Member', lastActive: 'Yesterday' },
];

/* ------------------------------------------------------------------ */
/*  Tab Components                                                     */
/* ------------------------------------------------------------------ */

function GeneralTab(): React.ReactElement {
  const [orgName, setOrgName] = React.useState('Acme Corporation');
  const [industry, setIndustry] = React.useState('Technology');
  const [orgSize, setOrgSize] = React.useState('500-1000');
  const [saved, setSaved] = React.useState(false);

  const handleSave = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
        <CardDescription>
          Update your organization information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="Technology">Technology</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Government">Government</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-size">Organization Size</Label>
            <select
              id="org-size"
              value={orgSize}
              onChange={(e) => setOrgSize(e.target.value)}
              className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="1-50">1-50 employees</option>
              <option value="50-200">50-200 employees</option>
              <option value="200-500">200-500 employees</option>
              <option value="500-1000">500-1,000 employees</option>
              <option value="1000-5000">1,000-5,000 employees</option>
              <option value="5000+">5,000+ employees</option>
            </select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-3">
        <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Settings saved successfully!</span>}
      </CardFooter>
    </Card>
  );
}

function TeamTab(): React.ReactElement {
  const [showInviteDialog, setShowInviteDialog] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('Member');
  const [invitedUsers, setInvitedUsers] = React.useState<OrgUser[]>([]);
  const [editingUser, setEditingUser] = React.useState<OrgUser | null>(null);
  const [editRole, setEditRole] = React.useState('Member');

  const allUsers = [...ORG_USERS, ...invitedUsers];

  const handleInvite = (): void => {
    if (!inviteEmail.trim()) return;
    const newUser: OrgUser = {
      id: `u-invite-${Date.now()}`,
      name: inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: inviteEmail.trim(),
      role: inviteRole,
      lastActive: 'Invited',
    };
    setInvitedUsers((prev) => [...prev, newUser]);
    setInviteEmail('');
    setInviteRole('Member');
    setShowInviteDialog(false);
  };

  const handleEditSave = (): void => {
    if (!editingUser) return;
    setInvitedUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, role: editRole } : u));
    setEditingUser(null);
  };

  return (
    <>
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation to join the organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input id="invite-email" type="email" placeholder="name@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <select id="invite-role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400">
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()} className="bg-slate-900 text-white hover:bg-slate-800">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingUser !== null} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update role for {editingUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-slate-500">{editingUser?.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <select id="edit-role" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400">
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleEditSave} className="bg-slate-900 text-white hover:bg-slate-800">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Users</CardTitle>
              <CardDescription>Manage users and role assignments across the organization.</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowInviteDialog(true)} className="bg-slate-900 text-white hover:bg-slate-800">
              <Users className="h-4 w-4" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Last Active</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user, idx) => (
                  <tr key={user.id} className={cn('border-b border-slate-200 transition-colors hover:bg-slate-50', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50')}>
                    <td className="py-3 px-4 font-medium text-slate-900">{user.name}</td>
                    <td className="py-3 px-4 text-slate-500">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={cn('text-xs', user.role === 'Admin' ? 'bg-violet-500/15 text-violet-700 border-violet-500/25' : 'bg-slate-100 text-slate-500 border-slate-200')}>{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{user.lastActive}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setEditRole(user.role); }}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function IntegrationsTab(): React.ReactElement {
  const [connectionStatuses, setConnectionStatuses] = React.useState<Record<string, ConnectionStatus>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.status]))
  );

  const toggleConnection = (id: string): void => {
    setConnectionStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'connected' ? 'not_connected' : 'connected',
    }));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {INTEGRATIONS.map((integration) => {
        const Icon = integration.icon;
        const isConnected = connectionStatuses[integration.id] === 'connected';

        return (
          <Card key={integration.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                  </div>
                </div>
                {isConnected ? (
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/25 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{integration.description}</p>
            </CardContent>
            <CardFooter className="pt-0">
              {isConnected ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => toggleConnection(integration.id)}>
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" className="w-full bg-slate-900 text-white hover:bg-slate-800" onClick={() => toggleConnection(integration.id)}>
                  <Plug className="h-3.5 w-3.5" />
                  Connect
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function BillingTab(): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                <Crown className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Professional Plan
                </h3>
                <p className="text-sm text-slate-500">
                  Unlimited projects, advanced reporting, priority support
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">$2,000</p>
              <p className="text-xs text-slate-500">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>
            Current billing period: Feb 1 - Feb 28, 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Active Projects
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
              <p className="text-xs text-slate-500 mt-0.5">of unlimited</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Team Members
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">6</p>
              <p className="text-xs text-slate-500 mt-0.5">of 25 seats</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Reports Generated
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
              <p className="text-xs text-slate-500 mt-0.5">of unlimited</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => alert('Billing management portal would open here.\n\nIn production, this redirects to Stripe Customer Portal.')}>
            <CreditCard className="h-4 w-4" />
            Manage Billing
          </Button>
          <Button className="ml-2 bg-slate-900 text-white hover:bg-slate-800" onClick={() => alert('Plan upgrade flow would begin here.\n\nAvailable Plans:\n- Professional: $2,000/mo\n- Enterprise: $5,000/mo\n\nIn production, this opens the upgrade dialog with Stripe checkout.')}>
            Upgrade Plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SettingsPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Organization Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your organization profile, team access, integrations, and
          billing.
        </p>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Building className="h-4 w-4 mr-1.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-1.5" />
            Team
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-4 w-4 mr-1.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-1.5" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
