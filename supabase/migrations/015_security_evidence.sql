-- ============================================================================
-- 015: Security Controls, Policy Rules, Incidents, Evidence & Audit Events
-- Security control checks, policy-as-code rules, incident tracking,
-- compliance evidence packages, and extended audit trail.
-- ============================================================================

-- Control Checks — security control check results
CREATE TABLE control_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  control_id TEXT NOT NULL,
  control_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('auth', 'secrets', 'model_config', 'logging', 'egress', 'storage', 'data_retention', 'access_control', 'encryption')),
  description TEXT,
  result TEXT NOT NULL CHECK (result IN ('pass', 'fail', 'warning', 'not_applicable', 'error')),
  evidence_link TEXT,
  evidence_details TEXT,
  remediation TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_by UUID REFERENCES users(id),
  next_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_control_checks_project_id ON control_checks(project_id);
CREATE INDEX idx_control_checks_organization_id ON control_checks(organization_id);
CREATE INDEX idx_control_checks_category ON control_checks(category);
CREATE INDEX idx_control_checks_result ON control_checks(result);
CREATE INDEX idx_control_checks_checked_by ON control_checks(checked_by);
CREATE INDEX idx_control_checks_checked_at ON control_checks(checked_at DESC);
CREATE INDEX idx_control_checks_control_id ON control_checks(control_id);

-- Policy Rules — policy-as-code rule definitions
CREATE TABLE policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rule_definition JSONB NOT NULL DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  enforcement_mode TEXT NOT NULL DEFAULT 'warn' CHECK (enforcement_mode IN ('enforce', 'warn', 'audit', 'disabled')),
  applies_to JSONB DEFAULT '[]',
  exceptions JSONB DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_policy_rules_project_id ON policy_rules(project_id);
CREATE INDEX idx_policy_rules_organization_id ON policy_rules(organization_id);
CREATE INDEX idx_policy_rules_severity ON policy_rules(severity);
CREATE INDEX idx_policy_rules_enforcement_mode ON policy_rules(enforcement_mode);
CREATE INDEX idx_policy_rules_category ON policy_rules(category);
CREATE INDEX idx_policy_rules_created_by ON policy_rules(created_by);

-- Security Incidents — incident tracking
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('data_leak', 'model_misuse', 'prompt_injection', 'compliance_breach', 'unauthorized_access', 'policy_violation', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  detected_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id),
  assigned_to_name TEXT,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  root_cause TEXT,
  impact_assessment TEXT,
  corrective_actions JSONB DEFAULT '[]',
  linked_control_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_security_incidents_project_id ON security_incidents(project_id);
CREATE INDEX idx_security_incidents_organization_id ON security_incidents(organization_id);
CREATE INDEX idx_security_incidents_category ON security_incidents(category);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_security_incidents_detected_by ON security_incidents(detected_by);
CREATE INDEX idx_security_incidents_assigned_to ON security_incidents(assigned_to);
CREATE INDEX idx_security_incidents_detected_at ON security_incidents(detected_at DESC);

-- Evidence Packages — compliance evidence bundles
CREATE TABLE evidence_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  artifact_manifest JSONB NOT NULL DEFAULT '[]',
  gate_summaries JSONB DEFAULT '[]',
  control_summary JSONB,
  risk_summary JSONB,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_evidence_packages_project_id ON evidence_packages(project_id);
CREATE INDEX idx_evidence_packages_organization_id ON evidence_packages(organization_id);
CREATE INDEX idx_evidence_packages_generated_by ON evidence_packages(generated_by);
CREATE INDEX idx_evidence_packages_generated_at ON evidence_packages(generated_at DESC);

-- Audit Events — extended audit trail (richer than audit_logs)
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'auth_change',
    'policy_edit',
    'policy_approved',
    'gate_submitted',
    'gate_approved',
    'gate_rejected',
    'risk_updated',
    'data_classified',
    'data_approved',
    'control_check_run',
    'export_generated',
    'model_config_changed',
    'incident_created',
    'incident_resolved',
    'evidence_generated',
    'team_change',
    'project_status_change'
  )),
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_project_id ON audit_events(project_id);
CREATE INDEX idx_audit_events_organization_id ON audit_events(organization_id);
CREATE INDEX idx_audit_events_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);

-- Triggers: update updated_at on row modification
-- Note: audit_events has no updated_at (immutable append-only log)
CREATE TRIGGER set_control_checks_updated_at
  BEFORE UPDATE ON control_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_policy_rules_updated_at
  BEFORE UPDATE ON policy_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_security_incidents_updated_at
  BEFORE UPDATE ON security_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_evidence_packages_updated_at
  BEFORE UPDATE ON evidence_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
