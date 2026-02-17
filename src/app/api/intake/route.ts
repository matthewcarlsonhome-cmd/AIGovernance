import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, withRateLimit } from '@/lib/api-helpers';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';
import { scoreIntake, generateDemoIntakeResult, INTAKE_QUESTIONS } from '@/lib/intake/scorecard';

const IntakeResponseSchema = z.object({
  project_id: z.string().min(1),
  responses: z.array(z.object({
    question_id: z.string().min(1),
    selected_value: z.string().min(1),
    score: z.number().min(0).max(10),
  })),
});

export async function GET(request: NextRequest) {
  const rateLimited = withRateLimit(request);
  if (rateLimited) return rateLimited;

  return apiSuccess({ questions: INTAKE_QUESTIONS });
}

export async function POST(request: NextRequest) {
  const rateLimited = withRateLimit(request);
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const parsed = IntakeResponseSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(`Validation error: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  const result = scoreIntake(parsed.data.responses);
  result.project_id = parsed.data.project_id;

  return apiSuccess(result, 200, 'Intake scored successfully');
}
