import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Nav from './components/Nav';

/* -------------------------------------------------------
   Font setup via next/font (self-hosted, no Google requests
   at runtime — better privacy + performance than a <link>).

   Each font is loaded with the `variable` option so we can
   reference it as a CSS custom property in globals.css.
------------------------------------------------------- */
const inter = Inter({
  subsets:  ['latin'],
  display:  'swap',
  variable: '--font-inter-var',
});

const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  weight:   ['500', '700'],
  display:  'swap',
  variable: '--font-space-grotesk-var',
});

export const metadata: Metadata = {
  title: {
    default:  'Groundwork Technologies — Websites for local trades',
    template: '%s — Groundwork Technologies',
  },
  description:
    'Groundwork Technologies designs, hosts, and grows websites for electricians, plumbers, roofers, and other local trades.',
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
      // Inject font CSS-variable class names onto <html> so every element
      // in the tree can reference --font-inter-var and --font-space-grotesk-var.
      className={`${inter.variable} ${spaceGrotesk.variable}`}
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
            <span>© {new Date().getFullYear()} Groundwork Technologies</span>
            <span>Build · Host · Grow</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
