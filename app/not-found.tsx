import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page not found | Trelio IT Services',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center py-20">
      <div className="max-w-md w-full">
        <div className="text-[var(--blue)] font-bold tracking-widest text-sm uppercase mb-6">
          404 Error
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-zinc-900 dark:text-white tracking-tight">
          Page not found
        </h1>
        
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8">
          The page you are looking for doesn&apos;t exist or has been moved. Check the URL or navigate back to our services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/services" className="btn btn-ghost">
            Our Services
          </Link>
        </div>
      </div>
    </div>
  );
}
