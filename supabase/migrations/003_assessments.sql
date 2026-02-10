-- 003: Assessment Engine

CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('infrastructure', 'security', 'governance', 'engineering', 'business')),
  text TEXT NOT NULL,
  help_text TEXT,
  type TEXT NOT NULL CHECK (type IN ('single_select', 'multi_select', 'text', 'number', 'file_upload')),
  options JSONB DEFAULT '[]',
  weight NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  scoring JSONB DEFAULT '{}',
  branching_rules JSONB,
  required BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_questions_template_id ON assessment_questions(template_id);
CREATE INDEX idx_assessment_questions_domain ON assessment_questions(domain);

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  responded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, question_id)
);

CREATE INDEX idx_assessment_responses_project_id ON assessment_responses(project_id);

CREATE TABLE feasibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL CHECK (domain IN ('infrastructure', 'security', 'governance', 'engineering', 'business')),
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  percentage NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  recommendations JSONB DEFAULT '[]',
  remediation_tasks JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, domain)
);

CREATE INDEX idx_feasibility_scores_project_id ON feasibility_scores(project_id);

CREATE TRIGGER set_assessment_templates_updated_at
  BEFORE UPDATE ON assessment_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_assessment_responses_updated_at
  BEFORE UPDATE ON assessment_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
