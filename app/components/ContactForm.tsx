'use client';

import { useState } from 'react';
import { SERVICES as SITE_SERVICES } from '@/lib/services';

const SERVICE_OPTIONS = [
  ...SITE_SERVICES.map(s => s.name),
  'Other / Custom Project'
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      companyName: formData.get('companyName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      serviceInterest: formData.get('serviceInterest'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message.');
      }

      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Message Sent!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for reaching out. We will review your project and get back to you within 24 hours.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="px-6 py-2.5 bg-[var(--blue)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all placeholder:text-gray-400 text-sm"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="companyName" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all placeholder:text-gray-400 text-sm"
            placeholder="Acme Corp"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Work Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all placeholder:text-gray-400 text-sm"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all placeholder:text-gray-400 text-sm"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div>
        <label htmlFor="serviceInterest" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Service Interest
        </label>
        <div className="relative">
          <select
            id="serviceInterest"
            name="serviceInterest"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all appearance-none cursor-pointer pr-10 text-sm"
          >
            <option value="" className="text-gray-400">Select a service...</option>
            {SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {service}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Project Brief / Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all resize-none placeholder:text-gray-400 text-sm"
          placeholder="Tell us about your project, timeline, and goals..."
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[var(--blue)] hover:bg-blue-600 text-white font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
      >
        {isSubmitting ? 'Sending inquiry...' : 'Send Inquiry'}
      </button>
    </form>
  );
}
