import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { withRateLimit, apiSuccess, apiError } from '@/lib/api-helpers';
import { RATE_LIMIT_STRICT, RATE_LIMIT_WINDOW_MS } from '@/lib/rate-limit';
import {
  generateRemediationRecommendations,
  generatePolicyRecommendations,
  generateRiskMitigations,
  parseRecommendationResponse,
  getSampleRecommendations,
} from '@/lib/ai/recommendations';
import type { ApiResponse, Recommendation, RecommendationResponse } from '@/types';

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const recommendationRequestSchema = z.object({
  type: z.enum(['remediation', 'policy', 'risk']),
  context: z.record(z.string(), z.unknown()),
});

// ---------------------------------------------------------------------------
// Anthropic API Types
// ---------------------------------------------------------------------------

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessagesResponse {
  content: AnthropicContentBlock[];
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ---------------------------------------------------------------------------
// POST /api/ai/recommendations
// ---------------------------------------------------------------------------

/**
 * Generate AI-powered recommendations based on assessment data, policy context,
 * or risk items.
 *
 * Request body:
 *   { type: 'remediation' | 'policy' | 'risk', context: Record<string, unknown> }
 *
 * - In demo mode (Supabase not configured): returns sample recommendations
 * - When ANTHROPIC_API_KEY is missing: returns sample recommendations with a note
 * - When fully configured: calls the Claude API and returns parsed recommendations
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<RecommendationResponse>>> {
  // Rate limit: 10 requests per minute (shared with the main AI endpoint)
  const rateLimitResponse = withRateLimit(request, RATE_LIMIT_STRICT, RATE_LIMIT_WINDOW_MS);
  if (rateLimitResponse) return rateLimitResponse as NextResponse<ApiResponse<RecommendationResponse>>;

  try {
    // Parse and validate the request body
    const body: unknown = await request.json();
    const parsed = recommendationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        'Validation failed: ' + parsed.error.issues.map((i) => i.message).join(', '),
        400,
      ) as NextResponse<ApiResponse<RecommendationResponse>>;
    }

    const { type, context } = parsed.data;

    // ------------------------------------------------------------------
    // Demo mode: return sample recommendations without any external calls
    // ------------------------------------------------------------------
    if (!isServerSupabaseConfigured()) {
      return apiSuccess<RecommendationResponse>({
        recommendations: getSampleRecommendations(type),
        generated_at: new Date().toISOString(),
        model: 'demo-mode',
      });
    }

    // ------------------------------------------------------------------
    // Auth check
    // ------------------------------------------------------------------
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiError('Unauthorized', 401) as NextResponse<ApiResponse<RecommendationResponse>>;
    }

    // ------------------------------------------------------------------
    // Check for Anthropic API key
    // ------------------------------------------------------------------
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return sample data with a note rather than failing hard
      return apiSuccess<RecommendationResponse>(
        {
          recommendations: getSampleRecommendations(type),
          generated_at: new Date().toISOString(),
          model: 'demo-mode',
        },
        200,
        'ANTHROPIC_API_KEY is not configured. Returning sample recommendations.',
      );
    }

    // ------------------------------------------------------------------
    // Build the prompt based on recommendation type
    // ------------------------------------------------------------------
    let prompt: string;

    switch (type) {
      case 'remediation': {
        const scores = (context.scores ?? []) as import('@/types').DomainScore[];
        const responses = (context.responses ?? []) as import('@/types').AssessmentResponse[];
        prompt = generateRemediationRecommendations(scores, responses);
        break;
      }
      case 'policy': {
        const policyType = (context.policyType as string) ?? 'aup';
        const industry = context.industry as string | undefined;
        prompt = generatePolicyRecommendations(policyType, industry);
        break;
      }
      case 'risk': {
        const riskItems = (context.riskItems ?? []) as import('@/types').RiskItem[];
        prompt = generateRiskMitigations(riskItems);
        break;
      }
      default: {
        return apiError(`Unknown recommendation type: ${type as string}`, 400) as NextResponse<
          ApiResponse<RecommendationResponse>
        >;
      }
    }

    // ------------------------------------------------------------------
    // Call the Anthropic Messages API
    // ------------------------------------------------------------------
    const model = 'claude-sonnet-4-5-20250929';

    // Split the combined prompt at the separator to extract system vs user parts
    const separatorIndex = prompt.indexOf('\n\n---\n\n');
    const systemPrompt = separatorIndex > -1 ? prompt.slice(0, separatorIndex) : '';
    const userMessage = separatorIndex > -1 ? prompt.slice(separatorIndex + 7) : prompt;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error('[recommendations] Anthropic API error:', anthropicResponse.status, errorBody);

      if (anthropicResponse.status === 429) {
        return apiError(
          'AI service is temporarily rate limited. Please try again shortly.',
          429,
        ) as NextResponse<ApiResponse<RecommendationResponse>>;
      }

      // Fall back to sample data on API errors so the user still gets value
      return apiSuccess<RecommendationResponse>(
        {
          recommendations: getSampleRecommendations(type),
          generated_at: new Date().toISOString(),
          model: 'fallback-demo',
        },
        200,
        'AI service encountered an error. Returning sample recommendations.',
      );
    }

    const result: AnthropicMessagesResponse = await anthropicResponse.json();

    // Extract text from response content blocks
    const textBlocks = (result.content ?? []).filter(
      (block: AnthropicContentBlock) => block.type === 'text',
    );
    const generatedText = textBlocks
      .map((block: AnthropicContentBlock) => block.text ?? '')
      .join('\n\n');

    // Parse the structured response into typed Recommendation objects
    const recommendations: Recommendation[] = parseRecommendationResponse(generatedText);

    // If parsing produced zero results, fall back to sample data
    if (recommendations.length === 0) {
      return apiSuccess<RecommendationResponse>(
        {
          recommendations: getSampleRecommendations(type),
          generated_at: new Date().toISOString(),
          model: 'fallback-demo',
        },
        200,
        'Could not parse AI response. Returning sample recommendations.',
      );
    }

    return apiSuccess<RecommendationResponse>({
      recommendations,
      generated_at: new Date().toISOString(),
      model: result.model ?? model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[recommendations] Unexpected error:', message);
    return apiError(message, 500) as NextResponse<ApiResponse<RecommendationResponse>>;
  }
}
