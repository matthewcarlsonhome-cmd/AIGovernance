import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const ALLOWED_BUCKETS = ['evidence', 'reports', 'attachments', 'avatars'] as const;

const uploadSchema = z.object({
  bucket: z.enum(ALLOWED_BUCKETS),
  filePath: z.string().min(1).max(500),
  contentType: z.string().min(1).max(200).optional(),
});

const downloadSchema = z.object({
  bucket: z.enum(ALLOWED_BUCKETS),
  filePath: z.string().min(1).max(500),
  /** Signed URL expiry in seconds. Defaults to 3600 (1 hour). */
  expiresIn: z.coerce.number().int().min(60).max(86400).optional().default(3600),
});

// ---------------------------------------------------------------------------
// POST /api/storage  -  Generate a signed upload URL
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ signedUrl: string; path: string }>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { bucket, filePath, contentType } = parsed.data;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath, {
        upsert: false,
      });

    if (error) {
      console.error('Storage signed upload URL error:', error);
      return NextResponse.json(
        { error: 'Storage error', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        signedUrl: data.signedUrl,
        path: data.path,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/storage  -  Generate a signed download URL
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ signedUrl: string }>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = downloadSchema.safeParse({
      bucket: searchParams.get('bucket'),
      filePath: searchParams.get('filePath'),
      expiresIn: searchParams.get('expiresIn'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { bucket, filePath, expiresIn } = parsed.data;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Storage signed download URL error:', error);
      return NextResponse.json(
        { error: 'Storage error', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: { signedUrl: data.signedUrl },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
