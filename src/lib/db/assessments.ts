import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AssessmentQuestion, AssessmentResponse, FeasibilityScore } from '@/types';

/**
 * Fetch assessment questions, optionally filtered by template ID.
 * Returns questions ordered by their defined `order` column.
 */
export async function getAssessmentQuestions(
  templateId?: string
): Promise<AssessmentQuestion[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('assessment_questions')
    .select('*')
    .order('order', { ascending: true });

  if (templateId) {
    query = query.eq('template_id', templateId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all assessment responses for a given project.
 * Returns the most recent response per question.
 */
export async function getResponses(
  projectId: string
): Promise<AssessmentResponse[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Save or update a single assessment response for a project + question pair.
 * Uses upsert keyed on (project_id, question_id) to ensure idempotency.
 */
export async function saveResponse(
  projectId: string,
  questionId: string,
  value: string | string[] | number
): Promise<AssessmentResponse> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('assessment_responses')
    .upsert(
      {
        project_id: projectId,
        question_id: questionId,
        value,
        responded_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,question_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch computed feasibility scores for a project.
 * Returns null if no scores have been calculated yet.
 */
export async function getScores(
  projectId: string
): Promise<FeasibilityScore | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('feasibility_scores')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  return {
    domain_scores: data.domain_scores,
    overall_score: data.overall_score,
    rating: data.rating,
    recommendations: data.recommendations ?? [],
    remediation_tasks: data.remediation_tasks ?? [],
  };
}

/**
 * Persist computed feasibility scores for a project.
 * Inserts a new row each time to preserve score history.
 */
export async function saveScores(
  projectId: string,
  scores: FeasibilityScore
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error: insertError } = await supabase
    .from('feasibility_scores')
    .insert({
      project_id: projectId,
      domain_scores: scores.domain_scores,
      overall_score: scores.overall_score,
      rating: scores.rating,
      recommendations: scores.recommendations,
      remediation_tasks: scores.remediation_tasks,
    });

  if (insertError) throw insertError;

  // Also update the project's top-level feasibility_score for quick reference.
  const { error: updateError } = await supabase
    .from('projects')
    .update({
      feasibility_score: scores.overall_score,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (updateError) throw updateError;
}
