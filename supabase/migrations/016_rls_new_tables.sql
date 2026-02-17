-- ============================================================================
-- 016: Row Level Security for New Tables (014 & 015)
-- Org-scoped policies using the existing auth_org_id() helper.
-- Pattern: team members can SELECT within org; admins/consultants can manage.
-- audit_events is insert-only (no UPDATE/DELETE), matching audit_logs pattern.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on all 9 new tables
-- ---------------------------------------------------------------------------
ALTER TABLE data_asset_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- data_asset_records
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view data assets"
  ON data_asset_records FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage data assets"
  ON data_asset_records FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- data_processing_activities
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view processing activities"
  ON data_processing_activities FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage processing activities"
  ON data_processing_activities FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- governance_gates
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view governance gates"
  ON governance_gates FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage governance gates"
  ON governance_gates FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- pilot_setups
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view pilot setups"
  ON pilot_setups FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage pilot setups"
  ON pilot_setups FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- control_checks
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view control checks"
  ON control_checks FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage control checks"
  ON control_checks FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- policy_rules
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view policy rules"
  ON policy_rules FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage policy rules"
  ON policy_rules FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- security_incidents
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view security incidents"
  ON security_incidents FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage security incidents"
  ON security_incidents FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- evidence_packages
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view evidence packages"
  ON evidence_packages FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins can manage evidence packages"
  ON evidence_packages FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- ---------------------------------------------------------------------------
-- audit_events — insert-only; no UPDATE or DELETE through RLS
-- ---------------------------------------------------------------------------
CREATE POLICY "Team can view audit events"
  ON audit_events FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Authenticated users can insert audit events"
  ON audit_events FOR INSERT
  WITH CHECK (organization_id = auth_org_id());
