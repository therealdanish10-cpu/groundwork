import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from './components/Reveal';
import ContactForm from './components/ContactForm';
import HeroBackground from './components/HeroBackground';
import FAQAccordion from './components/FAQAccordion';
import PricingCarousel, { PlanItem } from './components/PricingCarousel';

const PLANS: PlanItem[] = [
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

export const metadata: Metadata = {
  title: 'Trelio — Websites for local trades',
  description:
    'Trelio designs, hosts, and grows websites for electricians, plumbers, roofers, and other local trades — and we only make more when you do.',
};

/* ─────────────────────────────────────────────────────────────
   Home page — body content only.
   <nav> and <footer> are rendered by app/layout.tsx.
───────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── 1. HERO (Single centered column + 3 blurred gradient blobs) ── */}
      <section className="hero">
        <HeroBackground />

        <div className="container">
          <div className="hero-centered-layout">
            <Reveal initiallyVisible>
              <div className="eyebrow">BUILT FOR LOCAL TRADE BUSINESSES</div>
            </Reveal>

            <Reveal initiallyVisible delay={50}>
              <h1>
                Websites that turn clicks into <span className="u">booked jobs</span>.
              </h1>
            </Reveal>

            <Reveal initiallyVisible delay={100}>
              <p>
                Trelio designs, hosts, and grows websites for local trades — and on our Grow plan, we only charge when a lead turns into real work.
              </p>
            </Reveal>

            <Reveal initiallyVisible delay={150}>
              <div className="hero-actions">
                <Link href="/login" className="btn btn-primary">Get started</Link>
                <Link href="#how" className="btn btn-ghost">How it works</Link>
              </div>
            </Reveal>

            {/* Staggered Stats Strip */}
            <div className="hero-stats">
              <Reveal delay={200} className="stat-item">
                <span className="stat-number">40+</span>
                <span className="stat-label">businesses served</span>
              </Reveal>

              <div className="stat-divider" />

              <Reveal delay={280} className="stat-item">
                <span className="stat-number">7 days</span>
                <span className="stat-label">free trial</span>
              </Reveal>

              <div className="stat-divider" />

              <Reveal delay={360} className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">uptime</span>
              </Reveal>

              <div className="stat-divider" />

              <Reveal delay={440} className="stat-item">
                <span className="stat-number">$500</span>
                <span className="stat-label">starting price</span>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how">
        <div className="container">
          <Reveal className="section-head text-center" style={{ margin: '0 auto 56px', textAlign: 'center' }}>
            <div className="section-eyebrow">HOW IT WORKS</div>
            <h2>One site, three ways to move forward</h2>
            <p>
              Start with just a website, or let us run everything — including the work of finding you customers.
            </p>
          </Reveal>

          <div className="flow-steps">
            <Reveal delay={0}>
              <div className="flow-step">
                <div className="step-num">01</div>
                <h3>We design your site</h3>
                <p>
                  Built for your trade, your service area, and how customers actually search for you.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="flow-step">
                <div className="step-num">02</div>
                <h3>You choose a plan</h3>
                <p>
                  Just the build, ongoing hosting, or the full growth plan below.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="flow-step">
                <div className="step-num">03</div>
                <h3>Leads come through your site</h3>
                <p>
                  A booking form and call tracking are built in, so every lead is counted.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="flow-step">
                <div className="step-num">04</div>
                <h3>You only pay for results</h3>
                <p>
                  On the Grow plan, we charge $50 per booked job — nothing if it doesn't turn into work.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3. PRICING CAROUSEL ─────────────────────────────────── */}
      <section id="pricing">
        <div className="container">
          <Reveal className="section-head text-center" style={{ margin: '0 auto 56px', textAlign: 'center' }}>
            <div className="section-eyebrow">PRICING</div>
            <h2>Simple plans, no surprises.</h2>
            <p>
              Every plan starts with a site built for your trade. Hosting and
              growth are optional add-ons.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <PricingCarousel plans={PLANS} initialIndex={0} />
          </Reveal>
        </div>
      </section>

      {/* ── 4. CONTACT (Get Started / Free Quote) ─────────────── */}
      <section id="contact">
        <div className="container">
          <Reveal className="section-head" style={{ margin: '0 auto 40px', textAlign: 'center' }}>
            <div className="section-eyebrow">GET STARTED</div>
            <h2>Get a free quote.</h2>
          </Reveal>

          <Reveal>
            <div className="contact-card-wrap">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5. FAQ (Collapsible Accordion) ───────────────────────── */}
      <section id="faq">
        <div className="container">
          <Reveal className="section-head text-center" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            <div className="section-eyebrow">FAQ</div>
            <h2>How the $50-per-booked-job fee works</h2>
          </Reveal>

          <Reveal delay={100}>
            <FAQAccordion />
          </Reveal>
        </div>
      </section>
    </>
  );
}
