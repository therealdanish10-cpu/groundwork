'use client';

import { ElementType, ReactNode, useEffect, useRef } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Extra classes to merge onto the wrapper element. */
  className?: string;
  /** Inline styles forwarded to the wrapper element. */
  style?: React.CSSProperties;
  /** Stagger delay in milliseconds (default 0). */
  delay?: number;
  /** Render as a different HTML tag, e.g. "li" or "section". Default: "div". */
  as?: ElementType;
  /** Start already-revealed (for above-the-fold elements). */
  initiallyVisible?: boolean;
}

export default function Reveal({
  children,
  className = '',
  style,
  delay = 0,
  as: Tag = 'div',
  initiallyVisible = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already visible (e.g. hero card above the fold), mark immediately.
    if (initiallyVisible) {
      el.classList.add('in');
      return;
    }

    // Respect the user's motion preference — skip animation entirely.
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) {
      el.classList.add('in');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('in'), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, initiallyVisible]);

  const classes = ['reveal', className].filter(Boolean).join(' ');

  // Cast ref so TypeScript accepts it on a generic ElementType.
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={classes} style={style}>
      {children}
    </Tag>
  );
}
