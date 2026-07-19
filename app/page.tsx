import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from './components/Reveal';
import CheckoutButton from './components/CheckoutButton';
import ContactForm from './components/ContactForm';

export const metadata: Metadata = {
  title: 'Groundwork — Websites for local trades',
  description:
    'Groundwork designs, hosts, and grows websites for electricians, plumbers, roofers, and other local trades — and we only make more when you do.',
};

/* ─────────────────────────────────────────────────────────────
   Home page — body content only.
   <nav> and <footer> are rendered by app/layout.tsx.
───────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        {/* Animated background */}
        <div className="blob-field" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="grain" />
        </div>

        <div className="container hero-grid-layout">
          {/* Left column — copy */}
          <div>
            <div className="eyebrow">WEBSITES FOR LOCAL TRADES</div>
            <h1>
              We build the site.<br />
              We keep it running.<br />
              <span className="u">We bring you customers.</span>
            </h1>
            <p>
              Groundwork designs, hosts, and grows websites for electricians,
              plumbers, roofers, and other local trades — and we only make more
              when you do.
            </p>
            <div className="hero-actions">
              <Link href="#pricing" className="btn btn-primary">See plans</Link>
              <Link href="#how"     className="btn btn-ghost">How it works</Link>
            </div>
          </div>

          {/* Right column — hero card (above fold, pre-revealed) */}
          <Reveal initiallyVisible>
            <div className="hero-card">
              <span className="tag">Grow plan</span>
              <h3>Build → Host → Grow</h3>
              <p>One plan, three jobs done for you.</p>
              <div className="mini-flow">
                <div className="mini-flow-item">
                  <span className="mini-dot" />
                  Site built for your trade
                </div>
                <div className="mini-flow-item">
                  <span className="mini-dot" />
                  Hosted and kept running
                </div>
                <div className="mini-flow-item">
                  <span className="mini-dot" />
                  $50 per booked job, nothing else
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how">
        <div className="container">
          <Reveal className="section-head">
            <div className="section-eyebrow">HOW IT WORKS</div>
            <h2>One site, three ways to move forward</h2>
            <p>
              Start with just a website, or let us run everything — including
              the work of finding you customers.
            </p>
          </Reveal>

          <div className="flow-steps">
            <Reveal delay={0}>
              <div className="flow-step">
                <div className="step-num">STEP 1</div>
                <h3>We design your site</h3>
                <p>
                  Built for your trade, your service area, and how customers
                  actually search for you.
                </p>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div className="flow-step">
                <div className="step-num">STEP 2</div>
                <h3>You choose a plan</h3>
                <p>
                  Just the build, ongoing hosting, or the full growth plan
                  below.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="flow-step">
                <div className="step-num">STEP 3</div>
                <h3>Leads come through your site</h3>
                <p>
                  A booking form and call tracking are built in, so every lead
                  is counted.
                </p>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="flow-step">
                <div className="step-num">STEP 4</div>
                <h3>You only pay for results</h3>
                <p>
                  On the Grow plan, we charge $50 per booked job — nothing if
                  it doesn't turn into work.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ───────────────────────────────────── */}
      <section id="pricing">
        <div className="container">
          <Reveal className="section-head">
            <div className="section-eyebrow">PRICING</div>
            <h2>Choose how much we handle</h2>
            <p>
              Every plan starts with a site built for your trade. Hosting and
              growth are optional add-ons.
            </p>
          </Reveal>

          <div className="pricing-grid">
            {/* Build */}
            <Reveal delay={0}>
              <div className="plan">
                <div className="plan-name">Build</div>
                <div className="plan-tagline">A finished site, handed to you</div>
                <div className="plan-price">$500</div>
                <div className="plan-cadence">one-time</div>
                <ul className="plan-features">
                  <li>Custom-designed site for your trade</li>
                  <li>Mobile-friendly, fast-loading</li>
                  <li>Contact form included</li>
                  <li>You host it anywhere you like</li>
                  <li>Optional hosting add-on: +$20/mo</li>
                </ul>
                <CheckoutButton plan="build" className="btn btn-ghost">Get started</CheckoutButton>
              </div>
            </Reveal>

            {/* Grow — featured */}
            <Reveal delay={60}>
              <div className="plan featured">
                <div className="plan-badge">MOST POPULAR</div>
                <div className="plan-name">Grow</div>
                <div className="plan-tagline">Build + host, plus we find you work</div>
                <div className="plan-price">$1,000</div>
                <div className="plan-cadence" style={{ marginBottom: '4px' }}>one-time setup</div>
                <div className="plan-recurring">then $70 / month</div>
                <ul className="plan-features">
                  <li>Everything in Build and Host</li>
                  <li>Ongoing SEO and performance work</li>
                  <li>Booking form + call tracking built in</li>
                  <li>$50 charged only when a lead turns into a booked job</li>
                </ul>
                <CheckoutButton plan="grow" className="btn btn-primary">Get started</CheckoutButton>
              </div>
            </Reveal>

            {/* Host */}
            <Reveal delay={120}>
              <div className="plan">
                <div className="plan-name">Host</div>
                <div className="plan-tagline">Keep an existing site alive</div>
                <div className="plan-price">$700</div>
                <div className="plan-cadence" style={{ marginBottom: '4px' }}>one-time setup</div>
                <div className="plan-recurring">then $50 / month</div>
                <ul className="plan-features">
                  <li>Hosting, uptime, and backups</li>
                  <li>Security and software updates</li>
                  <li>Content and copy updates</li>
                  <li>Direct support line to us</li>
                </ul>
                <CheckoutButton plan="host" className="btn btn-ghost">Get started</CheckoutButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq">
        <div className="container">
          <Reveal className="section-head">
            <div className="section-eyebrow">FAQ</div>
            <h2>How the $50-per-booked-job fee works</h2>
          </Reveal>

          <Reveal>
            <div className="faq-item">
              <h3>How do you know when I get a lead?</h3>
              <p>
                Your Grow-plan site includes a booking form and a dedicated
                tracking phone number. Every submission or call through those
                is logged automatically — nothing to report yourself.
              </p>
            </div>
            <div className="faq-item">
              <h3>What if the lead doesn't turn into a job?</h3>
              <p>
                You're only charged once a lead is marked as a booked job —
                not for raw form submissions or calls that don't go anywhere.
                It's a flat $50 per completed job, so there's never a dispute
                over what it was worth.
              </p>
            </div>
            <div className="faq-item">
              <h3>Can I see every lead I'm charged for?</h3>
              <p>
                Yes — your dashboard shows a running log of every lead, when
                it came in, and the charge tied to it.
              </p>
            </div>
            <div className="faq-item">
              <h3>Can I switch plans later?</h3>
              <p>
                Yes, you can move between Host and Grow at any time from your
                dashboard.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact">
        <div className="container">
          <Reveal>
            <div className="contact-box">
              <div className="contact-copy">
                <h2>Let's build your site</h2>
                <p>
                  Tell us about your business and we'll follow up with a plan
                  recommendation and a quote.
                </p>
              </div>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
