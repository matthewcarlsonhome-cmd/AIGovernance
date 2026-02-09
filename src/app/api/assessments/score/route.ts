import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateDomainScore, DOMAINS, DOMAIN_WEIGHTS, getOverallRating } from '@/lib/scoring/engine';
import { ASSESSMENT_QUESTIONS } from '@/lib/scoring/questions';
import type { ApiResponse, AssessmentResponse, DomainScore, FeasibilityScore, ScoreDomain } from '@/types';

const scoreRequestSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
});

/**
 * POST /api/assessments/score
 * Run the feasibility scoring engine for a given project.
 * Fetches all assessment responses, calculates domain scores using the
 * scoring engine, and persists results to the feasibility_scores table.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<FeasibilityScore>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = scoreRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { project_id } = parsed.data;

    // Verify the project exists and is accessible
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'The specified project does not exist or has been deleted' },
        { status: 404 },
      );
    }

    // Fetch all assessment responses for this project
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('project_id', project_id);

    if (responsesError) {
      return NextResponse.json(
        { error: 'Failed to fetch responses', message: responsesError.message },
        { status: 500 },
      );
    }

    const typedResponses: AssessmentResponse[] = responses ?? [];

    // Calculate domain scores using the scoring engine
    const domainScores: DomainScore[] = DOMAINS.map((domain: ScoreDomain) =>
      calculateDomainScore(domain, typedResponses, ASSESSMENT_QUESTIONS),
    );

    // Calculate weighted overall score
    const overallScore = domainScores.reduce((acc, ds) => {
      return acc + ds.percentage * DOMAIN_WEIGHTS[ds.domain];
    }, 0);
    const roundedOverall = Math.round(overallScore);

    // Aggregate recommendations and remediation tasks (weakest domains first)
    const sortedDomains = [...domainScores].sort((a, b) => a.percentage - b.percentage);

    const recommendations: string[] = [];
    for (const ds of sortedDomains) {
      for (const rec of ds.recommendations) {
        if (!recommendations.includes(rec)) {
          recommendations.push(rec);
        }
      }
    }

    const remediationTasks: string[] = [];
    for (const ds of sortedDomains) {
      for (const task of ds.remediation_tasks) {
        if (!remediationTasks.includes(task)) {
          remediationTasks.push(task);
        }
      }
    }

    const feasibilityScore: FeasibilityScore = {
      domain_scores: domainScores,
      overall_score: roundedOverall,
      rating: getOverallRating(roundedOverall),
      recommendations,
      remediation_tasks: remediationTasks,
    };

    // Persist the scores to the feasibility_scores table
    const { error: insertError } = await supabase
      .from('feasibility_scores')
      .insert({
        project_id,
        domain_scores: feasibilityScore.domain_scores,
        overall_score: feasibilityScore.overall_score,
        rating: feasibilityScore.rating,
        recommendations: feasibilityScore.recommendations,
        remediation_tasks: feasibilityScore.remediation_tasks,
      });

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save scores', message: insertError.message },
        { status: 500 },
      );
    }

    // Update the project's top-level feasibility_score for quick reference
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        feasibility_score: feasibilityScore.overall_score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project_id);

    if (updateError) {
      // Non-critical: scores are already saved, log but don't fail
      console.error('Failed to update project feasibility_score:', updateError.message);
    }

    return NextResponse.json({ data: feasibilityScore }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
