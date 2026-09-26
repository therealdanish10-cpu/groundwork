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
    <div className="pt-32 pb-24 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
              Proven Track Record
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2 mb-4">
              Our Work
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              A curated selection of high-impact digital solutions built for our clients.
            </p>
          </div>
        </ScrollReveal>

        {!projects || projects.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio updating</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">We are currently adding our recent projects. Check back soon!</p>
          </div>
        ) : (
          <StaggerContainer className="grid gap-10 md:grid-cols-2">
            {projects.map((project) => (
              <StaggerItem key={project.id}>
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative aspect-[16/10] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {(project.screenshot || project.screenshot_url) ? (
                      <Image
                        src={project.screenshot || project.screenshot_url}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--blue)]/10">
                        <span className="text-[var(--blue)] font-bold text-xl">{project.name}</span>
                      </div>
                    )}
                    {project.category && (
                      <div className="absolute top-5 left-5 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white backdrop-blur-md shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                          {project.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {project.name}
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    {(project.live_link || project.live_link_url) && (
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <a 
                          href={project.live_link || project.live_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-xl hover:bg-[var(--blue)] hover:text-white hover:border-[var(--blue)] dark:hover:bg-[var(--blue)] dark:hover:border-[var(--blue)] transition-all w-full sm:w-auto gap-2"
                        >
                          <span>View Live Project</span>
                          <span>↗</span>
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
