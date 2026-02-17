-- ============================================================================
-- 014: Data Governance & Pilot Setup
-- Data classification inventory, processing activity records, governance gates,
-- and pilot wizard state tracking.
-- ============================================================================

-- Data Asset Records — data classification inventory
CREATE TABLE data_asset_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('database', 'data_lake', 'api', 'file_system', 'streaming', 'feature_store', 'document', 'spreadsheet')),
  domain TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  owner_name TEXT,
  classification TEXT NOT NULL CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
  lawful_basis TEXT CHECK (lawful_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest')),
  retention_period TEXT CHECK (retention_period IN ('30_days', '90_days', '1_year', '3_years', '7_years', 'indefinite')),
  retention_expires_at TIMESTAMPTZ,
  source_system TEXT,
  contains_pii BOOLEAN NOT NULL DEFAULT false,
  pii_types JSONB DEFAULT '[]',
  ai_relevance TEXT DEFAULT 'none' CHECK (ai_relevance IN ('training', 'inference', 'both', 'none')),
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_data_asset_records_project_id ON data_asset_records(project_id);
CREATE INDEX idx_data_asset_records_organization_id ON data_asset_records(organization_id);
CREATE INDEX idx_data_asset_records_classification ON data_asset_records(classification);
CREATE INDEX idx_data_asset_records_type ON data_asset_records(type);
CREATE INDEX idx_data_asset_records_owner_id ON data_asset_records(owner_id);
CREATE INDEX idx_data_asset_records_created_by ON data_asset_records(created_by);
CREATE INDEX idx_data_asset_records_ai_relevance ON data_asset_records(ai_relevance);
CREATE INDEX idx_data_asset_records_approved ON data_asset_records(approved);

-- Data Processing Activities — GDPR-style processing records
CREATE TABLE data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_asset_id UUID NOT NULL REFERENCES data_asset_records(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  processor TEXT NOT NULL,
  processing_type TEXT CHECK (processing_type IN ('collection', 'storage', 'analysis', 'transformation', 'transfer', 'deletion')),
  transfer_region TEXT,
  cross_border BOOLEAN DEFAULT false,
  risk_flags JSONB DEFAULT '[]',
  lawful_basis TEXT CHECK (lawful_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest')),
  retention_period TEXT CHECK (retention_period IN ('30_days', '90_days', '1_year', '3_years', '7_years', 'indefinite')),
  automated_decision_making BOOLEAN DEFAULT false,
  human_oversight_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_data_processing_activities_project_id ON data_processing_activities(project_id);
CREATE INDEX idx_data_processing_activities_organization_id ON data_processing_activities(organization_id);
CREATE INDEX idx_data_processing_activities_data_asset_id ON data_processing_activities(data_asset_id);
CREATE INDEX idx_data_processing_activities_status ON data_processing_activities(status);
CREATE INDEX idx_data_processing_activities_processing_type ON data_processing_activities(processing_type);
CREATE INDEX idx_data_processing_activities_created_by ON data_processing_activities(created_by);

-- Governance Gates — 4-gate approval workflow
CREATE TABLE governance_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gate_type TEXT NOT NULL CHECK (gate_type IN ('design_review', 'data_approval', 'security_review', 'launch_review')),
  gate_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  required_artifacts JSONB DEFAULT '[]',
  decision TEXT NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending', 'approved', 'conditionally_approved', 'rejected', 'deferred')),
  decision_rationale TEXT,
  approver_id UUID REFERENCES users(id),
  approver_name TEXT,
  decided_at TIMESTAMPTZ,
  conditions JSONB DEFAULT '[]',
  escalation_required BOOLEAN DEFAULT false,
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(project_id, gate_type)
);

CREATE INDEX idx_governance_gates_project_id ON governance_gates(project_id);
CREATE INDEX idx_governance_gates_organization_id ON governance_gates(organization_id);
CREATE INDEX idx_governance_gates_gate_type ON governance_gates(gate_type);
CREATE INDEX idx_governance_gates_decision ON governance_gates(decision);
CREATE INDEX idx_governance_gates_approver_id ON governance_gates(approver_id);
CREATE INDEX idx_governance_gates_submitted_by ON governance_gates(submitted_by);

-- Pilot Setups — pilot wizard state
CREATE TABLE pilot_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id TEXT,
  current_step TEXT NOT NULL DEFAULT 'business_goal' CHECK (current_step IN ('business_goal', 'use_case', 'data_scope', 'risk_tier', 'success_metrics', 'architecture', 'launch_checklist')),
  business_goal TEXT,
  use_case_description TEXT,
  use_case_domain TEXT,
  data_scope JSONB,
  risk_tier TEXT CHECK (risk_tier IN ('critical', 'high', 'medium', 'low')),
  success_metrics JSONB DEFAULT '[]',
  architecture_notes TEXT,
  launch_checklist JSONB DEFAULT '[]',
  readiness_score REAL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'ready', 'launched')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_pilot_setups_project_id ON pilot_setups(project_id);
CREATE INDEX idx_pilot_setups_organization_id ON pilot_setups(organization_id);
CREATE INDEX idx_pilot_setups_status ON pilot_setups(status);
CREATE INDEX idx_pilot_setups_current_step ON pilot_setups(current_step);
CREATE INDEX idx_pilot_setups_created_by ON pilot_setups(created_by);

-- Triggers: update updated_at on row modification
CREATE TRIGGER set_data_asset_records_updated_at
  BEFORE UPDATE ON data_asset_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_data_processing_activities_updated_at
  BEFORE UPDATE ON data_processing_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_governance_gates_updated_at
  BEFORE UPDATE ON governance_gates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_pilot_setups_updated_at
  BEFORE UPDATE ON pilot_setups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
