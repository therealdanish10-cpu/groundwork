/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the requested plan and returns
 * the session URL. Supports both guest checkout and logged-in clients.
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
  /* ── 1. Optional user session check (for existing logged-in clients) ─ */
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  /* ── 2. Parse body ─────────────────────────────────────────────────── */
  let plan: Plan;
  try {
    const body = await request.json() as { plan: Plan };
    if (!['build', 'host', 'grow'].includes(body.plan)) throw new Error();
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  /* ── 3. Same-plan guard for logged-in users ──────────────────────── */
  if (user) {
    const { data: existingActiveSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('plan_type', plan)
      .maybeSingle();

    if (existingActiveSub) {
      const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
      return NextResponse.json(
        {
          error:   'already_subscribed',
          message: `You already have an active ${planLabel} plan. Visit your dashboard to manage billing.`,
        },
        { status: 409 },
      );
    }
  }

  /* ── 4. Reuse existing Stripe customer if available ──────────────── */
  let existingCustomerId: string | null = null;
  if (user) {
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .maybeSingle();

    existingCustomerId = existingSub?.stripe_customer_id ?? null;
  }

  /* ── 5. Build redirect URLs ────────────────────────────────────────── */
  const origin     = request.headers.get('origin') ?? 'http://localhost:3000';
  const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${origin}/pricing?checkout=canceled`;

  const prices = PRICES[plan];

  /* ── 6. Build session params ────────────────────────────────────────── */
  function buildParams(customerId: string | null) {
    const customerField = customerId
      ? { customer: customerId }
      : user?.email
        ? { customer_email: user.email }
        : {};

    const clientRefField = user?.id ? { client_reference_id: user.id } : {};

    if (plan === 'build') {
      return {
        mode:                'payment' as const,
        ...clientRefField,
        ...customerField,
        line_items: [{ price: prices.setup, quantity: 1 }],
        metadata:    { plan, userId: user?.id ?? '' },
        success_url: successUrl,
        cancel_url:  cancelUrl,
      };
    }

    /* Host or Grow — subscription */
    return {
      mode:                'subscription' as const,
      ...clientRefField,
      ...customerField,
      line_items: [
        { price: prices.setup,    quantity: 1 },
        { price: prices.monthly!, quantity: 1 },
      ],
      subscription_data: { metadata: { plan, userId: user?.id ?? '' } },
      metadata:    { plan, userId: user?.id ?? '' },
      success_url: successUrl,
      cancel_url:  cancelUrl,
    };
  }

  /* ── 7. Create Checkout Session ────────────────────────────────────── */
  try {
    let session;

    try {
      session = await stripe.checkout.sessions.create(buildParams(existingCustomerId));
    } catch (stripeErr) {
      const msg = stripeErr instanceof Error ? stripeErr.message : '';
      const isStaleCustomer =
        existingCustomerId !== null &&
        (msg.includes('No such customer') || msg.includes('resource_missing'));

      if (!isStaleCustomer) throw stripeErr;

      console.warn(
        `[checkout] Stale customer ID ${existingCustomerId} rejected — clearing and retrying.`
      );

      if (user) {
        await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: null })
          .eq('user_id', user.id)
          .eq('stripe_customer_id', existingCustomerId);
      }

      session = await stripe.checkout.sessions.create(buildParams(null));
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
