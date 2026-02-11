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
  Key,
  Eye,
  EyeOff,
  Bot,
  Sparkles,
  Cpu,
  ShieldCheck,
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

interface LLMProvider {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  models: string[];
  keyPrefix: string;
}

interface SavedApiKeys {
  [providerId: string]: {
    apiKey: string;
    model: string;
  };
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

const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    subtitle: 'Claude',
    icon: Sparkles,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-100',
    models: ['Claude Opus 4.6', 'Claude Sonnet 4.5', 'Claude Haiku 4.5'],
    keyPrefix: 'sk-ant-',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    subtitle: 'ChatGPT / GPT-4',
    icon: Bot,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4-turbo'],
    keyPrefix: 'sk-',
  },
  {
    id: 'google',
    name: 'Google',
    subtitle: 'Gemini',
    icon: Cpu,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
    models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.0 Flash'],
    keyPrefix: 'AIza',
  },
];

const LOCALSTORAGE_KEY = 'govai_api_keys';

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

function ApiKeysTab(): React.ReactElement {
  const [savedKeys, setSavedKeys] = React.useState<SavedApiKeys>({});
  const [keyInputs, setKeyInputs] = React.useState<Record<string, string>>({});
  const [modelSelections, setModelSelections] = React.useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = React.useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = React.useState<string | null>(null);
  const [testResults, setTestResults] = React.useState<Record<string, 'success' | 'error' | null>>({});
  const [savingProvider, setSavingProvider] = React.useState<string | null>(null);
  const [saveResults, setSaveResults] = React.useState<Record<string, boolean>>({});

  // Load saved keys from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      if (stored) {
        const parsed: SavedApiKeys = JSON.parse(stored);
        setSavedKeys(parsed);
        const inputs: Record<string, string> = {};
        const models: Record<string, string> = {};
        for (const [providerId, data] of Object.entries(parsed)) {
          inputs[providerId] = data.apiKey;
          models[providerId] = data.model;
        }
        setKeyInputs(inputs);
        setModelSelections(models);
      }
    } catch {
      // Ignore parse errors from corrupted localStorage
    }
  }, []);

  const handleKeyChange = (providerId: string, value: string): void => {
    setKeyInputs((prev) => ({ ...prev, [providerId]: value }));
    // Clear test result when key changes
    setTestResults((prev) => ({ ...prev, [providerId]: null }));
  };

  const handleModelChange = (providerId: string, value: string): void => {
    setModelSelections((prev) => ({ ...prev, [providerId]: value }));
  };

  const toggleKeyVisibility = (providerId: string): void => {
    setVisibleKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleTestConnection = (providerId: string): void => {
    const currentKey = keyInputs[providerId] || '';
    if (!currentKey.trim()) {
      setTestResults((prev) => ({ ...prev, [providerId]: 'error' }));
      setTimeout(() => setTestResults((prev) => ({ ...prev, [providerId]: null })), 3000);
      return;
    }

    setTestingProvider(providerId);
    setTestResults((prev) => ({ ...prev, [providerId]: null }));

    // Simulate API connection test with a timeout
    setTimeout(() => {
      // Simulate success if key is non-empty, has at least 10 chars
      const isValid = currentKey.trim().length >= 10;
      setTestResults((prev) => ({ ...prev, [providerId]: isValid ? 'success' : 'error' }));
      setTestingProvider(null);
      // Auto-clear test result after 4 seconds
      setTimeout(() => setTestResults((prev) => ({ ...prev, [providerId]: null })), 4000);
    }, 1500);
  };

  const handleSave = (providerId: string): void => {
    const currentKey = keyInputs[providerId] || '';
    const provider = LLM_PROVIDERS.find((p) => p.id === providerId);
    const currentModel = modelSelections[providerId] || provider?.models[0] || '';

    setSavingProvider(providerId);

    setTimeout(() => {
      const updatedKeys: SavedApiKeys = { ...savedKeys };

      if (currentKey.trim()) {
        updatedKeys[providerId] = {
          apiKey: currentKey.trim(),
          model: currentModel,
        };
      } else {
        delete updatedKeys[providerId];
      }

      setSavedKeys(updatedKeys);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedKeys));
      setSavingProvider(null);
      setSaveResults((prev) => ({ ...prev, [providerId]: true }));
      setTimeout(() => setSaveResults((prev) => ({ ...prev, [providerId]: false })), 3000);
    }, 500);
  };

  const isProviderConfigured = (providerId: string): boolean => {
    return Boolean(savedKeys[providerId]?.apiKey);
  };

  return (
    <div className="space-y-4">
      {LLM_PROVIDERS.map((provider) => {
        const Icon = provider.icon;
        const configured = isProviderConfigured(provider.id);
        const isTesting = testingProvider === provider.id;
        const testResult = testResults[provider.id];
        const isSaving = savingProvider === provider.id;
        const showSaveSuccess = saveResults[provider.id];
        const isKeyVisible = visibleKeys[provider.id] || false;
        const currentKey = keyInputs[provider.id] || '';
        const currentModel = modelSelections[provider.id] || provider.models[0];

        return (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', provider.iconBg)}>
                    <Icon className={cn('h-5 w-5', provider.iconColor)} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                    <CardDescription className="text-xs">{provider.subtitle}</CardDescription>
                  </div>
                </div>
                {configured ? (
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/25 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-xs">
                    Not Configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                {/* API Key Input */}
                <div className="space-y-2">
                  <Label htmlFor={`api-key-${provider.id}`}>API Key</Label>
                  <div className="relative">
                    <Input
                      id={`api-key-${provider.id}`}
                      type={isKeyVisible ? 'text' : 'password'}
                      placeholder={`Enter your ${provider.name} API key (e.g. ${provider.keyPrefix}...)`}
                      value={currentKey}
                      onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(provider.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
                    >
                      {isKeyVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Default Model Selector */}
                <div className="space-y-2">
                  <Label htmlFor={`model-${provider.id}`}>Default Model</Label>
                  <select
                    id={`model-${provider.id}`}
                    value={currentModel}
                    onChange={(e) => handleModelChange(provider.id, e.target.value)}
                    className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    {provider.models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection(provider.id)}
                disabled={isTesting || !currentKey.trim()}
              >
                {isTesting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => handleSave(provider.id)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              {testResult === 'success' && (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Connection successful
                </span>
              )}
              {testResult === 'error' && (
                <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Connection failed
                </span>
              )}
              {showSaveSuccess && (
                <span className="text-sm text-emerald-600 font-medium">
                  API key saved!
                </span>
              )}
            </CardFooter>
          </Card>
        );
      })}

      {/* Security Notice */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200">
              <ShieldCheck className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Security Notice</h3>
              <p className="mt-1 text-sm text-slate-500">
                In production, API keys are encrypted at rest and transmitted only over TLS.
                Keys stored here are used for AI-assisted features like report generation,
                analysis, and content drafting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
          <TabsTrigger value="api-keys">
            <Key className="h-4 w-4 mr-1.5" />
            API Keys
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

        <TabsContent value="api-keys">
          <ApiKeysTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
