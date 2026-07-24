'use client';

import { useState, useRef, MouseEvent, TouchEvent, KeyboardEvent } from 'react';
import CheckoutButton from './CheckoutButton';

export interface PlanItem {
  id: 'build' | 'host' | 'grow';
  name: string;
  eyebrow?: string;
  tagline: string;
  description?: string;
  price: string;
  cadence: string;
  recurring?: string;
  features: string[];
  isFeatured?: boolean;
  ctaText?: string;
}

export interface PricingCarouselProps {
  plans: PlanItem[];
  initialIndex?: number;
}

export default function PricingCarousel({
  plans,
  initialIndex = 0,
}: PricingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const index = Math.max(0, Math.min(currentIndex, plans.length - 1));

  function goToIndex(nextIndex: number) {
    if (nextIndex >= 0 && nextIndex < plans.length) {
      setCurrentIndex(nextIndex);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleNext() {
    if (currentIndex < plans.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  // Mouse Drag handlers
  function onMouseDown(e: MouseEvent<HTMLDivElement>) {
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setDragOffset(0);
  }

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!isDragging) return;
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    setDragOffset(diff);
  }

  function onMouseUp() {
    if (!isDragging) return;
    const diff = currentXRef.current - startXRef.current;
    const threshold = 60;

    if (diff < -threshold && currentIndex < plans.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (diff > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
  }

  function onMouseLeave() {
    if (isDragging) {
      onMouseUp();
    }
  }

  // Touch Swipe handlers
  function onTouchStart(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      currentXRef.current = e.touches[0].clientX;
      setDragOffset(0);
    }
  }

  function onTouchMove(e: TouchEvent<HTMLDivElement>) {
    if (!isDragging || e.touches.length !== 1) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    setDragOffset(diff);
  }

  function onTouchEnd() {
    if (!isDragging) return;
    const diff = currentXRef.current - startXRef.current;
    const threshold = 60;

    if (diff < -threshold && currentIndex < plans.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (diff > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
  }

  // Keyboard navigation
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  }

  return (
    <div className="carousel-shell">
      <div
        className="carousel-viewport"
        tabIndex={0}
        aria-label="Pricing Plans Carousel"
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {plans.map((plan, i) => (
            <div key={plan.id} className="plan-panel">
              {/* Left Column: Plan Overview */}
              <div className="plan-left">
                <div className="plan-eyebrow">{plan.eyebrow ?? `PLAN 0${i + 1}`}</div>
                <h3>{plan.name}</h3>
                <p style={{ fontWeight: 600, color: 'var(--fg)', marginBottom: '8px' }}>
                  {plan.tagline}
                </p>
                {plan.description && <p>{plan.description}</p>}
              </div>

              {/* Right Column: Pricing Card Details (No floating badge element) */}
              <div className={`plan-right ${plan.isFeatured ? 'featured' : ''}`}>
                <div className="plan-price">
                  {plan.price} <span className="unit">/ {plan.cadence}</span>
                </div>

                {plan.recurring && (
                  <div className="plan-recurring">{plan.recurring}</div>
                )}

                <div className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="plan-feature">
                      <span className="check">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="plan-cta">
                  <CheckoutButton
                    plan={plan.id}
                    className="btn plan-cta-btn"
                  >
                    {plan.ctaText ?? 'Start with ' + plan.name}
                  </CheckoutButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Controls: Arrows & Dot Indicators */}
      <div className="carousel-controls">
        <button
          type="button"
          className="carousel-arrow"
          onClick={handlePrev}
          disabled={index === 0}
          aria-label="Previous plan"
          style={{ opacity: index === 0 ? 0.35 : 1, cursor: index === 0 ? 'default' : 'pointer' }}
        >
          ←
        </button>

        <div className="carousel-dots" role="tablist" aria-label="Plan slides">
          {plans.map((plan, i) => (
            <button
              key={plan.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to ${plan.name} plan`}
              className={`dot ${i === index ? 'active' : ''}`}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="carousel-arrow"
          onClick={handleNext}
          disabled={index === plans.length - 1}
          aria-label="Next plan"
          style={{ opacity: index === plans.length - 1 ? 0.35 : 1, cursor: index === plans.length - 1 ? 'default' : 'pointer' }}
        >
          →
        </button>
      </div>
    </div>
  );
}
