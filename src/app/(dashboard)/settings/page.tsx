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
              className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
              className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
      <CardFooter>
        <Button>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function TeamTab(): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organization Users</CardTitle>
            <CardDescription>
              Manage users and role assignments across the organization.
            </CardDescription>
          </div>
          <Button size="sm">
            <Users className="h-4 w-4" />
            Invite User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Active
                </th>
                <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ORG_USERS.map((user, idx) => (
                <tr
                  key={user.id}
                  className={cn(
                    'border-b border-border transition-colors hover:bg-muted/50',
                    idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  )}
                >
                  <td className="py-3 px-4 font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        user.role === 'Admin'
                          ? 'bg-violet-500/15 text-violet-700 border-violet-500/25'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {user.lastActive}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationsTab(): React.ReactElement {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {INTEGRATIONS.map((integration) => {
        const Icon = integration.icon;
        const isConnected = integration.status === 'connected';

        return (
          <Card key={integration.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {integration.name}
                    </CardTitle>
                  </div>
                </div>
                {isConnected ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/15 text-emerald-700 border-emerald-500/25 text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-border text-xs"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {integration.description}
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              {isConnected ? (
                <Button variant="outline" size="sm" className="w-full">
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" className="w-full">
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
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Professional Plan
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unlimited projects, advanced reporting, priority support
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">$2,000</p>
              <p className="text-xs text-muted-foreground">per month</p>
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
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Active Projects
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">3</p>
              <p className="text-xs text-muted-foreground mt-0.5">of unlimited</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Team Members
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">6</p>
              <p className="text-xs text-muted-foreground mt-0.5">of 25 seats</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Reports Generated
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">12</p>
              <p className="text-xs text-muted-foreground mt-0.5">of unlimited</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <CreditCard className="h-4 w-4" />
            Manage Billing
          </Button>
          <Button className="ml-2">
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Organization Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
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
