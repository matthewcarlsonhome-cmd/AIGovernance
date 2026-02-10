// Organization and User types
export type UserRole = 'admin' | 'consultant' | 'executive' | 'it' | 'legal' | 'engineering' | 'marketing';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  size?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: UserRole;
  user?: User;
  created_at: string;
}

// Project types
export type ProjectStatus = 'discovery' | 'governance' | 'sandbox' | 'pilot' | 'evaluation' | 'production' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  status: ProjectStatus;
  feasibility_score?: number;
  start_date?: string;
  target_end_date?: string;
  actual_end_date?: string;
  created_at: string;
  updated_at: string;
}

// Assessment types
export type QuestionType = 'single_select' | 'multi_select' | 'text' | 'number' | 'file_upload';

export interface AssessmentQuestion {
  id: string;
  section: string;
  domain: ScoreDomain;
  text: string;
  type: QuestionType;
  options?: string[];
  weight: number;
  scoring?: Record<string, number>;
  branches?: Record<string, string[]>;
  help_text?: string;
  required: boolean;
  order: number;
}

export interface AssessmentResponse {
  id: string;
  project_id: string;
  question_id: string;
  value: string | string[] | number;
  responded_by?: string;
  created_at: string;
  updated_at: string;
}

// Scoring types
export type ScoreDomain = 'infrastructure' | 'security' | 'governance' | 'engineering' | 'business';
export type FeasibilityRating = 'high' | 'moderate' | 'conditional' | 'not_ready';

export interface DomainScore {
  domain: ScoreDomain;
  score: number;
  maxScore: number;
  percentage: number;
  passThreshold: number;
  passed: boolean;
  recommendations: string[];
  remediation_tasks: string[];
}

export interface FeasibilityScore {
  domain_scores: DomainScore[];
  overall_score: number;
  rating: FeasibilityRating;
  recommendations: string[];
  remediation_tasks: string[];
}

// Governance types
export type PolicyType = 'aup' | 'irp' | 'data_classification' | 'risk_framework';
export type PolicyStatus = 'draft' | 'review' | 'approved' | 'archived';

export interface Policy {
  id: string;
  project_id: string;
  title: string;
  type: PolicyType;
  status: PolicyStatus;
  content: string;
  version: number;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version: number;
  content: string;
  change_summary?: string;
  created_by?: string;
  created_at: string;
}

