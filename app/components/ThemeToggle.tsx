'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'groundwork-theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  // On mount, read the saved preference and apply it immediately.
  // Defaults to 'light' if no preference saved yet.
  useEffect(() => {
    let saved: Theme = 'light';
    try {
      saved = (localStorage.getItem(STORAGE_KEY) as Theme) || 'light';
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
    applyTheme(saved);
    setTheme(saved);
  }, []);

  function applyTheme(next: Theme) {
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  return (
    <button
      id="theme-toggle"
      className="theme-toggle"
      aria-label="Toggle dark and light theme"
      onClick={toggle}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
