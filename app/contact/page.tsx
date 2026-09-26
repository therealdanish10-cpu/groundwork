import { Metadata } from 'next';
import ContactForm from '@/app/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Trelio',
  description: 'Get in touch with Trelio to discuss your next IT project. Send us a message and we\'ll get back to you within 24 hours.',
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
            Start a Conversation
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mt-2 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Let's discuss how our modern engineering and growth strategies can elevate your business. Reach out today and receive a detailed consultation within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send us a message</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Fill out the details below and we'll reply promptly.</p>
            <ContactForm />
          </div>

          {/* Right Column: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Direct Channels</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--blue)]/10 flex items-center justify-center shrink-0 text-[var(--blue)]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Email</h3>
                    <a href="mailto:hello@trelio.tech" className="text-base font-semibold text-gray-900 dark:text-white hover:text-[var(--blue)] transition-colors">
                      hello@trelio.tech
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--blue)]/10 flex items-center justify-center shrink-0 text-[var(--blue)]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Phone</h3>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--blue)]/10 flex items-center justify-center shrink-0 text-[var(--blue)]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Location</h3>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">United States (Remote-First)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--blue)]/10 flex items-center justify-center shrink-0 text-[var(--blue)]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Response SLA</h3>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">Within 24 Hours (Mon - Fri)</p>
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
