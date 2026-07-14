import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your Groundwork client dashboard — leads, billing, and site management.',
};

/* ─────────────────────────────────────────────────────────────
   Client dashboard — static/mock data matching groundwork-dashboard.html.
   Real data fetching and auth come in Phase 2.
   <nav> and <footer> come from app/layout.tsx.
───────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="app-shell">
      <div className="page">

        {/* ── Page heading ─────────────────────────────────── */}
        <h1 className="page-title">Welcome back, JC Electrical</h1>
        <p className="page-sub">Here's how your site is performing.</p>

        {/* ── Metric cards ─────────────────────────────────── */}
        <div className="grid metrics">
          <div className="metric-card">
            <div className="metric-label">Current plan</div>
            <div className="metric-value">Grow</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Site status</div>
            <div className="metric-value" style={{ fontSize: '18px' }}>
              <span className="badge badge-live">Live</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Leads this month</div>
            <div className="metric-value accent">14</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Owed this month</div>
            <div className="metric-value accent">$700</div>
          </div>
        </div>

        {/* ── Two-column: leads table + plan sidebar ────────── */}
        <div className="grid two-col">

          {/* Recent leads table */}
          <div className="panel">
            <div className="panel-head">
              <h2>Recent leads</h2>
              <Link href="#" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jul 12</td>
                  <td>Booking form</td>
                  <td>Contacted</td>
                  <td>$50</td>
                </tr>
                <tr>
                  <td>Jul 10</td>
                  <td>Tracking number</td>
                  <td>Booked</td>
                  <td>$50</td>
                </tr>
                <tr>
                  <td>Jul 8</td>
                  <td>Booking form</td>
                  <td>New</td>
                  <td>$50</td>
                </tr>
                <tr>
                  <td>Jul 5</td>
                  <td>Tracking number</td>
                  <td>Booked</td>
                  <td>$50</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plan / billing sidebar */}
          <div className="panel">
            <div className="panel-head">
              <h2>Your plan</h2>
            </div>
            <div className="plan-row">
              <span>Grow</span>
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>$1,000/mo</span>
            </div>
            <div className="plan-row">
              <span>Leads this month</span>
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>14 × $50</span>
            </div>
            <div className="plan-row">
              <span>Next billing date</span>
              <span style={{ color: 'var(--gray)', fontSize: '13px' }}>Aug 1</span>
            </div>
            <Link
              href="#"
              className="btn btn-primary btn-sm"
              style={{ display: 'block', textAlign: 'center', marginTop: '14px' }}
            >
              Manage billing
            </Link>
          </div>
        </div>

        {/* ── Site requests panel ──────────────────────────── */}
        <div className="panel">
          <div className="panel-head">
            <h2>Site requests</h2>
            <Link href="#" className="btn btn-ghost btn-sm">New request</Link>
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
            Need a change to your site — new photos, updated hours, a new
            service page? Submit a request and we'll handle it.
          </p>
        </div>

      </div>
    </div>
  );
}
