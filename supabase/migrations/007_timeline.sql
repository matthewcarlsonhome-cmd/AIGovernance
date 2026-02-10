-- 007: Timeline & Project Management

CREATE TABLE timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL,
  assigned_to UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'complete')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_milestone BOOLEAN NOT NULL DEFAULT false,
  is_critical_path BOOLEAN NOT NULL DEFAULT false,
  gate_review_id UUID REFERENCES gate_reviews(id),
  color TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_tasks_project_id ON timeline_tasks(project_id);
CREATE INDEX idx_timeline_tasks_status ON timeline_tasks(status);
CREATE INDEX idx_timeline_tasks_assigned_to ON timeline_tasks(assigned_to);

CREATE TABLE timeline_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_task_id UUID NOT NULL REFERENCES timeline_tasks(id) ON DELETE CASCADE,
  target_task_id UUID NOT NULL REFERENCES timeline_tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'FS' CHECK (type IN ('FS', 'SS', 'FF', 'SF')),
  lag_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_task_id, target_task_id)
);

CREATE INDEX idx_timeline_dependencies_source ON timeline_dependencies(source_task_id);
CREATE INDEX idx_timeline_dependencies_target ON timeline_dependencies(target_task_id);

CREATE TABLE timeline_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'at_risk')),
  gate_number INTEGER CHECK (gate_number IN (1, 2, 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_milestones_project_id ON timeline_milestones(project_id);

CREATE TABLE timeline_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  snapshot_data JSONB NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  captured_by UUID REFERENCES users(id)
);

CREATE INDEX idx_timeline_snapshots_project_id ON timeline_snapshots(project_id);

CREATE TABLE task_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES timeline_tasks(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_status_history_task_id ON task_status_history(task_id);

CREATE TRIGGER set_timeline_tasks_updated_at BEFORE UPDATE ON timeline_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_timeline_milestones_updated_at BEFORE UPDATE ON timeline_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
