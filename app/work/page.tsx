import { createAdminClient } from '@/lib/supabase/admin'
import { Metadata } from 'next'
import { ScrollReveal } from '@/app/components/MotionWrapper'
import WorkGalleryClient from './WorkGalleryClient'

export const metadata: Metadata = {
  title: 'Our Work & Case Studies | Trelio',
  description: 'Discover our portfolio of successful digital projects, custom web platforms, mobile apps, and growth solutions delivered for clients worldwide.',
  openGraph: {
    title: 'Our Work & Case Studies | Trelio',
    description: 'Discover our portfolio of successful digital projects, custom web platforms, mobile apps, and growth solutions delivered for clients worldwide.',
    url: 'https://www.trelio.tech/work',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Our Work & Case Studies | Trelio',
      },
    ],
  },
};

export const revalidate = 60

export default async function WorkPage() {
  const adminClient = createAdminClient()
  
  const { data: projects, error } = await adminClient
    .from('gallery')
    .select('id, name, description, category, screenshot, live_link, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching gallery projects:', error)
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12">
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

        <WorkGalleryClient initialProjects={projects || []} />
      </div>
    </div>
  )
}
