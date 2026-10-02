import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICES } from '@/lib/services'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { StaggerContainer, StaggerItem, ScrollReveal } from '@/app/components/MotionWrapper'
import { stripMarkdown } from '@/lib/markdown'

export const metadata: Metadata = {
  title: 'Blog & Digital Insights | Trelio',
  description: 'Stay ahead with actionable insights, expert guides, and the latest trends in web development, AI automation, SEO, and digital growth from Trelio.',
  alternates: {
    canonical: 'https://www.trelio.tech/blog',
  },
  openGraph: {
    title: 'Blog & Digital Insights | Trelio',
    description: 'Stay ahead with actionable insights, expert guides, and the latest trends in web development, AI automation, SEO, and digital growth from Trelio.',
    url: 'https://www.trelio.tech/blog',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Blog & Digital Insights | Trelio',
      },
    ],
  },
};

export const revalidate = 60

export default async function BlogPage() {
  const adminClient = createAdminClient()
  
  const { data: posts, error } = await adminClient
    .from('blogs')
    .select('id, title, slug, service_tag, cover_image, created_at, status, content')
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
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post, index) => {
              const service = SERVICES.find(s => s.slug === post.service_tag)
              const serviceName = service ? service.name : post.service_tag
              const excerpt = stripMarkdown(post.content)

              return (
                <StaggerItem
                  key={post.id}
                  index={index}
                  duration={1.05}
                  y={20}
                  stagger={0.12}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group relative block w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 border border-gray-200/60 dark:border-gray-800"
                  >
                    {/* Background image or Fallback Navy-to-Blue Gradient */}
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={`${post.title} - Trelio`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0B192C] via-[#0F284E] to-[#1E40AF]" />
                    )}

                    {/* Overall dark tint for readable text across any image */}
                    <div className="absolute inset-0 bg-black/30 z-[1]" />

                    {/* Dark gradient overlay, stronger at the bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-[2]" />

                    {/* Content overlay */}
                    <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-between">
                      {/* Top left: Category pill */}
                      <div>
                        {serviceName && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--blue)] text-white shadow-sm">
                            {serviceName}
                          </span>
                        )}
                      </div>

                      {/* Bottom left: Title, Excerpt, and Date */}
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2 drop-shadow-sm group-hover:text-blue-100 transition-colors duration-300">
                          {post.title}
                        </h2>
                        {excerpt && (
                          <p className="text-xs sm:text-sm text-gray-200/85 line-clamp-2 mt-1 leading-relaxed font-normal">
                            {excerpt}
                          </p>
                        )}
                        <time
                          dateTime={post.created_at}
                          className="text-xs text-gray-300/90 font-medium mt-2 block"
                        >
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}
