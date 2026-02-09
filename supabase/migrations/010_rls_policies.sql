-- 010: Row Level Security Policies
-- All tables are org-scoped: users can only access data within their organization

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feasibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE poc_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE poc_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE poc_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE raci_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE raci_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's organization_id
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: users see their own org
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = auth_org_id());

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Users: see users in same org
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage org users"
  ON users FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- Projects: org-scoped
CREATE POLICY "Users can view org projects"
  ON projects FOR SELECT
  USING (organization_id = auth_org_id());

CREATE POLICY "Admins/consultants can manage projects"
  ON projects FOR ALL
  USING (organization_id = auth_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- Team members: project-scoped through org
CREATE POLICY "Users can view project team"
  ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = team_members.project_id AND projects.organization_id = auth_org_id()
  ));

CREATE POLICY "Admins can manage team"
  ON team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = team_members.project_id AND projects.organization_id = auth_org_id()
  ) AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  ));

-- Assessment templates: globally readable
CREATE POLICY "Anyone can view active templates"
  ON assessment_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view template questions"
  ON assessment_questions FOR SELECT
  USING (true);

-- Assessment responses: project-scoped
CREATE POLICY "Team can view responses"
  ON assessment_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = assessment_responses.project_id AND projects.organization_id = auth_org_id()
  ));

CREATE POLICY "Team can manage responses"
  ON assessment_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = assessment_responses.project_id AND projects.organization_id = auth_org_id()
  ));

-- Feasibility scores: project-scoped
CREATE POLICY "Team can view scores"
  ON feasibility_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = feasibility_scores.project_id AND projects.organization_id = auth_org_id()
  ));

CREATE POLICY "System can manage scores"
  ON feasibility_scores FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = feasibility_scores.project_id AND projects.organization_id = auth_org_id()
  ));

-- Governance tables: project-scoped through org
-- Policies
CREATE POLICY "Team can view policies" ON policies FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = policies.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage policies" ON policies FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = policies.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view policy versions" ON policy_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM policies JOIN projects ON projects.id = policies.project_id WHERE policies.id = policy_versions.policy_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage policy versions" ON policy_versions FOR ALL
  USING (EXISTS (SELECT 1 FROM policies JOIN projects ON projects.id = policies.project_id WHERE policies.id = policy_versions.policy_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view compliance" ON compliance_mappings FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = compliance_mappings.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage compliance" ON compliance_mappings FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = compliance_mappings.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view risks" ON risk_classifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = risk_classifications.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage risks" ON risk_classifications FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = risk_classifications.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view gates" ON gate_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = gate_reviews.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage gates" ON gate_reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = gate_reviews.project_id AND projects.organization_id = auth_org_id()));

-- Sandbox: project-scoped
CREATE POLICY "Team can view sandbox" ON sandbox_configs FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = sandbox_configs.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage sandbox" ON sandbox_configs FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = sandbox_configs.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view configs" ON config_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM sandbox_configs JOIN projects ON projects.id = sandbox_configs.project_id WHERE sandbox_configs.id = config_files.sandbox_config_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage configs" ON config_files FOR ALL
  USING (EXISTS (SELECT 1 FROM sandbox_configs JOIN projects ON projects.id = sandbox_configs.project_id WHERE sandbox_configs.id = config_files.sandbox_config_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view validations" ON environment_validations FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = environment_validations.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage validations" ON environment_validations FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = environment_validations.project_id AND projects.organization_id = auth_org_id()));

-- PoC: project-scoped
CREATE POLICY "Team can view poc" ON poc_projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = poc_projects.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage poc" ON poc_projects FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = poc_projects.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view sprints" ON poc_sprints FOR SELECT
  USING (EXISTS (SELECT 1 FROM poc_projects JOIN projects ON projects.id = poc_projects.project_id WHERE poc_projects.id = poc_sprints.poc_project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage sprints" ON poc_sprints FOR ALL
  USING (EXISTS (SELECT 1 FROM poc_projects JOIN projects ON projects.id = poc_projects.project_id WHERE poc_projects.id = poc_sprints.poc_project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view metrics" ON poc_metrics FOR SELECT
  USING (EXISTS (SELECT 1 FROM poc_sprints JOIN poc_projects ON poc_projects.id = poc_sprints.poc_project_id JOIN projects ON projects.id = poc_projects.project_id WHERE poc_sprints.id = poc_metrics.sprint_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage metrics" ON poc_metrics FOR ALL
  USING (EXISTS (SELECT 1 FROM poc_sprints JOIN poc_projects ON poc_projects.id = poc_sprints.poc_project_id JOIN projects ON projects.id = poc_projects.project_id WHERE poc_sprints.id = poc_metrics.sprint_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view evaluations" ON tool_evaluations FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = tool_evaluations.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage evaluations" ON tool_evaluations FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = tool_evaluations.project_id AND projects.organization_id = auth_org_id()));

-- Timeline: project-scoped
CREATE POLICY "Team can view tasks" ON timeline_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_tasks.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage tasks" ON timeline_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_tasks.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view dependencies" ON timeline_dependencies FOR SELECT
  USING (EXISTS (SELECT 1 FROM timeline_tasks JOIN projects ON projects.id = timeline_tasks.project_id WHERE timeline_tasks.id = timeline_dependencies.source_task_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage dependencies" ON timeline_dependencies FOR ALL
  USING (EXISTS (SELECT 1 FROM timeline_tasks JOIN projects ON projects.id = timeline_tasks.project_id WHERE timeline_tasks.id = timeline_dependencies.source_task_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view milestones" ON timeline_milestones FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_milestones.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage milestones" ON timeline_milestones FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_milestones.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view snapshots" ON timeline_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_snapshots.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage snapshots" ON timeline_snapshots FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_snapshots.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view history" ON task_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM timeline_tasks JOIN projects ON projects.id = timeline_tasks.project_id WHERE timeline_tasks.id = task_status_history.task_id AND projects.organization_id = auth_org_id()));

-- Reports: project-scoped
CREATE POLICY "Anyone can view templates" ON report_templates FOR SELECT USING (is_active = true);

CREATE POLICY "Team can view reports" ON generated_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = generated_reports.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage reports" ON generated_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = generated_reports.project_id AND projects.organization_id = auth_org_id()));

-- Meetings: project-scoped
CREATE POLICY "Team can view meetings" ON meeting_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = meeting_notes.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage meetings" ON meeting_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = meeting_notes.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view actions" ON action_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = action_items.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage actions" ON action_items FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = action_items.project_id AND projects.organization_id = auth_org_id()));

-- RACI: project-scoped
CREATE POLICY "Team can view raci" ON raci_matrices FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = raci_matrices.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage raci" ON raci_matrices FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = raci_matrices.project_id AND projects.organization_id = auth_org_id()));

CREATE POLICY "Team can view raci entries" ON raci_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM raci_matrices JOIN projects ON projects.id = raci_matrices.project_id WHERE raci_matrices.id = raci_entries.matrix_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage raci entries" ON raci_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM raci_matrices JOIN projects ON projects.id = raci_matrices.project_id WHERE raci_matrices.id = raci_entries.matrix_id AND projects.organization_id = auth_org_id()));

-- ROI: project-scoped
CREATE POLICY "Team can view roi" ON roi_calculations FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = roi_calculations.project_id AND projects.organization_id = auth_org_id()));
CREATE POLICY "Team can manage roi" ON roi_calculations FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = roi_calculations.project_id AND projects.organization_id = auth_org_id()));
