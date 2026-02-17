// Organization and User types
export type UserRole = 'admin' | 'consultant' | 'executive' | 'it' | 'legal' | 'engineering' | 'marketing';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  size: string | null;
  logo_url: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  avatar_url: string | null;
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
  feasibility_score: number | null;
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date?: string | null;
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
  options: string[] | null;
  weight: number;
  scoring: Record<string, number> | null;
  branches?: Record<string, string[]> | null;
  help_text: string | null;
  required: boolean;
  order: number;
}

export interface AssessmentResponse {
  id: string;
  project_id: string;
  question_id: string;
  value: string | string[] | number;
  responded_by?: string | null;
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
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version: number;
  content: string;
  change_summary: string | null;
  created_by: string | null;
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
  notes: string | null;
  reviewed_at: string | null;
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
  evidence: string | null;
  notes: string | null;
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
  owner: string | null;
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
  vpc_cidr: string | null;
  region: string | null;
  ai_provider: string | null;
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
  message: string | null;
  details: Record<string, unknown> | null;
  validated_at: string;
}

// Timeline types
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TimelineTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  phase: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  assigned_to: string | null;
  status: TaskStatus;
  dependencies: TaskDependency[];
  progress_percent: number;
  is_milestone: boolean;
  is_critical_path: boolean;
  gate_review_id: string | null;
  color: string | null;
}

export interface TaskDependency {
  task_id: string;
  type: DependencyType;
}

export interface TimelineMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  date: string;
  status: 'pending' | 'completed' | 'missed' | 'at_risk';
  gate_number: GateNumber | null;
}

export interface TimelineSnapshot {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  snapshot_data: Record<string, unknown>;
  captured_at: string;
  captured_by: string | null;
}

// PoC types
export interface PocProject {
  id: string;
  project_id: string;
  name: string;
  description: string;
  tool: 'claude_code' | 'openai_codex' | 'other';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  selection_score: number | null;
  criteria: PocCriterion[] | null;
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
  velocity: number | null;
  satisfaction: number | null;
  notes: string | null;
}

export interface PocMetric {
  id: string;
  sprint_id: string;
  metric_type: 'velocity' | 'defect_rate' | 'cycle_time' | 'satisfaction' | 'code_quality';
  baseline_value: number;
  ai_assisted_value: number;
  unit: string;
  notes: string | null;
}

export interface ToolEvaluation {
  id: string;
  project_id: string;
  tool_name: string;
  category: string;
  score: number;
  max_score: number;
  notes: string | null;
}

// Report types
export type ReportPersona = 'executive' | 'legal' | 'it_security' | 'engineering' | 'marketing';
export type ReportFormat = 'pdf' | 'docx' | 'markdown';
export type ReportStatus = 'draft' | 'generating' | 'review' | 'final';

export interface ReportTemplate {
  id: string;
  persona: ReportPersona;
  title: string;
  description: string | null;
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
  template_id: string | null;
  persona: ReportPersona;
  title: string;
  status: ReportStatus;
  content: Record<string, unknown> | null;
  file_url: string | null;
  file_size: number | null;
  generated_by: string | null;
  generated_at: string;
  updated_at: string;
}

// Meeting & Action Item types
export type MeetingType = 'discovery' | 'gate_review' | 'executive_briefing' | 'sprint_review' | 'general' | 'kickoff' | 'retrospective';

export interface MeetingNote {
  id: string;
  project_id: string;
  title: string;
  meeting_date: string;
  meeting_type: MeetingType;
  attendees: MeetingAttendee[];
  notes: string | null;
  summary: string | null;
  created_by: string | null;
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
  description: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  due_date: string | null;
  linked_task_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// RACI types
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
  task_id: string | null;
  user_id: string | null;
  user_name: string;
  assignment: RaciAssignment;
  created_at: string;
  updated_at: string;
}

// ROI types
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
  sensitivity_data: SensitivityRow[] | null;
  calculated_by: string | null;
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

// Industry types
export type Industry = 'financial_services' | 'healthcare' | 'government' | 'technology' | 'manufacturing' | 'retail' | 'education' | 'other';

// Maturity Assessment types
export type MaturityDimension = 'policy_standards' | 'risk_management' | 'data_governance' | 'access_controls' | 'vendor_management' | 'training_awareness';
export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

