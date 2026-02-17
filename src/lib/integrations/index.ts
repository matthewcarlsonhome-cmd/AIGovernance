// Integration Framework Foundation (Design Doc v3 §10)
// MVP: Webhook basics + CSV/API import structure.

export type IntegrationType = 'identity' | 'ticketing' | 'document_storage' | 'siem' | 'bi';
export type IntegrationStatus = 'available' | 'configured' | 'connected' | 'error' | 'disabled';

export interface IntegrationDefinition {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  logo_placeholder: string;
  status: IntegrationStatus;
  tier: 'starter' | 'governance' | 'enterprise';
  capabilities: string[];
}

export const INTEGRATION_CATALOG: IntegrationDefinition[] = [
  {
    id: 'int-okta',
    type: 'identity',
    name: 'Okta SSO',
    description: 'Single sign-on via Okta SAML/OIDC for enterprise identity management.',
    logo_placeholder: 'Okta',
    status: 'available',
    tier: 'enterprise',
    capabilities: ['SSO login', 'Role mapping', 'MFA enforcement', 'Group sync'],
  },
  {
    id: 'int-azure-ad',
    type: 'identity',
    name: 'Azure AD / Entra ID',
    description: 'Microsoft identity provider for SSO and directory sync.',
    logo_placeholder: 'Azure',
    status: 'available',
    tier: 'enterprise',
    capabilities: ['SSO login', 'Role mapping', 'MFA enforcement', 'Conditional access'],
  },
  {
    id: 'int-jira',
    type: 'ticketing',
    name: 'Jira',
    description: 'Bi-directional sync with Jira for task and sprint tracking.',
    logo_placeholder: 'Jira',
    status: 'available',
    tier: 'governance',
    capabilities: ['Task sync', 'Sprint import', 'Status mapping', 'Webhook events'],
  },
  {
    id: 'int-linear',
    type: 'ticketing',
    name: 'Linear',
    description: 'Issue and project sync with Linear for modern development teams.',
    logo_placeholder: 'Linear',
    status: 'available',
    tier: 'governance',
    capabilities: ['Issue sync', 'Status mapping', 'Webhook events'],
  },
  {
    id: 'int-sharepoint',
    type: 'document_storage',
    name: 'SharePoint / OneDrive',
    description: 'Evidence and document linkage via Microsoft SharePoint.',
    logo_placeholder: 'SharePoint',
    status: 'available',
    tier: 'governance',
    capabilities: ['Evidence linking', 'Document upload', 'Version tracking'],
  },
  {
    id: 'int-confluence',
    type: 'document_storage',
    name: 'Confluence',
    description: 'Knowledge base and evidence documentation via Atlassian Confluence.',
    logo_placeholder: 'Confluence',
    status: 'available',
    tier: 'governance',
    capabilities: ['Evidence linking', 'Page sync', 'Template export'],
  },
  {
    id: 'int-splunk',
    type: 'siem',
    name: 'Splunk',
    description: 'Security event forwarding and audit log integration with Splunk.',
    logo_placeholder: 'Splunk',
    status: 'available',
    tier: 'enterprise',
    capabilities: ['Audit log export', 'Security alerts', 'Dashboard data'],
  },
  {
    id: 'int-datadog',
    type: 'siem',
    name: 'Datadog',
    description: 'Monitoring and observability integration for AI system metrics.',
    logo_placeholder: 'Datadog',
    status: 'available',
    tier: 'enterprise',
    capabilities: ['Metric export', 'Alert forwarding', 'Dashboard embed'],
  },
  {
    id: 'int-powerbi',
    type: 'bi',
    name: 'Power BI',
    description: 'Executive portfolio reporting via Microsoft Power BI connector.',
    logo_placeholder: 'PowerBI',
    status: 'available',
    tier: 'enterprise',
    capabilities: ['Portfolio data', 'KPI export', 'Scheduled refresh'],
  },
  {
    id: 'int-webhook',
    type: 'ticketing',
    name: 'Webhooks (Generic)',
    description: 'Send governance events to any endpoint via configurable webhooks.',
    logo_placeholder: 'Webhook',
    status: 'available',
    tier: 'starter',
    capabilities: ['Event forwarding', 'Custom payload', 'Retry logic'],
  },
];

export interface WebhookConfig {
  id: string;
  organization_id: string;
  name: string;
  url: string;
  secret: string | null;
  event_types: string[];
  enabled: boolean;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  delivered_at: string;
  success: boolean;
  retry_attempt: number;
}

export function getIntegrationsByType(type: IntegrationType): IntegrationDefinition[] {
  return INTEGRATION_CATALOG.filter((i) => i.type === type);
}

export function getIntegrationsByTier(tier: IntegrationDefinition['tier']): IntegrationDefinition[] {
  return INTEGRATION_CATALOG.filter((i) => i.tier === tier);
}
