-- 009: Meeting Tracker & RACI Matrix (New Features)

-- Meeting notes
CREATE TABLE meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'general' CHECK (meeting_type IN ('discovery', 'gate_review', 'executive_briefing', 'sprint_review', 'general', 'kickoff', 'retrospective')),
  attendees JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  summary TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_meeting_notes_project_id ON meeting_notes(project_id);
CREATE INDEX idx_meeting_notes_meeting_date ON meeting_notes(meeting_date);

-- Action items from meetings
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meeting_notes(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  assigned_to_name TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'complete', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  linked_task_id UUID REFERENCES timeline_tasks(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX idx_action_items_project_id ON action_items(project_id);
CREATE INDEX idx_action_items_assigned_to ON action_items(assigned_to);
CREATE INDEX idx_action_items_status ON action_items(status);

-- RACI Matrix
CREATE TABLE raci_matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, phase)
);

CREATE INDEX idx_raci_matrices_project_id ON raci_matrices(project_id);

CREATE TABLE raci_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matrix_id UUID NOT NULL REFERENCES raci_matrices(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_id UUID REFERENCES timeline_tasks(id),
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  assignment TEXT NOT NULL CHECK (assignment IN ('R', 'A', 'C', 'I')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(matrix_id, task_name, user_name)
);

CREATE INDEX idx_raci_entries_matrix_id ON raci_entries(matrix_id);

-- ROI calculations
CREATE TABLE roi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  sensitivity_data JSONB,
  calculated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

CREATE INDEX idx_roi_calculations_project_id ON roi_calculations(project_id);

CREATE TRIGGER set_meeting_notes_updated_at BEFORE UPDATE ON meeting_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_action_items_updated_at BEFORE UPDATE ON action_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_raci_matrices_updated_at BEFORE UPDATE ON raci_matrices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_raci_entries_updated_at BEFORE UPDATE ON raci_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_roi_calculations_updated_at BEFORE UPDATE ON roi_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
