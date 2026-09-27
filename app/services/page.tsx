import { SERVICES } from '@/lib/services';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/app/components/MotionWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services | Trelio',
  description: 'Comprehensive digital solutions tailored to help your business grow, innovate, and succeed in a fast-paced world.',
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white pb-28">
      <ScrollReveal className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
          Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-2 mb-6">
          Our Services
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Comprehensive digital solutions tailored to help your business grow, innovate, and succeed in a fast-paced world.
        </p>
      </ScrollReveal>

      <div className="px-6 max-w-7xl mx-auto">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, index) => (
            <StaggerItem key={service.slug} index={index} className="h-full">
              <Link href={`/services/${service.slug}`} className="group block h-full">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl overflow-hidden hover:border-[var(--blue)] dark:hover:border-[var(--blue)] transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-[var(--blue)] transition-colors">
                        {service.name}
                      </h2>
                      <p className="text-xs font-bold text-[var(--blue)] mb-2 uppercase tracking-wide">
                        {service.tagline}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--blue)] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Explore scope <span>→</span>
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {service.scope.length} deliverables
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
