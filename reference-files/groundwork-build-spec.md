# Groundwork — Build Spec

## What this is
Groundwork is an agency that builds, hosts, and grows websites for local trades (electricians, plumbers, roofers, etc). This doc specifies the backend needed to turn the existing front-end pages into a fully functional site: real authentication, subscription billing, and automated per-lead charging.

Front-end pages already built (static HTML/CSS/JS, in `/pages`):
- `groundwork-home.html` — marketing home page
- `groundwork-pricing.html` — pricing + comparison table
- `groundwork-auth.html` — login / sign-up (UI only, no real auth yet)
- `groundwork-dashboard.html` — client + admin dashboard (UI only, mock data)

All four share a black/white/lime/violet visual system with a light/dark theme toggle (`data-theme` attribute + CSS variables). Keep this design system when building real pages/components — don't restyle.

---

## Plans

| Plan  | Price          | Billing   | Includes |
|-------|----------------|-----------|----------|
| Build | $500           | one-time  | Site design + handoff |
| Host  | $700/mo        | recurring | Hosting, uptime, security, content edits |
| Grow  | $1,000/mo      | recurring | Build + Host + SEO/performance work + lead capture + $50 charged per lead |

Clients can start on Build only, and later add Host or Grow. Host and Grow are separate recurring Stripe subscriptions (not stacked pricing — Grow includes hosting, so a client on Grow should not also be charged Host).

---

## Data model

```
users
  id
  email
  password_hash
  role                 enum: 'client' | 'admin'
  business_name
  trade                e.g. "electrician", "plumber"
  created_at

subscriptions
  id
  user_id              → users.id
  plan_type             enum: 'build' | 'host' | 'grow'
  status                enum: 'active' | 'canceled' | 'past_due'
  stripe_customer_id
  stripe_subscription_id   (null for one-time Build plan)
  started_at
  canceled_at

leads
  id
  client_id            → users.id
  created_at
  source                enum: 'booking_form' | 'call_tracking'
  status                enum: 'new' | 'contacted' | 'booked'
  stripe_charge_id
  charge_status         enum: 'pending' | 'charged' | 'failed'
  fee_amount            fixed at $50.00

sites
  id
  client_id             → users.id
  status                enum: 'in_progress' | 'live'
  domain
  live_url

site_requests
  id
  client_id             → users.id
  message
  status                enum: 'open' | 'in_progress' | 'done'
  created_at
```

---

## Auth

- Email + password, hashed (bcrypt or equivalent).
- Two roles: `client` (business owner) and `admin` (Groundwork staff). Role is chosen at sign-up on the auth page (already built as a UI toggle — wire it to write `role` on the `users` row).
- Session-based or JWT — either is fine; use whatever the framework's standard auth pattern is (e.g. NextAuth if using Next.js).
- Route protection: `/dashboard` client view requires `role = client`; `/admin` requires `role = admin`.

---

## Stripe integration

1. **Build plan ($500)** — one-time Stripe Checkout payment. On success, create a `subscriptions` row with `plan_type = 'build'`, no `stripe_subscription_id`.
2. **Host / Grow plans** — Stripe subscription (recurring monthly). Use Stripe Checkout or Billing to create the subscription; store `stripe_customer_id` and `stripe_subscription_id`.
3. **Lead fee ($50 flat, Grow plan only)** — when a lead is logged (see below), create a Stripe one-off charge against the client's saved payment method (Stripe `PaymentIntent` off-session, using the customer's default payment method from their subscription). Update `leads.stripe_charge_id` and `charge_status` based on the result. If the charge fails, mark `charge_status = 'failed'` and surface this in the admin dashboard for follow-up — don't silently retry indefinitely.
4. Use Stripe webhooks to keep `subscriptions.status` in sync (`invoice.paid`, `customer.subscription.deleted`, `invoice.payment_failed`, etc).

---

## Lead capture and logging

- Each Grow-plan client's live site includes a booking form and a dedicated tracking phone number (built per-client, outside this spec — this is part of the individual client site build, not the Groundwork app itself).
- Booking form submissions POST to an endpoint here (e.g. `/api/leads`) with the client's ID, creating a `leads` row with `source = 'booking_form'`, `status = 'new'`.
- Call-tracking leads: either integrate a call-tracking provider's webhook, or allow admin manual entry as a fallback (the admin dashboard mock already includes a "Log $50 charge" action per lead — wire this button to trigger the charge flow above).
- Logging a lead should immediately attempt the $50 charge (see Stripe section) rather than batching, so the dashboard always reflects real-time status.

---

## Dashboard functionality to wire up

**Client view** (`groundwork-dashboard.html`, client half):
- Metric cards pull from real data: current plan, site status, lead count this month, amount owed this month (sum of `leads.fee_amount` where `charge_status = 'charged'` this billing cycle).
- Recent leads table reads from `leads` where `client_id = current user`.
- Billing panel links to Stripe's customer billing portal (Stripe-hosted, minimal build needed).
- Site requests panel writes to `site_requests`.

**Admin view**:
- Client list reads all `users` where `role = 'client'`, joined with their `subscriptions` and lead counts.
- MRR = sum of active `host`/`grow` subscription amounts.
- "Leads to log" queue = `leads` where `charge_status = 'pending'`, with the log action triggering the Stripe charge flow.

---

## Recommended stack

- **Framework: Next.js** — API routes handle both the front-end pages and backend logic in one project, no separate server to deploy.
- **Database + auth: Supabase** (Postgres) — matches the relational schema above directly (foreign keys between `users`, `subscriptions`, `leads`), and includes built-in email/password auth so sessions and password hashing don't need to be hand-built. Store `role` as a column on the Supabase `users` table (or a linked `profiles` table) and gate routes based on it.
- **Payments: Stripe** — Checkout for the Build one-time payment and Host/Grow subscriptions; PaymentIntents (off-session) for the $50 lead charges; webhooks to keep subscription status in sync.
- **Hosting: Vercel** — pairs natively with Next.js, simplest deploy path.

Keep Stripe logic in a small service layer, not scattered across route handlers, since both subscription billing and one-off lead charges need to share the same customer/payment-method lookup.
