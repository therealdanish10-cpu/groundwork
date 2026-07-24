import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: caller } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (caller?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { clientId, note } = await req.json();
    if (!clientId || !note?.trim()) {
      return NextResponse.json({ error: 'Note text is required.' }, { status: 400 });
    }

    const { error } = await admin
      .from('client_notes')
      .insert({
        client_id: clientId,
        created_by: user.id,
        note: note.trim(),
      });

    if (error) {
      console.error('client_notes insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/admin/notes error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
