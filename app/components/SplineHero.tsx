'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
});

export default function SplineHero({ scene }: { scene: string }) {
  return (
    <div className="w-full h-[400px] lg:h-[600px] relative">
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl" />}>
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
}
