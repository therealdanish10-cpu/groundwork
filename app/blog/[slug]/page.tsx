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
    .select('title, content')
    .eq('slug', slug)
    .single()
 
  if (!post) {
    return { title: 'Post Not Found | Trelio' }
  }
 
  return {
    title: `${post.title} | Trelio Blog`,
    description: post.content?.replace(/<[^>]+>/g, '').substring(0, 150) || 'Read more on Trelio Blog',
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
    <article className="pt-24 pb-16">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
            ← Back to blog
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            {serviceName && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                {serviceName}
              </span>
            )}
            <time dateTime={post.created_at} className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>
        </div>
      </ScrollReveal>

      {post.cover_image && (
        <ScrollReveal delay={0.1}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden bg-muted shadow-lg">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-border/50">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-muted">
                    {relatedPost.cover_image ? (
                      <Image
                        src={relatedPost.cover_image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <span className="text-primary font-medium">Trelio</span>
                      </div>
                    )}
                  </div>
                  <time dateTime={relatedPost.created_at} className="text-xs text-muted-foreground block mb-2">
                    {new Date(relatedPost.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
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
