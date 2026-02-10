-- ============================================================================
-- 012: Audit Log
-- Tracks all significant user actions across the platform for compliance,
-- security monitoring, and operational visibility.
-- ============================================================================

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES users(id),
  action text NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'view', 'export', 'approve', 'sign_in', 'sign_out'
  )),
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read audit logs for their own organization.
-- Audit logs are insert-only from the application layer; updates and deletes
-- are intentionally not permitted through RLS to preserve the audit trail.
CREATE POLICY audit_logs_org_read ON audit_logs
  FOR SELECT
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Allow inserts from authenticated users within the same organization.
CREATE POLICY audit_logs_org_insert ON audit_logs
  FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
