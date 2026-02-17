/**
 * Supabase Database Type Definitions
 *
 * Auto-generated style types matching the project schema described in CLAUDE.md.
 * Each table provides Row (full record), Insert (creation), and Update (partial
 * mutation) variants following Supabase conventions.
 *
 * Convention notes:
 * - Table names: snake_case, plural
 * - All tables include: id (uuid), created_at (timestamptz), updated_at (timestamptz)
 * - Foreign keys: [referenced_table_singular]_id
 * - Soft deletes: deleted_at (nullable timestamptz)
 * - Enums: stored as text with CHECK constraints
 */

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

/** JSON-compatible value for Supabase jsonb columns. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Enum unions (text CHECK constraints in Postgres)
// ---------------------------------------------------------------------------

export type UserRole =
  | 'admin'
  | 'consultant'
  | 'executive'
  | 'it'
  | 'legal'
  | 'engineering'
  | 'marketing';

export type ProjectStatus =
  | 'discovery'
  | 'governance'
  | 'sandbox'
  | 'pilot'
  | 'evaluation'
  | 'production'
  | 'completed';

export type QuestionType =
  | 'single_select'
  | 'multi_select'
  | 'text'
  | 'number'
  | 'file_upload';

export type ScoreDomain =
  | 'infrastructure'
  | 'security'
  | 'governance'
  | 'engineering'
  | 'business';

export type FeasibilityRating = 'high' | 'moderate' | 'conditional' | 'not_ready';

export type PolicyType = 'aup' | 'irp' | 'data_classification' | 'risk_framework';

export type PolicyStatus = 'draft' | 'review' | 'approved' | 'archived';

export type GateNumber = 1 | 2 | 3;

export type GateStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export type ComplianceStatus =
  | 'not_started'
  | 'in_progress'
  | 'implemented'
  | 'verified'
  | 'not_applicable';

export type RiskTier = 'critical' | 'high' | 'medium' | 'low';

export type RiskStatus = 'open' | 'mitigating' | 'accepted' | 'closed';

export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'on_premises';

export type SandboxModel = 'cloud_native' | 'codespaces' | 'docker' | 'hybrid';

export type ConfigFileType = 'json' | 'toml' | 'yaml' | 'hcl' | 'markdown' | 'dockerfile';

export type ValidationStatus = 'pass' | 'warning' | 'fail' | 'pending';

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export type MilestoneStatus = 'pending' | 'completed' | 'missed' | 'at_risk';

export type PocTool = 'claude_code' | 'openai_codex' | 'other';

export type PocStatus = 'planned' | 'active' | 'completed' | 'cancelled';

export type SprintStatus = 'planned' | 'active' | 'completed';

export type MetricType =
  | 'velocity'
  | 'defect_rate'
  | 'cycle_time'
  | 'satisfaction'
  | 'code_quality';

export type ReportPersona =
  | 'executive'
  | 'legal'
  | 'it_security'
  | 'engineering'
  | 'marketing';

export type ReportFormat = 'pdf' | 'docx' | 'markdown';

export type ReportStatus = 'draft' | 'generating' | 'review' | 'final';

export type MeetingType =
  | 'discovery'
  | 'gate_review'
  | 'executive_briefing'
  | 'sprint_review'
  | 'general'
  | 'kickoff'
  | 'retrospective';

export type ActionItemStatus = 'open' | 'in_progress' | 'complete' | 'cancelled';

export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RaciAssignment = 'R' | 'A' | 'C' | 'I';

// New enums for Phase 1-2 tables
export type DataClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type DataRetentionPeriod = '30_days' | '90_days' | '1_year' | '3_years' | '7_years' | 'indefinite';
export type LawfulBasis = 'consent' | 'contract' | 'legal_obligation' | 'vital_interest' | 'public_task' | 'legitimate_interest';
export type DataProcessingType = 'collection' | 'storage' | 'analysis' | 'transformation' | 'transfer' | 'deletion';
export type GovernanceGateType = 'design_review' | 'data_approval' | 'security_review' | 'launch_review';
export type GovernanceGateDecision = 'pending' | 'approved' | 'conditionally_approved' | 'rejected' | 'deferred';
export type PilotWizardStep = 'business_goal' | 'use_case' | 'data_scope' | 'risk_tier' | 'success_metrics' | 'architecture' | 'launch_checklist';
export type PilotSetupStatus = 'draft' | 'in_progress' | 'ready' | 'launched';
export type ControlCheckCategory = 'auth' | 'secrets' | 'model_config' | 'logging' | 'egress' | 'storage' | 'data_retention' | 'access_control' | 'encryption';
export type ControlCheckResult = 'pass' | 'fail' | 'warning' | 'not_applicable' | 'error';
export type PolicyRuleSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type PolicyEnforcementMode = 'enforce' | 'warn' | 'audit' | 'disabled';
export type SecurityIncidentCategory = 'data_leak' | 'model_misuse' | 'prompt_injection' | 'compliance_breach' | 'unauthorized_access' | 'policy_violation' | 'other';
export type SecurityIncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type SecurityIncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
export type AuditEventType =
  | 'auth_change' | 'policy_edit' | 'policy_approved'
  | 'gate_submitted' | 'gate_approved' | 'gate_rejected'
  | 'risk_updated' | 'data_classified' | 'data_approved'
  | 'control_check_run' | 'export_generated' | 'model_config_changed'
  | 'incident_created' | 'incident_resolved' | 'evidence_generated'
  | 'team_change' | 'project_status_change';

// ---------------------------------------------------------------------------
// Table definitions
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      // ── Multi-tenant Foundation ──────────────────────────────

      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: string | null;
          size: string | null;
          logo_url: string | null;
          settings: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          industry?: string | null;
          size?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          industry?: string | null;
          size?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          organization_id: string;
          status: ProjectStatus;
          feasibility_score: number | null;
          start_date: string | null;
          target_end_date: string | null;
          actual_end_date: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          organization_id: string;
          status?: ProjectStatus;
          feasibility_score?: number | null;
          start_date?: string | null;
          target_end_date?: string | null;
          actual_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          organization_id?: string;
          status?: ProjectStatus;
          feasibility_score?: number | null;
          start_date?: string | null;
          target_end_date?: string | null;
          actual_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          organization_id: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: UserRole;
          organization_id: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          organization_id?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      team_members: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          role: UserRole;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Assessment Engine ────────────────────────────────────

      assessment_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          version: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      assessment_questions: {
        Row: {
          id: string;
          template_id: string | null;
          section: string;
          domain: ScoreDomain;
          text: string;
          type: QuestionType;
          options: Json | null;
          weight: number;
          scoring: Json | null;
          branches: Json | null;
          help_text: string | null;
          required: boolean;
          order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          section: string;
          domain: ScoreDomain;
          text: string;
          type: QuestionType;
          options?: Json | null;
          weight?: number;
          scoring?: Json | null;
          branches?: Json | null;
          help_text?: string | null;
          required?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          template_id?: string | null;
          section?: string;
          domain?: ScoreDomain;
          text?: string;
          type?: QuestionType;
          options?: Json | null;
          weight?: number;
          scoring?: Json | null;
          branches?: Json | null;
          help_text?: string | null;
          required?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      assessment_responses: {
        Row: {
          id: string;
          project_id: string;
          question_id: string;
          value: Json;
          responded_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          question_id: string;
          value: Json;
          responded_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          question_id?: string;
          value?: Json;
          responded_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      feasibility_scores: {
        Row: {
          id: string;
          project_id: string;
          domain_scores: Json;
          overall_score: number;
          rating: FeasibilityRating;
          recommendations: Json;
          remediation_tasks: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          domain_scores: Json;
          overall_score: number;
          rating: FeasibilityRating;
          recommendations: Json;
          remediation_tasks: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          domain_scores?: Json;
          overall_score?: number;
          rating?: FeasibilityRating;
          recommendations?: Json;
          remediation_tasks?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Governance Artifacts ─────────────────────────────────

      policies: {
        Row: {
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
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          type: PolicyType;
          status?: PolicyStatus;
          content: string;
          version?: number;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          type?: PolicyType;
          status?: PolicyStatus;
          content?: string;
          version?: number;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      policy_versions: {
        Row: {
          id: string;
          policy_id: string;
          version: number;
          content: string;
          change_summary: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          policy_id: string;
          version: number;
          content: string;
          change_summary?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          policy_id?: string;
          version?: number;
          content?: string;
          change_summary?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      compliance_mappings: {
        Row: {
          id: string;
          project_id: string;
          framework: string;
          control_id: string;
          control_name: string;
          description: string;
          status: ComplianceStatus;
          evidence: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          framework: string;
          control_id: string;
          control_name: string;
          description: string;
          status?: ComplianceStatus;
          evidence?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          framework?: string;
          control_id?: string;
          control_name?: string;
          description?: string;
          status?: ComplianceStatus;
          evidence?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      risk_classifications: {
        Row: {
          id: string;
          project_id: string;
          category: string;
          description: string;
          tier: RiskTier;
          likelihood: number;
          impact: number;
          mitigation: string;
          owner: string | null;
          status: RiskStatus;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          category: string;
          description: string;
          tier: RiskTier;
          likelihood: number;
          impact: number;
          mitigation: string;
          owner?: string | null;
          status?: RiskStatus;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          category?: string;
          description?: string;
          tier?: RiskTier;
          likelihood?: number;
          impact?: number;
          mitigation?: string;
          owner?: string | null;
          status?: RiskStatus;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      gate_reviews: {
        Row: {
          id: string;
          project_id: string;
          gate_number: GateNumber;
          status: GateStatus;
          evidence_checklist: Json;
          approvers: Json;
          notes: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          gate_number: GateNumber;
          status?: GateStatus;
          evidence_checklist?: Json;
          approvers?: Json;
          notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          gate_number?: GateNumber;
          status?: GateStatus;
          evidence_checklist?: Json;
          approvers?: Json;
          notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Implementation Tracking ──────────────────────────────

      workflow_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      workflow_phases: {
        Row: {
          id: string;
          workflow_template_id: string;
          name: string;
          description: string | null;
          order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workflow_template_id: string;
          name: string;
          description?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workflow_template_id?: string;
          name?: string;
          description?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      workflow_tasks: {
        Row: {
          id: string;
          project_id: string;
          workflow_phase_id: string | null;
          title: string;
          description: string | null;
          phase: string;
          start_date: string;
          end_date: string;
          duration_days: number;
          assigned_to: string | null;
          status: TaskStatus;
          progress_percent: number;
          is_milestone: boolean;
          is_critical_path: boolean;
          gate_review_id: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          workflow_phase_id?: string | null;
          title: string;
          description?: string | null;
          phase: string;
          start_date: string;
          end_date: string;
          duration_days: number;
          assigned_to?: string | null;
          status?: TaskStatus;
          progress_percent?: number;
          is_milestone?: boolean;
          is_critical_path?: boolean;
          gate_review_id?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          workflow_phase_id?: string | null;
          title?: string;
          description?: string | null;
          phase?: string;
          start_date?: string;
          end_date?: string;
          duration_days?: number;
          assigned_to?: string | null;
          status?: TaskStatus;
          progress_percent?: number;
          is_milestone?: boolean;
          is_critical_path?: boolean;
          gate_review_id?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      task_assignments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          assigned_at: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      task_status_history: {
        Row: {
          id: string;
          task_id: string;
          old_status: TaskStatus | null;
          new_status: TaskStatus;
          changed_by: string | null;
          changed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          old_status?: TaskStatus | null;
          new_status: TaskStatus;
          changed_by?: string | null;
          changed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          old_status?: TaskStatus | null;
          new_status?: TaskStatus;
          changed_by?: string | null;
          changed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── Sandbox Configuration ────────────────────────────────

      sandbox_configs: {
        Row: {
          id: string;
          project_id: string;
          cloud_provider: CloudProvider;
          sandbox_model: SandboxModel;
          vpc_cidr: string | null;
          region: string | null;
          ai_provider: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          cloud_provider: CloudProvider;
          sandbox_model: SandboxModel;
          vpc_cidr?: string | null;
          region?: string | null;
          ai_provider?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          cloud_provider?: CloudProvider;
          sandbox_model?: SandboxModel;
          vpc_cidr?: string | null;
          region?: string | null;
          ai_provider?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      config_files: {
        Row: {
          id: string;
          sandbox_config_id: string;
          filename: string;
          file_type: ConfigFileType;
          content: string;
          description: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          sandbox_config_id: string;
          filename: string;
          file_type: ConfigFileType;
          content: string;
          description: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          sandbox_config_id?: string;
          filename?: string;
          file_type?: ConfigFileType;
          content?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      environment_validations: {
        Row: {
          id: string;
          project_id: string;
          check_name: string;
          check_category: string;
          status: ValidationStatus;
          message: string | null;
          details: Json | null;
          validated_at: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          check_name: string;
          check_category: string;
          status: ValidationStatus;
          message?: string | null;
          details?: Json | null;
          validated_at: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          check_name?: string;
          check_category?: string;
          status?: ValidationStatus;
          message?: string | null;
          details?: Json | null;
          validated_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── PoC Evaluation ───────────────────────────────────────

      poc_projects: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string;
          tool: PocTool;
          status: PocStatus;
          selection_score: number | null;
          criteria: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description: string;
          tool: PocTool;
          status?: PocStatus;
          selection_score?: number | null;
          criteria?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string;
          tool?: PocTool;
          status?: PocStatus;
          selection_score?: number | null;
          criteria?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      poc_sprints: {
        Row: {
          id: string;
          poc_project_id: string;
          sprint_number: number;
          start_date: string;
          end_date: string;
          status: SprintStatus;
          goals: Json;
          velocity: number | null;
          satisfaction: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          poc_project_id: string;
          sprint_number: number;
          start_date: string;
          end_date: string;
          status?: SprintStatus;
          goals?: Json;
          velocity?: number | null;
          satisfaction?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          poc_project_id?: string;
          sprint_number?: number;
          start_date?: string;
          end_date?: string;
          status?: SprintStatus;
          goals?: Json;
          velocity?: number | null;
          satisfaction?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      poc_metrics: {
        Row: {
          id: string;
          sprint_id: string;
          metric_type: MetricType;
          baseline_value: number;
          ai_assisted_value: number;
          unit: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          sprint_id: string;
          metric_type: MetricType;
          baseline_value: number;
          ai_assisted_value: number;
          unit: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          sprint_id?: string;
          metric_type?: MetricType;
          baseline_value?: number;
          ai_assisted_value?: number;
          unit?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      tool_evaluations: {
        Row: {
          id: string;
          project_id: string;
          tool_name: string;
          category: string;
          score: number;
          max_score: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          tool_name: string;
          category: string;
          score: number;
          max_score: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          tool_name?: string;
          category?: string;
          score?: number;
          max_score?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Timeline / PM ────────────────────────────────────────

      timeline_milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          date: string;
          status: MilestoneStatus;
          gate_number: GateNumber | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          date: string;
          status?: MilestoneStatus;
          gate_number?: GateNumber | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          status?: MilestoneStatus;
          gate_number?: GateNumber | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      timeline_dependencies: {
        Row: {
          id: string;
          source_task_id: string;
          target_task_id: string;
          type: DependencyType;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          source_task_id: string;
          target_task_id: string;
          type: DependencyType;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          source_task_id?: string;
          target_task_id?: string;
          type?: DependencyType;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      timeline_snapshots: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          snapshot_data: Json;
          captured_at: string;
          captured_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          snapshot_data: Json;
          captured_at?: string;
          captured_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          snapshot_data?: Json;
          captured_at?: string;
          captured_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Reporting ────────────────────────────────────────────

      report_templates: {
        Row: {
          id: string;
          persona: ReportPersona;
          title: string;
          description: string | null;
          sections: Json;
          format: ReportFormat;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          persona: ReportPersona;
          title: string;
          description?: string | null;
          sections: Json;
          format: ReportFormat;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          persona?: ReportPersona;
          title?: string;
          description?: string | null;
          sections?: Json;
          format?: ReportFormat;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      generated_reports: {
        Row: {
          id: string;
          project_id: string;
          template_id: string | null;
          persona: ReportPersona;
          title: string;
          status: ReportStatus;
          content: Json | null;
          file_url: string | null;
          file_size: number | null;
          generated_by: string | null;
          generated_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          template_id?: string | null;
          persona: ReportPersona;
          title: string;
          status?: ReportStatus;
          content?: Json | null;
          file_url?: string | null;
          file_size?: number | null;
          generated_by?: string | null;
          generated_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          template_id?: string | null;
          persona?: ReportPersona;
          title?: string;
          status?: ReportStatus;
          content?: Json | null;
          file_url?: string | null;
          file_size?: number | null;
          generated_by?: string | null;
          generated_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Meetings & Action Items ──────────────────────────────

      meeting_notes: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          meeting_date: string;
          meeting_type: MeetingType;
          attendees: Json;
          notes: string | null;
          summary: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          meeting_date: string;
          meeting_type: MeetingType;
          attendees: Json;
          notes?: string | null;
          summary?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          meeting_date?: string;
          meeting_type?: MeetingType;
          attendees?: Json;
          notes?: string | null;
          summary?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      action_items: {
        Row: {
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
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          project_id: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          status?: ActionItemStatus;
          priority?: ActionItemPriority;
          due_date?: string | null;
          linked_task_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          status?: ActionItemStatus;
          priority?: ActionItemPriority;
          due_date?: string | null;
          linked_task_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── RACI Matrix ──────────────────────────────────────────

      raci_matrices: {
        Row: {
          id: string;
          project_id: string;
          phase: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          phase: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          phase?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      raci_entries: {
        Row: {
          id: string;
          matrix_id: string;
          task_name: string;
          task_id: string | null;
          user_id: string | null;
          user_name: string;
          assignment: RaciAssignment;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          matrix_id: string;
          task_name: string;
          task_id?: string | null;
          user_id?: string | null;
          user_name: string;
          assignment: RaciAssignment;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          matrix_id?: string;
          task_name?: string;
          task_id?: string | null;
          user_id?: string | null;
          user_name?: string;
          assignment?: RaciAssignment;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── ROI Calculations ─────────────────────────────────────

      roi_calculations: {
        Row: {
          id: string;
          project_id: string;
          inputs: Json;
          results: Json;
          sensitivity_data: Json | null;
          calculated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          inputs: Json;
          results: Json;
          sensitivity_data?: Json | null;
          calculated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          inputs?: Json;
          results?: Json;
          sensitivity_data?: Json | null;
          calculated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Audit Logs ───────────────────────────────────────────

      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // ── Data Governance (Phase 1-2) ────────────────────────────

      data_asset_records: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          name: string;
          description: string;
          type: string;
          domain: string;
          owner_id: string | null;
          owner_name: string | null;
          classification: DataClassificationLevel;
          lawful_basis: LawfulBasis | null;
          retention_period: DataRetentionPeriod | null;
          retention_expires_at: string | null;
          source_system: string | null;
          contains_pii: boolean;
          pii_types: Json;
          ai_relevance: string;
          approved: boolean;
          approved_by: string | null;
          approved_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          name: string;
          description: string;
          type: string;
          domain: string;
          owner_id?: string | null;
          owner_name?: string | null;
          classification: DataClassificationLevel;
          lawful_basis?: LawfulBasis | null;
          retention_period?: DataRetentionPeriod | null;
          retention_expires_at?: string | null;
          source_system?: string | null;
          contains_pii?: boolean;
          pii_types?: Json;
          ai_relevance?: string;
          approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          name?: string;
          description?: string;
          type?: string;
          domain?: string;
          owner_id?: string | null;
          owner_name?: string | null;
          classification?: DataClassificationLevel;
          lawful_basis?: LawfulBasis | null;
          retention_period?: DataRetentionPeriod | null;
          retention_expires_at?: string | null;
          source_system?: string | null;
          contains_pii?: boolean;
          pii_types?: Json;
          ai_relevance?: string;
          approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      data_processing_activities: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          data_asset_id: string;
          purpose: string;
          processor: string;
          processing_type: DataProcessingType;
          transfer_region: string | null;
          cross_border: boolean;
          risk_flags: Json;
          lawful_basis: LawfulBasis | null;
          retention_period: DataRetentionPeriod | null;
          automated_decision_making: boolean;
          human_oversight_required: boolean;
          status: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          data_asset_id: string;
          purpose: string;
          processor: string;
          processing_type: DataProcessingType;
          transfer_region?: string | null;
          cross_border?: boolean;
          risk_flags?: Json;
          lawful_basis?: LawfulBasis | null;
          retention_period?: DataRetentionPeriod | null;
          automated_decision_making?: boolean;
          human_oversight_required?: boolean;
          status?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          data_asset_id?: string;
          purpose?: string;
          processor?: string;
          processing_type?: DataProcessingType;
          transfer_region?: string | null;
          cross_border?: boolean;
          risk_flags?: Json;
          lawful_basis?: LawfulBasis | null;
          retention_period?: DataRetentionPeriod | null;
          automated_decision_making?: boolean;
          human_oversight_required?: boolean;
          status?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      governance_gates: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          gate_type: GovernanceGateType;
          gate_order: number;
          title: string;
          description: string | null;
          required_artifacts: Json;
          decision: GovernanceGateDecision;
          decision_rationale: string | null;
          approver_id: string | null;
          approver_name: string | null;
          decided_at: string | null;
          conditions: Json;
          escalation_required: boolean;
          submitted_by: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          gate_type: GovernanceGateType;
          gate_order: number;
          title: string;
          description?: string | null;
          required_artifacts?: Json;
          decision?: GovernanceGateDecision;
          decision_rationale?: string | null;
          approver_id?: string | null;
          approver_name?: string | null;
          decided_at?: string | null;
          conditions?: Json;
          escalation_required?: boolean;
          submitted_by?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          gate_type?: GovernanceGateType;
          gate_order?: number;
          title?: string;
          description?: string | null;
          required_artifacts?: Json;
          decision?: GovernanceGateDecision;
          decision_rationale?: string | null;
          approver_id?: string | null;
          approver_name?: string | null;
          decided_at?: string | null;
          conditions?: Json;
          escalation_required?: boolean;
          submitted_by?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      pilot_setups: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          template_id: string | null;
          current_step: PilotWizardStep;
          business_goal: string | null;
          use_case_description: string | null;
          use_case_domain: string | null;
          data_scope: Json | null;
          risk_tier: RiskTier | null;
          success_metrics: Json;
          architecture_notes: string | null;
          launch_checklist: Json;
          readiness_score: number | null;
          status: PilotSetupStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          template_id?: string | null;
          current_step?: PilotWizardStep;
          business_goal?: string | null;
          use_case_description?: string | null;
          use_case_domain?: string | null;
          data_scope?: Json | null;
          risk_tier?: RiskTier | null;
          success_metrics?: Json;
          architecture_notes?: string | null;
          launch_checklist?: Json;
          readiness_score?: number | null;
          status?: PilotSetupStatus;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          template_id?: string | null;
          current_step?: PilotWizardStep;
          business_goal?: string | null;
          use_case_description?: string | null;
          use_case_domain?: string | null;
          data_scope?: Json | null;
          risk_tier?: RiskTier | null;
          success_metrics?: Json;
          architecture_notes?: string | null;
          launch_checklist?: Json;
          readiness_score?: number | null;
          status?: PilotSetupStatus;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      // ── Security & Evidence (Phase 1-2) ────────────────────────

      control_checks: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          control_id: string;
          control_name: string;
          category: ControlCheckCategory;
          description: string | null;
          result: ControlCheckResult;
          evidence_link: string | null;
          evidence_details: string | null;
          remediation: string | null;
          checked_at: string;
          checked_by: string | null;
          next_check_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          control_id: string;
          control_name: string;
          category: ControlCheckCategory;
          description?: string | null;
          result: ControlCheckResult;
          evidence_link?: string | null;
          evidence_details?: string | null;
          remediation?: string | null;
          checked_at?: string;
          checked_by?: string | null;
          next_check_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          control_id?: string;
          control_name?: string;
          category?: ControlCheckCategory;
          description?: string | null;
          result?: ControlCheckResult;
          evidence_link?: string | null;
          evidence_details?: string | null;
          remediation?: string | null;
          checked_at?: string;
          checked_by?: string | null;
          next_check_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      policy_rules: {
        Row: {
          id: string;
          project_id: string | null;
          organization_id: string;
          name: string;
          description: string | null;
          category: string;
          rule_definition: Json;
          severity: PolicyRuleSeverity;
          enforcement_mode: PolicyEnforcementMode;
          applies_to: Json;
          exceptions: Json;
          version: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          organization_id: string;
          name: string;
          description?: string | null;
          category: string;
          rule_definition?: Json;
          severity: PolicyRuleSeverity;
          enforcement_mode?: PolicyEnforcementMode;
          applies_to?: Json;
          exceptions?: Json;
          version?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          organization_id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          rule_definition?: Json;
          severity?: PolicyRuleSeverity;
          enforcement_mode?: PolicyEnforcementMode;
          applies_to?: Json;
          exceptions?: Json;
          version?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      security_incidents: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          category: SecurityIncidentCategory;
          severity: SecurityIncidentSeverity;
          title: string;
          description: string | null;
          detected_at: string;
          detected_by: string | null;
          status: SecurityIncidentStatus;
          assigned_to: string | null;
          assigned_to_name: string | null;
          resolution: string | null;
          resolved_at: string | null;
          root_cause: string | null;
          impact_assessment: string | null;
          corrective_actions: Json;
          linked_control_ids: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          category: SecurityIncidentCategory;
          severity: SecurityIncidentSeverity;
          title: string;
          description?: string | null;
          detected_at?: string;
          detected_by?: string | null;
          status?: SecurityIncidentStatus;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          root_cause?: string | null;
          impact_assessment?: string | null;
          corrective_actions?: Json;
          linked_control_ids?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          category?: SecurityIncidentCategory;
          severity?: SecurityIncidentSeverity;
          title?: string;
          description?: string | null;
          detected_at?: string;
          detected_by?: string | null;
          status?: SecurityIncidentStatus;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          root_cause?: string | null;
          impact_assessment?: string | null;
          corrective_actions?: Json;
          linked_control_ids?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      evidence_packages: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          version: number;
          title: string;
          description: string | null;
          artifact_manifest: Json;
          gate_summaries: Json;
          control_summary: Json | null;
          risk_summary: Json | null;
          generated_by: string | null;
          generated_at: string;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          version?: number;
          title: string;
          description?: string | null;
          artifact_manifest?: Json;
          gate_summaries?: Json;
          control_summary?: Json | null;
          risk_summary?: Json | null;
          generated_by?: string | null;
          generated_at?: string;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          version?: number;
          title?: string;
          description?: string | null;
          artifact_manifest?: Json;
          gate_summaries?: Json;
          control_summary?: Json | null;
          risk_summary?: Json | null;
          generated_by?: string | null;
          generated_at?: string;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      audit_events: {
        Row: {
          id: string;
          project_id: string | null;
          organization_id: string;
          event_type: AuditEventType;
          actor_id: string;
          actor_name: string;
          actor_role: string;
          description: string;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          organization_id: string;
          event_type: AuditEventType;
          actor_id: string;
          actor_name: string;
          actor_role: string;
          description: string;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          organization_id?: string;
          event_type?: AuditEventType;
          actor_id?: string;
          actor_name?: string;
          actor_role?: string;
          description?: string;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ---------------------------------------------------------------------------
// Convenience type helpers
// ---------------------------------------------------------------------------

/** Extract the Row type for a given table name. */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Extract the Insert type for a given table name. */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Extract the Update type for a given table name. */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Pre-built convenience aliases for commonly-used tables
export type OrganizationRow = TableRow<'organizations'>;
export type ProjectRow = TableRow<'projects'>;
export type UserRow = TableRow<'users'>;
export type TeamMemberRow = TableRow<'team_members'>;
export type AssessmentQuestionRow = TableRow<'assessment_questions'>;
export type AssessmentResponseRow = TableRow<'assessment_responses'>;
export type FeasibilityScoreRow = TableRow<'feasibility_scores'>;
export type PolicyRow = TableRow<'policies'>;
export type PolicyVersionRow = TableRow<'policy_versions'>;
export type ComplianceMappingRow = TableRow<'compliance_mappings'>;
export type RiskClassificationRow = TableRow<'risk_classifications'>;
export type GateReviewRow = TableRow<'gate_reviews'>;
export type WorkflowTemplateRow = TableRow<'workflow_templates'>;
export type WorkflowPhaseRow = TableRow<'workflow_phases'>;
export type WorkflowTaskRow = TableRow<'workflow_tasks'>;
export type TaskAssignmentRow = TableRow<'task_assignments'>;
export type TaskStatusHistoryRow = TableRow<'task_status_history'>;
export type SandboxConfigRow = TableRow<'sandbox_configs'>;
export type ConfigFileRow = TableRow<'config_files'>;
export type EnvironmentValidationRow = TableRow<'environment_validations'>;
export type PocProjectRow = TableRow<'poc_projects'>;
export type PocSprintRow = TableRow<'poc_sprints'>;
export type PocMetricRow = TableRow<'poc_metrics'>;
export type ToolEvaluationRow = TableRow<'tool_evaluations'>;
export type TimelineMilestoneRow = TableRow<'timeline_milestones'>;
export type TimelineDependencyRow = TableRow<'timeline_dependencies'>;
export type TimelineSnapshotRow = TableRow<'timeline_snapshots'>;
export type ReportTemplateRow = TableRow<'report_templates'>;
export type GeneratedReportRow = TableRow<'generated_reports'>;
export type MeetingNoteRow = TableRow<'meeting_notes'>;
export type ActionItemRow = TableRow<'action_items'>;
export type RaciMatrixRow = TableRow<'raci_matrices'>;
export type RaciEntryRow = TableRow<'raci_entries'>;
export type RoiCalculationRow = TableRow<'roi_calculations'>;
export type AuditLogRow = TableRow<'audit_logs'>;
