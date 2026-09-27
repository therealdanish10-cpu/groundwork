import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { StaggerContainer, StaggerItem, ScrollReveal } from '@/app/components/MotionWrapper'

export const metadata: Metadata = {
  title: 'About Us | Trelio IT Services',
  description: 'Learn about Trelio, our mission, values, and the team dedicated to transforming businesses through technology.',
}

const team = [
  {
    name: 'Allah Ditta',
    role: 'Founder & CEO',
    image: '/allah-ditta.jpg',
    initials: 'AD'
  },
  {
    name: 'Danish Awan',
    role: 'Co-founder & CTO',
    image: '/danish-awan.png',
    initials: 'DA'
  },
  {
    name: 'Awais Tahir',
    role: 'COO',
    image: null,
    initials: 'AT'
  },
  {
    name: 'Alishba Zaheer',
    role: 'Social Media Manager',
    image: null,
    initials: 'AZ'
  }
]

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 lg:pb-24">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
              Who We Are
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2 mb-6">
              About Trelio
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              We are a premier IT services agency serving forward-thinking businesses worldwide, dedicated to scaling and innovating through cutting-edge technology and data-backed digital marketing.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Story Section */}
      <section className="bg-gray-50 dark:bg-gray-900/60 py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="right">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
                  Our Mission
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-6">Our Story</h2>
                <div className="space-y-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Trelio was founded with a singular vision: to bridge the gap between complex technological challenges and elegant, scalable business solutions. We recognized that growing businesses worldwide needed more than just vendors—they needed strategic technology partners.
                  </p>
                  <p>
                    Since our inception, we have been committed to delivering excellence in software development, cloud architecture, and digital growth. Our approach combines deep technical expertise with a profound understanding of modern business dynamics.
                  </p>
                  <p>
                    Today, Trelio stands as a trusted digital partner for startups and enterprises alike, driving digital transformation and ensuring our clients stay ahead in an ever-evolving technological landscape.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
                  alt="Trelio team collaborating in modern office"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
              Guiding Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">Our Values</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              The core principles that drive everything we build and deliver.
            </p>
          </div>
        </ScrollReveal>
        
        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Excellence', desc: 'We deliver nothing but the highest quality code and strategic advice. We don\'t settle for "good enough".' },
            { title: 'Transparency', desc: 'Clear communication, honest timelines, and high-impact deliverables. We build trust through openness and accountability.' },
            { title: 'Innovation', desc: 'We stay at the bleeding edge of technology to bring the most effective solutions to our clients\' challenges.' }
          ].map((value, i) => (
            <StaggerItem key={i} index={i}>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[var(--blue)]/10 text-[var(--blue)] rounded-xl flex items-center justify-center mb-6">
                  <div className="w-4 h-4 bg-[var(--blue)] rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{value.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 dark:bg-gray-900/60 py-24 px-4 sm:px-6 lg:px-8 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
                Leadership
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">Meet the Team</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                The experts behind our successful partnerships and client results.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <StaggerItem key={member.name} index={i}>
                <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800 border-4 border-[var(--blue)]/20 shadow-md">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--blue)]/10 text-[var(--blue)] text-3xl font-bold">
                        {member.initials}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-[var(--blue)] font-bold text-sm mt-1">{member.role}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center bg-[#1d4ed8] text-white rounded-3xl p-12 lg:p-16 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10 text-white tracking-tight">Ready to transform your business?</h2>
            <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
              Let's discuss how Trelio can help you achieve your technology goals and drive unprecedented growth.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-9 py-4 text-base font-extrabold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer relative z-10"
              style={{
                backgroundColor: '#ffffff',
                color: '#1d4ed8',
              }}
            >
              Get in Touch
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}
