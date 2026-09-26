import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('gallery')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const adminClient = createAdminClient();

  // Get max sort_order
  const { data: maxOrderData } = await adminClient
    .from('gallery')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();
    
  const nextSortOrder = (maxOrderData?.sort_order ?? -1) + 1;

  const insertData = {
    ...body,
    screenshot: body.screenshot || body.screenshot_url || null,
    live_link: body.live_link || body.live_link_url || null,
    sort_order: nextSortOrder
  };

  const { data, error } = await adminClient
    .from('gallery')
    .insert([insertData])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updateData } = body;
  
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updatePayload: Record<string, any> = { ...updateData };
  if ('screenshot' in updateData || 'screenshot_url' in updateData) {
    updatePayload.screenshot = updateData.screenshot || updateData.screenshot_url || null;
  }
  if ('live_link' in updateData || 'live_link_url' in updateData) {
    updatePayload.live_link = updateData.live_link || updateData.live_link_url || null;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('gallery')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
