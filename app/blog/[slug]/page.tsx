import { createClient } from '@/lib/supabase/server'
import { getServiceBySlug } from '@/lib/services'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'
import { ScrollReveal } from '@/app/components/MotionWrapper'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('blogs')
    .select('title, content, cover_image')
    .eq('slug', slug)
    .single()
 
  if (!post) {
    return { title: 'Post Not Found | Trelio' }
  }
 
  const title = `${post.title} | Trelio Blog`
  const description = post.content?.replace(/<[^>]+>/g, '').substring(0, 150) || 'Read more on Trelio Blog'
  const ogImage = post.cover_image || '/og-image.png'

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.trelio.tech/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.trelio.tech/blog/${slug}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

function getReadingTime(content: string | null | undefined): string {
  if (!content) return '1 min read';
  const text = content.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default async function BlogPostPage({ params }: Props) {
  const slug = (await params).slug
  const supabase = await createClient()
  
  // Fetch current post
  const { data: post, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
    
  if (error || !post) {
    notFound()
  }

  // Fetch related posts (same service tag, excluding current)
  const { data: relatedPosts } = await supabase
    .from('blogs')
    .select('id, title, slug, cover_image, created_at, service_tag')
    .eq('status', 'published')
    .eq('service_tag', post.service_tag)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const service = getServiceBySlug(post.service_tag)
  const serviceName = service ? service.name : post.service_tag
  const readingTime = getReadingTime(post.content)

  return (
    <article className="pt-28 sm:pt-32 pb-24 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[var(--blue)] dark:text-gray-400 dark:hover:text-[var(--blue)] transition-colors gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] rounded-lg py-1 px-1.5 -ml-1.5"
        >
          <span>←</span>
          <span>Back to all articles</span>
        </Link>
      </div>

      {/* Full width hero with cover image as background */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative w-full aspect-[16/9] min-h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-200/60 dark:border-gray-800">
          {/* Background image or Fallback Navy-to-Blue Gradient */}
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={`${post.title} - Trelio`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 95vw, 1280px"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B192C] via-[#0F284E] to-[#1E40AF]" />
          )}

          {/* Light overall tint so white text is readable on any image */}
          <div className="absolute inset-0 bg-black/35 z-[1]" />

          {/* Dark gradient overlay from bottom (about 75% black) to transparent at top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent z-[2]" />

          {/* Content placed in the top-left where the image has empty space */}
          <div className="absolute inset-0 z-10 p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-start items-start">
            <div className="w-full lg:max-w-[60%] flex flex-col items-start gap-3 sm:gap-4">
              {/* Category pill */}
              {serviceName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--blue)] text-white shadow-sm">
                  {serviceName}
                </span>
              )}

              {/* Large H1 Title */}
              <h1 className="text-[26px] sm:text-3xl md:text-4xl lg:text-[46px] xl:text-[52px] font-extrabold text-white leading-[1.18] tracking-tight drop-shadow-sm">
                {post.title}
              </h1>

              {/* Date and Reading Time */}
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200/90 font-medium mt-1">
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                <span className="inline-block w-1 h-1 rounded-full bg-gray-300/80" />
                <span>{readingTime}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Article Body */}
      <ScrollReveal delay={0.15}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-slate dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </ScrollReveal>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <ScrollReveal delay={0.25}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((relatedPost) => {
                const relService = getServiceBySlug(relatedPost.service_tag)
                const relServiceName = relService ? relService.name : relatedPost.service_tag

                return (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group relative block w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 border border-gray-200/60 dark:border-gray-800"
                  >
                    {/* Background image or Fallback Navy-to-Blue Gradient */}
                    {relatedPost.cover_image ? (
                      <Image
                        src={relatedPost.cover_image}
                        alt={`${relatedPost.title} - Trelio`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0B192C] via-[#0F284E] to-[#1E40AF]" />
                    )}

                    {/* Overall dark tint */}
                    <div className="absolute inset-0 bg-black/30 z-[1]" />

                    {/* Dark gradient overlay, stronger at the bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-[2]" />

                    {/* Content overlay */}
                    <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-between">
                      {/* Top left: Category pill */}
                      <div>
                        {relServiceName && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--blue)] text-white shadow-sm">
                            {relServiceName}
                          </span>
                        )}
                      </div>

                      {/* Bottom left: Title and Date */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-3 drop-shadow-sm group-hover:text-blue-100 transition-colors duration-300">
                          {relatedPost.title}
                        </h3>
                        <time
                          dateTime={relatedPost.created_at}
                          className="text-xs text-gray-300/90 font-medium mt-2 block"
                        >
                          {new Date(relatedPost.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>
      )}
    </article>
  )
}
