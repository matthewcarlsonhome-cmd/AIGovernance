-- 006: PoC Evaluation

CREATE TABLE poc_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tool TEXT NOT NULL CHECK (tool IN ('claude_code', 'openai_codex', 'other')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  selection_score NUMERIC(5,2),
  criteria JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_poc_projects_project_id ON poc_projects(project_id);

CREATE TABLE poc_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poc_project_id UUID NOT NULL REFERENCES poc_projects(id) ON DELETE CASCADE,
  sprint_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  goals JSONB DEFAULT '[]',
  velocity NUMERIC(5,1),
  satisfaction NUMERIC(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_poc_sprints_poc_project_id ON poc_sprints(poc_project_id);

CREATE TABLE poc_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES poc_sprints(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('velocity', 'defect_rate', 'cycle_time', 'satisfaction', 'code_quality')),
  baseline_value NUMERIC(10,2) NOT NULL,
  ai_assisted_value NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_poc_metrics_sprint_id ON poc_metrics(sprint_id);

CREATE TABLE tool_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  category TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tool_evaluations_project_id ON tool_evaluations(project_id);

CREATE TRIGGER set_poc_projects_updated_at BEFORE UPDATE ON poc_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_poc_sprints_updated_at BEFORE UPDATE ON poc_sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at();