export interface MaturitySubScores {
  documentation: number;
  implementation: number;
  enforcement: number;
  measurement: number;
  improvement: number;
}

export interface MaturityDimensionScore {
  dimension: MaturityDimension;
  level: MaturityLevel;
  score: number;
  subscores: MaturitySubScores;
  key_gap: string;
}

export interface MaturityAssessment {
  id: string;
  project_id: string;
  dimension_scores: MaturityDimensionScore[];
  overall_score: number;
  overall_level: MaturityLevel;
  industry: Industry | null;
  created_at: string;
  updated_at: string;
}

// Enhanced Risk types
export type RiskCategory = 'model_algorithm' | 'operational' | 'ethical_fairness' | 'regulatory_compliance' | 'security_privacy' | 'strategic_business' | 'third_party';

export interface RiskHeatMapCell {
  likelihood: number;
  impact: number;
  score: number;
  rating: RiskTier;
  risks: string[];
}

export interface RiskAssessmentSummary {
  total_risks: number;
  by_tier: Record<RiskTier, number>;
  by_category: Record<RiskCategory, number>;
  heat_map: RiskHeatMapCell[][];
  top_risks: RiskClassification[];
}

// Enhanced Compliance types
export type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'needs_review' | 'not_applicable';

export interface ComplianceRequirement {
  id: string;
  framework: string;
  article: string;
  requirement: string;
  status: ComplianceStatus;
  evidence: string | null;
  gap: string | null;
  priority: RiskTier;
}

export interface PrivacyImpactItem {
  id: string;
  data_type: string;
  purpose: string;
  legal_basis: string;
  retention: string;
  access: string;
  risk_level: RiskTier;
}

// Vendor Evaluation types
export type VendorDimension = 'capabilities' | 'security' | 'compliance' | 'integration' | 'economics' | 'viability' | 'support';

export interface VendorScore {
  dimension: VendorDimension;
  score: number;
  max_score: number;
  notes: string;
}

export interface VendorEvaluation {
  id: string;
  project_id: string;
  vendor_name: string;
  dimension_scores: VendorScore[];
  overall_score: number;
  recommendation: 'recommended' | 'alternative' | 'not_recommended';
  red_flags: string[];
  strengths: string[];
  weaknesses: string[];
  tco_estimate: number | null;
  created_at: string;
  updated_at: string;
}

// Enhanced ROI types
export interface EnhancedRoiInputs extends RoiInputs {
  infrastructure_cost: number;
  data_engineering_cost: number;
  change_management_cost: number;
  ongoing_infrastructure: number;
  ongoing_support_fte: number;
  support_fte_salary: number;
  revenue_increase_pct: number;
  error_reduction_pct: number;
  error_cost_annual: number;
}

export interface ScenarioAnalysis {
  scenario: 'optimistic' | 'base' | 'conservative' | 'pessimistic';
  probability: number;
  revenue_multiplier: number;
  cost_multiplier: number;
  npv: number;
  roi: number;
}

export interface EnhancedRoiResults extends RoiResults {
  tco_initial: number;
  tco_annual: number;
  tco_three_year: number;
  irr: number;
  scenarios: ScenarioAnalysis[];
  expected_npv: number;
  five_year_cashflows: number[];
  benefit_breakdown: { revenue: number; cost_reduction: number; error_savings: number; productivity: number };
}

// Ethics Review types
export type BiasType = 'historical' | 'representation' | 'measurement' | 'aggregation' | 'evaluation';
export type FairnessMetricType = 'demographic_parity' | 'equalized_odds' | 'predictive_parity' | 'individual_fairness';

