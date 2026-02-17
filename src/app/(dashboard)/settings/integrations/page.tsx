'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { INTEGRATION_CATALOG, type IntegrationDefinition, type IntegrationType } from '@/lib/integrations';
import { Link, Plug, Shield, FileText, BarChart3, Radio, CheckCircle, Settings } from 'lucide-react';

const TYPE_CONFIG: Record<IntegrationType, { label: string; icon: React.ReactNode; description: string }> = {
  identity: { label: 'Identity & SSO', icon: <Shield className="h-5 w-5" />, description: 'Single sign-on and directory sync' },
  ticketing: { label: 'Ticketing & PM', icon: <Settings className="h-5 w-5" />, description: 'Project management and issue tracking' },
  document_storage: { label: 'Documents', icon: <FileText className="h-5 w-5" />, description: 'Evidence storage and document linking' },
  siem: { label: 'Security & Monitoring', icon: <Shield className="h-5 w-5" />, description: 'SIEM, logging, and observability' },
  bi: { label: 'Business Intelligence', icon: <BarChart3 className="h-5 w-5" />, description: 'Executive reporting and dashboards' },
};

const TIER_COLORS: Record<string, string> = {
  starter: 'bg-slate-100 text-slate-700 border-slate-200',
  governance: 'bg-blue-100 text-blue-800 border-blue-200',
  enterprise: 'bg-purple-100 text-purple-800 border-purple-200',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  configured: { label: 'Configured', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  connected: { label: 'Connected', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  error: { label: 'Error', color: 'bg-red-100 text-red-800 border-red-200' },
  disabled: { label: 'Disabled', color: 'bg-slate-100 text-slate-400 border-slate-200' },
};

function IntegrationCard({ integration }: { integration: IntegrationDefinition }) {
  const tierColor = TIER_COLORS[integration.tier] ?? TIER_COLORS.starter;
  const statusConfig = STATUS_CONFIG[integration.status] ?? STATUS_CONFIG.available;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
              {integration.logo_placeholder.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-medium text-slate-900">{integration.name}</h3>
              <p className="text-xs text-slate-500">{integration.description}</p>
            </div>
          </div>
          <Badge className={statusConfig.color} variant="outline">{statusConfig.label}</Badge>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Badge className={tierColor} variant="outline">{integration.tier}</Badge>
        </div>
        <div className="space-y-1 mb-4">
          {integration.capabilities.map((cap, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle className="h-3 w-3 text-slate-400" />
              {cap}
            </div>
          ))}
        </div>
        <Button
          variant={integration.status === 'connected' ? 'outline' : 'default'}
          size="sm"
          className={integration.status === 'connected' ? 'text-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}
          disabled={integration.tier === 'enterprise'}
        >
          {integration.status === 'connected' ? 'Configure' : integration.tier === 'enterprise' ? 'Enterprise Only' : 'Connect'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const types: (IntegrationType | 'all')[] = ['all', 'identity', 'ticketing', 'document_storage', 'siem', 'bi'];

  const filtered = activeTab === 'all'
    ? INTEGRATION_CATALOG
    : INTEGRATION_CATALOG.filter((i) => i.type === activeTab);

  const connectedCount = INTEGRATION_CATALOG.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
          <p className="text-slate-500 mt-1">Connect GovAI Studio with your existing tools and infrastructure.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200" variant="outline">
            {connectedCount} Connected
          </Badge>
          <Badge className="bg-slate-100 text-slate-700 border-slate-200" variant="outline">
            {INTEGRATION_CATALOG.length} Available
          </Badge>
        </div>
      </div>

      {/* MVP Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Radio className="h-5 w-5" />
            <span className="font-medium">MVP Integration Strategy:</span>
            <span className="text-blue-700">Webhooks and CSV import available now. Managed connectors coming in Enterprise tier.</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">All</TabsTrigger>
          {(Object.keys(TYPE_CONFIG) as IntegrationType[]).map((type) => (
            <TabsTrigger key={type} value={type} className="data-[state=active]:bg-white">
              {TYPE_CONFIG[type].label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No integrations available for this category.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
