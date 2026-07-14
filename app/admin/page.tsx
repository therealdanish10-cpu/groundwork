import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin — Groundwork',
  description: 'Groundwork admin overview — all clients, leads, and billing at a glance.',
};

/* ─────────────────────────────────────────────────────────────
   Admin overview — static/mock data matching groundwork-dashboard.html.
   Real data fetching and auth come in Phase 2.
   <nav> and <footer> come from app/layout.tsx.
───────────────────────────────────────────────────────────── */
export default function AdminPage() {
  return (
    <div className="app-shell">
      <div className="page">

        {/* ── Page heading ─────────────────────────────────── */}
        <h1 className="page-title">Admin overview</h1>
        <p className="page-sub">All Groundwork clients at a glance.</p>

        {/* ── Metric cards ─────────────────────────────────── */}
        <div className="grid metrics">
          <div className="metric-card">
            <div className="metric-label">Active clients</div>
            <div className="metric-value">18</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MRR</div>
            <div className="metric-value accent">$13,400</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Leads this month</div>
            <div className="metric-value accent">211</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Lead revenue</div>
            <div className="metric-value accent">$10,550</div>
          </div>
        </div>

        {/* ── Clients table ────────────────────────────────── */}
        <div className="panel">
          <div className="panel-head">
            <h2>Clients</h2>
            <Link href="#" className="btn btn-primary btn-sm">Add client</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Plan</th>
                <th>Leads (mo)</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>JC Electrical Services</td>
                <td>Grow</td>
                <td>14</td>
                <td><span className="badge badge-live">Live</span></td>
                <td><Link href="#" className="btn btn-ghost btn-sm">Manage</Link></td>
              </tr>
              <tr>
                <td>Round Rock Plumbing Co.</td>
                <td>Grow</td>
                <td>9</td>
                <td><span className="badge badge-live">Live</span></td>
                <td><Link href="#" className="btn btn-ghost btn-sm">Manage</Link></td>
              </tr>
              <tr>
                <td>Austin Roofing Pros</td>
                <td>Host</td>
                <td>—</td>
                <td><span className="badge badge-live">Live</span></td>
                <td><Link href="#" className="btn btn-ghost btn-sm">Manage</Link></td>
              </tr>
              <tr>
                <td>Lonestar Landscaping</td>
                <td>Build</td>
                <td>—</td>
                <td><span className="badge badge-pending">In progress</span></td>
                <td><Link href="#" className="btn btn-ghost btn-sm">Manage</Link></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Recent leads to log ──────────────────────────── */}
        <div className="panel">
          <div className="panel-head">
            <h2>Recent leads to log</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Date</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>JC Electrical Services</td>
                <td>Jul 12</td>
                <td>Booking form</td>
                <td>
                  <Link href="#" className="btn btn-primary btn-sm">
                    Log $50 charge
                  </Link>
                </td>
              </tr>
              <tr>
                <td>Round Rock Plumbing Co.</td>
                <td>Jul 11</td>
                <td>Tracking number</td>
                <td>
                  <Link href="#" className="btn btn-primary btn-sm">
                    Log $50 charge
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
