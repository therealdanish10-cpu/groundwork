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
    setup: 'price_1TtQF3APrKHvi6DBxL1clVpm',
  },
  host: {
    setup:   'price_1TtQFZAPrKHvi6DBd2d7a4Hm',
    monthly: 'price_1TtQO7APrKHvi6DBacSYZmiN',
  },
  grow: {
    setup:   'price_1TtQOZAPrKHvi6DBAbLOktkX',
    monthly: 'price_1TtQP6APrKHvi6DBGZU98cOZ',
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
  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const successUrl = `${origin}/dashboard?checkout=success`;
  const cancelUrl  = `${origin}/pricing?checkout=canceled`;

  const prices = PRICES[plan];

  /* ── Create Checkout Session ────────────────────────────────────── */
  try {
    let session;

    if (plan === 'build') {
      /* One-time payment — Build plan */
      session = await stripe.checkout.sessions.create({
        mode:                'payment',
        client_reference_id: user.id,
        ...(existingCustomerId
          ? { customer: existingCustomerId }
          : { customer_email: user.email }),
        line_items: [
          { price: prices.setup, quantity: 1 },
        ],
        metadata: { plan },
        success_url: successUrl,
        cancel_url:  cancelUrl,
      });
    } else {
      /* Subscription — Host or Grow plan.
         The setup (one-time) price is listed first; Stripe automatically
         treats it as an invoice item on the first subscription invoice. */
      session = await stripe.checkout.sessions.create({
        mode:                'subscription',
        client_reference_id: user.id,
        ...(existingCustomerId
          ? { customer: existingCustomerId }
          : { customer_email: user.email }),
        line_items: [
          { price: prices.setup,    quantity: 1 },
          { price: prices.monthly!, quantity: 1 },
        ],
        subscription_data: {
          metadata: { plan, userId: user.id },
        },
        metadata: { plan },
        success_url: successUrl,
        cancel_url:  cancelUrl,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
