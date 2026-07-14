/**
 * Stripe Node SDK singleton — for use in Server Components, Server Actions,
 * and Route Handlers ONLY.
 *
 * Never import this file from a Client Component or any file that might be
 * bundled for the browser: STRIPE_SECRET_KEY must stay server-side.
 *
 * Usage:
 *   import { stripe } from '@/lib/stripe';
 *   const session = await stripe.checkout.sessions.create({ ... });
 */
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Pin the API version so upgrades don't silently break existing code.
  // Update intentionally when you're ready to adopt breaking changes.
  apiVersion: '2026-06-24.dahlia',
});
