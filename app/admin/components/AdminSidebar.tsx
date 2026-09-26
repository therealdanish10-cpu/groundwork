'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/app/components/ThemeToggle';
import LogoutButton from './LogoutButton';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Blog Articles',
    href: '/admin/blogs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    name: 'Work Gallery',
    href: '/admin/gallery',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div 
        className="md:hidden flex items-center justify-between px-5 py-4 border-b sticky top-0 z-40"
        style={{
          background: 'var(--nav-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <img
            src="/trelio-logo-nav.png"
            alt="Trelio"
            className="nav-logo-img nav-logo-light"
            style={{ height: '28px', width: 'auto' }}
          />
          <img
            src="/trelio-logo-nav-dark.png"
            alt="Trelio"
            className="nav-logo-img nav-logo-dark"
            style={{ height: '28px', width: 'auto' }}
          />
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[var(--blue)]/10 text-[var(--blue)]">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border"
            style={{ borderColor: 'var(--border)', background: 'var(--paper-2)' }}
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5 text-[var(--fg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside 
        className={`
          fixed md:sticky top-0 bottom-0 left-0 z-30 w-72 flex flex-col transition-transform duration-300 ease-in-out border-r
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'var(--paper-2)',
          borderColor: 'var(--border)',
          height: '100vh',
        }}
      >
        {/* Brand Header */}
        <div className="p-6 border-b flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
          <Link href="/" className="inline-flex items-center gap-2.5 focus:outline-none" aria-label="Trelio home">
            <img
              src="/trelio-logo-nav.png"
              alt="Trelio"
              className="nav-logo-img nav-logo-light"
              style={{ height: '32px', width: 'auto' }}
            />
            <img
              src="/trelio-logo-nav-dark.png"
              alt="Trelio"
              className="nav-logo-img nav-logo-dark"
              style={{ height: '32px', width: 'auto' }}
            />
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--gray)]">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--gray)] px-3 mb-2">
            Manage
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${active 
                    ? 'text-white shadow-sm' 
                    : 'text-[var(--gray)] hover:text-[var(--fg)] hover:bg-[var(--border)]/40'
                  }
                `}
                style={active ? {
                  background: 'var(--blue)',
                } : undefined}
              >
                <span className={active ? 'text-white' : 'text-[var(--gray)]'}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}

          <div className="pt-6 pb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--gray)] px-3">
            Quick Links
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--gray)] hover:text-[var(--fg)] hover:bg-[var(--border)]/40 transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--gray)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>View Live Site</span>
            <span className="ml-auto text-xs text-[var(--gray)]">↗</span>
          </Link>
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
          {userEmail && (
            <div className="px-3 py-2 rounded-xl bg-[var(--paper)] border flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-full bg-[var(--blue)]/10 text-[var(--blue)] font-bold text-xs flex items-center justify-center flex-shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-[var(--fg)]">{userEmail}</p>
                <p className="text-[10px] text-[var(--gray)]">Administrator</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
