'use client';

import { useRef, useState } from 'react';
import CheckoutButton from './CheckoutButton';

type Plan = {
  id: 'build' | 'host' | 'grow';
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  recurring?: string;
  badge?: string;
  features: string[];
  cta: string;
  ctaVariant: 'btn-ghost' | 'btn-primary';
};

const PLANS: Plan[] = [
  {
    id: 'build',
    name: 'Build',
    tagline: 'A finished site, handed to you',
    price: '$500',
    cadence: 'one-time',
    features: [
      'Custom-designed site for your trade',
      'Mobile-friendly, fast-loading',
      'Contact form included',
      'You host it anywhere you like',
      'One round of revisions',
      'Optional hosting add-on: +$20/mo',
    ],
    cta: 'Get started',
    ctaVariant: 'btn-ghost',
  },
  {
    id: 'host',
    name: 'Host',
    tagline: 'Keep an existing site alive',
    price: '$700',
    cadence: 'one-time setup',
    recurring: 'then $50 / month',
    badge: 'MOST CHOSEN',
    features: [
      'Hosting, uptime, and backups',
      'Security and software updates',
      'Content and copy updates',
      'Direct support line to us',
      'No job fees',
    ],
    cta: 'Get started',
    ctaVariant: 'btn-primary',
  },
  {
    id: 'grow',
    name: 'Grow',
    tagline: 'Build + host, plus we find you work',
    price: '$1,000',
    cadence: 'one-time setup',
    recurring: 'then $70 / month',
    features: [
      'Everything in Build and Host',
      'Ongoing SEO and performance work',
      'Booking form + call tracking built in',
      'Monthly performance report',
      '$50 charged only when a lead turns into a booked job',
    ],
    cta: 'Get started',
    ctaVariant: 'btn-ghost',
  },
];

export default function PricingCarousel() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, dragged: 0 });

  function move(dir: number) {
    setIndex((prev) => (prev + dir + PLANS.length) % PLANS.length);
  }

  function goTo(i: number) {
    setIndex(i);
  }

  function onPointerDown(e: React.PointerEvent) {
    dragState.current.isDown = true;
    dragState.current.startX = e.clientX;
    dragState.current.dragged = 0;
    trackRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current.isDown) return;
    dragState.current.dragged = e.clientX - dragState.current.startX;
  }

  function onPointerUp() {
    if (!dragState.current.isDown) return;
    dragState.current.isDown = false;
    const dragged = dragState.current.dragged;
    if (dragged < -60) move(1);
    else if (dragged > 60) move(-1);
    dragState.current.dragged = 0;
  }

  return (
    <div className="carousel-shell">
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          ref={trackRef}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {PLANS.map((plan) => (
            <div className="plan-panel" key={plan.id}>
              <div className="plan-left">
                <div className="plan-eyebrow">
                  {plan.name}
                  {plan.badge ? ` · ${plan.badge}` : ''}
                </div>
                <h3>{plan.name}</h3>
                <p>{plan.tagline}</p>
              </div>
              <div className="plan-right">
                <div className="plan-price">
                  {plan.price} <span className="unit">{plan.cadence}</span>
                </div>
                {plan.recurring && (
                  <div className="plan-recurring">{plan.recurring}</div>
                )}
                <div className="plan-features">
                  {plan.features.map((f) => (
                    <div className="plan-feature" key={f}>
                      <span className="check">✓</span> {f}
                    </div>
                  ))}
                </div>
                <CheckoutButton plan={plan.id} className={`btn ${plan.ctaVariant} plan-cta`}>
                  {plan.cta}
                </CheckoutButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <button
          type="button"
          className="carousel-arrow"
          aria-label="Previous plan"
          onClick={() => move(-1)}
        >
          ←
        </button>
        <div className="carousel-dots">
          {PLANS.map((plan, i) => (
            <button
              key={plan.id}
              type="button"
              aria-label={`Show ${plan.name} plan`}
              className={`dot${i === index ? ' active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="carousel-arrow"
          aria-label="Next plan"
          onClick={() => move(1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
