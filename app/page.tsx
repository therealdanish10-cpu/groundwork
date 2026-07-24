import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from './components/Reveal';
import CheckoutButton from './components/CheckoutButton';
import ContactForm from './components/ContactForm';
import HeroBackground from './components/HeroBackground';

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
          <Reveal className="section-head">
            <div className="section-eyebrow">HOW IT WORKS</div>
            <h2>Four simple steps to predictable growth</h2>
            <p>
              Start with just a website, or let us handle hosting, lead capture, and performance.
            </p>
          </Reveal>

          <div className="flow-steps">
            <Reveal delay={0}>
              <div className="flow-step">
                <div className="step-num">STEP 1</div>
                <h3>We design your site</h3>
                <p>
                  Built for your specific trade, your service area, and how local customers actually search for you.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="flow-step">
                <div className="step-num">STEP 2</div>
                <h3>You choose a plan</h3>
                <p>
                  Pick a standalone build, managed monthly hosting, or our full pay-per-booked-job growth plan.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="flow-step">
                <div className="step-num">STEP 3</div>
                <h3>Leads flow through your site</h3>
                <p>
                  Smart booking forms and call tracking are built in, automatically logging every lead to your dashboard.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="flow-step">
                <div className="step-num">STEP 4</div>
                <h3>You only pay for results</h3>
                <p>
                  On the Grow plan, we charge $50 per confirmed booked job — nothing if it doesn't turn into real revenue.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3. PRICING TEASER ───────────────────────────────────── */}
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
            <Reveal delay={100}>
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
            <Reveal delay={200}>
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

      {/* ── 5. FAQ (Now Last) ──────────────────────────────────── */}
      <section id="faq">
        <div className="container">
          <Reveal className="section-head">
            <div className="section-eyebrow">FAQ</div>
            <h2>How the $50-per-booked-job fee works</h2>
          </Reveal>

          <Reveal delay={100}>
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
    </>
  );
}
