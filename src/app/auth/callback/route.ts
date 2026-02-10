import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('redirect') || '/';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth error callbacks
  if (errorParam) {
    const message = encodeURIComponent(errorDescription || errorParam);
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No authorization code received. Please try signing in again.')}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Supabase is not configured. Check your environment variables.')}`);
  }

  try {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(`Authentication failed: ${error.message}`)}`
      );
    }

    return response;
  } catch (err) {
    console.error('Auth callback exception:', err);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('An unexpected error occurred during authentication. Please try again.')}`
    );
  }
}
