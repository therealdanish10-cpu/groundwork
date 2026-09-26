import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, companyName, email, phone, serviceInterest, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required fields.' },
        { status: 400 }
      );
    }

    const htmlContent = `
      <h2>New Inquiry from ${name}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Service Interest:</strong> ${serviceInterest || 'N/A'}</p>
      <h3>Message:</h3>
      <p>${message || 'No message provided.'}</p>
    `;

    // 1. Send Email via Resend
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Trelio <hello@trelio.tech>',
          to: process.env.NOTIFY_EMAIL || 'hello@trelio.tech',
          replyTo: email,
          subject: `New Inquiry from ${name} - ${serviceInterest || 'General'}`,
          html: htmlContent,
        });
      }
    } catch (emailError) {
      console.error('Failed to send email via Resend:', emailError);
      // Non-fatal, continue to Supabase insert
    }

    // 2. Insert into Supabase
    try {
      const supabase = createAdminClient();
      const { error: dbError } = await supabase
        .from('contact_inquiries')
        .insert([{
          name,
          company_name: companyName,
          email,
          phone,
          service_interest: serviceInterest,
          message
        }]);

      if (dbError) {
        console.error('Failed to insert into Supabase:', dbError);
        // Do not fail user request if DB lacks table yet
      }
    } catch (dbError) {
      console.error('Failed to connect to Supabase:', dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
