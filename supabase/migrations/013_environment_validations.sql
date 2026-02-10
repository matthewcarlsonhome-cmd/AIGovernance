-- Environment Validations table
-- Stores sandbox validation check results for audit trail and history

CREATE TABLE IF NOT EXISTS environment_validations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  check_name text NOT NULL,
  check_category text NOT NULL,
  status text NOT NULL CHECK (status IN ('pass', 'warning', 'fail', 'pending')),
  message text,
  details jsonb,
  validated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_env_validations_project_id ON environment_validations(project_id);
CREATE INDEX IF NOT EXISTS idx_env_validations_validated_at ON environment_validations(validated_at DESC);
CREATE INDEX IF NOT EXISTS idx_env_validations_status ON environment_validations(status);

-- RLS
ALTER TABLE environment_validations ENABLE ROW LEVEL SECURITY;

-- Policy: users can view validations for projects in their organization
CREATE POLICY "Users can view validations for their projects"
  ON environment_validations FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN team_members tm ON tm.project_id = p.id
      JOIN users u ON u.id = tm.user_id
      WHERE u.id = auth.uid()
    )
  );

-- Policy: users can insert validations for their projects
CREATE POLICY "Users can insert validations for their projects"
  ON environment_validations FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN team_members tm ON tm.project_id = p.id
      JOIN users u ON u.id = tm.user_id
      WHERE u.id = auth.uid()
    )
  );
