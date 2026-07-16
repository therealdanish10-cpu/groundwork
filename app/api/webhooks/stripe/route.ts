/**
 * POST /api/webhooks/stripe
 *
 * Verifies incoming Stripe webhook events and keeps the Supabase
 * subscriptions table in sync.
 *
 * Events handled:
 *   checkout.session.completed      → create / upsert subscriptions row
 *   customer.subscription.updated   → sync status (active | past_due)
 *   customer.subscription.deleted   → mark canceled
 *
 * IMPORTANT: this handler reads the raw request body (via request.text())
 * which is required for Stripe signature verification.  Next.js App Router
 * route handlers support this pattern natively — no special bodyParser
 * config is needed.
 */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

/* Stripe subscription status → our DB status */
function mapSubStatus(stripeStatus: string): string {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active';
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid')  return 'past_due';
  return 'canceled';
}

export async function POST(request: Request) {
  const body = await request.text(); // raw body — required for sig verification
  const sig  = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`,
      { status: 400 },
    );
  }

  /* Admin client bypasses RLS — webhooks have no user session */
  const supabase = createAdminClient();

  try {
    switch (event.type) {

      /* ── New checkout completed ────────────────────────────────── */
      case 'checkout.session.completed': {
        const session     = event.data.object as Stripe.Checkout.Session;
        const userId      = session.client_reference_id;
        const plan        = session.metadata?.plan as 'build' | 'host' | 'grow' | undefined;
        const customerId  = session.customer as string | null;
        const subId       = session.subscription as string | null;

        if (!userId || !plan) {
          console.warn('[webhook] checkout.session.completed missing userId or plan', session.id);
          break;
        }

        const { error } = await supabase.from('subscriptions').upsert(
          {
            user_id:                 userId,
            plan_type:               plan,
            status:                  'active',
            stripe_customer_id:      customerId,
            stripe_subscription_id:  subId,
            started_at:              new Date().toISOString(),
          },
          {
            /* If a row for this user already exists (e.g. upgrading),
               update it rather than create a duplicate. */
            onConflict: 'user_id',
          },
        );

        if (error) {
          console.error('[webhook] Failed to upsert subscription:', error);
          // Return 500 so Stripe retries
          return new Response('DB error', { status: 500 });
        }

        console.log(`[webhook] Subscription created for user ${userId}, plan ${plan}`);
        break;
      }

      /* ── Subscription status changed ───────────────────────────── */
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const newStatus = mapSubStatus(sub.status);

        await supabase
          .from('subscriptions')
          .update({ status: newStatus })
          .eq('stripe_subscription_id', sub.id);

        console.log(`[webhook] Subscription ${sub.id} updated to ${newStatus}`);
        break;
      }

      /* ── Subscription canceled / deleted ───────────────────────── */
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;

        await supabase
          .from('subscriptions')
          .update({
            status:       'canceled',
            canceled_at:  new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);

        console.log(`[webhook] Subscription ${sub.id} canceled`);
        break;
      }

      default:
        // Unhandled event types — acknowledge receipt so Stripe doesn't retry
        break;
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err);
    return new Response('Internal error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
