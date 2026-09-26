'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-[var(--fg)] hover:text-red-500 transition-colors border border-[var(--border)] rounded-lg hover:border-red-500/50"
    >
      Log Out
    </button>
  );
}
