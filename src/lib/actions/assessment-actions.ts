'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateDomainScore, DOMAINS, DOMAIN_WEIGHTS } from '@/lib/scoring/engine';
import { ASSESSMENT_QUESTIONS } from '@/lib/scoring/questions';
import type { AssessmentResponse, FeasibilityRating } from '@/types';

export async function saveAssessmentResponse(
  projectId: string,
  questionId: string,
  value: string | string[] | number
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('assessment_responses')
    .upsert(
      { project_id: projectId, question_id: questionId, value: JSON.stringify(value), responded_by: user.id },
      { onConflict: 'project_id,question_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitAssessment(projectId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Fetch all responses
  const { data: responses, error: respError } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('project_id', projectId);

  if (respError) throw respError;

  const parsedResponses: AssessmentResponse[] = (responses || []).map(r => ({
    ...r,
    value: JSON.parse(r.value),
  }));

  // Calculate scores for each domain
  const domainScores = DOMAINS.map(domain =>
    calculateDomainScore(domain, parsedResponses, ASSESSMENT_QUESTIONS)
  );

  // Calculate overall score
  const overallScore = domainScores.reduce(
    (sum, ds) => sum + ds.percentage * DOMAIN_WEIGHTS[ds.domain],
    0
  );

  const rating: FeasibilityRating =
    overallScore >= 75 ? 'high' :
    overallScore >= 55 ? 'moderate' :
    overallScore >= 35 ? 'conditional' :
    'not_ready';

  // Save scores
  for (const ds of domainScores) {
    await supabase
      .from('feasibility_scores')
      .upsert(
        {
          project_id: projectId,
          domain: ds.domain,
          score: ds.score,
          max_score: ds.maxScore,
          percentage: ds.percentage,
          passed: ds.passed,
          recommendations: JSON.stringify(ds.recommendations),
          remediation_tasks: JSON.stringify(ds.remediation_tasks),
        },
        { onConflict: 'project_id,domain' }
      );
  }

  // Update project feasibility score
  await supabase
    .from('projects')
    .update({ feasibility_score: overallScore })
    .eq('id', projectId);

  return {
    domain_scores: domainScores,
    overall_score: overallScore,
    rating,
    recommendations: domainScores.flatMap(ds => ds.recommendations),
    remediation_tasks: domainScores.flatMap(ds => ds.remediation_tasks),
  };
}
