-- 005: Sandbox Configuration

CREATE TABLE sandbox_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cloud_provider TEXT NOT NULL CHECK (cloud_provider IN ('aws', 'gcp', 'azure', 'on_premises')),
  sandbox_model TEXT NOT NULL CHECK (sandbox_model IN ('cloud_native', 'codespaces', 'docker', 'hybrid')),
  vpc_cidr TEXT,
  region TEXT,
  ai_provider TEXT DEFAULT 'anthropic',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

CREATE INDEX idx_sandbox_configs_project_id ON sandbox_configs(project_id);

CREATE TABLE config_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sandbox_config_id UUID NOT NULL REFERENCES sandbox_configs(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('json', 'toml', 'yaml', 'hcl', 'markdown', 'dockerfile')),
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_config_files_sandbox_config_id ON config_files(sandbox_config_id);

CREATE TABLE environment_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  check_name TEXT NOT NULL,
  check_category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass', 'warning', 'fail', 'pending')),
  message TEXT,
  details JSONB,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_environment_validations_project_id ON environment_validations(project_id);

CREATE TRIGGER set_sandbox_configs_updated_at BEFORE UPDATE ON sandbox_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_config_files_updated_at BEFORE UPDATE ON config_files FOR EACH ROW EXECUTE FUNCTION update_updated_at();
