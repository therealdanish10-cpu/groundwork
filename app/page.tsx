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
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-14">
                <Link 
                  href="/services" 
                  className="px-9 py-4 bg-[var(--blue)] hover:bg-blue-600 text-white rounded-xl font-bold transition-all w-full sm:w-auto text-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 inline-flex items-center justify-center text-lg"
                  style={{ color: '#ffffff', minHeight: '56px' }}
                >
                  Explore Our Services
                </Link>
                <Link 
                  href="/contact" 
                  className="px-9 py-4 bg-transparent border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:border-[var(--blue)] hover:text-[var(--blue)] dark:hover:text-[var(--blue)] transition-all w-full sm:w-auto text-center inline-flex items-center justify-center text-lg"
                  style={{ minHeight: '56px' }}
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
                  <div className="h-44 relative w-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
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
                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-[var(--blue)] transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {service.tagline}
                      </p>
                    </div>

                    <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
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
              { 
                title: 'US-Based Execution', 
                desc: 'Direct, clear communication aligned with your working hours and time zones.',
                icon: (
                  <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                title: 'Result-Driven Metrics', 
                desc: 'We optimize for measurable business impact: conversions, uptime, and ROI.',
                icon: (
                  <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              { 
                title: 'Cutting-Edge Stack', 
                desc: 'Architected with React, Next.js, and cloud systems to guarantee future-proof performance.',
                icon: (
                  <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )
              },
              { 
                title: '24/7 Dedicated Support', 
                desc: 'Active monitoring, continuous updates, and immediate SLA response times.',
                icon: (
                  <svg className="w-6 h-6 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <ScrollReveal 
                key={i} 
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-left shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[var(--blue)]/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
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
                className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-[var(--blue)]/10 text-[var(--blue)] font-extrabold flex items-center justify-center text-sm">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Phase {step.num}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
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
