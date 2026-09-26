import { Metadata } from 'next';
import ContactForm from '@/app/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Trelio',
  description: 'Get in touch with Trelio to discuss your next IT project. Send us a message and we\'ll get back to you within 24 hours.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-lg md:text-xl text-[var(--gray)] max-w-2xl mx-auto">
            Let's discuss your next project. Send us a message and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Contact Form */}
          <div className="bg-white/5 p-8 rounded-2xl border border-[var(--border)]">
            <ContactForm />
          </div>

          {/* Right Column: Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-semibold mb-8">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--blue)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Email</h3>
                    <p className="text-[var(--gray)]">hello@trelio.tech</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--blue)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Phone</h3>
                    <p className="text-[var(--gray)]">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--blue)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Office</h3>
                    <p className="text-[var(--gray)]">United States</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--blue)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Business Hours</h3>
                    <p className="text-[var(--gray)]">Mon-Fri, 9am - 6pm EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
