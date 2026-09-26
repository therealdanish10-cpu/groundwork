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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-24">
      <ScrollReveal className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">Our Services</h1>
        <p className="text-xl text-[var(--gray)] max-w-2xl mx-auto">
          Comprehensive digital solutions tailored to help your business grow, innovate, and succeed in a fast-paced world.
        </p>
      </ScrollReveal>

      <div className="px-6 max-w-7xl mx-auto">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service) => (
            <StaggerItem key={service.slug}>
              <Link href={`/services/${service.slug}`} className="group block h-full">
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--blue)] transition-colors h-full flex flex-col shadow-sm hover:shadow-md">
                  <div className="relative h-48 w-full bg-[var(--border)] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--blue)] transition-colors">{service.name}</h2>
                    <p className="text-sm font-semibold text-[var(--blue)] mb-3">{service.tagline}</p>
                    <p className="text-[var(--gray)] text-sm line-clamp-3">{service.description}</p>
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