export type GateNumber = 1 | 2 | 3;
export type GateStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface GateReview {
  id: string;
  project_id: string;
  gate_number: GateNumber;
  status: GateStatus;
  evidence_checklist: GateEvidence[];
  approvers: GateApprover[];
  notes?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GateEvidence {
  id: string;
  label: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

export interface GateApprover {
  user_id: string;
  name: string;
  role: string;
  approved: boolean;
  approved_at?: string;
}

export interface ComplianceMapping {
  id: string;
  project_id: string;
  framework: string;
  control_id: string;
  control_name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'implemented' | 'verified' | 'not_applicable';
  evidence?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type RiskTier = 'critical' | 'high' | 'medium' | 'low';

export interface RiskClassification {
  id: string;
  project_id: string;
  category: string;
  description: string;
  tier: RiskTier;
  likelihood: number;
  impact: number;
  mitigation: string;
  owner?: string;
  status: 'open' | 'mitigating' | 'accepted' | 'closed';
  created_at: string;
  updated_at: string;
}

// Sandbox types
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'on_premises';
export type SandboxModel = 'cloud_native' | 'codespaces' | 'docker' | 'hybrid';

export interface SandboxConfig {
  id: string;
  project_id: string;
  cloud_provider: CloudProvider;
  sandbox_model: SandboxModel;
  vpc_cidr?: string;
  region?: string;
  ai_provider?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConfigFile {
  id: string;
  sandbox_config_id: string;
  filename: string;
  file_type: 'json' | 'toml' | 'yaml' | 'hcl' | 'markdown' | 'dockerfile';
  content: string;
  description: string;
  created_at: string;
}

export interface EnvironmentValidation {
  id: string;
  project_id: string;
  check_name: string;
  check_category: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  message?: string;
  details?: Record<string, unknown>;
  validated_at: string;
}

// Timeline types
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TimelineTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  phase: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  assigned_to?: string;
  status: TaskStatus;
  dependencies: TaskDependency[];
  progress_percent: number;
  is_milestone: boolean;
  is_critical_path?: boolean;
  gate_review_id?: string;
  color?: string;
}

export interface TaskDependency {
  task_id: string;
  type: DependencyType;
}

export interface TimelineMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  date: string;
  status: 'pending' | 'completed' | 'missed' | 'at_risk';
  gate_number?: GateNumber;
}

export interface TimelineSnapshot {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  snapshot_data: Record<string, unknown>;
  captured_at: string;
  captured_by?: string;
}

// PoC types
export interface PocProject {
  id: string;
  project_id: string;
  name: string;
  description: string;
  tool: 'claude_code' | 'openai_codex' | 'other';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  selection_score?: number;
  criteria?: PocCriterion[];
  created_at: string;
  updated_at: string;
}

export interface PocCriterion {
  name: string;
  score: number;
  weight: number;
}

export interface PocSprint {
  id: string;
  poc_project_id: string;
  sprint_number: number;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed';
  goals: string[];
  velocity?: number;
  satisfaction?: number;
  notes?: string;
}

export interface PocMetric {
  id: string;
  sprint_id: string;
  metric_type: 'velocity' | 'defect_rate' | 'cycle_time' | 'satisfaction' | 'code_quality';
  baseline_value: number;
  ai_assisted_value: number;
  unit: string;
  notes?: string;
}

export interface ToolEvaluation {
  id: string;
  project_id: string;
  tool_name: string;
  category: string;
  score: number;
  max_score: number;
  notes?: string;
}

// Report types
export type ReportPersona = 'executive' | 'legal' | 'it_security' | 'engineering' | 'marketing';
export type ReportFormat = 'pdf' | 'docx' | 'markdown';
export type ReportStatus = 'draft' | 'generating' | 'review' | 'final';

export interface ReportTemplate {
  id: string;
  persona: ReportPersona;
  title: string;
  description?: string;
  sections: ReportSection[];
  format: ReportFormat;
}

export interface ReportSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
}

export interface GeneratedReport {
  id: string;
  project_id: string;
  template_id?: string;
  persona: ReportPersona;
  title: string;
  status: ReportStatus;
  content?: Record<string, unknown>;
  file_url?: string;
  file_size?: number;
  generated_by?: string;
  generated_at: string;
  updated_at: string;
}

// Meeting & Action Item types (NEW)
export type MeetingType = 'discovery' | 'gate_review' | 'executive_briefing' | 'sprint_review' | 'general' | 'kickoff' | 'retrospective';

export interface MeetingNote {
  id: string;
  project_id: string;
  title: string;
  meeting_date: string;
  meeting_type: MeetingType;
  attendees: MeetingAttendee[];
  notes?: string;
  summary?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttendee {
  user_id?: string;
  name: string;
  role?: string;
  email?: string;
}

export type ActionItemStatus = 'open' | 'in_progress' | 'complete' | 'cancelled';
export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ActionItem {
  id: string;
  meeting_id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  due_date?: string;
  linked_task_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// RACI types (NEW)
export type RaciAssignment = 'R' | 'A' | 'C' | 'I';

export interface RaciMatrix {
  id: string;
  project_id: string;
  phase: string;
  created_at: string;
  updated_at: string;
}

export interface RaciEntry {
  id: string;
  matrix_id: string;
  task_name: string;
  task_id?: string;
  user_id?: string;
  user_name: string;
  assignment: RaciAssignment;
  created_at: string;
  updated_at: string;
}

// ROI types (NEW)
export interface RoiInputs {
  team_size: number;
  avg_salary: number;
  current_velocity: number;
  projected_velocity_lift: number;
  license_cost_per_user: number;
  implementation_cost: number;
  training_cost: number;
}

export interface RoiResults {
  monthly_savings: number;
  annual_savings: number;
  total_annual_cost: number;
  net_annual_benefit: number;
  payback_months: number;
  three_year_npv: number;
  roi_percentage: number;
}

export interface RoiCalculation {
  id: string;
  project_id: string;
  inputs: RoiInputs;
  results: RoiResults;
  sensitivity_data?: SensitivityRow[];
  calculated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SensitivityRow {
  velocity_lift: number;
  monthly_savings: number;
  annual_savings: number;
  payback_months: number;
  three_year_npv: number;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  children?: NavItem[];
  roles?: UserRole[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
