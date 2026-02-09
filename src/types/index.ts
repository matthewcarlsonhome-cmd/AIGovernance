// Organization and User types
export type UserRole = 'admin' | 'consultant' | 'executive' | 'it' | 'legal' | 'engineering' | 'marketing';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  size?: string;
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
  status: 'not_started' | 'in_progress' | 'implemented' | 'verified';
  evidence?: string;
  notes?: string;
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
  status: 'identified' | 'mitigating' | 'accepted' | 'resolved';
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

// Timeline types
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TimelineTask {
  id: string;
  project_id: string;
  title: string;
  phase: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  assigned_to?: string;
  status: TaskStatus;
  dependencies: TaskDependency[];
  progress_percent: number;
  is_milestone: boolean;
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
  date: string;
  status: 'upcoming' | 'reached' | 'missed';
  gate_number?: GateNumber;
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
  created_at: string;
}

export interface PocSprint {
  id: string;
  poc_project_id: string;
  sprint_number: number;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed';
  goals: string[];
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
  template_id: string;
  persona: ReportPersona;
  title: string;
  status: ReportStatus;
  content?: string;
  file_url?: string;
  generated_at: string;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  children?: NavItem[];
  roles?: UserRole[];
}
