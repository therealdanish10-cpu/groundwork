import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, direction, currentOrder } = await req.json();

  if (!id || !direction || currentOrder === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  try {
    // Find the item to swap with
    const { data: adjacentItem, error: adjacentError } = await adminClient
      .from('gallery')
      .select('id, sort_order')
      .order('sort_order', { ascending: direction === 'up' ? false : true })
      .filter('sort_order', direction === 'up' ? 'lt' : 'gt', currentOrder)
      .limit(1)
      .single();

    if (adjacentError) throw adjacentError;
    if (!adjacentItem) return NextResponse.json({ success: true }); // At end

    // Swap orders using RPC or two updates
    // Using two updates for simplicity, although it's not strictly atomic
    const newOrder = adjacentItem.sort_order;

    await adminClient
      .from('gallery')
      .update({ sort_order: currentOrder })
      .eq('id', adjacentItem.id);

    await adminClient
      .from('gallery')
      .update({ sort_order: newOrder })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
