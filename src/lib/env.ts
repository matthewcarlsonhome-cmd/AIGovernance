import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || undefined,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  });

  if (!parsed.success) {
    console.warn(
      '[GovAI Studio] Environment variable validation warnings:',
      parsed.error.flatten().fieldErrors
    );
    // Return defaults rather than crashing - the app will show
    // configuration guidance in the UI for missing variables
    return {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    };
  }

  // Log helpful setup message if Supabase isn't configured
  if (!parsed.data.NEXT_PUBLIC_SUPABASE_URL || !parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      '[GovAI Studio] Supabase is not configured. Authentication and database features are disabled.\n' +
      'To enable them, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.\n' +
      'See SETUP_MANUAL.md for detailed instructions.'
    );
  }

  return parsed.data;
}

export const env = getEnv();

export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
  );
}
