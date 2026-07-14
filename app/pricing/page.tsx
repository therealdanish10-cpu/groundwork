import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '../components/Reveal';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Start with just a site, or let Groundwork run the whole thing — hosting, growth, and finding you customers.',
};

/* ─────────────────────────────────────────────────────────────
   Pricing page — body content only.
   <nav> and <footer> are rendered by app/layout.tsx.
───────────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <header className="page-head">
        <div className="container">
          <div className="section-eyebrow">PRICING</div>
          <h1>One plan for every stage of your business</h1>
          <p>
            Start with just a site, or let Groundwork run the whole thing —
            hosting, growth, and finding you customers.
          </p>
        </div>
      </header>

      {/* ── PLAN CARDS ───────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
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
                  <li>One round of revisions</li>
                  <li>Optional hosting add-on: +$20/mo</li>
                </ul>
                <Link href="/#contact" className="btn btn-ghost">Get started</Link>
              </div>
            </Reveal>

            {/* Grow — featured */}
            <Reveal delay={60}>
              <div className="plan featured">
                <div className="plan-badge">MOST POPULAR</div>
                <div className="plan-name">Grow</div>
                <div className="plan-tagline">Build + host, plus we find you work</div>
                <div className="plan-price">$1,000</div>
                <div className="plan-cadence">per month</div>
                <ul className="plan-features">
                  <li>Everything in Build and Host</li>
                  <li>Ongoing SEO and performance work</li>
                  <li>Booking form + call tracking built in</li>
                  <li>Monthly performance report</li>
                  <li>$50 charged only when a lead turns into a booked job</li>
                </ul>
                <Link href="/#contact" className="btn btn-primary">Get started</Link>
              </div>
            </Reveal>

            {/* Host */}
            <Reveal delay={120}>
              <div className="plan">
                <div className="plan-name">Host</div>
                <div className="plan-tagline">Keep an existing site alive</div>
                <div className="plan-price">$700</div>
                <div className="plan-cadence">per month</div>
                <ul className="plan-features">
                  <li>Hosting, uptime, and backups</li>
                  <li>Security and software updates</li>
                  <li>Content and copy updates</li>
                  <li>Direct support line to us</li>
                  <li>No job fees</li>
                </ul>
                <Link href="/#contact" className="btn btn-ghost">Get started</Link>
              </div>
            </Reveal>
          </div>

          <p className="note">
            All monthly plans are billed month-to-month — cancel or switch
            plans any time from your dashboard.
          </p>
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ─────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal className="section-head" style={{ maxWidth: '600px', marginBottom: '40px' }}>
            <div className="section-eyebrow">COMPARE</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)' }}>
              What's included in each plan
            </h2>
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

      {/* ── HOW THE $50-PER-BOOKED-JOB FEE WORKS ────────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal>
            <div className="lead-explainer">
              <h2>How the $50-per-booked-job fee works</h2>
              <div className="lead-steps">
                <div className="lead-step">
                  <div className="num">1</div>
                  <h3>Lead comes in</h3>
                  <p>Through your site's booking form or tracking phone number.</p>
                </div>
                <div className="lead-step">
                  <div className="num">2</div>
                  <h3>It's logged automatically</h3>
                  <p>No reporting needed — it shows up in your dashboard right away.</p>
                </div>
                <div className="lead-step">
                  <div className="num">3</div>
                  <h3>You mark it as booked</h3>
                  <p>Once the job is won, you or we mark it booked in the dashboard.</p>
                </div>
                <div className="lead-step">
                  <div className="num">4</div>
                  <h3>$50 is charged</h3>
                  <p>A flat fee, charged to your card on file, only for booked jobs.</p>
                </div>
                <div className="lead-step">
                  <div className="num">5</div>
                  <h3>You see everything</h3>
                  <p>Every lead and every charge is itemized, always visible to you.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="section-sm">
        <div className="container">
          <Reveal className="section-head" style={{ maxWidth: '600px', marginBottom: '40px' }}>
            <div className="section-eyebrow">FAQ</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)' }}>Common questions</h2>
          </Reveal>

          <Reveal>
            <div className="faq-item">
              <h3>Can I start with Build and upgrade later?</h3>
              <p>
                Yes — most clients start with Build, then move to Host or Grow
                once the site is live and they see the value in ongoing support.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is there a contract or commitment?</h3>
              <p>
                No. Host and Grow are billed monthly and you can cancel or
                switch anytime from your dashboard.
              </p>
            </div>
            <div className="faq-item">
              <h3>What if I already have a website?</h3>
              <p>
                We can take over hosting an existing site on the Host plan, or
                rebuild it as part of Grow if it needs work to convert visitors
                into leads.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is the $50 job fee capped?</h3>
              <p>
                Not currently — it scales with how many jobs your site helps
                you win, which is the same incentive we have: the better it
                performs, the more we both earn.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CLOSING CTA BAND ─────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <h2>Ready to get your business online?</h2>
              <p>Tell us about your trade and we'll recommend the right plan.</p>
              <Link href="/#contact" className="btn btn-primary">Get started</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
