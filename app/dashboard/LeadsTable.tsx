'use client';

import MarkBookedButton from '@/app/components/MarkBookedButton';

interface Lead {
  id:            string;
  created_at:    string;
  source:        string;
  status:        string;
  fee_amount:    number | null;
  charge_status: string;
}

const SOURCE_LABELS: Record<string, string> = {
  booking_form:  'Booking form',
  call_tracking: 'Tracking number',
};

function leadStatusBadge(status: string): string {
  if (status === 'booked') return 'badge badge-live';
  return 'badge badge-pending'; // 'new' or 'contacted'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Recent leads</h2>
      </div>

      {leads.length === 0 ? (
        <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
          No leads yet — they&apos;ll appear here once your site is live and generating
          enquiries.
        </p>
      ) : (
        <div className="table-scroll-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Status</th>
                <th>Fee</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
                  <td>{SOURCE_LABELS[lead.source] ?? lead.source}</td>
                  <td>
                    <span className={leadStatusBadge(lead.status)}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {lead.fee_amount != null ? `$${lead.fee_amount}` : '—'}
                  </td>
                  <td>
                    {lead.status !== 'booked' ? (
                      <MarkBookedButton leadId={lead.id} />
                    ) : (
                      <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
                        Booked ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
