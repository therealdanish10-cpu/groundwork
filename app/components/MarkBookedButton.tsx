'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  leadId: string;
}

/**
 * Shared "Mark as booked" button used in both the client dashboard
 * (LeadsTable) and the admin leads-to-log queue (PendingLeadsPanel).
 *
 * On click: updates leads.status = 'booked' via the browser Supabase
 * client, then calls router.refresh() so the parent Server Component
 * re-fetches and the row disappears from the queue.
 */
export default function MarkBookedButton({ leadId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('leads')
      .update({ status: 'booked' })
      .eq('id', leadId);
    setBusy(false);
    if (!error) {
      router.refresh();
    }
  }

  return (
    <button
      className="btn btn-ghost btn-sm"
      disabled={busy}
      onClick={handleClick}
    >
      {busy ? 'Saving…' : 'Mark booked'}
    </button>
  );
}
