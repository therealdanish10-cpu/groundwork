import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { Metadata } from 'next'
import { StaggerContainer, StaggerItem, ScrollReveal } from '@/app/components/MotionWrapper'

export const metadata: Metadata = {
  title: 'Our Work | Trelio IT Services',
  description: 'Projects we\'re proud of. Explore our portfolio of successful IT implementations and digital solutions.',
}

export const revalidate = 3600

export default async function WorkPage() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('gallery')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching gallery projects:', error)
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
              Our Work
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Projects we're proud of
            </p>
          </div>
        </ScrollReveal>

        {!projects || projects.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl">
            <h3 className="text-2xl font-semibold text-foreground">Portfolio updating</h3>
            <p className="mt-2 text-muted-foreground">We are currently adding our recent projects. Check back soon!</p>
          </div>
        ) : (
          <StaggerContainer className="grid gap-10 md:grid-cols-2">
            {projects.map((project) => (
              <StaggerItem key={project.id}>
                <div className="flex flex-col h-full bg-card rounded-3xl shadow-sm border border-border/50 overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                    {(project.screenshot || project.screenshot_url) ? (
                      <Image
                        src={project.screenshot || project.screenshot_url}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <span className="text-primary font-medium text-xl">{project.name}</span>
                      </div>
                    )}
                    {project.category && (
                      <div className="absolute top-6 left-6 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-background/95 text-foreground backdrop-blur-sm shadow-sm">
                          {project.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {project.name}
                    </h3>
                    <p className="text-base text-muted-foreground mb-8 flex-1">
                      {project.description}
                    </p>
                    {(project.live_link || project.live_link_url) && (
                      <div>
                        <a 
                          href={project.live_link || project.live_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 border border-border bg-background text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors w-full sm:w-auto"
                        >
                          View Live Project
                          <span className="ml-2">↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}
