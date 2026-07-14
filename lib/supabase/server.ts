/**
 * Supabase server client — use in Server Components, Server Actions,
 * and Route Handlers.
 *
 * createServerClient from @supabase/ssr reads and writes auth tokens via
 * HTTP cookies (using next/headers), keeping sessions in sync between the
 * server and browser without any manual token handling.
 *
 * IMPORTANT: cookies() is async in Next.js 15+ (including 16.x).
 *            This function is therefore async — always await it.
 *
 * Usage:
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can throw in read-only Server Component contexts
            // (e.g. inside a page that's already streaming). The middleware
            // handles token refresh in those cases, so this is safe to ignore.
          }
        },
      },
    },
  );
}
