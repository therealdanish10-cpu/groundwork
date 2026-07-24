'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do you know when I get a lead?',
    answer:
      'Your Grow-plan site includes a booking form and a dedicated tracking phone number. Every submission or call through those is logged automatically — nothing to report yourself.',
  },
  {
    question: "What if the lead doesn't turn into a job?",
    answer:
      "You're only charged once a lead is marked as a booked job — not for raw form submissions or calls that don't go anywhere. It's a flat $50 per completed job, so there's never a dispute over what it was worth.",
  },
  {
    question: "Can I see every lead I'm charged for?",
    answer:
      'Yes — your dashboard shows a running log of every lead, when it came in, and the charge tied to it.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes, you can move between Host and Grow at any time from your dashboard.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(idx: number) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  return (
    <div className="faq-accordion">
      {FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="faq-question"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <span className="faq-icon" aria-hidden="true">
                +
              </span>
            </button>
            {isOpen && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
