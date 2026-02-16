import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isServerSupabaseConfigured, createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

const scanRequestSchema = z.object({
  project_id: z.string().uuid(),
  data_asset_ids: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// PII Scan result types (local to this route)
// ---------------------------------------------------------------------------

interface PiiDetection {
  field_name: string;
  pii_type: string;
  confidence: number;
  sample_count: number;
}

interface ScanResult {
  data_asset_id: string;
  data_asset_name: string;
  scanned_at: string;
  total_fields_scanned: number;
  detections: PiiDetection[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface ScanResponse {
  scan_id: string;
  project_id: string;
  status: 'completed' | 'partial' | 'failed';
  started_at: string;
  completed_at: string;
  total_assets_scanned: number;
  total_pii_detections: number;
  results: ScanResult[];
}

// ---------------------------------------------------------------------------
// Demo scan results
// ---------------------------------------------------------------------------

function generateDemoScanResults(projectId: string): ScanResponse {
  const now = new Date().toISOString();
  return {
    scan_id: `scan-${Date.now()}`,
    project_id: projectId,
    status: 'completed',
    started_at: now,
    completed_at: now,
    total_assets_scanned: 4,
    total_pii_detections: 12,
    results: [
      {
        data_asset_id: 'da-001',
        data_asset_name: 'Customer CRM Database',
        scanned_at: now,
        total_fields_scanned: 42,
        detections: [
          { field_name: 'customer_email', pii_type: 'email', confidence: 0.98, sample_count: 15420 },
          { field_name: 'customer_phone', pii_type: 'phone', confidence: 0.95, sample_count: 12380 },
          { field_name: 'full_name', pii_type: 'name', confidence: 0.97, sample_count: 15420 },
          { field_name: 'billing_address', pii_type: 'address', confidence: 0.92, sample_count: 11200 },
        ],
        risk_level: 'high',
      },
      {
        data_asset_id: 'da-003',
        data_asset_name: 'Employee HR Records',
        scanned_at: now,
        total_fields_scanned: 68,
        detections: [
          { field_name: 'ssn', pii_type: 'ssn', confidence: 0.99, sample_count: 3200 },
          { field_name: 'employee_name', pii_type: 'name', confidence: 0.96, sample_count: 3200 },
          { field_name: 'home_address', pii_type: 'address', confidence: 0.94, sample_count: 3200 },
          { field_name: 'date_of_birth', pii_type: 'date_of_birth', confidence: 0.97, sample_count: 3200 },
          { field_name: 'salary', pii_type: 'financial', confidence: 0.88, sample_count: 3200 },
        ],
        risk_level: 'critical',
      },
      {
        data_asset_id: 'da-005',
        data_asset_name: 'Financial Transaction Logs',
        scanned_at: now,
        total_fields_scanned: 35,
        detections: [
          { field_name: 'card_last_four', pii_type: 'payment_card', confidence: 0.91, sample_count: 89500 },
          { field_name: 'payer_email', pii_type: 'email', confidence: 0.96, sample_count: 89500 },
          { field_name: 'billing_name', pii_type: 'name', confidence: 0.93, sample_count: 89500 },
        ],
        risk_level: 'critical',
      },
      {
        data_asset_id: 'da-007',
        data_asset_name: 'Customer Support Tickets',
        scanned_at: now,
        total_fields_scanned: 28,
        detections: [],
        risk_level: 'low',
      },
    ],
  };
}

/**
 * POST /api/data/classification/scan
 * Run a simulated PII detection scan across data assets.
 * In production this would integrate with a real data scanning service.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ScanResponse>>> {
  try {
    const body = await request.json();
    const parsed = scanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.flatten().fieldErrors as unknown as string },
        { status: 400 },
      );
    }

    // Demo mode
    if (!isServerSupabaseConfigured()) {
      const results = generateDemoScanResults(parsed.data.project_id);
      return NextResponse.json({ data: results });
    }

    // Authenticated flow
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a production system this would trigger an async scan job.
    // For now, return simulated results.
    const results = generateDemoScanResults(parsed.data.project_id);
    return NextResponse.json({ data: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
