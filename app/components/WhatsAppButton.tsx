'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Hide on admin and login pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  return (
    <Link
      href="https://wa.me/1XXXXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 animate-pulse"
      aria-label="Contact on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8"
      >
        <path d="M12.031 21c-1.618 0-3.197-.417-4.587-1.21l-5.111 1.34 1.365-4.981A8.937 8.937 0 012.441 12C2.441 7.037 6.478 3 11.441 3c4.962 0 8.999 4.037 8.999 9s-4.037 9-8.409 9zm-4.707-2.029c1.368.807 2.946 1.233 4.587 1.233 4.148 0 7.525-3.376 7.525-7.525 0-4.148-3.377-7.525-7.525-7.525-4.148 0-7.525 3.377-7.525 7.525 0 1.554.475 3.056 1.378 4.318l-1.011 3.69 3.778-.991zm6.98-4.836c-.198-.099-1.168-.576-1.349-.642-.18-.066-.312-.099-.444.099-.132.198-.51 .642-.625.774-.115.132-.231.149-.429.05-.198-.099-.834-.308-1.589-.982-.587-.525-.983-1.173-1.098-1.371-.115-.198-.012-.305.087-.404.089-.089.198-.231.297-.346.099-.115.132-.198.198-.33.066-.132.033-.248-.016-.347-.05-.099-.444-1.072-.608-1.468-.16-.384-.323-.332-.444-.338-.115-.006-.247-.006-.379-.006-.132 0-.346.05-.528.248-.182.198-.693.677-.693 1.65 0 .974.71 1.916.809 2.048.099.132 1.396 2.131 3.382 2.989.473.204.842.326 1.129.417.475.152.908.13 1.25.079.384-.057 1.168-.477 1.333-.938.165-.461.165-.856.115-.938-.05-.083-.182-.132-.38-.231z" />
      </svg>
    </Link>
  );
}
