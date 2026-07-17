'use client';

import MarkBookedButton from '@/app/components/MarkBookedButton';

interface PendingLead {
  id:           string;
  created_at:   string;
  source:       string;
  status:       string;
  client_id:    string;
  businessName: string;
}

const SOURCE_LABELS: Record<string, string> = {
  booking_form:  'Booking form',
  call_tracking: 'Tracking number',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PendingLeadsPanel({ leads }: { leads: PendingLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="panel">
        <div className="panel-head">
          <h2>Leads to log</h2>
        </div>
        <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
          No unbooked leads — all caught up.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Leads to log</h2>
        <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
          {leads.length} pending
        </span>
      </div>
      <div className="table-scroll-wrap">
      <table>
        <thead>
          <tr>
            <th>Business</th>
            <th>Date</th>
            <th>Source</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td>{lead.businessName}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
              <td>{SOURCE_LABELS[lead.source] ?? lead.source}</td>
              <td>
                <span className="badge badge-pending">
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </span>
              </td>
              <td>
                <MarkBookedButton leadId={lead.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
