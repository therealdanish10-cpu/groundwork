import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import Nav from './components/Nav';

/* -------------------------------------------------------
   Font setup via next/font (self-hosted, no Google requests
   at runtime — better privacy + performance than a <link>).

   Manrope is loaded with the `variable` option so we can
   reference it as a CSS custom property in globals.css.
------------------------------------------------------- */
const manrope = Manrope({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
  variable: '--font-manrope-var',
});

export const metadata: Metadata = {
  title: {
    default:  'Trelio — Websites for local trades',
    template: '%s — Trelio',
  },
  description:
    'Trelio designs, hosts, and grows websites for electricians, plumbers, roofers, and other local trades.',
  icons: {
    icon: [
      // Light-mode favicons (shown when OS/browser is in light mode)
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      // Dark-mode favicons (shown when OS/browser is in dark mode)
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
      // Inject font CSS-variable class name onto <html> so every element
      // in the tree can reference --font-manrope-var.
      className={manrope.variable}
    >
      <body>
        <Nav />
        {children}
        <footer>
          <div
            className="container"
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              flexWrap:       'wrap',
              gap:            '12px',
              width:          '100%',
            }}
          >
            <span>© {new Date().getFullYear()} Trelio</span>
            <span>Websites that work as hard as you do.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
