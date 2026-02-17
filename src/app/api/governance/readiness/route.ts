import { NextRequest } from 'next/server';
import { apiSuccess, withRateLimit } from '@/lib/api-helpers';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';

interface DemoReadiness {
  ready: boolean;
  gates_status: { gate_type: string; decision: string; evidence_complete: boolean }[];
  control_pass_rate: number;
  open_risks: number;
  open_exceptions: number;
  blockers: string[];
}

function getDemoReadiness(_projectId: string): DemoReadiness {
  return {
    ready: false,
    gates_status: [
      { gate_type: 'design_review', decision: 'approved', evidence_complete: true },
      { gate_type: 'data_approval', decision: 'approved', evidence_complete: true },
      { gate_type: 'security_review', decision: 'conditionally_approved', evidence_complete: false },
      { gate_type: 'launch_review', decision: 'pending', evidence_complete: false },
    ],
    control_pass_rate: 87,
    open_risks: 3,
    open_exceptions: 1,
    blockers: [
      'Gate "launch_review" is pending',
      'Gate "security_review" has incomplete evidence',
      '1 high/critical risk(s) without exception or mitigation',
    ],
  };
}

export async function GET(request: NextRequest) {
  const rateLimited = withRateLimit(request);
  if (rateLimited) return rateLimited;

  const projectId = request.nextUrl.searchParams.get('project_id') ?? 'proj-demo-001';

  if (!isServerSupabaseConfigured()) {
    return apiSuccess(getDemoReadiness(projectId));
  }

  return apiSuccess(getDemoReadiness(projectId));
}
