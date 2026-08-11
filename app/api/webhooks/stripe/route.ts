/**
 * POST /api/webhooks/stripe
 *
 * Verifies incoming Stripe webhook events and keeps the Supabase
 * subscriptions table and user accounts in sync.
 *
 * Events handled:
 *   checkout.session.completed      → resolve/create user account & send email, upsert subscription
 *   customer.subscription.updated   → sync status (active | past_due)
 *   customer.subscription.deleted   → mark canceled
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

      /* ── New checkout completed (Guest or Authenticated) ────────── */
      case 'checkout.session.completed': {
        const session    = event.data.object as Stripe.Checkout.Session;
        let userId       = session.client_reference_id;
        const plan       = session.metadata?.plan as 'build' | 'host' | 'grow' | undefined;
        const customerId = session.customer as string | null;
        const subId      = session.subscription as string | null;
        const customerEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase().trim();

        if (!plan) {
          console.warn('[webhook] checkout.session.completed missing plan metadata', session.id);
          break;
        }

        /* If checkout was performed as a guest (no client_reference_id) */
        if (!userId) {
          if (!customerEmail) {
            console.error('[webhook] Guest checkout missing customer email', session.id);
            return new Response('Missing customer email', { status: 400 });
          }

          const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

          /* 1. Check if user already exists with this email */
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .maybeSingle();

          if (existingProfile) {
            userId = existingProfile.id;
            console.log(`[webhook] Existing user found for email ${customerEmail} (id: ${userId}). Sending password reset / login link.`);

            /* Send password reset / magic login email to existing user */
            const { error: resetErr } = await supabase.auth.resetPasswordForEmail(customerEmail, {
              redirectTo: `${origin}/login`,
            });
            if (resetErr) {
              console.error(`[webhook] resetPasswordForEmail failed for ${customerEmail}:`, resetErr.message);
            } else {
              console.log(`[webhook] Password reset / login email successfully dispatched to existing user ${customerEmail}`);
            }

          } else {
            /* 2. Brand new guest buyer — Invite user via email (creates user + sends activation email) */
            console.log(`[webhook] Creating and inviting brand new user for email: ${customerEmail}`);

            const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
              customerEmail,
              {
                redirectTo: `${origin}/login`,
                data: { role: 'client' },
              }
            );

            if (inviteError || !inviteData?.user) {
              console.error(`[webhook] inviteUserByEmail failed for ${customerEmail}:`, inviteError?.message || 'Unknown error');
              console.log('[webhook] Attempting fallback createUser...');

              const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: customerEmail,
                email_confirm: true,
                user_metadata: { role: 'client' },
              });

              if (createError || !newUser?.user) {
                console.error('[webhook] User creation fallback failed:', createError);
                return new Response('User creation failed', { status: 500 });
              }

              userId = newUser.user.id;
            } else {
              userId = inviteData.user.id;
              console.log(`[webhook] Successfully invited new user ${customerEmail} (id: ${userId}) via Supabase Auth email`);
            }

            /* 3. Ensure profile record exists with role='client' */
            await supabase.from('profiles').upsert(
              {
                id: userId,
                email: customerEmail,
                role: 'client',
              },
              { onConflict: 'id' }
            );
          }
        }

        /* 4. Upsert active subscription record in database */
        const { error: subError } = await supabase.from('subscriptions').upsert(
          {
            user_id:                 userId,
            plan_type:               plan,
            status:                  'active',
            stripe_customer_id:      customerId,
            stripe_subscription_id:  subId,
            started_at:              new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          },
        );

        if (subError) {
          console.error('[webhook] Failed to upsert subscription:', subError);
          return new Response('DB error', { status: 500 });
        }

        console.log(`[webhook] Subscription successfully created for user ${userId} (${customerEmail}), plan ${plan}`);
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
        break;
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err);
    return new Response('Internal error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
