-- 004: Governance Artifacts

CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('aup', 'irp', 'data_classification', 'risk_framework')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  content TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_policies_project_id ON policies(project_id);
CREATE INDEX idx_policies_type ON policies(type);
CREATE INDEX idx_policies_status ON policies(status);

CREATE TABLE policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_policy_versions_policy_id ON policy_versions(policy_id);

CREATE TABLE compliance_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  framework TEXT NOT NULL CHECK (framework IN ('soc2', 'hipaa', 'nist', 'gdpr', 'iso27001')),
  control_id TEXT NOT NULL,
  control_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'implemented', 'verified', 'not_applicable')),
  evidence TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_mappings_project_id ON compliance_mappings(project_id);
CREATE INDEX idx_compliance_mappings_framework ON compliance_mappings(framework);

CREATE TABLE risk_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('critical', 'high', 'medium', 'low')),
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  mitigation TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigating', 'accepted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_classifications_project_id ON risk_classifications(project_id);

CREATE TABLE gate_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  gate_number INTEGER NOT NULL CHECK (gate_number IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  evidence_checklist JSONB DEFAULT '[]',
  approvers JSONB DEFAULT '[]',
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, gate_number)
);

CREATE INDEX idx_gate_reviews_project_id ON gate_reviews(project_id);

CREATE TRIGGER set_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_compliance_mappings_updated_at BEFORE UPDATE ON compliance_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_risk_classifications_updated_at BEFORE UPDATE ON risk_classifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_gate_reviews_updated_at BEFORE UPDATE ON gate_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
