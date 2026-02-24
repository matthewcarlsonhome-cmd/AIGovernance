-- ============================================================================
-- 018: Project State Machine & Notifications
-- Adds the 7-state FSM status values to projects, plus a notifications
-- table for the in-app notification center (Design Spec v4).
-- ============================================================================

-- Widen the projects.status CHECK constraint to include the 7-state FSM values
-- used by lib/state-machine/. The original 7 values (discovery..completed) are
-- kept for backwards compatibility; the new values map to the FSM.
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN (
    -- Original values (still valid)
    'discovery', 'governance', 'sandbox', 'pilot', 'evaluation', 'production', 'completed',
    -- State-machine values (v4)
    'draft', 'scoped', 'data_approved', 'security_approved',
    'pilot_running', 'review_complete', 'decision_finalized'
  ));

-- Notifications — in-app notification center
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- NULL = broadcast to org
  target_role TEXT CHECK (target_role IN ('admin', 'consultant', 'executive', 'it', 'legal', 'engineering', 'marketing')),

  type TEXT NOT NULL CHECK (type IN (
    'task_assigned', 'task_completed', 'phase_transition', 'gate_scheduled',
    'gate_decided', 'deadline_approaching', 'exception_expiring',
    'mention', 'escalation', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,           -- deep link into the app
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_target_role ON notifications(target_role);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users see notifications targeted to them or their role or broadcast
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (
    organization_id = auth_org_id()
    AND (
      user_id = auth.uid()
      OR user_id IS NULL
      OR target_role = (SELECT role FROM users WHERE id = auth.uid())
    )
  );

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (
    organization_id = auth_org_id()
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- System/admins can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (organization_id = auth_org_id());
