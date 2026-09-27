'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export const MotionDiv = motion.div;
export const MotionSection = motion.section;

export const StaggerContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export const StaggerItem = ({ 
  children, 
  className,
  index = 0,
}: { 
  children: React.ReactNode; 
  className?: string;
  index?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -40px 0px' }}
      transition={{ 
        duration: 0.8, 
        delay: (index % 4) * 0.18, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScrollCard = StaggerItem;

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  amount?: number;
}

export const ScrollReveal = ({ 
  children, 
  className, 
  delay = 0, 
  direction = 'up',
  amount = 0.15 
}: ScrollRevealProps) => {
  const directionOffset = {
    up: { x: 0, y: 24 },
    down: { x: 0, y: -24 },
    left: { x: 24, y: 0 },
    right: { x: -24, y: 0 },
  };

  const offset = directionOffset[direction];
  const delaySec = delay >= 10 ? delay / 1000 : delay;

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.75, delay: delaySec, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LazyCard = ({
  children,
  className,
  minHeight = '320px',
  rootMargin = '200px',
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  rootMargin?: string;
}) => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView) return;
    const el = containerRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={!inView ? { minHeight } : undefined}
    >
      {inView ? (
        children
      ) : (
        <div 
          className="w-full h-full min-h-[300px] rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-200/40 dark:border-gray-800/40 animate-pulse flex items-center justify-center" 
          aria-hidden="true" 
        >
          <div className="w-8 h-8 rounded-full border-2 border-[var(--blue)]/30 border-t-[var(--blue)] animate-spin" />
        </div>
      )}
    </div>
  );
};
