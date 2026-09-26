'use client';

import { motion } from 'framer-motion';
import React from 'react';

export const MotionDiv = motion.div;
export const MotionSection = motion.section;

export const StaggerContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.01 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ScrollReveal = ({ children, className, delay = 0, direction = 'up' }: ScrollRevealProps) => {
  const directionOffset = {
    up: { x: 0, y: 20 },
    down: { x: 0, y: -20 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
  };

  const offset = directionOffset[direction];

  const delaySec = delay >= 10 ? delay / 1000 : delay;

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.4, delay: delaySec, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
