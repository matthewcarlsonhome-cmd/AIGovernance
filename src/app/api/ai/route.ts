import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { withRateLimit } from '@/lib/api-helpers';
import { RATE_LIMIT_STRICT, RATE_LIMIT_WINDOW_MS } from '@/lib/rate-limit';
import { PROMPT_TEMPLATES, type PromptType } from '@/lib/ai/prompts';
import type { ApiResponse } from '@/types';

const PROMPT_TYPES = [
  'policy_draft',
  'report_narrative',
  'meeting_summary',
  'risk_assessment',
  'proposal_narrative',
] as const;

const aiRequestSchema = z.object({
  type: z.enum(PROMPT_TYPES),
  /** Free-form prompt text (used as fallback or appended to structured context). */
  prompt: z.string().min(1, 'Prompt is required').max(10000),
  /** Legacy plain-text context string. Prefer `templateContext` instead. */
  context: z.string().max(50000).optional().default(''),
  /** Structured context object consumed by the prompt template's buildUserMessage. */
  templateContext: z.record(z.string(), z.unknown()).optional(),
});

/** Shape of a single content block returned by the Anthropic Messages API. */
interface AnthropicContentBlock {
  type: string;
  text?: string;
}

/** Shape of the top-level response from the Anthropic Messages API. */
interface AnthropicMessagesResponse {
  content: AnthropicContentBlock[];
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AiResponseData {
  text: string;
  type: PromptType;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * POST /api/ai
 * Proxy requests to the Claude API for AI-assisted content generation.
 * All AI calls are server-side only to protect the ANTHROPIC_API_KEY.
 *
 * The route resolves a typed PromptTemplate from `lib/ai/prompts.ts` based on
 * the request `type`.  When `templateContext` is provided the template builds a
 * structured user message; otherwise the route falls back to the plain `prompt`
 * + `context` fields for backward compatibility.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AiResponseData>>> {
  // Strict rate limit: 10 requests per minute for AI endpoints
  const rateLimitResponse = withRateLimit(request, RATE_LIMIT_STRICT, RATE_LIMIT_WINDOW_MS);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    if (!isServerSupabaseConfigured()) {
      const body = await request.json();
      return NextResponse.json({
        data: {
          text: 'This is a demo response. AI content generation requires a configured Supabase instance and Anthropic API key.',
          type: body.type ?? 'policy_draft',
          model: 'demo-mode',
          usage: { input_tokens: 0, output_tokens: 0 },
        },
      });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
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

    const { prompt, context, type, templateContext } = parsed.data;

    // Resolve the prompt template for this request type
    const template = PROMPT_TEMPLATES[type];

    // Build the user message ------------------------------------------------
    let userMessage: string;

    if (template && templateContext) {
      // Structured path: inject the free-form prompt into templateContext so
      // the template can incorporate it, then build the full message.
      const enrichedCtx = { ...templateContext, prompt };
      userMessage = template.buildUserMessage(enrichedCtx);
    } else if (context) {
      // Legacy plain-text path
      userMessage = `Context:\n${context}\n\n---\n\nRequest:\n${prompt}`;
    } else {
      userMessage = prompt;
    }

    // Resolve the system prompt from the template
    const systemPrompt = template?.system ?? '';

    const model = 'claude-sonnet-4-20250514';

    // Call the Anthropic Messages API ----------------------------------------
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
        system: systemPrompt,
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

    const result: AnthropicMessagesResponse = await response.json();

    // Extract text from the response content blocks
    const textBlocks = (result.content ?? []).filter(
      (block: AnthropicContentBlock) => block.type === 'text',
    );
    const generatedText = textBlocks
      .map((block: AnthropicContentBlock) => block.text ?? '')
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