export interface EthicsReview {
  id: string;
  project_id: string;
  system_name: string;
  system_purpose: string;
  risk_classification: RiskTier;
  bias_assessments: BiasAssessment[];
  fairness_metrics: FairnessMetric[];
  privacy_items: PrivacyImpactItem[];
  transparency_level: 'black_box' | 'interpretable' | 'explainable';
  human_oversight_controls: string[];
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

export interface BiasAssessment {
  type: BiasType;
  risk_level: RiskTier;
  evidence: string;
  mitigation: string;
}

export interface FairnessMetric {
  type: FairnessMetricType;
  target: string;
  current: string | null;
  status: ComplianceStatus;
}

// Change Management types
export interface ChangeReadinessFactor {
  factor: string;
  score: number;
  weight: number;
  notes: string;
}

export interface StakeholderGroup {
  group: string;
  influence: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  current_position: 'champion' | 'advocate' | 'supporter' | 'neutral' | 'skeptic' | 'resistant';
  target_position: 'champion' | 'advocate' | 'supporter' | 'neutral';
  strategy: string;
}

export interface ChangeManagementPlan {
  id: string;
  project_id: string;
  readiness_score: number;
  readiness_factors: ChangeReadinessFactor[];
  stakeholder_groups: StakeholderGroup[];
  communication_channels: CommunicationChannel[];
  training_modules: TrainingModule[];
  resistance_risks: ResistanceRisk[];
  adoption_metrics: AdoptionMetric[];
  created_at: string;
  updated_at: string;
}

export interface CommunicationChannel {
  audience: string;
  message_theme: string;
  channel: string;
  frequency: string;
  owner: string;
}

export interface TrainingModule {
  module: string;
  audience: string;
  format: string;
  duration: string;
  prerequisites: string;
}

export interface ResistanceRisk {
  type: string;
  indicators: string;
  root_cause: string;
  response_strategy: string;
  intensity: 'passive' | 'skeptical' | 'active' | 'aggressive';
}

export interface AdoptionMetric {
  category: 'awareness' | 'adoption' | 'sustainability';
  metric: string;
  target: string;
  measurement_method: string;
}

// Pilot Program types
export type PilotType = 'poc' | 'pov' | 'limited_pilot' | 'full_pilot';

export interface PilotDesign {
  id: string;
  project_id: string;
  pilot_type: PilotType;
  objectives: PilotObjective[];
  participant_criteria: ParticipantCriterion[];
  success_criteria: SuccessCriterion[];
  quantitative_metrics: PilotMetric[];
  go_nogo_gates: GoNoGoGate[];
  risk_register: PilotRisk[];
  kill_switch_criteria: string[];
  scale_recommendation: 'full_scale' | 'phased' | 'extended' | 'pivot' | 'discontinue' | null;
  created_at: string;
  updated_at: string;
}

export interface PilotObjective {
  category: 'technical' | 'business' | 'user' | 'operational' | 'strategic';
  description: string;
  priority: 'must_have' | 'should_have' | 'nice_to_have';
}

export interface ParticipantCriterion {
  criterion: string;
  weight: number;
  ideal_profile: string;
}

export interface SuccessCriterion {
  criteria: string;
  type: 'must_have' | 'should_have' | 'could_have';
  threshold: string;
  status: 'not_measured' | 'met' | 'not_met' | 'partial';
  evidence: string;
}

export interface PilotMetric {
  metric: string;
  baseline: string;
  target: string;
  actual: string | null;
  method: string;
}

export interface GoNoGoGate {
  criteria: string;
  threshold: string;
  status: 'pass' | 'fail' | 'pending';
  evidence: string;
}

export interface PilotRisk {
  risk: string;
  likelihood: RiskTier;
  impact: RiskTier;
  mitigation: string;
  contingency: string;
}

// Use Case Prioritization types
export type PriorityDimension = 'strategic_value' | 'technical_feasibility' | 'implementation_risk' | 'time_to_value';
export type PortfolioQuadrant = 'strategic_imperative' | 'high_value' | 'foundation_builder' | 'watch_list';

export interface UseCasePriority {
  id: string;
  project_id: string;
  name: string;
  description: string;
  sponsor: string;
  department: string;
  dimension_scores: UseCaseDimensionScore[];
  composite_score: number;
  quadrant: PortfolioQuadrant;
  implementation_wave: 1 | 2 | 3;
  dependencies: string[];
  roi_estimate: number | null;
  created_at: string;
  updated_at: string;
}

export interface UseCaseDimensionScore {
  dimension: PriorityDimension;
  score: number;
  weight: number;
  notes: string;
}

// Data Flow types
export interface DataFlowSystem {
  id: string;
  project_id: string;
  name: string;
  type: string;
  data_types: string[];
  ai_integration: boolean;
  ai_service: string | null;
  integration_type: 'direct_api' | 'embedded' | 'middleware' | 'on_premise' | 'rag_vector' | null;
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
  created_at: string;
  updated_at: string;
}

export interface DataFlowRiskPoint {
  id: string;
  project_id: string;
  system_id: string;
  risk_description: string;
  data_type: string;
  threat: string;
  score: number;
  current_control: string | null;
  recommended_control: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface VendorAssessment {
  id: string;
  project_id: string;
  vendor_name: string;
  service: string;
  data_access: string[];
  risk_rating: RiskTier;
  has_dpa: boolean;
  has_training_optout: boolean;
  has_deletion_rights: boolean;
  has_audit_rights: boolean;
  key_concerns: string[];
}

// AI Usage Playbook types
export type DataTrafficLight = 'green' | 'yellow' | 'red';

export interface PlaybookTool {
  name: string;
  status: 'approved' | 'restricted' | 'prohibited';
  data_handling: string;
  approved_for: string[];
  not_approved_for: string[];
  access_method: string;
}

export interface PlaybookDataRule {
  data_type: string;
  classification: DataTrafficLight;
  consumer_ai: boolean;
  enterprise_ai: boolean;
  notes: string;
}

export interface AIUsagePlaybook {
  id: string;
  project_id: string;
  golden_rules: string[];
  tools: PlaybookTool[];
  data_rules: PlaybookDataRule[];
  approved_activities: string[];
  prohibited_activities: string[];
  requires_approval: string[];
  disclosure_policy: string;
  created_at: string;
  updated_at: string;
}

// P3: AI Performance Monitoring types
export type MonitoringTier = 'executive' | 'model_performance' | 'operational' | 'data_quality' | 'business_impact';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type DriftType = 'data_drift' | 'concept_drift' | 'feature_drift';

export interface MonitoringMetric {
  id: string;
  tier: MonitoringTier;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'degraded' | 'critical';
  last_updated: string;
}

export interface MonitoringAlert {
  id: string;
  severity: AlertSeverity;
  metric_id: string;
  message: string;
  threshold: number;
  current_value: number;
  triggered_at: string;
  acknowledged: boolean;
}

export interface DriftDetection {
  id: string;
  drift_type: DriftType;
  feature: string;
  score: number;
  threshold: number;
  detected_at: string;
  status: 'active' | 'resolved' | 'investigating';
}

export interface MonitoringDashboard {
  id: string;
  project_id: string;
  health_score: number;
  metrics: MonitoringMetric[];
  alerts: MonitoringAlert[];
  drift_detections: DriftDetection[];
  created_at: string;
  updated_at: string;
}

// P3: Architecture Blueprint types
export type ArchitectureLayer = 'data_foundation' | 'ml_platform' | 'api_integration' | 'infrastructure' | 'mlops' | 'security';

export interface ArchitectureComponent {
  id: string;
  layer: ArchitectureLayer;
  name: string;
  technology: string;
  description: string;
  cloud_provider: string | null;
  status: 'planned' | 'in_progress' | 'deployed' | 'deprecated';
  dependencies: string[];
}

export interface ApiContract {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  description: string;
  request_schema: string;
  response_schema: string;
  rate_limit: string | null;
  auth_required: boolean;
}

export interface InfraRequirement {
  category: string;
  requirement: string;
  specification: string;
  priority: 'required' | 'recommended' | 'optional';
}

export interface ArchitectureBlueprint {
  id: string;
  project_id: string;
  name: string;
  cloud_provider: string;
  components: ArchitectureComponent[];
  api_contracts: ApiContract[];
  infra_requirements: InfraRequirement[];
  scaling_strategy: 'horizontal' | 'vertical' | 'auto' | 'hybrid';
  monitoring_stack: string[];
  deployment_model: 'kubernetes' | 'serverless' | 'vm' | 'hybrid';
  created_at: string;
  updated_at: string;
}

// P3: Stakeholder Communication types
export type CommunicationType = 'board_presentation' | 'executive_briefing' | 'employee_announcement' | 'employee_faq' | 'manager_talking_points' | 'customer_announcement' | 'customer_faq' | 'crisis_communication';

export interface CommunicationItem {
  id: string;
  type: CommunicationType;
  title: string;
  audience: string;
  key_messages: string[];
  content: string;
  tone: 'formal' | 'professional' | 'casual';
  status: 'draft' | 'review' | 'approved' | 'sent';
  scheduled_date: string | null;
}

export interface CommunicationCalendarEntry {
  id: string;
  milestone: string;
  date: string;
  communications: string[];
  owner: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface StakeholderCommunicationPackage {
  id: string;
  project_id: string;
  communications: CommunicationItem[];
  calendar: CommunicationCalendarEntry[];
  crisis_framework: string | null;
  created_at: string;
  updated_at: string;
}

// P3: Client Brief types
export type RiskPosture = 'conservative' | 'moderate' | 'progressive';

export interface ObjectionScript {
  objection: string;
  acknowledge: string;
  counter: string;
  evidence: string;
}

export interface TalkingPoint {
  role: 'c_suite' | 'legal' | 'it' | 'security' | 'engineering' | 'hr';
  points: string[];
  concerns: string[];
  benefits: string[];
}

export interface ClientBrief {
  id: string;
  project_id: string;
  client_industry: Industry;
  risk_posture: RiskPosture;
  executive_summary: string;
  governance_framework_summary: string;
  risk_mitigation_table: { risk: string; mitigation: string; status: string }[];
  objection_scripts: ObjectionScript[];
  talking_points: TalkingPoint[];
  faq_items: { question: string; answer: string }[];
  transparency_statement: string;
  available_upon_request: string[];
  created_at: string;
  updated_at: string;
}

// P3: Data Readiness types
export type DataReadinessDimension = 'availability' | 'quality' | 'accessibility' | 'governance' | 'security' | 'operations';
export type DataReadinessLevel = 'optimized' | 'managed' | 'defined' | 'developing' | 'initial';

export interface DataQualityMetric {
  dimension: 'accuracy' | 'completeness' | 'consistency' | 'timeliness' | 'validity' | 'uniqueness';
  score: number;
  target: number;
  domain: string;
  notes: string;
}

export interface DataAsset {
  id: string;
  name: string;
  type: 'database' | 'data_lake' | 'api' | 'file_system' | 'streaming' | 'feature_store';
  domain: string;
  owner: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  ai_relevance: 'training' | 'inference' | 'both' | 'none';
  quality_score: number;
}

export interface DataReadinessDimensionScore {
  dimension: DataReadinessDimension;
  score: number;
  weight: number;
  findings: string[];
  recommendations: string[];
}

export interface DataReadinessAudit {
  id: string;
  project_id: string;
  overall_score: number;
  readiness_level: DataReadinessLevel;
  dimension_scores: DataReadinessDimensionScore[];
  data_assets: DataAsset[];
  quality_metrics: DataQualityMetric[];
  dataops_maturity: number;
  remediation_roadmap: { phase: 'quick_wins' | 'foundation' | 'advanced'; items: string[] }[];
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Governance & Classification types (Design Doc §5C, §11)
// ─────────────────────────────────────────────────────────────────────────────

export type DataClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type DataRetentionPeriod = '30_days' | '90_days' | '1_year' | '3_years' | '7_years' | 'indefinite';
export type LawfulBasis = 'consent' | 'contract' | 'legal_obligation' | 'vital_interest' | 'public_task' | 'legitimate_interest';

export interface DataAssetRecord {
  id: string;
  project_id: string;
  organization_id: string;
  name: string;
  description: string;
  type: 'database' | 'data_lake' | 'api' | 'file_system' | 'streaming' | 'feature_store' | 'document' | 'spreadsheet';
  domain: string;
  owner_id: string | null;
  owner_name: string | null;
  classification: DataClassificationLevel;
  lawful_basis: LawfulBasis | null;
  retention_period: DataRetentionPeriod | null;
  retention_expires_at: string | null;
  source_system: string | null;
  contains_pii: boolean;
  pii_types: string[];
  ai_relevance: 'training' | 'inference' | 'both' | 'none';
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DataProcessingActivity {
  id: string;
  project_id: string;
  organization_id: string;
  data_asset_id: string;
  purpose: string;
  processor: string;
  processing_type: 'collection' | 'storage' | 'analysis' | 'transformation' | 'transfer' | 'deletion';
  transfer_region: string | null;
  cross_border: boolean;
  risk_flags: string[];
  lawful_basis: LawfulBasis | null;
  retention_period: DataRetentionPeriod | null;
  automated_decision_making: boolean;
  human_oversight_required: boolean;
  status: 'active' | 'paused' | 'terminated';
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Governance Gates (Design Doc §5B, §11)
// ─────────────────────────────────────────────────────────────────────────────

export type GovernanceGateType = 'design_review' | 'data_approval' | 'security_review' | 'launch_review';
export type GovernanceGateDecision = 'pending' | 'approved' | 'conditionally_approved' | 'rejected' | 'deferred';

export interface GovernanceGateArtifact {
  id: string;
  name: string;
  description: string;
  required: boolean;
  provided: boolean;
  file_url: string | null;
  verified_by: string | null;
  verified_at: string | null;
}

export interface GovernanceGate {
  id: string;
  project_id: string;
  organization_id: string;
  gate_type: GovernanceGateType;
  gate_order: number;
  title: string;
  description: string;
  required_artifacts: GovernanceGateArtifact[];
  decision: GovernanceGateDecision;
  decision_rationale: string | null;
  approver_id: string | null;
  approver_name: string | null;
  decided_at: string | null;
  conditions: string[];
  escalation_required: boolean;
  submitted_by: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Control Checks / Security Operations (Design Doc §5D, §11)
// ─────────────────────────────────────────────────────────────────────────────

export type ControlCheckCategory = 'auth' | 'secrets' | 'model_config' | 'logging' | 'egress' | 'storage' | 'data_retention' | 'access_control' | 'encryption';
export type ControlCheckResult = 'pass' | 'fail' | 'warning' | 'not_applicable' | 'error';

export interface ControlCheck {
  id: string;
  project_id: string;
  organization_id: string;
  control_id: string;
  control_name: string;
  category: ControlCheckCategory;
  description: string;
  result: ControlCheckResult;
  evidence_link: string | null;
  evidence_details: string | null;
  remediation: string | null;
  checked_at: string;
  checked_by: string | null;
  next_check_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecurityControlStatus {
  total_controls: number;
  passed: number;
  failed: number;
  warnings: number;
  not_applicable: number;
  pass_rate: number;
  by_category: Record<ControlCheckCategory, { total: number; passed: number; failed: number }>;
  last_run_at: string | null;
  checks: ControlCheck[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Policy Rules / Policy-as-Code (Design Doc §5B, §8.3, §11)
// ─────────────────────────────────────────────────────────────────────────────

export type PolicyRuleSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type PolicyEnforcementMode = 'enforce' | 'warn' | 'audit' | 'disabled';

export interface PolicyRule {
  id: string;
  project_id: string | null;
  organization_id: string;
  name: string;
  description: string;
  category: string;
  rule_definition: Record<string, unknown>;
  severity: PolicyRuleSeverity;
  enforcement_mode: PolicyEnforcementMode;
  applies_to: string[];
  exceptions: PolicyRuleException[];
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PolicyRuleException {
  id: string;
  reason: string;
  approved_by: string;
  approved_at: string;
  expires_at: string | null;
  compensating_controls: string[];
}

export interface PolicyEvaluationResult {
  rule_id: string;
  rule_name: string;
  severity: PolicyRuleSeverity;
  passed: boolean;
  message: string;
  evidence: string | null;
  remediation: string | null;
}

export interface PolicyEvaluationSummary {
  project_id: string;
  total_rules: number;
  passed: number;
  failed: number;
  warnings: number;
  results: PolicyEvaluationResult[];
  evaluated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Incidents (Design Doc §6.5, §11)
// ─────────────────────────────────────────────────────────────────────────────

export type SecurityIncidentCategory = 'data_leak' | 'model_misuse' | 'prompt_injection' | 'compliance_breach' | 'unauthorized_access' | 'policy_violation' | 'other';
export type SecurityIncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type SecurityIncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';

export interface SecurityIncident {
  id: string;
  project_id: string;
  organization_id: string;
  category: SecurityIncidentCategory;
  severity: SecurityIncidentSeverity;
  title: string;
  description: string;
  detected_at: string;
  detected_by: string | null;
  status: SecurityIncidentStatus;
  assigned_to: string | null;
  assigned_to_name: string | null;
  resolution: string | null;
  resolved_at: string | null;
  root_cause: string | null;
  impact_assessment: string | null;
  corrective_actions: string[];
  linked_control_ids: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Evidence Packages (Design Doc §8.2, §11)
// ─────────────────────────────────────────────────────────────────────────────

export interface EvidenceArtifact {
  id: string;
  type: 'policy' | 'gate_approval' | 'control_check' | 'risk_assessment' | 'data_classification' | 'audit_log' | 'report' | 'other';
  name: string;
  description: string;
  file_url: string | null;
  content_snapshot: Record<string, unknown> | null;
  collected_at: string;
}

export interface EvidencePackage {
  id: string;
  project_id: string;
  organization_id: string;
  version: number;
  title: string;
  description: string | null;
  artifact_manifest: EvidenceArtifact[];
  gate_summaries: { gate_type: GovernanceGateType; decision: GovernanceGateDecision; decided_at: string | null }[];
  control_summary: { total: number; passed: number; failed: number } | null;
  risk_summary: { total: number; by_tier: Record<RiskTier, number> } | null;
  generated_by: string | null;
  generated_at: string;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Events (Design Doc §6.5, §8.2)
// ─────────────────────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'auth_change'
  | 'policy_edit'
  | 'policy_approved'
  | 'gate_submitted'
  | 'gate_approved'
  | 'gate_rejected'
  | 'risk_updated'
  | 'data_classified'
  | 'data_approved'
  | 'control_check_run'
  | 'export_generated'
  | 'model_config_changed'
  | 'incident_created'
  | 'incident_resolved'
  | 'evidence_generated'
  | 'team_change'
  | 'project_status_change';

export interface AuditEvent {
  id: string;
  project_id: string | null;
  organization_id: string;
  event_type: AuditEventType;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  description: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pilot Setup Wizard (Design Doc §5A)
// ─────────────────────────────────────────────────────────────────────────────

export type PilotWizardStep = 'business_goal' | 'use_case' | 'data_scope' | 'risk_tier' | 'success_metrics' | 'architecture' | 'launch_checklist';

export interface PilotTemplate {
  id: string;
  name: string;
  domain: 'support' | 'knowledge_search' | 'document_drafting' | 'workflow_automation' | 'code_generation' | 'data_analysis' | 'custom';
  description: string;
  default_objectives: string[];
  default_success_metrics: string[];
  default_risk_tier: RiskTier;
  estimated_duration_weeks: number;
  prerequisites: string[];
}

export interface PilotSetup {
  id: string;
  project_id: string;
  organization_id: string;
  template_id: string | null;
  current_step: PilotWizardStep;
  business_goal: string | null;
  use_case_description: string | null;
  use_case_domain: string | null;
  data_scope: {
    classification: DataClassificationLevel;
    data_sources: string[];
    contains_pii: boolean;
    cross_border: boolean;
  } | null;
  risk_tier: RiskTier | null;
  success_metrics: { metric: string; target: string; measurement_method: string }[];
  architecture_notes: string | null;
  launch_checklist: { item: string; completed: boolean; required: boolean }[];
  readiness_score: number | null;
  status: 'draft' | 'in_progress' | 'ready' | 'launched';
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Next Best Action (Design Doc §7.2)
// ─────────────────────────────────────────────────────────────────────────────

export type ActionPriority = 'required' | 'recommended' | 'optional';
export type ActionCategory = 'governance' | 'security' | 'data' | 'pilot' | 'review' | 'team';

export interface NextBestAction {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  priority: ActionPriority;
  href: string;
  cta_label: string;
  blocker: boolean;
  completed: boolean;
}

export interface ProjectStatusSummary {
  project_id: string;
  current_phase: ProjectStatus;
  completion_percent: number;
  blockers: number;
  next_actions: NextBestAction[];
  governance_gates: { gate_type: GovernanceGateType; decision: GovernanceGateDecision }[];
  security_posture: { pass_rate: number; critical_failures: number };
  data_classification_complete: boolean;
  pilot_readiness_score: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI & Value Metrics (Design Doc §5E)
// ─────────────────────────────────────────────────────────────────────────────

export type KpiCategory = 'time_saved' | 'quality_lift' | 'error_rate' | 'adoption' | 'cost_reduction' | 'satisfaction';

export interface KpiDefinition {
  id: string;
  project_id: string;
  category: KpiCategory;
  name: string;
  description: string;
  unit: string;
  baseline_value: number | null;
  target_value: number;
  current_value: number | null;
  measurement_method: string;
  owner_id: string | null;
  owner_name: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  status: 'not_started' | 'tracking' | 'met' | 'at_risk' | 'missed';
  created_at: string;
  updated_at: string;
}

export interface KpiSnapshot {
  id: string;
  kpi_id: string;
  value: number;
  confidence: 'low' | 'medium' | 'high';
  notes: string | null;
  captured_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Threat Model (Design Doc §5D)
// ─────────────────────────────────────────────────────────────────────────────

export type ThreatCategory = 'prompt_injection' | 'data_exfiltration' | 'over_permissioned_tools' | 'unsafe_output' | 'model_poisoning' | 'denial_of_service' | 'supply_chain' | 'privacy_violation';

export interface ThreatModelItem {
  id: string;
  project_id: string;
  category: ThreatCategory;
  threat_name: string;
  description: string;
  likelihood: RiskTier;
  impact: RiskTier;
  risk_score: number;
  current_controls: string[];
  recommended_controls: string[];
  mitigation_status: 'open' | 'mitigated' | 'accepted' | 'transferred';
  owner_id: string | null;
  owner_name: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical Project State Machine (Design Doc §6.2, Redesign §6.2)
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectState =
  | 'draft'
  | 'scoped'
  | 'data_approved'
  | 'security_approved'
  | 'pilot_running'
  | 'review_complete'
  | 'decision_finalized';

export interface StateTransition {
  from: ProjectState;
  to: ProjectState;
  required_role: UserRole[];
  required_gates: GovernanceGateType[];
  label: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SLA & Escalation Workflows (Design Doc §9 Phase 4)
// ─────────────────────────────────────────────────────────────────────────────

export type EscalationLevel = 'l1_owner' | 'l2_manager' | 'l3_director' | 'l4_executive';

export type SlaStatus = 'within' | 'warning' | 'breached';

export interface SlaPolicy {
  id: string;
  name: string;
  description: string;
  target_days: number;
  warning_days: number;
  applies_to: 'risk' | 'gate_review' | 'control_failure' | 'incident';
  escalation_chain: EscalationLevel[];
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationRecord {
  id: string;
  sla_policy_id: string;
  resource_type: string;
  resource_id: string;
  project_id: string;
  organization_id: string;
  current_level: EscalationLevel;
  status: SlaStatus;
  opened_at: string;
  due_at: string;
  escalated_at: string | null;
  resolved_at: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin / Adoption Analytics (Design Doc §9 Phase 4, Redesign §13)
// ─────────────────────────────────────────────────────────────────────────────

export interface AdoptionMetrics {
  period: string;
  weekly_active_teams: number;
  projects_created: number;
  pilots_launched: number;
  governance_artifacts_completed: number;
  report_exports: number;
  avg_time_to_first_pilot_days: number | null;
  workflow_completion_rate: number;
  data_classification_pct: number;
  controls_passing_pct: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Outcome Metrics — target vs actual (Redesign §9, §10, §11)
// ─────────────────────────────────────────────────────────────────────────────

export interface OutcomeMetric {
  id: string;
  project_id: string;
  name: string;
  category: 'value' | 'quality' | 'adoption' | 'efficiency' | 'risk';
  target_value: number;
  actual_value: number | null;
  unit: string;
  confidence: 'low' | 'medium' | 'high';
  measurement_date: string | null;
  notes: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Executive Decision Brief (Redesign §11.1)
// ─────────────────────────────────────────────────────────────────────────────

export interface ExecutiveDecisionBrief {
  project_id: string;
  generated_at: string;
  trace_id: string;
  recommendation: 'go' | 'conditional_go' | 'no_go';
  recommendation_rationale: string;
  value_summary: {
    kpi_attainment_pct: number | null;
    top_wins: string[];
    concerns: string[];
  };
  risk_posture: {
    total_risks: number;
    high_critical_open: number;
    control_pass_rate: number;
    unresolved_items: string[];
  };
  governance_status: {
    gates_passed: number;
    gates_total: number;
    data_classified: boolean;
    evidence_exported: boolean;
  };
  next_steps: string[];
}

// API Response types (updated per Design Doc §12)
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string | null;
  message?: string;
  traceId?: string;
}
