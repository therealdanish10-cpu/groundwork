import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SERVICES } from '@/lib/services';
import SplineHero from './components/SplineHero';
import { ScrollReveal, StaggerContainer, StaggerItem } from './components/MotionWrapper';

export const metadata: Metadata = {
  title: 'Trelio | Intelligent Digital Solutions',
  description: 'Transform Your Business with Intelligent Digital Solutions. Trelio offers comprehensive IT services for modern businesses.',
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featuredProjects } = await supabase
    .from('gallery')
    .select('*')
    .order('sort_order')
    .limit(3);

  return (
    <main className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-[var(--bg)]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <ScrollReveal className="flex-1 text-center lg:text-left z-10">
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[var(--fg)] mb-6">
                Transform Your Business with <span className="text-[var(--blue)]">Intelligent Digital Solutions</span>
              </h1>
              <p className="text-xl text-[var(--gray)] mb-8 max-w-2xl mx-auto lg:mx-0">
                Top-tier US-focused IT services agency delivering scalable, innovative, and reliable solutions that drive growth.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Link href="/services" className="px-8 py-4 bg-[var(--blue)] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto text-center">
                  Explore Our Services
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-[var(--border)] text-[var(--fg)] rounded-lg font-semibold hover:border-[var(--blue)] hover:text-[var(--blue)] transition-colors w-full sm:w-auto text-center">
                  Contact Us
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[var(--border)]">
                {[
                  { value: '150+', label: 'Projects Delivered' },
                  { value: '50+', label: 'Happy Clients' },
                  { value: '8', label: 'Core Services' },
                  { value: '99.9%', label: 'Uptime' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-[var(--fg)]">{stat.value}</div>
                    <div className="text-sm text-[var(--gray)]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <div className="flex-1 w-full relative z-0">
              <SplineHero scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">Our Services</h2>
            <p className="text-lg text-[var(--gray)] max-w-2xl mx-auto">Comprehensive digital solutions for modern businesses</p>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service: any) => (
              <StaggerItem key={service.slug} className="group cursor-pointer">
                <Link href={`/services/${service.slug}`} className="block h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--blue)] transition-all shadow-sm hover:shadow-md">
                  <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[var(--gray)]">
                    {service.image ? (
                      <Image 
                        src={service.image} 
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm">Image Placeholder</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--fg)] mb-2 group-hover:text-[var(--blue)] transition-colors">{service.name}</h3>
                    <p className="text-[var(--gray)] text-sm">{service.tagline}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 3. TRUST/WHY-US SECTION */}
      <section className="py-24 bg-[var(--bg)]">
        <div className="container mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">Why Trelio?</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🇺🇸', title: 'US-Based Team', desc: 'Local expertise and clear communication during your business hours.' },
              { icon: '🎯', title: 'Result-Driven', desc: 'We focus on measurable outcomes that impact your bottom line.' },
              { icon: '🚀', title: 'Cutting-Edge Tech', desc: 'Leveraging the latest technologies to build future-proof solutions.' },
              { icon: '🎧', title: '24/7 Support', desc: 'Round-the-clock monitoring and dedicated support for your peace of mind.' }
            ].map((feature, i) => (
              <ScrollReveal key={i} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-[var(--border)] text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[var(--fg)] mb-2">{feature.title}</h3>
                <p className="text-[var(--gray)]">{feature.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROJECTS SECTION */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">Our Work</h2>
              <p className="text-lg text-[var(--gray)]">Projects we're proud of</p>
            </div>
            <Link href="/work" className="mt-4 md:mt-0 text-[var(--blue)] font-semibold hover:underline">
              View all projects &rarr;
            </Link>
          </ScrollReveal>
          
          {(!featuredProjects || featuredProjects.length === 0) ? (
            <ScrollReveal className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-[var(--border)]">
              <p className="text-[var(--gray)] text-lg">Amazing projects are being built right now. Check back soon!</p>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ScrollReveal key={project.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-60 relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {(project.screenshot || project.screenshot_url) && (
                      <Image 
                        src={project.screenshot || project.screenshot_url} 
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--fg)] mb-2">{project.name}</h3>
                    <p className="text-[var(--gray)] line-clamp-3">{project.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. PROCESS STEPS SECTION */}
      <section className="py-24 bg-[var(--bg)]">
        <div className="container mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">How We Work</h2>
            <p className="text-lg text-[var(--gray)] max-w-2xl mx-auto">Our proven process for delivering excellence</p>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Discovery & Strategy', desc: 'We dive deep into your business goals, target audience, and requirements.' },
              { num: '02', title: 'Design & Development', desc: 'Crafting intuitive interfaces and robust architectures tailored to your needs.' },
              { num: '03', title: 'Testing & Launch', desc: 'Rigorous QA testing ensures a flawless deployment to production.' },
              { num: '04', title: 'Growth & Support', desc: 'Continuous monitoring, updates, and strategic guidance post-launch.' }
            ].map((step) => (
              <StaggerItem key={step.num} className="relative p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-gray-800">
                <div className="text-6xl font-black text-gray-100 dark:text-gray-700/50 absolute top-4 right-4 -z-0">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-[var(--fg)] mb-3 mt-8">{step.title}</h3>
                  <p className="text-[var(--gray)]">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 6. CONTACT CTA SECTION */}
      <section className="py-24 bg-[var(--blue)] text-white">
        <div className="container mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Let's discuss how our intelligent digital solutions can transform your business. Reach out today for a free consultation.
            </p>
            <Link href="/contact" className="inline-block px-10 py-5 bg-white text-[var(--blue)] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl">
              Get in Touch
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
