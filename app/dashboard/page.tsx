import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LeadsTable from './LeadsTable';
import SiteRequestPanel from './SiteRequestPanel';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your Groundwork client dashboard — leads, billing, and site management.',
};

/* Returns the ISO string for the first moment of the current calendar month. */
function currentMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

const PLAN_PRICE: Record<string, string> = {
  grow:  '$1,000/mo',
  host:  '$700/mo',
  build: '$500 one-time',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  /* ── Auth guard (belt-and-suspenders — middleware already redirects) ── */
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const monthStart = currentMonthStart();

  /* ── Parallel data fetches ─────────────────────────────────────────── */
  const [
    profileResult,
    subscriptionResult,
    siteResult,
    leadsCountResult,
    chargedLeadsResult,
    recentLeadsResult,
    siteRequestsResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('business_name, trade')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan_type, status, started_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
    supabase
      .from('sites')
      .select('status, domain, live_url')
      .eq('client_id', user.id)
      .maybeSingle(),
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .gte('created_at', monthStart),
    supabase
      .from('leads')
      .select('fee_amount')
      .eq('client_id', user.id)
      .eq('charge_status', 'charged')
      .gte('created_at', monthStart),
    supabase
      .from('leads')
      .select('id, created_at, source, status, fee_amount, charge_status')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('site_requests')
      .select('id, message, status, created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const profile      = profileResult.data;
  const subscription = subscriptionResult.data;
  const site         = siteResult.data;
  const leadsCount   = leadsCountResult.count ?? 0;
  const owedAmount   = chargedLeadsResult.data?.reduce(
    (sum, l) => sum + (l.fee_amount ?? 0), 0
  ) ?? 0;
  const leads        = recentLeadsResult.data ?? [];
  const siteRequests = siteRequestsResult.data ?? [];

  const businessName = profile?.business_name ?? 'your business';
  const planLabel    = subscription
    ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)
    : null;

  /* ── No active subscription — empty state ──────────────────────────── */
  if (!subscription) {
    return (
      <div className="app-shell">
        <div className="page">
          <h1 className="page-title">Welcome, {businessName}</h1>
          <p className="page-sub">Get started by choosing a plan.</p>
          <div className="panel" style={{ textAlign: 'center', padding: '56px 32px' }}>
            <p style={{ color: 'var(--gray)', fontSize: '15px', marginBottom: '24px' }}>
              You don&apos;t have an active plan yet. Choose a plan to get your site started.
            </p>
            <Link href="/pricing" className="btn btn-primary">View plans</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Site status ───────────────────────────────────────────────────── */
  const siteIsLive = site?.status === 'live';

  return (
    <div className="app-shell">
      <div className="page">

        {/* ── Page heading ─────────────────────────────────────────── */}
        <h1 className="page-title">Welcome back, {businessName}</h1>
        <p className="page-sub">Here&apos;s how your site is performing.</p>

        {/* ── Metric cards ─────────────────────────────────────────── */}
        <div className="grid metrics">
          <div className="metric-card">
            <div className="metric-label">Current plan</div>
            <div className="metric-value">{planLabel}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Site status</div>
            <div className="metric-value" style={{ fontSize: '18px' }}>
              {site ? (
                <span className={`badge ${siteIsLive ? 'badge-live' : 'badge-pending'}`}>
                  {siteIsLive ? 'Live' : 'In progress'}
                </span>
              ) : (
                <span style={{ color: 'var(--gray)', fontSize: '14px' }}>No site yet</span>
              )}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Leads this month</div>
            <div className="metric-value accent">{leadsCount}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Owed this month</div>
            <div className="metric-value accent">
              ${owedAmount % 1 === 0 ? owedAmount : owedAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* ── Two-column: leads table + plan sidebar ─────────────── */}
        <div className="grid two-col">
          {/* Leads table is a Client Component (mark-as-booked button) */}
          <LeadsTable leads={leads} />

          {/* Plan / billing sidebar */}
          <div className="panel">
            <div className="panel-head">
              <h2>Your plan</h2>
            </div>
            <div className="plan-row">
              <span>{planLabel}</span>
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
                {PLAN_PRICE[subscription.plan_type] ?? '—'}
              </span>
            </div>
            {subscription.plan_type === 'grow' && (
              <div className="plan-row">
                <span>Booked jobs this month</span>
                <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
                  {leadsCount} × $50
                </span>
              </div>
            )}
            <Link
              href="#"
              className="btn btn-primary btn-sm"
              style={{ display: 'block', textAlign: 'center', marginTop: '14px' }}
            >
              Manage billing
            </Link>
          </div>
        </div>

        {/* ── Site requests panel (Client Component — has new-request form) */}
        <SiteRequestPanel
          siteRequests={siteRequests}
          clientId={user.id}
        />

      </div>
    </div>
  );
}
