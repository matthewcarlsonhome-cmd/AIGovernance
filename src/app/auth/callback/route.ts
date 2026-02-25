import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  const code = searchParams.get('code');
  const next = searchParams.get('redirect') || '/';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Behind a reverse proxy (Render, Vercel, etc.), request.url contains the
  // internal origin (e.g. http://localhost:10000). Use forwarded headers or
  // the configured NEXT_PUBLIC_APP_URL to get the real public origin.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

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
