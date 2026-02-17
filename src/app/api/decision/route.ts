import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, withRateLimit } from '@/lib/api-helpers';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';
import { generateDemoExecutiveBrief } from '@/lib/report-gen/executive-brief';

const DecisionRequestSchema = z.object({
  project_id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const rateLimited = withRateLimit(request);
  if (rateLimited) return rateLimited;

  const projectId = request.nextUrl.searchParams.get('project_id') ?? 'proj-demo-001';

  if (!isServerSupabaseConfigured()) {
    const brief = generateDemoExecutiveBrief(projectId);
    return apiSuccess(brief);
  }

  return apiSuccess(generateDemoExecutiveBrief(projectId));
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

  const parsed = DecisionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(`Validation error: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  const brief = generateDemoExecutiveBrief(parsed.data.project_id);
  return apiSuccess(brief, 200, 'Decision brief generated');
}
