import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PendingLeadsPanel from './PendingLeadsPanel';

export const metadata: Metadata = {
  title: 'Admin — Groundwork Technologies',
  description: 'Groundwork admin overview — all clients, leads, and billing at a glance.',
};

function currentMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/* Plan MRR contribution — Build is one-time so not counted. */
const PLAN_MRR: Record<string, number> = { grow: 1000, host: 700 };

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const monthStart = currentMonthStart();

  /* ── Parallel fetches ───────────────────────────────────────────────── */
  const [
    clientCountResult,
    activeSubsResult,
    leadsCountResult,
    chargedLeadsResult,
    clientProfilesResult,
    monthLeadsResult,
    pendingLeadsResult,
  ] = await Promise.all([
    /* 1 — Active client count */
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client'),

    /* 2 — Active recurring subscriptions (for MRR) */
    supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('status', 'active')
      .in('plan_type', ['host', 'grow']),

    /* 3 — Leads this month (all clients) */
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart),

    /* 4 — Charged lead revenue this month */
    supabase
      .from('leads')
      .select('fee_amount')
      .eq('charge_status', 'charged')
      .gte('created_at', monthStart),

    /* 5 — All client profiles (for clients table) */
    supabase
      .from('profiles')
      .select('id, business_name, trade')
      .eq('role', 'client')
      .order('business_name'),

    /* 6 — This month's leads per client (for the clients table column) */
    supabase
      .from('leads')
      .select('client_id')
      .gte('created_at', monthStart),

    /* 7 — Pending leads (status != 'booked') for the to-log queue */
    supabase
      .from('leads')
      .select('id, created_at, source, status, client_id')
      .neq('status', 'booked')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  /* ── Metrics ─────────────────────────────────────────────────────────── */
  const activeClientCount = clientCountResult.count ?? 0;
  const mrr = activeSubsResult.data?.reduce(
    (sum, s) => sum + (PLAN_MRR[s.plan_type] ?? 0), 0
  ) ?? 0;
  const leadsThisMonth = leadsCountResult.count ?? 0;
  const leadRevenue = chargedLeadsResult.data?.reduce(
    (sum, l) => sum + (l.fee_amount ?? 0), 0
  ) ?? 0;

  /* ── Clients table — join subscriptions separately ───────────────────── */
  const clientProfiles = clientProfilesResult.data ?? [];

  /* Fetch subscriptions for all client IDs in one query */
  const clientIds = clientProfiles.map(p => p.id);
  const subsResult = clientIds.length > 0
    ? await supabase
        .from('subscriptions')
        .select('user_id, plan_type, status')
        .in('user_id', clientIds)
        .eq('status', 'active')
    : { data: [] as Array<{ user_id: string; plan_type: string; status: string }> };

  /* Lookup maps for efficient rendering */
  const subByClient: Record<string, string> = {};
  subsResult.data?.forEach(s => { subByClient[s.user_id] = s.plan_type; });

  const leadCountByClient: Record<string, number> = {};
  monthLeadsResult.data?.forEach(l => {
    leadCountByClient[l.client_id] = (leadCountByClient[l.client_id] ?? 0) + 1;
  });

  /* ── Pending leads — resolve business names ───────────────────────────── */
  const rawPendingLeads = pendingLeadsResult.data ?? [];
  const pendingClientIds = [...new Set(rawPendingLeads.map(l => l.client_id))];
  const pendingProfilesResult = pendingClientIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, business_name')
        .in('id', pendingClientIds)
    : { data: [] as Array<{ id: string; business_name: string | null }> };

  const businessNameById: Record<string, string> = {};
  pendingProfilesResult.data?.forEach(p => {
    businessNameById[p.id] = p.business_name ?? 'Unknown';
  });

  const pendingLeads = rawPendingLeads.map(l => ({
    id:           l.id,
    created_at:   l.created_at,
    source:       l.source as string,
    status:       l.status as string,
    client_id:    l.client_id as string,
    businessName: businessNameById[l.client_id as string] ?? 'Unknown',
  }));

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="app-shell">
      <div className="page">

        {/* ── Page heading ──────────────────────────────────────────────── */}
        <h1 className="page-title">Admin overview</h1>
        <p className="page-sub">All Groundwork clients at a glance.</p>

        {/* ── Metric cards ──────────────────────────────────────────────── */}
        <div className="grid metrics">
          <div className="metric-card">
            <div className="metric-label">Active clients</div>
            <div className="metric-value">{activeClientCount}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MRR</div>
            <div className="metric-value accent">
              ${mrr.toLocaleString()}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Leads this month</div>
            <div className="metric-value accent">{leadsThisMonth}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Lead revenue</div>
            <div className="metric-value accent">
              ${leadRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ── Clients table ─────────────────────────────────────────────── */}
        <div className="panel">
          <div className="panel-head">
            <h2>Clients</h2>
          </div>

          {clientProfiles.length === 0 ? (
            <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
              No client accounts yet.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Trade</th>
                  <th>Plan</th>
                  <th>Leads (mo)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clientProfiles.map(client => {
                  const plan      = subByClient[client.id];
                  const planLabel = plan
                    ? plan.charAt(0).toUpperCase() + plan.slice(1)
                    : '—';
                  const moLeads   = leadCountByClient[client.id] ?? 0;

                  return (
                    <tr key={client.id}>
                      <td>{client.business_name ?? '—'}</td>
                      <td style={{ color: 'var(--gray)', fontSize: '13px' }}>
                        {client.trade ?? '—'}
                      </td>
                      <td>{planLabel}</td>
                      <td>{moLeads > 0 ? moLeads : '—'}</td>
                      <td>
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Leads-to-log queue (Client Component — has mark-as-booked) ── */}
        <PendingLeadsPanel leads={pendingLeads} />

      </div>
    </div>
  );
}
