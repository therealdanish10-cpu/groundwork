import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
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
      suppressHydrationWarning
    >
      <head />
      <body className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var urlParams = new URLSearchParams(window.location.search);
                  var urlTheme = urlParams.get('theme');
                  var t = urlTheme || localStorage.getItem('groundwork-theme');
                  if (urlTheme) {
                    try { localStorage.setItem('groundwork-theme', urlTheme); } catch(e) {}
                  }
                  if (t === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark');
                  } else if (t === 'light') {
                    document.documentElement.removeAttribute('data-theme');
                    document.documentElement.classList.remove('dark');
                  }
                  if ('scrollRestoration' in history) {
                    history.scrollRestoration = 'manual';
                  }
                  window.scrollTo(0, 0);
                } catch(e) {}
              })();
            `,
          }}
        />
        <Nav />
        <main className="flex-grow">
          {children}
        </main>
        <WhatsAppButton />
        <Footer />
      </body>
    </html>
  );
}
