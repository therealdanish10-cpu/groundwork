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

    const { userId, planType, status } = await req.json();
    if (!userId || !planType || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data: existing } = await admin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from('subscriptions')
        .update({ plan_type: planType, status })
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await admin
        .from('subscriptions')
        .insert({ user_id: userId, plan_type: planType, status });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/admin/subscriptions error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
