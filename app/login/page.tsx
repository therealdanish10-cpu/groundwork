import type { Metadata } from 'next';
import AuthCard from '../components/AuthCard';

export const metadata: Metadata = {
  title: 'Log in or sign up',
  description: 'Log in to your Trelio dashboard or create a new account.',
};

/* ─────────────────────────────────────────────────────────────
   Login / signup page.
   The shared <nav> and <footer> come from app/layout.tsx.
   All interactive tab-switching and form logic lives in
   <AuthCard> (a 'use client' component).
───────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return <AuthCard />;
}
