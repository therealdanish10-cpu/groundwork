import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminSubscriptionForm from './AdminSubscriptionForm';
import AdminClientNotes, { NoteItem } from './AdminClientNotes';
import MarkBookedButton from '@/app/components/MarkBookedButton';

export const metadata: Metadata = {
  title: 'Client Details — Admin',
  description: 'Manage client subscriptions, site requests, and internal notes.',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const SOURCE_LABELS: Record<string, string> = {
  booking_form: 'Booking form',
  call_tracking: 'Tracking number',
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clientId } = await params;

  /* ── 1. Auth check — Admin only ──────────────────────────────────── */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (callerProfile?.role !== 'admin') redirect('/dashboard');

  /* ── 2. Parallel data fetching for client ─────────────────────────── */
  const [
    profileRes,
    subRes,
    leadsRes,
    siteRes,
    siteRequestsRes,
    notesRes,
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id, business_name, email, trade, created_at')
      .eq('id', clientId)
      .single(),
    admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', clientId)
      .maybeSingle(),
    admin
      .from('leads')
      .select('id, created_at, source, status, fee_amount, charge_status')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
    admin
      .from('sites')
      .select('status, domain, live_url')
      .eq('client_id', clientId)
      .maybeSingle(),
    admin
      .from('site_requests')
      .select('id, message, status, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
    admin
      .from('client_notes')
      .select('id, note, created_at, created_by')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
  ]);

  if (!profileRes.data) {
    return (
      <div className="app-shell">
        <div className="page">
          <Link href="/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: '24px', display: 'inline-block' }}>
            ← Back to clients
          </Link>
          <div className="panel" style={{ textAlign: 'center', padding: '48px' }}>
            <h2>Client not found</h2>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>No client profile exists with ID &quot;{clientId}&quot;.</p>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileRes.data;
  const subscription = subRes.data;
  const leads = leadsRes.data ?? [];
  const site = siteRes.data;
  const siteRequests = siteRequestsRes.data ?? [];
  const notes: NoteItem[] = notesRes.data ?? [];

  const businessName = profile.business_name || 'Unnamed Business';
  const planType = subscription?.plan_type || 'build';
  const subStatus = subscription?.status || 'active';

  return (
    <div className="app-shell">
      <div className="page">
        {/* ── Top Navigation & Title ──────────────────────────────── */}
        <Link href="/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: '20px', display: 'inline-flex', gap: '6px' }}>
          ← Back to clients
        </Link>

        <h1 className="page-title">{businessName}</h1>
        <p className="page-sub">Client details, billing status, lead history, and internal notes.</p>

        {/* ── Overview Metrics Grid ───────────────────────────────── */}
        <div className="grid metrics">
          <div className="metric-card">
            <div className="metric-label">Trade</div>
            <div className="metric-value" style={{ fontSize: '20px' }}>
              {profile.trade || '—'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Current Plan</div>
            <div className="metric-value">
              <span className={`badge ${subStatus === 'active' ? 'badge-live' : 'badge-pending'}`}>
                {planType.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Leads</div>
            <div className="metric-value accent">{leads.length}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Site Status</div>
            <div className="metric-value" style={{ fontSize: '18px' }}>
              {site ? (
                <span className={`badge ${site.status === 'live' ? 'badge-live' : 'badge-pending'}`}>
                  {site.status.toUpperCase()}
                </span>
              ) : (
                <span style={{ color: 'var(--gray)', fontSize: '14px' }}>No site row</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-Column Layout: Details + Subscription Form ──────── */}
        <div className="grid two-col" style={{ marginBottom: '28px' }}>
          {/* Profile & Info Panel */}
          <div className="panel">
            <div className="panel-head">
              <h2>Client Information</h2>
            </div>
            <div className="plan-row">
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>Email</span>
              <span style={{ fontWeight: 600 }}>{profile.email}</span>
            </div>
            <div className="plan-row">
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>Joined Date</span>
              <span>{formatDate(profile.created_at)}</span>
            </div>
            <div className="plan-row">
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>Stripe Customer ID</span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {subscription?.stripe_customer_id || '—'}
              </span>
            </div>
            <div className="plan-row">
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>Live Site URL</span>
              <span>
                {site?.live_url ? (
                  <a href={site.live_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>
                    {site.live_url}
                  </a>
                ) : (
                  '—'
                )}
              </span>
            </div>
          </div>

          {/* Manual Subscription Override Panel */}
          <div className="panel">
            <div className="panel-head">
              <h2>Subscription Override</h2>
            </div>
            <AdminSubscriptionForm
              userId={clientId}
              initialPlanType={planType}
              initialStatus={subStatus}
            />
          </div>
        </div>

        {/* ── Lead History Table ───────────────────────────────────── */}
        <div className="panel" style={{ marginBottom: '28px' }}>
          <div className="panel-head">
            <h2>Lead History</h2>
            <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
              {leads.length} lead{leads.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {leads.length === 0 ? (
            <p style={{ color: 'var(--gray)', fontSize: '14px' }}>No leads recorded for this client yet.</p>
          ) : (
            <div className="table-scroll-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Charge Status</th>
                    <th>Fee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
                      <td>{SOURCE_LABELS[lead.source] ?? lead.source}</td>
                      <td>
                        <span className={`badge ${lead.status === 'booked' ? 'badge-live' : 'badge-pending'}`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: lead.charge_status === 'charged' ? 'var(--blue)' : 'var(--gray)' }}>
                          {lead.charge_status}
                        </span>
                      </td>
                      <td>{lead.fee_amount != null ? `$${lead.fee_amount}` : '—'}</td>
                      <td>
                        {lead.status !== 'booked' ? (
                          <MarkBookedButton leadId={lead.id} />
                        ) : (
                          <span style={{ color: 'var(--gray)', fontSize: '13px' }}>Booked ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Site Requests Panel ─────────────────────────────────── */}
        <div className="panel" style={{ marginBottom: '28px' }}>
          <div className="panel-head">
            <h2>Site Requests</h2>
            <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
              {siteRequests.length} request{siteRequests.length === 1 ? '' : 's'}
            </span>
          </div>

          {siteRequests.length === 0 ? (
            <p style={{ color: 'var(--gray)', fontSize: '14px' }}>No site requests submitted by this client.</p>
          ) : (
            <div className="table-scroll-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Request Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {siteRequests.map(req => (
                    <tr key={req.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(req.created_at)}</td>
                      <td style={{ maxWidth: '420px' }}>{req.message}</td>
                      <td>
                        <span className={`badge ${req.status === 'done' ? 'badge-live' : 'badge-pending'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Internal Admin Notes Component ──────────────────────── */}
        <AdminClientNotes clientId={clientId} notes={notes} />
      </div>
    </div>
  );
}
