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

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
