import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, withRateLimit } from '@/lib/api-helpers';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';
import { getDemoExceptions, createRiskException, checkExpirations } from '@/lib/exceptions';

const CreateExceptionSchema = z.object({
  project_id: z.string().min(1),
  organization_id: z.string().min(1),
  risk_id: z.string().optional(),
  control_id: z.string().optional(),
  title: z.string().min(1).max(200),
  justification: z.string().min(1).max(2000),
  compensating_controls: z.array(z.string()).min(1),
  requested_by: z.string().min(1),
  duration_days: z.number().int().min(1).max(365),
});

export async function GET(request: NextRequest) {
  const rateLimited = withRateLimit(request);
  if (rateLimited) return rateLimited;

  const projectId = request.nextUrl.searchParams.get('project_id');

  if (!isServerSupabaseConfigured()) {
    const exceptions = getDemoExceptions(projectId ?? 'proj-demo-001');
    const { expired, expiring_soon } = checkExpirations(exceptions);
    return apiSuccess({
      exceptions,
      expired_count: expired.length,
      expiring_soon_count: expiring_soon.length,
    });
  }

  return apiSuccess({ exceptions: [], expired_count: 0, expiring_soon_count: 0 });
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

  const parsed = CreateExceptionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(`Validation error: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  if (!isServerSupabaseConfigured()) {
    const exception = createRiskException(parsed.data);
    return apiSuccess(exception, 201, 'Exception request created');
  }

  return apiSuccess(createRiskException(parsed.data), 201, 'Exception request created');
}
