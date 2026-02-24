-- ============================================================================
-- 017: Risk Exceptions
-- Time-bound policy/control exception workflow with compensating controls,
-- expiry tracking, and approval chain. (Design Spec v3 §5.1D, v4 Phase 3)
-- ============================================================================

CREATE TABLE risk_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What this exception applies to (at least one should be set)
  risk_id UUID REFERENCES risk_classifications(id) ON DELETE SET NULL,
  control_id TEXT,  -- references a control_checks.control_id (not FK for flexibility)

  title TEXT NOT NULL,
  justification TEXT NOT NULL,
  compensating_controls JSONB NOT NULL DEFAULT '[]',  -- string[]

  -- Workflow
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'denied', 'expired', 'revoked')),
  expiry_reminder_sent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_risk_exceptions_project_id ON risk_exceptions(project_id);
CREATE INDEX idx_risk_exceptions_organization_id ON risk_exceptions(organization_id);
CREATE INDEX idx_risk_exceptions_risk_id ON risk_exceptions(risk_id);
CREATE INDEX idx_risk_exceptions_status ON risk_exceptions(status);
CREATE INDEX idx_risk_exceptions_requested_by ON risk_exceptions(requested_by);
CREATE INDEX idx_risk_exceptions_approved_by ON risk_exceptions(approved_by);
CREATE INDEX idx_risk_exceptions_expires_at ON risk_exceptions(expires_at);

-- Trigger: auto-update updated_at
CREATE TRIGGER set_risk_exceptions_updated_at
  BEFORE UPDATE ON risk_exceptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE risk_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view risk exceptions"
  ON risk_exceptions FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage risk exceptions"
  ON risk_exceptions FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- Allow any authenticated team member to request an exception
CREATE POLICY "Team members can request exceptions"
  ON risk_exceptions FOR INSERT
  WITH CHECK (organization_id = auth_org_id());
