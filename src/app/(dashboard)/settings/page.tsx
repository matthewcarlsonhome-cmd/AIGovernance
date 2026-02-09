'use client';

import { useState } from 'react';
import { Settings, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TABS = ['General', 'Team', 'Integrations', 'Billing'] as const;
type Tab = typeof TABS[number];

const INTEGRATIONS = [
  { name: 'Supabase', description: 'Database and authentication', connected: true, icon: '🗄️' },
  { name: 'Vercel', description: 'Hosting and deployment', connected: true, icon: '▲' },
  { name: 'Jira', description: 'Project management sync', connected: false, icon: '📋' },
  { name: 'Slack', description: 'Team notifications', connected: false, icon: '💬' },
  { name: 'GitHub', description: 'Repository management', connected: false, icon: '🐙' },
];

const TEAM_MEMBERS = [
  { name: 'Sarah Chen', email: 'sarah.chen@acme.com', role: 'Admin' },
  { name: 'James Wilson', email: 'james.wilson@acme.com', role: 'IT Security' },
  { name: 'Maria Garcia', email: 'maria.garcia@acme.com', role: 'Legal' },
  { name: 'Alex Kim', email: 'alex.kim@acme.com', role: 'Engineering' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('General');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your organization settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'General' && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>Update your organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Organization Name</Label>
                <Input defaultValue="Acme Corporation" className="mt-1" />
              </div>
              <div>
                <Label>Industry</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Financial Services</option>
                  <option>Government</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                </select>
              </div>
              <div>
                <Label>Organization Size</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>1-50</option>
                  <option>51-200</option>
                  <option selected>201-1,000</option>
                  <option>1,001-5,000</option>
                  <option>5,000+</option>
                </select>
              </div>
              <div>
                <Label>Primary Contact Email</Label>
                <Input defaultValue="admin@acme.com" className="mt-1" />
              </div>
            </div>
            <Separator />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      {/* Team */}
      {activeTab === 'Team' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>Manage who has access to your organization</CardDescription>
              </div>
              <Button size="sm">Invite Member</Button>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-3 font-medium">Name</th>
                  <th className="py-2 px-3 font-medium">Email</th>
                  <th className="py-2 px-3 font-medium">Role</th>
                  <th className="py-2 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map((m) => (
                  <tr key={m.email} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{m.name}</td>
                    <td className="py-2 px-3 text-muted-foreground">{m.email}</td>
                    <td className="py-2 px-3"><Badge variant="outline">{m.role}</Badge></td>
                    <td className="py-2 px-3 text-right">
                      <Button variant="outline" size="sm">Edit Role</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {activeTab === 'Integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTEGRATIONS.map((int) => (
            <Card key={int.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.icon}</span>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {int.name}
                        {int.connected ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{int.description}</p>
                    </div>
                  </div>
                  <Button variant={int.connected ? 'outline' : 'default'} size="sm">
                    {int.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Billing */}
      {activeTab === 'Billing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Professional</h3>
                  <p className="text-2xl font-bold text-primary mt-1">$2,000<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <p className="text-sm text-muted-foreground mt-1">Up to 25 users, 5 active projects, all report personas</p>
                </div>
                <Button>Upgrade to Enterprise</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Usage This Month</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-xl font-bold">6 <span className="text-sm text-muted-foreground font-normal">/ 25</span></p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-xl font-bold">3 <span className="text-sm text-muted-foreground font-normal">/ 5</span></p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Calls</p>
                  <p className="text-xl font-bold">127 <span className="text-sm text-muted-foreground font-normal">/ 500</span></p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reports Generated</p>
                  <p className="text-xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
