/**
 * POST /api/leads/[id]/book
 *
 * Atomically marks a lead as booked and charges the client $50 via Stripe.
 *
 * Guards:
 *   - Caller must be authenticated (client or admin).
 *   - Caller must own the lead OR have role = 'admin'.
 *   - Lead's charge_status must be 'pending' — rejects if already processed.
 *   - Client must have an active Grow subscription with a stripe_customer_id.
 *
 * On Stripe success:
 *   leads.status       → 'booked'
 *   leads.charge_status → 'charged'
 *   leads.stripe_charge_id → payment_intent.id
 *
 * On Stripe failure (card declined etc.):
 *   leads.charge_status → 'failed'
 *   leads.status        unchanged (not marked booked)
 *   Returns 402 with the Stripe failure message so the UI can surface it.
 */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leadId } = await params;

  /* ── 1. Auth — identify the caller ───────────────────────────────── */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* Use the admin client for cross-table reads that need to bypass RLS */
  const admin = createAdminClient();

  /* ── 2. Fetch the lead ────────────────────────────────────────────── */
  const { data: lead, error: leadError } = await admin
    .from('leads')
    .select('id, client_id, status, charge_status, fee_amount')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  /* ── 3. Permission check — owner or admin ─────────────────────────── */
  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin  = callerProfile?.role === 'admin';
  const isOwner  = lead.client_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  /* ── 4. Idempotency guard — reject if already processed ───────────── */
  if (lead.charge_status !== 'pending') {
    return NextResponse.json(
      {
        error: `Lead has already been processed (charge_status = '${lead.charge_status}'). Refusing to reprocess.`,
      },
      { status: 409 },
    );
  }

  /* ── 5. Verify active Grow subscription with a Stripe customer ID ─── */
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('stripe_customer_id, plan_type, status')
    .eq('user_id', lead.client_id)
    .eq('plan_type', 'grow')
    .eq('status', 'active')
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json(
      { error: 'Client does not have an active Grow plan — booking fees are not applicable.' },
      { status: 422 },
    );
  }

  if (!subscription.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No Stripe customer ID on file for this client — cannot charge.' },
      { status: 422 },
    );
  }

  const customerId = subscription.stripe_customer_id;

  /* ── 6. Resolve the customer's default payment method ────────────── */
  let paymentMethodId: string | null = null;

  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

    if (customer.deleted) {
      return NextResponse.json(
        { error: 'Stripe customer has been deleted — cannot charge.' },
        { status: 422 },
      );
    }

    /* Prefer the invoice default (set when subscription is created) */
    paymentMethodId =
      (typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : (customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod | null)?.id
      ) ?? null;

    /* Fallback: first attached card payment method */
    if (!paymentMethodId) {
      const methods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
        limit: 1,
      });
      paymentMethodId = methods.data[0]?.id ?? null;
    }
  } catch (err) {
    console.error('[book] Stripe customer retrieval error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve Stripe customer details.' },
      { status: 500 },
    );
  }

  if (!paymentMethodId) {
    return NextResponse.json(
      { error: 'No payment method on file for this customer — cannot charge off-session.' },
      { status: 422 },
    );
  }

  /* ── 7. Attempt the $50 off-session charge ───────────────────────── */
  const chargeAmount = 5000; // cents

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:               chargeAmount,
      currency:             'usd',
      customer:             customerId,
      payment_method:       paymentMethodId,
      off_session:          true,
      confirm:              true,
      description:          `Groundwork lead booking fee — lead ${leadId}`,
      metadata:             { leadId, clientId: lead.client_id },
    });

    /* ── 8a. Charge succeeded — update lead as booked + charged ───── */
    await admin
      .from('leads')
      .update({
        status:           'booked',
        charge_status:    'charged',
        stripe_charge_id: paymentIntent.id,
      })
      .eq('id', leadId);

    console.log(`[book] Lead ${leadId} booked and charged ${chargeAmount} cents (pi: ${paymentIntent.id})`);

    return NextResponse.json({
      success: true,
      leadId,
      paymentIntentId: paymentIntent.id,
    });

  } catch (err) {
    /* ── 8b. Charge failed — mark charge_status = 'failed', not booked */
    const stripeErr = err as Stripe.errors.StripeError;
    const failureMessage =
      stripeErr.message ?? 'Payment failed for an unknown reason.';

    console.error(`[book] Stripe charge failed for lead ${leadId}:`, stripeErr.message);

    /* Best-effort DB update — record the failure */
    await admin
      .from('leads')
      .update({ charge_status: 'failed' })
      .eq('id', leadId);

    return NextResponse.json(
      { error: `Charge failed: ${failureMessage}` },
      { status: 402 },
    );
  }
}
