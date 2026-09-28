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
    .select('id, title, slug, cover_image, created_at')
    .eq('status', 'published')
    .eq('service_tag', post.service_tag)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const service = getServiceBySlug(post.service_tag)
  const serviceName = service ? service.name : post.service_tag

  return (
    <article className="pt-32 pb-24 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Link href="/blog" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[var(--blue)] dark:text-gray-400 dark:hover:text-[var(--blue)] mb-8 transition-colors gap-1.5">
            <span>←</span>
            <span>Back to all articles</span>
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            {serviceName && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--blue)]/10 text-[var(--blue)]">
                {serviceName}
              </span>
            )}
            <time dateTime={post.created_at} className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>
        </div>
      </ScrollReveal>

      {post.cover_image && (
        <ScrollReveal delay={0.1}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-800">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={0.2}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-slate dark:prose-invert">
          {/* We'll render content as HTML since it might come from a rich text editor */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </ScrollReveal>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <ScrollReveal delay={0.3}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
                    {relatedPost.cover_image ? (
                      <Image
                        src={relatedPost.cover_image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--blue)]/10">
                        <span className="text-[var(--blue)] font-bold">Trelio</span>
                      </div>
                    )}
                  </div>
                  <time dateTime={relatedPost.created_at} className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                    {new Date(relatedPost.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[var(--blue)] dark:group-hover:text-[var(--blue)] transition-colors line-clamp-2 leading-snug">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </article>
  )
}
