'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { PolicyType, PolicyStatus, GateNumber, GateStatus, RiskTier } from '@/types';

export async function savePolicy(data: {
  id?: string;
  project_id: string;
  title: string;
  type: PolicyType;
  status: PolicyStatus;
  content: string;
  version?: number;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (data.id) {
    // Save version history before updating
    const { data: existing } = await supabase
      .from('policies')
      .select('version, content')
      .eq('id', data.id)
      .single();

    if (existing && existing.content !== data.content) {
      await supabase.from('policy_versions').insert({
        policy_id: data.id,
        version: existing.version,
        content: existing.content,
        created_by: user.id,
      });
    }

    const { data: policy, error } = await supabase
      .from('policies')
      .update({
        title: data.title,
        content: data.content,
        status: data.status,
        version: (existing?.version || 1) + 1,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return policy;
  }

  const { data: policy, error } = await supabase
    .from('policies')
    .insert({
      project_id: data.project_id,
      title: data.title,
      type: data.type,
      status: data.status,
      content: data.content,
    })
    .select()
    .single();

  if (error) throw error;
  return policy;
}

export async function approvePolicy(policyId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('policies')
    .update({
      status: 'approved' as PolicyStatus,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', policyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitGateReview(data: {
  project_id: string;
  gate_number: GateNumber;
  status: GateStatus;
  evidence_checklist: unknown[];
  approvers: unknown[];
  notes?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: gate, error } = await supabase
    .from('gate_reviews')
    .upsert(
      {
        project_id: data.project_id,
        gate_number: data.gate_number,
        status: data.status,
        evidence_checklist: JSON.stringify(data.evidence_checklist),
        approvers: JSON.stringify(data.approvers),
        notes: data.notes,
        reviewed_at: data.status !== 'pending' ? new Date().toISOString() : null,
      },
      { onConflict: 'project_id,gate_number' }
    )
    .select()
    .single();

  if (error) throw error;
  return gate;
}

export async function saveComplianceMapping(data: {
  id?: string;
  project_id: string;
  framework: string;
  control_id: string;
  control_name: string;
  description: string;
  status: string;
  evidence?: string;
  notes?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (data.id) {
    const { data: mapping, error } = await supabase
      .from('compliance_mappings')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return mapping;
  }

  const { data: mapping, error } = await supabase
    .from('compliance_mappings')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return mapping;
}

export async function saveRiskClassification(data: {
  id?: string;
  project_id: string;
  category: string;
  description: string;
  tier: RiskTier;
  likelihood: number;
  impact: number;
  mitigation: string;
  owner?: string;
  status?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (data.id) {
    const { data: risk, error } = await supabase
      .from('risk_classifications')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return risk;
  }

  const { data: risk, error } = await supabase
    .from('risk_classifications')
    .insert({ ...data, status: data.status || 'open' })
    .select()
    .single();
  if (error) throw error;
  return risk;
}
