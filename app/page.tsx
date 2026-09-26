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
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <ScrollReveal className="flex-1 text-center lg:text-left z-10">
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                Transform Your Business with <span className="text-[var(--blue)]">Intelligent Digital Solutions</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Top-tier US-focused IT services agency delivering scalable, innovative, and reliable solutions that drive growth.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Link 
                  href="/services" 
                  className="px-8 py-4 bg-[var(--blue)] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto text-center shadow-md hover:shadow-lg"
                >
                  Explore Our Services
                </Link>
                <Link 
                  href="/contact" 
                  className="px-8 py-4 bg-transparent border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:border-[var(--blue)] hover:text-[var(--blue)] transition-colors w-full sm:w-auto text-center"
                >
                  Contact Us
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200 dark:border-gray-800">
                {[
                  { value: '150+', label: 'Projects Delivered' },
                  { value: '50+', label: 'Happy Clients' },
                  { value: '8', label: 'Core Services' },
                  { value: '99.9%', label: 'Uptime' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
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
      <section className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
              What We Deliver
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4 tracking-tight">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Comprehensive digital solutions tailored to help modern businesses innovate, scale, and outperform.
            </p>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service) => (
              <StaggerItem key={service.slug} className="group cursor-pointer h-full">
                <Link 
                  href={`/services/${service.slug}`} 
                  className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/80 hover:border-[var(--blue)] dark:hover:border-[var(--blue)] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Card Image */}
                  <div className="h-52 relative w-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <Image 
                      src={service.image} 
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Card Content with Generous Spacing */}
                  <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-[var(--blue)] transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {service.tagline}
                      </p>
                    </div>

                    <div className="pt-3 mt-auto border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--blue)] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Learn more <span>→</span>
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {service.scope.length} capabilities
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 3. TRUST/WHY-US SECTION */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
              The Trelio Advantage
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4 tracking-tight">
              Why Trelio?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              We operate as your dedicated engineering and marketing wing with transparent US-aligned execution.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🇺🇸', title: 'US-Based Execution', desc: 'Direct, clear communication aligned with your working hours and time zones.' },
              { icon: '🎯', title: 'Result-Driven Metrics', desc: 'We optimize for measurable business impact: conversions, uptime, and ROI.' },
              { icon: '🚀', title: 'Cutting-Edge Stack', desc: 'Architected with React, Next.js, and cloud systems to guarantee future-proof performance.' },
              { icon: '🎧', title: '24/7 Dedicated Support', desc: 'Active monitoring, continuous updates, and immediate SLA response times.' }
            ].map((feature, i) => (
              <ScrollReveal 
                key={i} 
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4 select-none">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.desc}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROJECTS SECTION */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
                Proven Track Record
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1 mb-2 tracking-tight">
                Our Work
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                A selection of high-impact digital solutions built for our clients.
              </p>
            </div>
            <Link 
              href="/work" 
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-[var(--blue)] font-bold hover:underline"
            >
              <span>View all projects</span>
              <span>→</span>
            </Link>
          </ScrollReveal>
          
          {(!featuredProjects || featuredProjects.length === 0) ? (
            <ScrollReveal className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Exciting client case studies are currently being finalized. Check back shortly!
              </p>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ScrollReveal 
                  key={project.id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <div className="h-60 relative overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {(project.screenshot || project.screenshot_url) ? (
                      <Image 
                        src={project.screenshot || project.screenshot_url} 
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                        {project.name}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-between gap-3">
                    <div>
                      {project.category && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--blue)]/10 text-[var(--blue)] mb-2">
                          {project.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {(project.live_link || project.live_link_url) && (
                      <a
                        href={project.live_link || project.live_link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--blue)] hover:underline pt-2 mt-auto"
                      >
                        <span>Visit live product</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. PROCESS STEPS SECTION */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
              Workflow
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4 tracking-tight">
              How We Work
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Our battle-tested roadmap from initial kickoff to launch and beyond.
            </p>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Discovery & Strategy', desc: 'We align on business goals, user personas, technical requirements, and milestone timelines.' },
              { num: '02', title: 'Design & Engineering', desc: 'Crafting intuitive UI/UX prototypes and robust, production-grade software architectures.' },
              { num: '03', title: 'QA & Optimization', desc: 'Rigorous end-to-end testing, speed benchmarks, security audits, and zero-downtime deployment.' },
              { num: '04', title: 'Scale & Growth', desc: 'Continuous performance analytics, iterative feature releases, and reliable maintenance.' }
            ].map((step) => (
              <StaggerItem 
                key={step.num} 
                className="relative p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="text-6xl font-black text-gray-200 dark:text-gray-800 select-none absolute top-4 right-4 pointer-events-none z-0">
                  {step.num}
                </div>
                <div className="relative z-10 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--blue)]">
                    Step {step.num}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-1 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 6. CONTACT CTA SECTION (BLUE BANNER) */}
      <section className="py-24 bg-[#1d4ed8] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-90 pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's discuss how our intelligent digital solutions can transform your business. Reach out today for a consultation.
            </p>
            <div>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-10 py-4.5 rounded-xl font-extrabold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1d4ed8',
                }}
              >
                Get in Touch
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
