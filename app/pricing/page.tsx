import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '../components/Reveal';
import PricingCarousel, { PlanItem } from '../components/PricingCarousel';
import FAQAccordion, { FAQItem } from '../components/FAQAccordion';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Start with just a site, or let Trelio run the whole thing — hosting, growth, and finding you customers.',
};

const PRICING_PLANS: PlanItem[] = [
  {
    id: 'build',
    name: 'Build',
    eyebrow: 'PLAN 01',
    tagline: 'A finished site, handed to you',
    description: 'A custom-built website for your trade, ready to launch anywhere.',
    price: '$500',
    cadence: 'one-time',
    features: [
      'Custom-designed site for your trade',
      'Mobile-friendly, fast-loading',
      'Contact form included',
      'You host it anywhere you like',
      'Optional hosting add-on: +$20/mo',
    ],
    ctaText: 'Start with Build',
  },
  {
    id: 'host',
    name: 'Host',
    eyebrow: 'PLAN 02 · MOST CHOSEN',
    tagline: 'Keep an existing site alive',
    description: 'Managed hosting, updates, and maintenance so your site stays fast and secure.',
    price: '$700',
    cadence: 'one-time setup',
    recurring: 'then $50 / month',
    features: [
      'Hosting, uptime, and backups',
      'Security and software updates',
      'Content and copy updates',
      'Direct support line to us',
    ],
    isFeatured: true,
    ctaText: 'Start with Host',
  },
  {
    id: 'grow',
    name: 'Grow',
    eyebrow: 'PLAN 03',
    tagline: 'Build + host, plus we find you work',
    description: 'Everything in Host, plus SEO and lead capture that pays for itself.',
    price: '$1,000',
    cadence: 'one-time setup',
    recurring: 'then $70 / month + $50 per booked job',
    features: [
      'Everything in Build and Host',
      'Ongoing SEO and performance work',
      'Booking form + call tracking built in',
      '$50 charged only when a lead turns into a booked job',
    ],
    ctaText: 'Start with Grow',
  },
];

const PRICING_FAQS: FAQItem[] = [
  {
    question: 'Can I start with Build and upgrade later?',
    answer:
      'Yes — most clients start with Build, then move to Host or Grow once the site is live and they see the value in ongoing support.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer:
      'No. Host and Grow are billed monthly and you can cancel or switch anytime from your dashboard.',
  },
  {
    question: 'What if I already have a website?',
    answer:
      'We can take over hosting an existing site on the Host plan, or rebuild it as part of Grow if it needs work to convert visitors into leads.',
  },
  {
    question: 'Is the $50 job fee capped?',
    answer:
      'Not currently — it scales with how many jobs your site helps you win, which is the same incentive we have: the better it performs, the more we both earn.',
  },
];

/* ─────────────────────────────────────────────────────────────
   Pricing page — body content only.
   <nav> and <footer> are rendered by app/layout.tsx.
───────────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <>
      {/* ── 1. PAGE HEADER ───────────────────────────────────── */}
      <header className="page-head">
        <div className="container">
          <div className="section-eyebrow">PRICING</div>
          <h1>One plan for every stage of your business</h1>
          <p>
            Start with just a site, or let Trelio run the whole thing —
            hosting, growth, and finding you customers.
          </p>
        </div>
      </header>

      {/* ── 2. PLAN CAROUSEL ─────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal>
            <PricingCarousel plans={PRICING_PLANS} initialIndex={0} />
          </Reveal>

          <p className="note" style={{ marginTop: '36px' }}>
            All monthly plans are billed month-to-month — cancel or switch
            plans any time from your dashboard.
          </p>
        </div>
      </section>

      {/* ── 3. FEATURE COMPARISON TABLE ──────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal className="section-head text-center" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            <div className="section-eyebrow">COMPARE</div>
            <h2>What&apos;s included in each plan</h2>
          </Reveal>

          <Reveal className="compare-wrap">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Build</th>
                  <th>Host</th>
                  <th>Grow</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Custom site design</td>
                  <td className="check">✓</td>
                  <td className="dash">—</td>
                  <td className="check">✓</td>
                </tr>
                <tr>
                  <td className="row-label">Hosting and uptime</td>
                  <td className="dash">—</td>
                  <td className="check">✓</td>
                  <td className="check">✓</td>
                </tr>
                <tr>
                  <td className="row-label">Security and updates</td>
                  <td className="dash">—</td>
                  <td className="check">✓</td>
                  <td className="check">✓</td>
                </tr>
                <tr>
                  <td className="row-label">Content edits</td>
                  <td className="dash">—</td>
                  <td className="check">✓</td>
                  <td className="check">✓</td>
                </tr>
                <tr>
                  <td className="row-label">SEO and performance work</td>
                  <td className="dash">—</td>
                  <td className="dash">—</td>
                  <td className="check">✓</td>
                </tr>
                <tr>
                  <td className="row-label">Booking form + call tracking</td>
                  <td className="dash">—</td>
                  <td className="dash">—</td>
                  <td className="check">✓</td>
                </tr>
                <tr>
                  <td className="row-label">Job fee</td>
                  <td className="dash">—</td>
                  <td className="dash">—</td>
                  <td className="row-label">$50 / booked job</td>
                </tr>
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* ── 4. HOW THE $50-PER-BOOKED-JOB FEE WORKS ─────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal>
            <div className="lead-explainer">
              <h2>How the $50-per-booked-job fee works</h2>
              <div className="lead-steps">
                <div className="lead-step">
                  <div className="num">01</div>
                  <h3>Lead comes in</h3>
                  <p>Through your site&apos;s booking form or tracking phone number.</p>
                </div>
                <div className="lead-step">
                  <div className="num">02</div>
                  <h3>It&apos;s logged automatically</h3>
                  <p>No reporting needed — it shows up in your dashboard right away.</p>
                </div>
                <div className="lead-step">
                  <div className="num">03</div>
                  <h3>You mark it as booked</h3>
                  <p>Once the job is won, you or we mark it booked in the dashboard.</p>
                </div>
                <div className="lead-step">
                  <div className="num">04</div>
                  <h3>$50 is charged</h3>
                  <p>A flat fee, charged to your card on file, only for booked jobs.</p>
                </div>
                <div className="lead-step">
                  <div className="num">05</div>
                  <h3>You see everything</h3>
                  <p>Every lead and every charge is itemized, always visible to you.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5. FAQ (Collapsible Accordion) ───────────────────── */}
      <section id="faq" className="section-sm">
        <div className="container">
          <Reveal className="section-head text-center" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            <div className="section-eyebrow">FAQ</div>
            <h2>Common questions</h2>
          </Reveal>

          <Reveal delay={100}>
            <FAQAccordion items={PRICING_FAQS} />
          </Reveal>
        </div>
      </section>

      {/* ── 6. CLOSING CTA BAND ──────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <h2>Ready to get your business online?</h2>
              <p>Tell us about your trade and we&apos;ll recommend the right plan.</p>
              <Link href="/#contact" className="btn btn-primary">Get started</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
