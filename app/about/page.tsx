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
    image: null,
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
    <div className="pt-24 pb-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 lg:py-24">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl lg:text-6xl">
              About Trelio
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              We are a premier IT services agency based in the United States, dedicated to helping businesses scale and innovate through cutting-edge technology solutions.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Story Section */}
      <section className="bg-muted/30 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="right">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-6 text-lg text-muted-foreground">
                  <p>
                    Trelio was founded with a singular vision: to bridge the gap between complex technological challenges and elegant, scalable business solutions. We recognized that businesses across the US needed more than just vendors—they needed strategic technology partners.
                  </p>
                  <p>
                    Since our inception, we have been committed to delivering excellence in software development, cloud architecture, and IT consulting. Our approach combines deep technical expertise with a profound understanding of modern business dynamics.
                  </p>
                  <p>
                    Today, Trelio stands as a trusted digital partner for startups and enterprises alike, driving digital transformation and ensuring our clients stay ahead in an ever-evolving technological landscape.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl">
                {/* Replace with a generic tech/office image or colorful abstract background if actual image isn't available */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center p-12">
                  <div className="w-full h-full border-2 border-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-background/30">
                    <span className="text-4xl font-bold text-primary/50 tracking-widest">TRELIO</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Our Values</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The core principles that drive everything we do.
            </p>
          </div>
        </ScrollReveal>
        
        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Excellence', desc: 'We deliver nothing but the highest quality code and strategic advice. We don\'t settle for "good enough".' },
            { title: 'Transparency', desc: 'Clear communication, honest timelines, and straightforward pricing. We build trust through openness.' },
            { title: 'Innovation', desc: 'We stay at the bleeding edge of technology to bring the most effective solutions to our clients\' challenges.' }
          ].map((value, i) => (
            <StaggerItem key={i}>
              <div className="bg-card border border-border/50 p-8 rounded-2xl h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Team Section */}
      <section className="bg-muted/20 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Meet the Team</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                The experts behind our successful partnerships.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <StaggerItem key={member.name}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 bg-muted border-4 border-background shadow-lg">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary text-3xl font-bold">
                        {member.initials}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                  <p className="text-primary font-medium mt-1">{member.role}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center bg-primary text-primary-foreground rounded-3xl p-12 lg:p-16 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to transform your business?</h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Let's discuss how Trelio can help you achieve your technology goals and drive unprecedented growth.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full bg-background text-foreground hover:bg-background/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 relative z-10"
            >
              Get in Touch
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}
