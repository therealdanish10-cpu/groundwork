import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import Nav from './components/Nav';
import WhatsAppButton from './components/WhatsAppButton';
import Link from 'next/link';

const manrope = Manrope({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
  variable: '--font-manrope-var',
});

export const metadata: Metadata = {
  title: 'Trelio — IT Services & Digital Solutions',
  description: 'Trelio is a modern IT services agency providing innovative digital solutions, web development, and cloud services for forward-thinking businesses.',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-dark-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={manrope.variable}
    >
      <body className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-grow">
          {children}
        </main>
        <WhatsAppButton />
        
        <footer className="border-t py-16 px-6 mt-20" style={{ background: 'var(--paper-2)', borderColor: 'var(--border)' }}>
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
              <div className="md:col-span-4 flex flex-col gap-6">
                <Link href="/" aria-label="Trelio home" className="inline-block">
                  <img
                    src="/trelio-logo-nav.png"
                    alt="Trelio"
                    className="nav-logo-img nav-logo-light"
                    style={{ height: '36px', width: 'auto' }}
                  />
                  <img
                    src="/trelio-logo-nav-dark.png"
                    alt="Trelio"
                    className="nav-logo-img nav-logo-dark"
                    style={{ height: '36px', width: 'auto' }}
                  />
                </Link>
                <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
                  Empowering businesses with modern IT services and scalable digital solutions. We build the infrastructure for your success.
                </p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="font-bold mb-4 tracking-tight" style={{ color: 'var(--fg)' }}>Services</h3>
                <ul className="flex flex-col gap-3 text-sm" style={{ color: 'var(--gray)' }}>
                  <li><Link href="/services/web-development" className="hover:text-[var(--blue)] transition-colors">Web Development</Link></li>
                  <li><Link href="/services/seo" className="hover:text-[var(--blue)] transition-colors">SEO</Link></li>
                  <li><Link href="/services/app-development" className="hover:text-[var(--blue)] transition-colors">App Development</Link></li>
                  <li><Link href="/services/ai-automation" className="hover:text-[var(--blue)] transition-colors">AI Automation</Link></li>
                  <li><Link href="/services/meta-ads" className="hover:text-[var(--blue)] transition-colors">Meta Ads</Link></li>
                  <li><Link href="/services/social-media-management" className="hover:text-[var(--blue)] transition-colors">Social Media</Link></li>
                  <li><Link href="/services/content-writing" className="hover:text-[var(--blue)] transition-colors">Content Writing</Link></li>
                  <li><Link href="/services/wordpress-development" className="hover:text-[var(--blue)] transition-colors">WordPress</Link></li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-bold mb-4 tracking-tight" style={{ color: 'var(--fg)' }}>Company</h3>
                <ul className="flex flex-col gap-3 text-sm" style={{ color: 'var(--gray)' }}>
                  <li><Link href="/about" className="hover:text-[var(--blue)] transition-colors">About Us</Link></li>
                  <li><Link href="/work" className="hover:text-[var(--blue)] transition-colors">Our Work</Link></li>
                  <li><Link href="/blog" className="hover:text-[var(--blue)] transition-colors">Blog</Link></li>
                  <li><Link href="/contact" className="hover:text-[var(--blue)] transition-colors">Contact</Link></li>
                </ul>
              </div>

              <div className="md:col-span-4">
                <h3 className="font-bold mb-4 tracking-tight" style={{ color: 'var(--fg)' }}>Contact</h3>
                <ul className="flex flex-col gap-3 text-sm" style={{ color: 'var(--gray)' }}>
                  <li>hello@trelio.tech</li>
                  <li>United States</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--gray)' }}>
              <span>© {new Date().getFullYear()} Trelio. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
