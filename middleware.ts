/**
 * middleware.ts — Route protection via Supabase Auth + @supabase/ssr.
 *
 * This file CANNOT use lib/supabase/server.ts (which relies on next/headers).
 * Middleware must use createServerClient directly with NextRequest/NextResponse
 * cookies — this is the official @supabase/ssr pattern for Next.js middleware.
 *
 * Protected routes:
 *   /dashboard  — any authenticated user
 *   /admin      — authenticated users with profiles.role === 'admin' only
 *
 * Public routes (/, /pricing, /login) — no session check, always allowed.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  /**
   * Start with a plain pass-through response.
   * The setAll cookie handler below will rebuild it if tokens need refreshing,
   * ensuring the updated auth cookies are written back to the browser.
   */
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First write the cookies onto the mutated request so subsequent
          // server code in this middleware invocation sees them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild supabaseResponse so the refreshed cookies propagate
          // to the browser on every response.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /**
   * IMPORTANT: use getUser(), not getSession().
   * getUser() validates the JWT with Supabase's server — it cannot be spoofed
   * by a tampered cookie. getSession() only reads the local cookie and is not
   * safe to trust in middleware for access control decisions.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Not logged in → redirect to /login ───────────────────────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // ── /admin → require profiles.role === 'admin' ───────────────────────────
  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      // Logged-in client trying to access admin — bounce to their own dashboard.
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // ── All checks passed — return the (potentially cookie-refreshed) response ─
  return supabaseResponse;
}

/**
 * Only run this middleware on protected routes.
 * Static assets, public pages, and the login page are intentionally excluded.
 */
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
