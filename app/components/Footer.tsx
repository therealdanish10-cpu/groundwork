'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Footer() {
  const pathname = usePathname();

  // Hide public marketing footer entirely on /admin and /login routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  return (
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
              <li>Serving clients worldwide</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--gray)' }}>
          <span>© {new Date().getFullYear()} Trelio. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
