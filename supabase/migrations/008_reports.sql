-- 008: Reporting

CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona TEXT NOT NULL CHECK (persona IN ('executive', 'legal', 'it_security', 'engineering', 'marketing')),
  title TEXT NOT NULL,
  description TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'markdown')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id),
  persona TEXT NOT NULL CHECK (persona IN ('executive', 'legal', 'it_security', 'engineering', 'marketing')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'review', 'final')),
  content JSONB,
  file_url TEXT,
  file_size INTEGER,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_reports_project_id ON generated_reports(project_id);
CREATE INDEX idx_generated_reports_persona ON generated_reports(persona);

CREATE TRIGGER set_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_generated_reports_updated_at BEFORE UPDATE ON generated_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
