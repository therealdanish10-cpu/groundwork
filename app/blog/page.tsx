import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICES } from '@/lib/services'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { StaggerContainer, StaggerItem, ScrollReveal } from '@/app/components/MotionWrapper'

export const metadata: Metadata = {
  title: 'Blog | Trelio IT Services',
  description: 'Insights, guides, and industry news from the Trelio team.',
}

export const revalidate = 60

export default async function BlogPage() {
  const adminClient = createAdminClient()
  
  const { data: posts, error } = await adminClient
    .from('blogs')
    .select('id, title, slug, service_tag, cover_image, created_at, status')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching blog posts:', error)
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--blue)]">
              Knowledge & Strategy
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2 mb-4">
              Blog & Insights
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Actionable guides, industry trends, and deep dives from our engineers and marketers.
            </p>
          </div>
        </ScrollReveal>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No articles published yet</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Check back soon for our latest insights and analysis.</p>
          </div>
        ) : (
          <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const service = SERVICES.find(s => s.slug === post.service_tag)
              const serviceName = service ? service.name : post.service_tag

              return (
                <StaggerItem key={post.id} index={index}>
                  <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-52 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--blue)]/10">
                          <span className="text-[var(--blue)] font-bold">Trelio</span>
                        </div>
                      )}
                      {serviceName && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white backdrop-blur-md shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                            {serviceName}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </div>
                        <Link href={`/blog/${post.slug}`} className="block mt-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[var(--blue)] dark:group-hover:text-[var(--blue)] transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                          {post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : ''}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="text-[var(--blue)] font-bold text-sm inline-flex items-center gap-1 group/link"
                        >
                          <span>Read article</span>
                          <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}
