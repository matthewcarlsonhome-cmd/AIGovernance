import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

const AI_REQUEST_TYPES = ['policy_draft', 'report_narrative', 'meeting_summary', 'proposal'] as const;
type AiRequestType = (typeof AI_REQUEST_TYPES)[number];

const aiRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000),
  context: z.string().max(50000).optional().default(''),
  type: z.enum(AI_REQUEST_TYPES),
});

interface AiResponseData {
  text: string;
  type: AiRequestType;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * System prompt templates per request type.
 * These guide Claude to generate content appropriate for each use case.
 */
const SYSTEM_PROMPTS: Record<AiRequestType, string> = {
  policy_draft: `You are an expert AI governance consultant drafting organizational policies for enterprise AI coding tool adoption.
Write in formal, precise policy language appropriate for corporate governance documents.
Include clear definitions, scope statements, and actionable requirements.
Structure the output with numbered sections and subsections.
Focus on practical, enforceable policy language that aligns with SOC 2, HIPAA, NIST, and GDPR frameworks where applicable.`,

  report_narrative: `You are an expert AI governance consultant writing report sections for stakeholders evaluating AI coding tool adoption.
Write in clear, professional language appropriate for the specified audience.
Support claims with data points when provided in context.
Include executive-appropriate summaries and actionable recommendations.
Structure content with clear headings and bullet points for readability.`,

  meeting_summary: `You are an expert AI governance consultant summarizing meeting notes.
Produce a structured summary with the following sections:
1. Key Decisions - numbered list of decisions made
2. Action Items - who, what, and by when
3. Open Questions - unresolved topics requiring follow-up
4. Next Steps - planned activities and timeline
Be concise but comprehensive. Attribute actions and decisions to specific participants when mentioned.`,

  proposal: `You are an expert AI governance consultant drafting proposals for AI coding tool adoption initiatives.
Write persuasive, data-informed content appropriate for executive and technical decision-makers.
Include a clear problem statement, proposed approach, expected outcomes, and resource requirements.
Structure the proposal with professional formatting including headers, bullet points, and summary tables where appropriate.`,
};

/**
 * POST /api/ai
 * Proxy requests to the Claude API for AI-assisted content generation.
 * All AI calls are server-side only to protect the ANTHROPIC_API_KEY.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AiResponseData>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', message: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Configuration error', message: 'AI service is not configured. ANTHROPIC_API_KEY is missing.' },
        { status: 503 },
      );
    }

    const { prompt, context, type } = parsed.data;

    // Build the user message with context
    const userMessage = context
      ? `Context:\n${context}\n\n---\n\nRequest:\n${prompt}`
      : prompt;

    const model = 'claude-sonnet-4-20250514';

    // Call the Anthropic Messages API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: SYSTEM_PROMPTS[type],
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Anthropic API error:', response.status, errorBody);

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limited', message: 'AI service is temporarily rate limited. Please try again shortly.' },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: 'AI service error', message: 'Failed to generate AI content. Please try again.' },
        { status: 502 },
      );
    }

    const result = await response.json();

    // Extract text from the response content blocks
    const textBlocks = (result.content ?? []).filter(
      (block: { type: string }) => block.type === 'text',
    );
    const generatedText = textBlocks
      .map((block: { text: string }) => block.text)
      .join('\n\n');

    const aiResponse: AiResponseData = {
      text: generatedText,
      type,
      model: result.model ?? model,
      usage: {
        input_tokens: result.usage?.input_tokens ?? 0,
        output_tokens: result.usage?.output_tokens ?? 0,
      },
    };

    return NextResponse.json({ data: aiResponse });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
