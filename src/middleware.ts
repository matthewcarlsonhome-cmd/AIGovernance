import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/auth/callback'];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder') &&
    url.startsWith('https://')
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  if (isStaticAsset) {
    return NextResponse.next({ request });
  }

  // If Supabase is not configured, allow all routes through
  // The app will show configuration guidance in the UI
  if (!isSupabaseConfigured()) {
    const response = NextResponse.next({ request });
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return response;
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Middleware auth error:', error.message);
    }

    // API routes: return 401 if not authenticated
    if (isApiRoute && !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to access this resource.' },
        { status: 401 }
      );
    }

    // Redirect unauthenticated users to login
    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      if (pathname !== '/') {
        url.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (user && isPublicPath) {
      const url = request.nextUrl.clone();
      const redirect = request.nextUrl.searchParams.get('redirect');
      url.pathname = redirect || '/';
      url.searchParams.delete('redirect');
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error('Middleware error:', err);
    // On middleware failure, allow the request through rather than blocking
    // The page-level error boundaries will handle display
  }

  // Add security headers
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
