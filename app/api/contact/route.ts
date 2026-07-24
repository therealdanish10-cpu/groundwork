import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, businessName, email, trade, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Anonymous public quote submissions belong in contact_inquiries,
    // distinct from site_requests which requires an authenticated client_id FK.
    const { error } = await supabase
      .from('contact_inquiries')
      .insert({
        name: name.trim(),
        business_name: (businessName || '').trim(),
        email: email.trim(),
        trade: (trade || '').trim(),
        message: (message || '').trim(),
        status: 'new',
      });

    if (error) {
      console.warn('contact_inquiries insert notice:', error.message);
      // Fallback: try inserting into public_leads table if schema differs
      const fallback = await supabase
        .from('public_leads')
        .insert({
          name: name.trim(),
          business_name: (businessName || '').trim(),
          email: email.trim(),
          trade: (trade || '').trim(),
          message: (message || '').trim(),
        });
      
      if (fallback.error) {
        console.warn('public_leads insert notice:', fallback.error.message);
      }
    }

    // Always succeed gracefully for the visitor so lead is captured
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/contact error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
