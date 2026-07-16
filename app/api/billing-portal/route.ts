/**
 * POST /api/billing-portal
 *
 * Creates a Stripe Customer Portal session for the authenticated user
 * and returns the portal URL. The client redirects the browser there.
 *
 * Requirements:
 *   - User must be authenticated (401 otherwise)
 *   - User must have a stripe_customer_id in their subscriptions row
 *     (i.e. they completed a Stripe Checkout at some point)
 *
 * Returns: { url: string }
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  /* ── Auth check ─────────────────────────────────────────────────── */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* ── Look up the customer's Stripe customer ID ───────────────────── */
  const { data: sub, error: dbError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .maybeSingle();

  if (dbError) {
    console.error('[billing-portal] DB error:', dbError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No Stripe customer found for this account' },
      { status: 404 },
    );
  }

  /* ── Build the return URL ────────────────────────────────────────── */
  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const returnUrl = `${origin}/dashboard`;

  /* ── Create the Billing Portal session ──────────────────────────── */
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   sub.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('[billing-portal] Stripe error:', err);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 },
    );
  }
}
