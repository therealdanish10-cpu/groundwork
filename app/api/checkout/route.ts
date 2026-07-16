/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the requested plan and returns
 * the session URL. The frontend redirects the browser there.
 *
 * Body:  { plan: 'build' | 'host' | 'grow' }
 * Returns: { url: string }
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

type Plan = 'build' | 'host' | 'grow';

/* ── Price IDs (Stripe test mode) ──────────────────────────────────── */
const PRICES: Record<Plan, { setup: string; monthly?: string }> = {
  build: {
    setup: 'price_1TtjyqA55Y86ruKFK64QWntO',
  },
  host: {
    setup:   'price_1TtjzLA55Y86ruKF88yYSPTs',
    monthly: 'price_1TtjzjA55Y86ruKFS8w2oEXn',
  },
  grow: {
    setup:   'price_1Ttk06A55Y86ruKFomso2yLR',
    monthly: 'price_1Ttk0QA55Y86ruKFH4As1Rw5',
  },
};

export async function POST(request: Request) {
  /* ── Auth check ─────────────────────────────────────────────────── */
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* ── Parse body ─────────────────────────────────────────────────── */
  let plan: Plan;
  try {
    const body = await request.json() as { plan: Plan };
    if (!['build', 'host', 'grow'].includes(body.plan)) throw new Error();
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  /* ── Reuse existing Stripe customer if possible ─────────────────── */
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .maybeSingle();

  const existingCustomerId = existingSub?.stripe_customer_id ?? null;

  /* ── Build redirect URLs ────────────────────────────────────────── */
  const origin     = request.headers.get('origin') ?? 'http://localhost:3000';
  const successUrl = `${origin}/dashboard?checkout=success`;
  const cancelUrl  = `${origin}/pricing?checkout=canceled`;

  const prices = PRICES[plan];

  /* ── Build session params ────────────────────────────────────────── */
  function buildParams(customerId: string | null) {
    const customerField = customerId
      ? { customer: customerId }
      : { customer_email: user!.email };

    if (plan === 'build') {
      return {
        mode:                'payment' as const,
        client_reference_id: user!.id,
        ...customerField,
        line_items: [{ price: prices.setup, quantity: 1 }],
        metadata:    { plan },
        success_url: successUrl,
        cancel_url:  cancelUrl,
      };
    }

    /* Host or Grow — subscription */
    return {
      mode:                'subscription' as const,
      client_reference_id: user!.id,
      ...customerField,
      line_items: [
        { price: prices.setup,    quantity: 1 },
        { price: prices.monthly!, quantity: 1 },
      ],
      subscription_data: { metadata: { plan, userId: user!.id } },
      metadata:    { plan },
      success_url: successUrl,
      cancel_url:  cancelUrl,
    };
  }

  /* ── Create Checkout Session (with stale-customer fallback) ─────── */
  try {
    let session;

    try {
      session = await stripe.checkout.sessions.create(buildParams(existingCustomerId));
    } catch (stripeErr) {
      /* If Stripe rejects the stored customer ID (e.g. it belongs to a
         different Stripe account after a key rotation), clear it from the
         DB and retry with just the user's email so Stripe creates a new
         customer automatically. */
      const msg = stripeErr instanceof Error ? stripeErr.message : '';
      const isStaleCustomer =
        existingCustomerId !== null &&
        (msg.includes('No such customer') || msg.includes('resource_missing'));

      if (!isStaleCustomer) throw stripeErr; // unrelated error — rethrow

      console.warn(
        `[checkout] Stale customer ID ${existingCustomerId} rejected — clearing and retrying.`
      );

      /* Best-effort clear — don't block checkout if this DB call fails */
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: null })
        .eq('user_id', user.id)
        .eq('stripe_customer_id', existingCustomerId);

      /* Retry without a customer ID — Stripe will create a fresh one */
      session = await stripe.checkout.sessions.create(buildParams(null));
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
