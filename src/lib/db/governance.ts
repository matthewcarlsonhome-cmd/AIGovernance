import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  Policy,
  PolicyType,
  PolicyStatus,
  GateReview,
  GateNumber,
  GateStatus,
  GateEvidence,
  GateApprover,
  ComplianceMapping,
  RiskClassification,
  RiskTier,
} from '@/types';

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

/**
 * Fetch all policies for a project, excluding soft-deleted rows.
 */
export async function getPolicies(projectId: string): Promise<Policy[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a policy.
 * When an `id` is present the row is updated; otherwise a new row is inserted.
 * On update, a snapshot of the previous version is written to `policy_versions`.
 */
export async function savePolicy(
  data: Pick<Policy, 'project_id' | 'title' | 'type' | 'content'> &
    Partial<Pick<Policy, 'id' | 'status' | 'version' | 'approved_by' | 'approved_at'>>
): Promise<Policy> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    // Fetch existing to create a version snapshot before overwriting.
    const { data: existing, error: fetchErr } = await supabase
      .from('policies')
      .select('*')
      .eq('id', data.id)
      .single();

    if (fetchErr) throw fetchErr;

    if (existing) {
      const { error: versionErr } = await supabase
        .from('policy_versions')
        .insert({
          policy_id: existing.id,
          version: existing.version,
          content: existing.content,
          change_summary: `Superseded by version ${(existing.version ?? 0) + 1}`,
        });

      if (versionErr) throw versionErr;
    }

    const { data: updated, error } = await supabase
      .from('policies')
      .update({
        title: data.title,
        type: data.type,
        content: data.content,
        status: data.status ?? existing?.status ?? 'draft',
        version: (existing?.version ?? 0) + 1,
        approved_by: data.approved_by ?? null,
        approved_at: data.approved_at ?? null,
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  // New policy
  const { data: created, error } = await supabase
    .from('policies')
    .insert({
      project_id: data.project_id,
      title: data.title,
      type: data.type,
      content: data.content,
      status: data.status ?? 'draft',
      version: 1,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Gate Reviews
// ---------------------------------------------------------------------------

/**
 * Fetch all gate reviews for a project ordered by gate number.
 */
export async function getGateReviews(projectId: string): Promise<GateReview[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('gate_reviews')
    .select('*')
    .eq('project_id', projectId)
    .order('gate_number', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a gate review.
 * When `id` is present the existing row is updated; otherwise a new row is created.
 */
export async function saveGateReview(
  data: Pick<Policy, 'project_id'> &
    Pick<GateReview, 'gate_number' | 'evidence_checklist' | 'approvers'> &
    Partial<Pick<GateReview, 'id' | 'status' | 'notes' | 'reviewed_at'>>
): Promise<GateReview> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('gate_reviews')
      .update({
        gate_number: data.gate_number,
        status: data.status ?? 'pending',
        evidence_checklist: data.evidence_checklist,
        approvers: data.approvers,
        notes: data.notes ?? null,
        reviewed_at: data.reviewed_at ?? null,
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('gate_reviews')
    .insert({
      project_id: data.project_id,
      gate_number: data.gate_number,
      status: data.status ?? 'pending',
      evidence_checklist: data.evidence_checklist,
      approvers: data.approvers,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Compliance Mappings
// ---------------------------------------------------------------------------

/**
 * Fetch compliance mappings for a project, optionally filtered by framework.
 */
export async function getComplianceMappings(
  projectId: string,
  framework?: string
): Promise<ComplianceMapping[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('compliance_mappings')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('framework', { ascending: true })
    .order('control_id', { ascending: true });

  if (framework) {
    query = query.eq('framework', framework);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a compliance mapping entry.
 */
export async function saveComplianceMapping(
  data: Pick<
    ComplianceMapping,
    'project_id' | 'framework' | 'control_id' | 'control_name' | 'description'
  > &
    Partial<Pick<ComplianceMapping, 'id' | 'status' | 'evidence' | 'notes'>>
): Promise<ComplianceMapping> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('compliance_mappings')
      .update({
        framework: data.framework,
        control_id: data.control_id,
        control_name: data.control_name,
        description: data.description,
        status: data.status ?? 'not_started',
        evidence: data.evidence ?? null,
        notes: data.notes ?? null,
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('compliance_mappings')
    .insert({
      project_id: data.project_id,
      framework: data.framework,
      control_id: data.control_id,
      control_name: data.control_name,
      description: data.description,
      status: data.status ?? 'not_started',
      evidence: data.evidence ?? null,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

// ---------------------------------------------------------------------------
// Risk Classifications
// ---------------------------------------------------------------------------

/**
 * Fetch all risk classifications for a project, ordered by tier severity.
 */
export async function getRiskClassifications(
  projectId: string
): Promise<RiskClassification[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('risk_classifications')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a risk classification entry.
 */
export async function saveRiskClassification(
  data: Pick<
    RiskClassification,
    'project_id' | 'category' | 'description' | 'tier' | 'likelihood' | 'impact' | 'mitigation'
  > &
    Partial<Pick<RiskClassification, 'id' | 'owner' | 'status'>>
): Promise<RiskClassification> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('risk_classifications')
      .update({
        category: data.category,
        description: data.description,
        tier: data.tier,
        likelihood: data.likelihood,
        impact: data.impact,
        mitigation: data.mitigation,
        owner: data.owner ?? null,
        status: data.status ?? 'open',
        updated_at: now,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from('risk_classifications')
    .insert({
      project_id: data.project_id,
      category: data.category,
      description: data.description,
      tier: data.tier,
      likelihood: data.likelihood,
      impact: data.impact,
      mitigation: data.mitigation,
      owner: data.owner ?? null,
      status: data.status ?? 'open',
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}
