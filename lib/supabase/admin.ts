/**
 * Supabase admin client — server-side only, uses the service role key
 * to bypass Row Level Security.
 *
 * Use ONLY in Route Handlers and Server Actions that run with trusted
 * server-level context (e.g. Stripe webhook handler).
 * NEVER import this in Client Components or expose to the browser.
 */
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
